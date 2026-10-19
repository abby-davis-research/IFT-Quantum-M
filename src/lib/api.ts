export interface DeployStep {
  stage: string;
  message: string;
}

export interface DeployResult {
  success: boolean;
  accountId?: string;
  region?: string;
  bucket?: string;
  configKey?: string;
  experimentId?: string;
  steps: DeployStep[];
  consoleUrl?: string;
  error?: string;
}

export async function deployToAws(experimentConfig: unknown, experimentId: string): Promise<DeployResult> {
  const res = await fetch('/api/aws/deploy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ experimentConfig, experimentId }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, steps: data.steps || [], error: data.error || `HTTP ${res.status}` };
  }
  return data as DeployResult;
}

export async function askGemini(question: string, experiment: unknown): Promise<string> {
  const res = await fetch('/api/gemini/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, experiment }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data.answer as string;
}
