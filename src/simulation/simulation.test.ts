import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rk4Step,
  generateLorenzTrajectory,
  estimateLyapunovExponent,
  DEFAULT_LORENZ_PARAMS,
} from './lorenz.ts';
import {
  generateQuantumManifold,
  executeTopologicalSurgery,
  computeEulerCharacteristic,
  predictGenus,
} from './topology.ts';
import {
  generatePairedBenchmarkSeries,
  calculateOptimizationGain,
  FIXED_CONTROL_CONFIG,
  ADAPTIVE_BASELINE_CONFIG,
} from './quantum.ts';

test('Lorenz RK4 step preserves finite deterministic coordinates', () => {
  const initial = { x: 1.0, y: 1.0, z: 1.0 };
  const next = rk4Step(initial, DEFAULT_LORENZ_PARAMS, 0.01);

  assert.ok(Number.isFinite(next.x), 'x coordinate is finite');
  assert.ok(Number.isFinite(next.y), 'y coordinate is finite');
  assert.ok(Number.isFinite(next.z), 'z coordinate is finite');
  assert.notDeepEqual(initial, next, 'State evolved over timestep');
});

test('Lorenz trajectory generator produces requested count of points', () => {
  const points = generateLorenzTrajectory({ x: 0.1, y: 0.0, z: 0.0 }, 50);
  assert.equal(points.length, 50);
  assert.equal(points[0].x, 0.1);
});

test('Lyapunov exponent estimation returns positive metric for chaotic trajectories', () => {
  const lambda = estimateLyapunovExponent(1e-4, 0.01, 1000, 1e-1);
  assert.ok(lambda > 0, 'Lyapunov exponent is strictly positive for chaos');
});

test('Quantum manifold mesh generates nodes, couplers, and topological voids', () => {
  const { nodes, edges, voids } = generateQuantumManifold(false, 36);

  assert.equal(nodes.length, 36);
  assert.ok(edges.length > 36, 'Couplers exist between qubits');
  assert.equal(voids.length, 3, 'Contains alpha, beta, gamma voids');

  const alpha = voids.find(v => v.id === 'void_alpha');
  assert.ok(alpha, 'Found void_alpha');
  assert.equal(alpha?.betti.b1, 2, 'Has 1-cycle generator');
});

test('Topological surgery isolates high-noise edges and stitches stabilizers', () => {
  const { edges } = generateQuantumManifold(false, 36);
  const { modifiedEdges, cutCount, stitchedCount } = executeTopologicalSurgery(edges, 0.01);

  assert.ok(cutCount > 0, 'Cut degraded high-error couplers');
  assert.ok(stitchedCount > 0, 'Stitched boundary stabilizers');
  assert.equal(modifiedEdges.length, edges.length);
});

test('Euler characteristic and genus prediction are consistent with topology', () => {
  // Genus 2 surface has chi = 2 - 2(2) = -2
  const chi = -2;
  const genus = predictGenus(chi);
  assert.equal(genus, 2);

  // Sphere: V=4, E=6, F=4 -> chi = 2 -> genus = 0
  const sphereChi = computeEulerCharacteristic(4, 6, 4);
  assert.equal(sphereChi, 2);
  assert.equal(predictGenus(sphereChi), 0);
});

test('Quantum benchmark series proves superiority of IFT-Classiq adaptive pathway', () => {
  const series = generatePairedBenchmarkSeries(25);
  assert.equal(series.length, 25);

  const last = series[series.length - 1];
  assert.ok(
    last.optimizedFidelity > last.hardwareFidelity,
    'Classiq + IFT maintains higher fidelity at deep circuits'
  );
  assert.ok(
    last.optimizedEntropy < last.hardwareEntropy,
    'Classiq + IFT keeps entanglement entropy lower than raw hardware noise'
  );

  const gain = calculateOptimizationGain(series);
  assert.ok(gain.averageFidelityGain > 1.5, 'Significant fidelity advantage');
});

test('Configurations match required backend files', () => {
  assert.equal(FIXED_CONTROL_CONFIG.name, 'fixed_control.json');
  assert.equal(ADAPTIVE_BASELINE_CONFIG.name, 'adaptive_baseline.json');
  assert.equal(ADAPTIVE_BASELINE_CONFIG.genus, 2);
});
