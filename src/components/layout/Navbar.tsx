import React from 'react';
import { useExperiment } from '../../context/ExperimentContext.tsx';
import {
  Activity,
  Cpu,
  Layers,
  Cloud,
  FileCode,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    configMode,
    setConfigMode,
    isAdaptive,
    providersStatus,
    setActiveModal,
  } = useExperiment();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30 shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-lg tracking-tight text-white font-mono whitespace-nowrap">
                IFT-Quantum
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono shrink-0 hidden sm:inline-block">
                Lab v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block whitespace-nowrap">
              Interplayed Field Theory &amp; Topological Manifolds
            </p>
          </div>
        </div>

        {/* Global Config Switcher */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
          <span className="text-[11px] font-mono text-slate-400 pl-2 hidden lg:inline">Config:</span>
          <button
            onClick={() => setConfigMode('fixed_control.json')}
            className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-mono rounded-lg transition-all ${
              !isAdaptive
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-inner border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Rigid rectangular torus baseline without adaptive reweaving"
          >
            <span className="sm:hidden">fixed</span>
            <span className="hidden sm:inline">fixed_control.json</span>
          </button>
          <button
            onClick={() => setConfigMode('adaptive_baseline.json')}
            className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-mono rounded-lg transition-all ${
              isAdaptive
                ? 'bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-600/30 border border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="High-genus Riemannian manifold with Classiq algorithmic synthesis"
          >
            <span className="sm:hidden">adaptive</span>
            <span className="hidden sm:inline">adaptive_baseline.json</span>
          </button>
        </div>

        {/* Provider Stream Badges */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">lorenz:</span>
            <span className="text-cyan-400 font-semibold">{providersStatus.classicalLorenz}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">classiq:</span>
            <span className="text-purple-400 font-semibold">{providersStatus.classiqProvider}</span>
          </div>
        </div>

        {/* Nav actions & AWS Deploy CTA */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => setActiveModal('awsDeploy')}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 font-mono text-[11px] sm:text-xs font-medium transition shadow-sm"
          >
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AWS Deploy</span>
            <span className="sm:hidden">Deploy</span>
          </button>

          <button
            onClick={() => setActiveModal('notebook')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono text-xs font-medium transition"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Prototype.ipynb</span>
          </button>
        </div>

      </div>
    </header>
  );
};
