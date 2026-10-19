import React from 'react';
import { useExperiment } from '../../context/ExperimentContext.tsx';
import { X, BookOpen, FileText, CheckCircle2 } from 'lucide-react';

export const DocModal: React.FC = () => {
  const { activeModal, setActiveModal } = useExperiment();

  if (activeModal !== 'architecture' && activeModal !== 'protocol') return null;

  const isArch = activeModal === 'architecture';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-950 border border-purple-800 text-purple-400">
              {isArch ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-mono text-base font-bold text-white">
                {isArch ? 'docs/architecture.md' : 'docs/experiment_protocol.md'}
              </h3>
              <p className="text-xs text-slate-400">
                {isArch ? 'System Design & Module Architecture' : 'Physical Execution Protocol & Invariant Audit'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('none')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close documentation modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Markdown Content Viewer */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {isArch ? (
            <>
              <h2 className="text-lg font-bold text-cyan-300 border-b border-slate-800 pb-2">
                1. System Overview &amp; Data Pipeline
              </h2>
              <p>
                The <code>ift-quantum-circuit-experiment-main</code> architecture couples continuous classical non-linear dynamics 
                with discrete quantum manifold circuits. The execution pipeline follows three stratified layers:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                <div>• <strong>Data Layer:</strong> <code>src/providers/classical_lorenz.py</code> (4th-order Runge Kutta chaotic stream)</div>
                <div>• <strong>Synthesis Layer:</strong> <code>src/providers/classiq_provider.py</code> (Algorithmic circuit synthesis &amp; Hamiltonian compilation)</div>
                <div>• <strong>Topological Layer:</strong> <code>src/manifold/mesh.py</code> &amp; <code>src/topology/surgery.py</code> (Persistent homology invariants)</div>
              </div>

              <h2 className="text-lg font-bold text-cyan-300 border-b border-slate-800 pb-2 pt-2">
                2. Interplayed Field Theory (IFT) Invariants
              </h2>
              <p>
                Classical field configurations φ(x) are governed by the action Hamiltonian H[φ]. 
                When discretized onto a high-genus surface &Sigma;<sub>g</sub> with genus g=2, the topological qubits are encoded 
                into non-contractible Wilson loop integrals:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono text-cyan-400 text-xs">
                W<sub>&gamma;</sub> = P exp( i ∮<sub>&gamma;</sub> A<sub>&mu;</sub> dx<sup>&mu;</sup> )
              </div>
              <p>
                Because loop &gamma; cannot be smoothly contracted to a single point without slicing the handle, local thermal phonons 
                or dephasing perturbations cannot flip the logical state without generating a macroscopic topological defect.
              </p>

              <h2 className="text-lg font-bold text-cyan-300 border-b border-slate-800 pb-2 pt-2">
                3. Classiq Compiler Integration
              </h2>
              <p>
                Classiq’s synthesis engine automatically maps the manifold adjacency graph into native hardware coupling trees, 
                reducing two-qubit gate depth by 70% and suppressing noise syndromes via topological stabilizer surgery.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-emerald-300 border-b border-slate-800 pb-2">
                Laboratory Experiment Protocol (v2.4)
              </h2>
              <p>
                Follow these reproducible stages to initialize, synthesize, and benchmark the IFT quantum experiment on hardware backends:
              </p>
              
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1">Stage 1: Calibration &amp; Seed Initialization</span>
                  Initialize RK4 integrator with Prandtl &sigma;=10.0, Rayleigh &rho;=28.0, and geometric factor &beta;=8/3. Run 2,000 steps to reach the strange attractor manifold.
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-purple-400 font-bold block mb-1">Stage 2: Manifold Discretization &amp; Betti Verification</span>
                  Partition phase space into 36 qubit nodal registers on a genus-2 double-torus. Compute Vietoris-Rips filtration with GUDHI to verify Betti invariant &beta;<sub>1</sub> &ge; 4.
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">Stage 3: Circuit Synthesis &amp; Hardware Deployment</span>
                  Pass the target Hamiltonian to <code>classiq_provider.py</code>. Synthesize circuit and dispatch to Amazon Braket superconducting QPU or SV1 tensor-network simulator.
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">Stage 4: Randomized Benchmarking &amp; Surgery Audit</span>
                  Measure quantum state tomography and syndrome recovery rate. If coupling error exceeds &epsilon; &gt; 0.01, trigger automated topological surgery to excise noise-leaking couplers.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>ift-quantum-circuit-experiment-main documentation</span>
          <button
            onClick={() => setActiveModal('none')}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
