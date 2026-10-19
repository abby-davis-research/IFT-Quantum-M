import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ConfigMode,
  LorenzParams,
  ManifoldNode,
  ManifoldEdge,
  TopologicalVoid,
  BenchmarkMetrics,
  ConfigData,
} from '../types/ift.ts';
import { DEFAULT_LORENZ_PARAMS } from '../simulation/lorenz.ts';
import {
  generateQuantumManifold,
  executeTopologicalSurgery,
} from '../simulation/topology.ts';
import {
  FIXED_CONTROL_CONFIG,
  ADAPTIVE_BASELINE_CONFIG,
  generatePairedBenchmarkSeries,
} from '../simulation/quantum.ts';

interface ExperimentContextType {
  configMode: ConfigMode;
  setConfigMode: (mode: ConfigMode) => void;
  configData: ConfigData;
  lorenzParams: LorenzParams;
  setLorenzParams: React.Dispatch<React.SetStateAction<LorenzParams>>;
  currentPhaseCoords: [number, number, number];
  setCurrentPhaseCoords: (coords: [number, number, number]) => void;
  
  // Manifold state
  nodes: ManifoldNode[];
  edges: ManifoldEdge[];
  voids: TopologicalVoid[];
  selectedVoid: TopologicalVoid | null;
  setSelectedVoid: (v: TopologicalVoid | null) => void;
  isAdaptive: boolean;
  setIsAdaptive: (adaptive: boolean) => void;

  // Surgery state
  isPerformingSurgery: boolean;
  surgeryResults: { cutCount: number; stitchedCount: number } | null;
  runTopologicalSurgery: () => void;

  // Benchmark state
  benchmarkSeries: BenchmarkMetrics[];
  selectedStep: number;
  setSelectedStep: (step: number) => void;

  // Providers Status
  providersStatus: {
    classicalLorenz: 'STREAMING' | 'PAUSED' | 'CALIBRATING';
    classiqProvider: 'SYNTHESIZED' | 'OPTIMIZING' | 'IDLE';
    simulatorProvider: 'ACTIVE' | 'STANDBY';
  };

  // Modals
  activeModal: 'none' | 'notebook' | 'architecture' | 'protocol' | 'awsDeploy';
  setActiveModal: (modal: 'none' | 'notebook' | 'architecture' | 'protocol' | 'awsDeploy') => void;
}

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export const ExperimentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [configMode, setConfigMode] = useState<ConfigMode>('adaptive_baseline.json');
  const [lorenzParams, setLorenzParams] = useState<LorenzParams>(DEFAULT_LORENZ_PARAMS);
  const [currentPhaseCoords, setCurrentPhaseCoords] = useState<[number, number, number]>([1.0, 1.0, 1.0]);

  const isAdaptive = configMode === 'adaptive_baseline.json';

  const configData = useMemo(() => {
    return isAdaptive ? ADAPTIVE_BASELINE_CONFIG : FIXED_CONTROL_CONFIG;
  }, [isAdaptive]);

  // Generate manifold based on config mode
  const [manifoldData, setManifoldData] = useState(() => generateQuantumManifold(isAdaptive));
  const [selectedVoid, setSelectedVoid] = useState<TopologicalVoid | null>(null);

  // Update manifold when configMode changes
  useEffect(() => {
    const updated = generateQuantumManifold(isAdaptive);
    setManifoldData(updated);
    if (!selectedVoid) {
      setSelectedVoid(updated.voids[0]);
    }
  }, [isAdaptive]);

  // Surgery execution
  const [isPerformingSurgery, setIsPerformingSurgery] = useState(false);
  const [surgeryResults, setSurgeryResults] = useState<{ cutCount: number; stitchedCount: number } | null>(null);

  const runTopologicalSurgery = () => {
    setIsPerformingSurgery(true);
    setTimeout(() => {
      const { modifiedEdges, cutCount, stitchedCount } = executeTopologicalSurgery(manifoldData.edges, 0.008);
      setManifoldData(prev => ({
        ...prev,
        edges: modifiedEdges,
      }));
      setSurgeryResults({ cutCount, stitchedCount });
      setIsPerformingSurgery(false);
    }, 1200);
  };

  // Benchmark dataset
  const [benchmarkSeries] = useState<BenchmarkMetrics[]>(() => generatePairedBenchmarkSeries(24));
  const [selectedStep, setSelectedStep] = useState<number>(20);

  // Mock Providers Status
  const [providersStatus] = useState({
    classicalLorenz: 'STREAMING' as const,
    classiqProvider: isAdaptive ? ('SYNTHESIZED' as const) : ('IDLE' as const),
    simulatorProvider: 'ACTIVE' as const,
  });

  const [activeModal, setActiveModal] = useState<'none' | 'notebook' | 'architecture' | 'protocol' | 'awsDeploy'>('none');

  const setIsAdaptiveHandler = (adaptive: boolean) => {
    setConfigMode(adaptive ? 'adaptive_baseline.json' : 'fixed_control.json');
  };

  return (
    <ExperimentContext.Provider
      value={{
        configMode,
        setConfigMode,
        configData,
        lorenzParams,
        setLorenzParams,
        currentPhaseCoords,
        setCurrentPhaseCoords,
        nodes: manifoldData.nodes,
        edges: manifoldData.edges,
        voids: manifoldData.voids,
        selectedVoid,
        setSelectedVoid,
        isAdaptive,
        setIsAdaptive: setIsAdaptiveHandler,
        isPerformingSurgery,
        surgeryResults,
        runTopologicalSurgery,
        benchmarkSeries,
        selectedStep,
        setSelectedStep,
        providersStatus: {
          ...providersStatus,
          classiqProvider: isAdaptive ? 'SYNTHESIZED' : 'IDLE',
        },
        activeModal,
        setActiveModal,
      }}
    >
      {children}
    </ExperimentContext.Provider>
  );
};

export function useExperiment() {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiment must be used within an ExperimentProvider');
  }
  return context;
}
