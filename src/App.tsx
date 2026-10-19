import React from 'react';
import { ExperimentProvider } from './context/ExperimentContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { HeroChaosSection } from './components/sections/HeroChaosSection.tsx';
import { ManifoldControllerSection } from './components/sections/ManifoldControllerSection.tsx';
import { TdaExplorerSection } from './components/sections/TdaExplorerSection.tsx';
import { BenchmarkDashboardSection } from './components/sections/BenchmarkDashboardSection.tsx';
import { FooterAndProvenance } from './components/sections/FooterAndProvenance.tsx';
import { NotebookModal } from './components/modals/NotebookModal.tsx';
import { DocModal } from './components/modals/DocModal.tsx';
import { AwsDeployModal } from './components/modals/AwsDeployModal.tsx';

export default function App() {
  return (
    <ExperimentProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Navigation Bar with Config Switcher and Stream Status */}
        <Navbar />

        {/* Main Content Sections */}
        <main className="flex-grow">
          {/* Section 1 & 2: Hero Classical Chaos (Lorenz Dynamics 3D) */}
          <HeroChaosSection />

          {/* Section 3: The Quantum Manifold Controller (Continuous to Discrete 3D Mesh) */}
          <ManifoldControllerSection />

          {/* Section 4: Topological Data Analysis (TDA) Explorer & Surgery */}
          <TdaExplorerSection />

          {/* Section 5: Dual-View Benchmark Dashboard (Hardware Noise vs Classiq Optimized) */}
          <BenchmarkDashboardSection />
        </main>

        {/* Section 6: Footer and Documentation Links */}
        <FooterAndProvenance />

        {/* Modals */}
        <NotebookModal />
        <DocModal />
        <AwsDeployModal />
      </div>
    </ExperimentProvider>
  );
}
