import React from 'react';
import { motion } from 'motion/react';
import { useExperiment } from '../../context/ExperimentContext.tsx';
import { LorenzAndManifoldCanvas } from '../canvas/LorenzAndManifoldCanvas.tsx';
import {
  Rotate3d,
  Activity,
  Sliders,
  Sparkles,
  ArrowDown,
  Info,
} from 'lucide-react';

export const HeroChaosSection: React.FC = () => {
  const {
    lorenzParams,
    setLorenzParams,
    currentPhaseCoords,
  } = useExperiment();

  return (
    <section id="chaos-section" className="relative py-12 lg:py-16 border-b border-slate-900 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title & Abstract Narrative */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-xs font-mono text-cyan-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>src/dynamics/lorenz.py • Classical Phase Space</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight font-sans">
            Classical Chaos to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">Quantum Manifolds</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            In non-linear atmospheric convection, classical trajectories wander unpredictably across strange attractors. 
            Interplayed Field Theory (IFT) generalizes chaotic dynamical systems into probabilistic quantum field states, 
            where topological manifolds protect quantum information from local thermal decoherence.
          </p>
        </div>

        {/* 3D Visualizer & Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main 3D Lorenz Attractor Visual Canvas */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <LorenzAndManifoldCanvas mode="lorenz" height="h-[520px]" />

            {/* Live Telemetry Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl font-mono">
                <span className="text-[10px] uppercase text-slate-400 block">State [X, Y, Z]</span>
                <span className="text-xs sm:text-sm font-semibold text-cyan-400">
                  {currentPhaseCoords[0]}, {currentPhaseCoords[1]}, {currentPhaseCoords[2]}
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl font-mono">
                <span className="text-[10px] uppercase text-slate-400 block">Lyapunov Exponent (λ)</span>
                <span className="text-xs sm:text-sm font-semibold text-emerald-400">+0.9056 bit/s</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl font-mono">
                <span className="text-[10px] uppercase text-slate-400 block">Fractal Dimension</span>
                <span className="text-xs sm:text-sm font-semibold text-purple-400">D₂ ≈ 2.06</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl font-mono">
                <span className="text-[10px] uppercase text-slate-400 block">Integrator Engine</span>
                <span className="text-xs sm:text-sm font-semibold text-sky-400">RK4 Symplectic</span>
              </div>
            </div>
          </div>

          {/* Interactive Parameters & Narrative Cards */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Parameters Panel */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-mono text-sm font-semibold text-white">Attractor Parameters</h3>
                </div>
                <button
                  onClick={() => setLorenzParams({ sigma: 10, rho: 28, beta: 8 / 3, dt: 0.01, speed: 1.0 })}
                  className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 transition"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="space-y-4">
                {/* Sigma (Prandtl) */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Prandtl Number (σ):</span>
                    <span className="text-cyan-400">{lorenzParams.sigma.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={lorenzParams.sigma}
                    onChange={(e) => setLorenzParams(prev => ({ ...prev, sigma: parseFloat(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Ratio of momentum diffusivity to thermal diffusivity.</p>
                </div>

                {/* Rho (Rayleigh) */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Rayleigh Number (ρ):</span>
                    <span className="text-cyan-400">{lorenzParams.rho.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="1"
                    value={lorenzParams.rho}
                    onChange={(e) => setLorenzParams(prev => ({ ...prev, rho: parseFloat(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Drives chaotic convective instability when ρ &gt; 24.74.</p>
                </div>

                {/* Beta (Geometric factor) */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Geometric Aspect (β):</span>
                    <span className="text-cyan-400">{lorenzParams.beta.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6"
                    step="0.1"
                    value={lorenzParams.beta}
                    onChange={(e) => setLorenzParams(prev => ({ ...prev, beta: parseFloat(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Spatial wave number of the fluid convection cell.</p>
                </div>

                {/* Simulation Speed */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Integration Velocity:</span>
                    <span className="text-cyan-400">{lorenzParams.speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.2"
                    value={lorenzParams.speed}
                    onChange={(e) => setLorenzParams(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Narrative Insight Card */}
            <div className="bg-gradient-to-br from-slate-900 via-cyan-950/30 to-purple-950/30 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-cyan-300 font-mono text-xs font-semibold">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>The Unpredictability of Classical Chaos</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Small perturbations grow exponentially (δx(t) ~ δx₀ · exp(λt)), making long-term prediction computationally impossible on classical processors.
              </p>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300">
                <span className="text-purple-400 font-semibold block mb-1">IFT Formulation:</span>
                IFT reformulates deterministic point orbits into continuous probability fields P[φ] = (1/Z) · exp(-H[φ]), allowing quantum circuits to track entire manifold distributions rather than fragile individual coordinates.
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
