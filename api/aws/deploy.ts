import type { VercelRequest, VercelResponse } from '@vercel/node';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { S3Client, CreateBucketCommand, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

function awsConfig() {
  const region = process.env.AWS_REGION || 'us-east-1';
  return {
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  };
}

function credsPresent() {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!credsPresent()) {
    return res.status(503).json({ error: 'AWS credentials not configured on the server.' });
  }

  const { experimentConfig, experimentId } = req.body || {};
  const cfg = awsConfig();
  const region = cfg.region;
  const steps: { stage: string; message: string }[] = [];

  try {
    // 1. Validate credentials via STS
    const sts = new STSClient(cfg);
    const identity = await sts.send(new GetCallerIdentityCommand({}));
    const accountId = identity.Account || 'unknown';
    steps.push({
      stage: 'iam',
      message: `[STS] Credentials valid. Account ${accountId}, identity ${identity.Arn || 'unknown'}.`,
    });

    // 2. Ensure S3 bucket for experiment artifacts
    const bucket = `ift-quantum-lab-artifacts-${accountId}`.toLowerCase();
    const s3 = new S3Client(cfg);
    let bucketReady = false;
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucket }));
      bucketReady = true;
      steps.push({ stage: 's3', message: `[S3] Bucket s3://${bucket} already exists — reusing.` });
    } catch {
      const params: any = { Bucket: bucket };
      if (region !== 'us-east-1') {
        params.CreateBucketConfiguration = { LocationConstraint: region };
      }
      await s3.send(new CreateBucketCommand(params));
      steps.push({ stage: 's3', message: `[S3] Created bucket s3://${bucket} in ${region}.` });
    }

    // 3. Persist the experiment config to S3
    const expId = experimentId || `exp_${Date.now()}`;
    const key = `experiments/${expId}/config.json`;
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify({ experimentId: expId, savedAt: new Date().toISOString(), config: experimentConfig || {} }, null, 2),
        ContentType: 'application/json',
      })
    );
    steps.push({ stage: 's3', message: `[S3] Saved experiment config to s3://${bucket}/${key}.` });

    return res.status(200).json({
      success: true,
      accountId,
      region,
      bucket,
      configKey: key,
      experimentId: expId,
      steps,
      consoleUrl: `https://s3.console.aws.amazon.com/s3/buckets/${bucket}?region=${region}`,
    });
  } catch (err: any) {
    console.error('AWS deploy error:', err?.message);
    steps.push({ stage: 'error', message: `[ERROR] ${err?.message || 'Unknown AWS error'}` });
    return res.status(500).json({ success: false, steps, error: err?.message || 'AWS request failed.' });
  }
}
