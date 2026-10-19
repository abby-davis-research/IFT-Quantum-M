import type { BenchmarkMetrics, ConfigData } from '../types/ift.ts';

export const FIXED_CONTROL_CONFIG: ConfigData = {
  experiment_id: "exp_ift_lorenz_ctrl_001",
  name: "fixed_control.json",
  target_manifold: "rigid_rectangular_torus",
  genus: 1,
  circuit_optimization: {
    engine: "standard_transpiler_o2",
    max_two_qubit_depth: 128,
    adaptive_reweaving: false,
    noise_threshold: 0.025,
  },
  tda_parameters: {
    max_filtration_epsilon: 5.0,
    betti_tolerance: 0.05,
    surgery_iterations: 0,
  },
  hardware_spec: {
    target_backend: "aws_braket_aspen_m3",
    average_t1_us: 45.2,
    average_t2_us: 38.6,
    two_qubit_gate_error: 0.0185,
  },
};

export const ADAPTIVE_BASELINE_CONFIG: ConfigData = {
  experiment_id: "exp_ift_lorenz_adapt_002",
  name: "adaptive_baseline.json",
  target_manifold: "high_genus_riemannian_surface_g2",
  genus: 2,
  circuit_optimization: {
    engine: "classiq_ift_synthesis_v4",
    max_two_qubit_depth: 38,
    adaptive_reweaving: true,
    noise_threshold: 0.005,
  },
  tda_parameters: {
    max_filtration_epsilon: 6.5,
    betti_tolerance: 0.01,
    surgery_iterations: 3,
  },
  hardware_spec: {
    target_backend: "aws_braket_classiq_optimized",
    average_t1_us: 112.4,
    average_t2_us: 96.8,
    two_qubit_gate_error: 0.0019,
  },
};

/**
 * Generate paired benchmark series simulating paired_benchmark.json
 * Compares unoptimized raw hardware degradation against Classiq IFT pathway.
 */
export function generatePairedBenchmarkSeries(steps: number = 30): BenchmarkMetrics[] {
  const metrics: BenchmarkMetrics[] = [];

  for (let i = 0; i < steps; i++) {
    const depth = (i + 1) * 4;

    // Hardware unoptimized: exponential decay + thermal jitter
    const hwDecay = Math.exp(-0.045 * depth);
    const hwJitter = (Math.sin(i * 1.3) + Math.cos(i * 0.7)) * 0.04;
    const hardwareFidelity = Math.max(0.12, Math.min(0.99, hwDecay + hwJitter));

    // Classiq + IFT Adaptive Manifold: topological protection keeps fidelity high
    const optDecay = Math.exp(-0.0035 * depth);
    const optJitter = (Math.sin(i * 0.8)) * 0.008;
    const optimizedFidelity = Math.max(0.88, Math.min(0.995, optDecay + optJitter));

    // Entropy growth
    const hardwareEntropy = Math.min(1.0, 0.15 + (1 - hwDecay) * 0.85);
    const optimizedEntropy = Math.min(0.35, 0.08 + (depth / 160) * 0.12);

    // Syndrome detection/recovery rates
    const syndromeRateHardware = Math.min(0.85, 0.08 + (depth / 100) * 0.5);
    const syndromeRateOptimized = Math.max(0.01, 0.05 - (depth / 200) * 0.03);

    metrics.push({
      timestamp: Date.now() - (steps - i) * 1000,
      depth,
      hardwareFidelity,
      optimizedFidelity,
      hardwareEntropy,
      optimizedEntropy,
      syndromeRateHardware,
      syndromeRateOptimized,
    });
  }

  return metrics;
}

/**
 * Calculates algorithmic compression ratio and error protection multiplier.
 */
export function calculateOptimizationGain(metrics: BenchmarkMetrics[]): {
  averageFidelityGain: number;
  entropyReductionFactor: number;
  depthCompression: string;
} {
  if (metrics.length === 0) {
    return { averageFidelityGain: 1.0, entropyReductionFactor: 1.0, depthCompression: '1x' };
  }

  const last = metrics[metrics.length - 1];
  const gain = last.optimizedFidelity / Math.max(0.01, last.hardwareFidelity);
  const entropyReduction = last.hardwareEntropy / Math.max(0.01, last.optimizedEntropy);

  return {
    averageFidelityGain: parseFloat(gain.toFixed(2)),
    entropyReductionFactor: parseFloat(entropyReduction.toFixed(1)),
    depthCompression: '3.37x',
  };
}
