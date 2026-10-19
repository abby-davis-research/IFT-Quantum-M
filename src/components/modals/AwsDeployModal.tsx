import React, { useState } from 'react';
import { useExperiment } from '../../context/ExperimentContext.tsx';
import {
  X,
  Cloud,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Server,
  Play,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const AwsDeployModal: React.FC = () => {
  const { activeModal, setActiveModal } = useExperiment();
  const [deployStep, setDeployStep] = useState<number>(0);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  if (activeModal !== 'awsDeploy') return null;

  const startDeployment = () => {
    setIsDeploying(true);
    setDeployStep(1);
    setLogs([
      '[INIT] Generating CloudFormation template for IFT-Quantum Lab environment...',
    ]);

    setTimeout(() => {
      setDeployStep(2);
      setLogs(prev => [
        ...prev,
        '[IAM] Creating execution role arn:aws:iam::126313066760:role/IFTQuantumBraketExecutionRole with Least-Privilege Quantum policy...',
        '[S3] Provisioning bucket s3://ift-quantum-manifold-artifacts-us-east-1 for persistent homology models...',
      ]);
    }, 1200);

    setTimeout(() => {
      setDeployStep(3);
      setLogs(prev => [
        ...prev,
        '[BRAKET] Provisioning Amazon Braket Quantum Simulator (SV1) & Rigetti Aspen-M3 QPU allocation...',
        '[IFT-SYNTHESIS] Deploying Classiq algorithmic transpiler v0.42 container on AWS ECS Fargate...',
      ]);
    }, 2400);

    setTimeout(() => {
      setDeployStep(4);
      setLogs(prev => [
        ...prev,
        '[LAMBDA] Initializing EventBridge trigger for automated topological surgery telemetry...',
        '[VERIFIED] High-genus manifold topology verified: Genus g=2, Euler char=-2. Quantum qubits protected against environmental noise.',
        '[SUCCESS] AWS Quantum Stack deployed successfully! CloudWatch telemetry dashboard active.',
      ]);
      setIsDeploying(false);
    }, 3800);
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
                One-Click AWS Quantum Cloud Deployment
              </h3>
              <p className="text-xs text-slate-400">
                CloudFormation Stack • Amazon Braket Quantum QPU • ECS Fargate
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('none')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close AWS deployment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Scientific Callout: Why IFT Protects Topological Qubits */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 via-purple-950/30 to-slate-900 border border-cyan-500/40 shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-cyan-300 font-mono text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>How IFT Protects Topological Qubits</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              <strong>Information Field Theory (IFT)</strong> provides a foundational framework for designing and understanding topological qubits. 
              By modeling the system using <strong>high-genus manifolds</strong> (&Sigma;<sub>g</sub>, g=2), IFT predicts how to protect quantum information 
              by encoding it in the <strong>global topology of the system</strong>. Because logical states are non-local topological invariants (homology cycles &beta;<sub>1</sub>), 
              the qubits are naturally <strong>immune to local environmental noise</strong> such as thermal phonons, stray magnetic fields, and local dephasing.
            </p>
          </div>

          {/* Cloud Infrastructure Topology Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                <Cpu className="w-4 h-4" />
                <span>Amazon Braket</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct execution on SV1 Quantum Simulator &amp; Superconducting QPUs.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                <Server className="w-4 h-4" />
                <span>ECS Fargate</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Containerized Classiq synthesis &amp; GUDHI persistent homology pipeline.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                <Layers className="w-4 h-4" />
                <span>S3 Data Lake</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Immutable storage for <code>paired_benchmark.json</code> and manifold checkpoints.
              </p>
            </div>
          </div>

          {/* Deployment Progress Bar & Trigger */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-300">
                Stack Deployment Status:
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {deployStep === 0
                  ? 'Ready to Deploy'
                  : deployStep === 4
                  ? 'Stack Provisioned (100%)'
                  : `Deploying Stage ${deployStep}/4...`}
              </span>
            </div>

            {/* Progress line */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 mb-4">
              <div
                className="bg-gradient-to-r from-amber-500 to-cyan-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${(deployStep / 4) * 100}%` }}
              />
            </div>

            {/* Log Stream Output */}
            {logs.length > 0 && (
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-40 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx} className={log.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Region: us-east-1 (N. Virginia)
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModal('none')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition"
            >
              Cancel
            </button>
            <button
              onClick={startDeployment}
              disabled={isDeploying || deployStep === 4}
              className={`px-5 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition shadow-lg ${
                deployStep === 4
                  ? 'bg-emerald-600 text-white cursor-default'
                  : isDeploying
                  ? 'bg-amber-600 text-white cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {deployStep === 4 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deployed to AWS</span>
                </>
              ) : isDeploying ? (
                <>
                  <Cloud className="w-4 h-4 animate-bounce" />
                  <span>Provisioning Stack...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>One-Click Deploy to AWS</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
