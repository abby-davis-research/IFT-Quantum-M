/**
 * POST /api/braket/status
 * Polls Braket tasks submitted via /api/braket/submit and computes fidelity.
 *
 * Body: { tasks: [{ depth, condition, taskArn }] }
 * Returns: { complete: boolean, results: [{ depth, condition, status, fidelity?, shots?, taskArn }] }
 *
 * Fidelity = P(0000) from the mirror circuit measurement counts.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BraketClient, GetQuantumTaskCommand } from '@aws-sdk/client-braket';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const RESULTS_BUCKET = 'ift-quantum-lab-artifacts-397450412448';
const RESULTS_PREFIX = 'braket-results/live-benchmark';

interface TaskRef { depth: number; condition: string; taskArn: string; }

function taskIdFromArn(arn: string): string {
  return arn.split('/').pop() || '';
}

async function readBody(stream: any): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of stream) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  return Buffer.concat(chunks).toString('utf-8');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return res.status(503).json({ error: 'AWS credentials not configured on the server.' });
  }

  const tasks = ((req.body || {}).tasks || []) as TaskRef[];
  if (!tasks.length) return res.status(400).json({ error: 'No tasks provided.' });

  const region = process.env.AWS_REGION || 'us-east-1';
  const creds = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
  const braket = new BraketClient({ region, credentials: creds });
  const s3 = new S3Client({ region, credentials: creds });

  const results: Array<Record<string, unknown>> = [];
  let allDone = true;

  for (const t of tasks) {
    const entry: Record<string, unknown> = {
      depth: t.depth, condition: t.condition, taskArn: t.taskArn, status: 'UNKNOWN',
    };
    try {
      const meta = await braket.send(new GetQuantumTaskCommand({ quantumTaskArn: t.taskArn }));
      entry.status = meta.status || 'UNKNOWN';

      if (meta.status === 'COMPLETED') {
        const taskId = taskIdFromArn(t.taskArn);
        const key = `${RESULTS_PREFIX}/${taskId}/results.json`;
        const obj = await s3.send(new GetObjectCommand({ Bucket: RESULTS_BUCKET, Key: key }));
        const data = JSON.parse(await readBody(obj.Body));
        const measurements: number[][] = data.measurements || [];
        const shots = measurements.length;
        let zeros = 0;
        for (const m of measurements) {
          if (m.every((b) => b === 0)) zeros++;
        }
        entry.fidelity = shots ? zeros / shots : 0;
        entry.shots = shots;
      } else if (meta.status === 'FAILED' || meta.status === 'CANCELLED') {
        entry.failureReason = String((meta as any).failureReason || '').slice(0, 300);
      } else {
        allDone = false;
      }
    } catch (e: any) {
      entry.status = 'ERROR';
      entry.error = String(e?.message || e).slice(0, 300);
      allDone = false;
    }
    results.push(entry);
  }

  return res.status(200).json({ complete: allDone, results });
}
