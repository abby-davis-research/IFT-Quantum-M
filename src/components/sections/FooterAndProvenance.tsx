import React from 'react';
import { useExperiment } from '../../context/ExperimentContext.tsx';
import {
  Terminal,
  Download,
  BookOpen,
  FileText,
  Cloud,
  CheckCircle,
  GitBranch,
  ExternalLink,
} from 'lucide-react';

export const FooterAndProvenance: React.FC = () => {
  const { setActiveModal } = useExperiment();

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 text-slate-300 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Terminal Header Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl mb-8">
          
          <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="text-slate-400 text-xs ml-2">lab-session@ift-quantum-node:~$</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span>main [commit 8e41a9d]</span>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            
            {/* Terminal Provenance Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Python Environment
                </span>
                <span className="text-white font-semibold block">Python 3.11.8 (Conda)</span>
                <span className="text-slate-400 text-[11px]">NumPy 1.26.4 • SciPy 1.12.0</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Quantum Compiler
                </span>
                <span className="text-purple-400 font-semibold block">Classiq SDK v0.42.0</span>
                <span className="text-slate-400 text-[11px]">Qiskit 1.0.2 Transpiler</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Topological Engine
                </span>
                <span className="text-emerald-400 font-semibold block">GUDHI 3.9.0 &amp; Giotto-tda</span>
                <span className="text-slate-400 text-[11px]">Vietoris-Rips Persistent Invariants</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Execution Backend
                </span>
                <span className="text-cyan-400 font-semibold block">AWS Braket SV1 Simulator</span>
                <span className="text-slate-400 text-[11px]">Density Matrix Master Equation</span>
              </div>
            </div>

            {/* Terminal Interactive Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
              <span className="text-slate-400 text-xs">Artifact Actions:</span>
              
              <button
                onClick={() => setActiveModal('notebook')}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/80 hover:border-cyan-600 transition flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download IFT_Quantum_Manifold_Prototype.ipynb</span>
              </button>

              <button
                onClick={() => setActiveModal('architecture')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 transition flex items-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>View docs/architecture.md</span>
              </button>

              <button
                onClick={() => setActiveModal('protocol')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 transition flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Read docs/experiment_protocol.md</span>
              </button>

              <button
                onClick={() => setActiveModal('awsDeploy')}
                className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/80 hover:border-amber-600 transition flex items-center gap-2"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Deploy to AWS (1-Click)</span>
              </button>
            </div>

          </div>

        </div>

        {/* Bottom Credits & Theoretical Foundation */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px] gap-4">
          <p>
            ift-quantum-circuit-experiment-main • Information Field Theory (IFT) Research Initiative.
          </p>
          <div className="flex items-center gap-4">
            <span>License: Apache 2.0</span>
            <span>arXiv:2308.14812 [quant-ph]</span>
            <span>Target QPU: AWS Braket Aspen-M3</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
