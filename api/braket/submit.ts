/**
 * POST /api/braket/submit
 * Submits paired mirror-circuit benchmark tasks to AWS Braket SV1.
 *
 * Body: { depths?: number[], shots?: number, noiseP?: number }
 * Returns: { tasks: [{ depth, condition: 'noisy'|'ideal', taskArn }] }
 *
 * Circuit: 4-qubit mirror circuit. |0000> -> U(depth layers) -> U^dagger ->
 * measure. Ideal returns |0000> with p~1. Noisy (depolarizing after each
 * 2-qubit gate) decays with depth. Fidelity = P(0000).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BraketClient, CreateQuantumTaskCommand } from '@aws-sdk/client-braket';

const SV1_ARN = 'arn:aws:braket:::device/quantum-simulator/amazon/sv1';
const RESULTS_BUCKET = 'ift-quantum-lab-artifacts-397450412448';
const RESULTS_PREFIX = 'braket-results/live-benchmark';
const QUBITS = 4;

function buildMirrorQasm(depth: number, noisy: boolean, noiseP: number): string {
  const lines: string[] = [
    'OPENQASM 3.0;',
    `bit[${QUBITS}] b;`,
    `qubit[${QUBITS}] q;`,
  ];
  const noise = (qs: number[]): string[] =>
    noisy ? qs.map((q) => `#pragma braket noise depolarizing(${noiseP}) q[${q}]`) : [];

  // Forward layers
  for (let d = 0; d < depth; d++) {
    const pairs: Array<[number, number]> = [[0, 1], [2, 3], [1, 2]];
    for (const [a, b] of pairs) {
      lines.push(`cnot q[${a}], q[${b}];`, ...noise([a, b]));
    }
    for (let q = 0; q < QUBITS; q++) lines.push(`rx(0.7) q[${q}];`);
  }
  // Inverse layers (mirror) — CNOT is self-inverse, Rx negated, reversed order
  for (let d = 0; d < depth; d++) {
    for (let q = QUBITS - 1; q >= 0; q--) lines.push(`rx(-0.7) q[${q}];`);
    const pairs: Array<[number, number]> = [[1, 2], [2, 3], [0, 1]];
    for (const [a, b] of pairs) {
      lines.push(`cnot q[${a}], q[${b}];`, ...noise([a, b]));
    }
  }
  for (let q = 0; q < QUBITS; q++) lines.push(`b[${q}] = measure q[${q}];`);
  return lines.join('\n');
}

function toAction(qasm: string): string {
  return JSON.stringify({
    braketSchemaHeader: { name: 'braket.ir.openqasm.program', version: '1' },
    source: qasm,
    inputs: {},
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return res.status(503).json({ error: 'AWS credentials not configured on the server.' });
  }

  const body = (req.body || {}) as { depths?: number[]; shots?: number; noiseP?: number };
  const depths = (body.depths || [2, 6, 10, 14, 18, 22]).slice(0, 8);
  const shots = Math.min(Math.max(body.shots || 300, 10), 1000);
  const noiseP = body.noiseP ?? 0.03;

  const region = process.env.AWS_REGION || 'us-east-1';
  const client = new BraketClient({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const tasks: Array<{ depth: number; condition: string; taskArn: string }> = [];
  try {
    for (const depth of depths) {
      for (const condition of ['noisy', 'ideal'] as const) {
        const qasm = buildMirrorQasm(depth, condition === 'noisy', noiseP);
        const out = await client.send(new CreateQuantumTaskCommand({
          action: toAction(qasm),
          deviceArn: SV1_ARN,
          shots,
          outputS3Bucket: RESULTS_BUCKET,
          outputS3KeyPrefix: RESULTS_PREFIX,
          clientToken: `ift-live-${Date.now()}-${depth}-${condition}`.slice(0, 64),
          tags: { project: 'ift-quantum-m', condition, depth: String(depth) },
        }));
        tasks.push({ depth, condition, taskArn: out.quantumTaskArn || '' });
      }
    }
  } catch (e: any) {
    return res.status(500).json({
      error: 'Braket submit failed',
      detail: String(e?.message || e).slice(0, 400),
      tasks,
    });
  }

  return res.status(200).json({
    tasks, shots, noiseP, device: 'SV1',
    note: 'AWS Braket SV1 state-vector simulator; noisy line uses depolarizing noise pragmas',
  });
}
