import React, { useState } from 'react';
import { useExperiment } from '../../context/ExperimentContext.tsx';
import { deployToAws, type DeployResult } from '../../lib/api.ts';
import {
  X,
  Cloud,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Server,
  Play,
  Layers,
  ExternalLink,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export const AwsDeployModal: React.FC = () => {
  const { activeModal, setActiveModal, configData } = useExperiment();
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [result, setResult] = useState<DeployResult | null>(null);

  if (activeModal !== 'awsDeploy') return null;

  const startDeployment = async () => {
    setIsDeploying(true);
    setResult(null);
    try {
      const r = await deployToAws(configData, configData.experiment_id);
      setResult(r);
    } catch (e: any) {
      setResult({ success: false, steps: [], error: e?.message || 'Deployment request failed.' });
    } finally {
      setIsDeploying(false);
    }
  };

  const close = () => {
    setResult(null);
    setActiveModal('none');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950 border border-amber-800 text-amber-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-base font-bold text-white">
                Deploy Experiment to AWS
              </h3>
              <p className="text-xs text-slate-400">
                Live AWS SDK • Credential validation • S3 artifact storage
              </p>
            </div>
          </div>

          <button
            onClick={close}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close AWS deployment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Scientific Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 via-purple-950/30 to-slate-900 border border-cyan-500/40 shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-cyan-300 font-mono text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>What this provisions</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              This performs a <strong>live AWS deployment</strong> using the AWS SDK: it validates
              your credentials via STS, provisions an S3 bucket for experiment artifacts, and persists
              your current experiment configuration to S3. Every step below reports a real AWS API response.
            </p>
          </div>

          {/* Infrastructure cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>STS Identity</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Validates AWS credentials and resolves the target account.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                <Server className="w-4 h-4" />
                <span>S3 Artifacts</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Provisions a versioned bucket for experiment configs and results.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                <Layers className="w-4 h-4" />
                <span>Config Persist</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Writes this experiment's manifold config to S3 as JSON.
              </p>
            </div>
          </div>

          {/* Deployment status */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-300">
                Deployment Status:
              </span>
              <span className={`text-xs font-mono font-bold ${result?.success ? 'text-emerald-400' : result ? 'text-red-400' : 'text-amber-400'}`}>
                {isDeploying ? 'Deploying...' : result?.success ? 'Deployed' : result ? 'Failed' : 'Ready to Deploy'}
              </span>
            </div>

            {isDeploying && (
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-3">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                Talking to AWS — validating credentials, provisioning S3...
              </div>
            )}

            {result && result.steps.length > 0 && (
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
                {result.steps.map((log, idx) => (
                  <div key={idx} className={log.stage === 'error' ? 'text-red-400' : log.message.includes('[S3] Created') ? 'text-emerald-400' : ''}>
                    {log.message}
                  </div>
                ))}
              </div>
            )}

            {result && !result.success && (
              <div className="mt-3 p-3 rounded-lg bg-red-950/40 border border-red-800/60 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-200 font-mono">{result.error}</p>
              </div>
            )}

            {result?.success && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 font-mono text-xs text-emerald-200 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Live on AWS</span>
                </div>
                <div>Account: {result.accountId} • Region: {result.region}</div>
                <div className="break-all">Bucket: s3://{result.bucket}</div>
                <div className="break-all">Config: {result.configKey}</div>
                {result.consoleUrl && (
                  <a href={result.consoleUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 underline">
                    Open in AWS Console <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Region: us-east-1 default (configured server-side)
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={close}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition"
            >
              Close
            </button>
            <button
              onClick={startDeployment}
              disabled={isDeploying}
              className="px-5 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20 disabled:opacity-50"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Deploy to AWS</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
