export type ConfigMode = 'fixed_control.json' | 'adaptive_baseline.json';

export interface LorenzParams {
  sigma: number; // Prandtl number (default ~10)
  rho: number;   // Rayleigh number (default ~28)
  beta: number;  // Geometric factor (default ~8/3)
  dt: number;
  speed: number;
}

export interface ManifoldNode {
  id: string;
  x: number;
  y: number;
  z: number;
  qubitIndex: number;
  coherenceTime: number; // microseconds
  phaseAngle: number;
  curvature: number;
  isSyndromeNode?: boolean;
}

export interface ManifoldEdge {
  id: string;
  source: string;
  target: string;
  couplingStrength: number; // 0 to 1
  isCut?: boolean;
  isStitched?: boolean;
  errorProbability: number;
}

export interface TopologicalVoid {
  id: string;
  name: string;
  center: [number, number, number];
  radius: number;
  betti: {
    b0: number; // connected components
    b1: number; // 1D tunnels / cycles
    b2: number; // 2D cavities / voids
  };
  persistence: {
    birth: number;
    death: number;
    lifetime: number;
    confidence: number;
  };
  description: string;
  genusContribution: number;
}

export interface BenchmarkMetrics {
  timestamp: number;
  depth: number;
  hardwareFidelity: number;
  optimizedFidelity: number;
  hardwareEntropy: number;
  optimizedEntropy: number;
  syndromeRateHardware: number;
  syndromeRateOptimized: number;
}

export interface ConfigData {
  experiment_id: string;
  name: string;
  target_manifold: string;
  genus: number;
  circuit_optimization: {
    engine: string;
    max_two_qubit_depth: number;
    adaptive_reweaving: boolean;
    noise_threshold: number;
  };
  tda_parameters: {
    max_filtration_epsilon: number;
    betti_tolerance: number;
    surgery_iterations: number;
  };
  hardware_spec: {
    target_backend: string;
    average_t1_us: number;
    average_t2_us: number;
    two_qubit_gate_error: number;
  };
}

export interface DeploymentLog {
  id: string;
  timestamp: string;
  stage: 'init' | 'iam' | 'braket' | 's3' | 'lambda' | 'complete' | 'error';
  message: string;
}
