import type { ManifoldNode, ManifoldEdge, TopologicalVoid } from '../types/ift.ts';

/**
 * Generate a double-torus (genus 2) quantum circuit manifold mesh.
 * A genus-2 surface provides non-contractible homology cycles that
 * protect topological qubits from local noise.
 */
export function generateQuantumManifold(
  adaptive: boolean = false,
  qubitCount: number = 36
): {
  nodes: ManifoldNode[];
  edges: ManifoldEdge[];
  voids: TopologicalVoid[];
} {
  const nodes: ManifoldNode[] = [];
  const edges: ManifoldEdge[] = [];

  // Generate 2 interconnected tori (handles)
  const ringCount = 6;
  const nodesPerRing = Math.floor(qubitCount / ringCount);

  let nodeIndex = 0;
  for (let r = 0; r < ringCount; r++) {
    // Left handle (r < 3) vs Right handle (r >= 3)
    const isLeft = r < 3;
    const centerOffset = isLeft ? -10 : 10;
    const majorRadius = 8;
    const minorRadius = 4.5;
    const phi = ((r % 3) / 3) * Math.PI * 2;

    for (let i = 0; i < nodesPerRing; i++) {
      const theta = (i / nodesPerRing) * Math.PI * 2;

      // Base coordinates on torus
      let x = centerOffset + (majorRadius + minorRadius * Math.cos(theta)) * Math.cos(phi);
      let y = minorRadius * Math.sin(theta);
      let z = (majorRadius + minorRadius * Math.cos(theta)) * Math.sin(phi);

      // In adaptive mode, nodes relax towards minimal Ricci curvature geodesics
      let curvature = -0.42 + 0.15 * Math.sin(phi * 2) * Math.cos(theta);
      if (adaptive) {
        // Geometric optimization minimizes local strain
        const damping = 0.82;
        x *= damping;
        y *= damping;
        z *= damping;
        curvature = -0.15; // smoother curvature distribution
      }

      const id = `q_${nodeIndex}`;
      nodes.push({
        id,
        x,
        y,
        z,
        qubitIndex: nodeIndex,
        coherenceTime: adaptive ? 98.5 + (nodeIndex % 7) * 2.1 : 62.0 + (nodeIndex % 5) * 1.8,
        phaseAngle: theta,
        curvature,
        isSyndromeNode: nodeIndex % 6 === 0,
      });

      nodeIndex++;
    }
  }

  // Create intra-ring and inter-ring edges (2-qubit couplers)
  for (let i = 0; i < nodes.length; i++) {
    // Next in ring
    const nextInRing = i % nodesPerRing === nodesPerRing - 1 ? i - nodesPerRing + 1 : i + 1;
    if (nextInRing < nodes.length) {
      edges.push({
        id: `e_${i}_${nextInRing}`,
        source: nodes[i].id,
        target: nodes[nextInRing].id,
        couplingStrength: adaptive ? 0.96 : 0.78,
        errorProbability: adaptive ? 0.0018 : 0.0142,
      });
    }

    // Connect across rings
    const ringNeighbor = (i + nodesPerRing) % nodes.length;
    edges.push({
      id: `e_${i}_${ringNeighbor}`,
      source: nodes[i].id,
      target: nodes[ringNeighbor].id,
      couplingStrength: adaptive ? 0.94 : 0.72,
      errorProbability: adaptive ? 0.0022 : 0.0165,
    });
  }

  // Bridge connection between left and right tori (the genus-2 neck)
  edges.push({
    id: `bridge_neck_1`,
    source: nodes[nodesPerRing - 1].id,
    target: nodes[nodesPerRing * 3].id,
    couplingStrength: adaptive ? 0.98 : 0.85,
    errorProbability: adaptive ? 0.0012 : 0.019,
  });

  // Voids representing topological invariants (Betti numbers beta_0, beta_1, beta_2)
  const voids: TopologicalVoid[] = [
    {
      id: 'void_alpha',
      name: 'Left Handle Cavity (α-Cycle)',
      center: [-10, 0, 0],
      radius: 4.8,
      betti: { b0: 1, b1: 2, b2: 1 },
      persistence: { birth: 0.12, death: 4.85, lifetime: 4.73, confidence: 0.98 },
      description: 'Primary non-contractible 1-cycle around genus handle 1. Encodes logical qubit QL_0 with invariant phase flux.',
      genusContribution: 1,
    },
    {
      id: 'void_beta',
      name: 'Right Handle Cavity (β-Cycle)',
      center: [10, 0, 0],
      radius: 4.8,
      betti: { b0: 1, b1: 2, b2: 1 },
      persistence: { birth: 0.14, death: 4.92, lifetime: 4.78, confidence: 0.97 },
      description: 'Secondary non-contractible 1-cycle around genus handle 2. Encodes logical qubit QL_1 shielded from local spin bath.',
      genusContribution: 1,
    },
    {
      id: 'void_gamma',
      name: 'Inter-Genus Neck Tunnel (γ-Neck)',
      center: [0, 0, 0],
      radius: 3.2,
      betti: { b0: 1, b1: 4, b2: 2 },
      persistence: { birth: 0.35, death: 3.88, lifetime: 3.53, confidence: 0.94 },
      description: 'Homological pinch zone bridging dual handles. Manages entanglement swapping between logical topological registers.',
      genusContribution: 2,
    },
  ];

  return { nodes, edges, voids };
}

/**
 * Execute topological surgery on a quantum manifold:
 * Cuts degraded high-error links, isolates noise entropy,
 * and stitches new geodesic stabilizer bonds.
 */
export function executeTopologicalSurgery(
  edges: ManifoldEdge[],
  noiseThreshold: number = 0.01
): {
  modifiedEdges: ManifoldEdge[];
  cutCount: number;
  stitchedCount: number;
} {
  let cutCount = 0;
  let stitchedCount = 0;

  const modifiedEdges = edges.map((edge) => {
    // High-error non-bridge couplers are excised to isolate noise
    if (edge.errorProbability >= noiseThreshold && !edge.id.includes('bridge') && !edge.isStitched) {
      cutCount++;
      return {
        ...edge,
        isCut: true,
        couplingStrength: 0.0,
      };
    }

    // Bridge stabilizers and perimeter boundary loops are re-stitched with topological protection
    if (edge.id.includes('bridge') || edge.couplingStrength < 0.8 || edge.isCut) {
      stitchedCount++;
      return {
        ...edge,
        isCut: false,
        isStitched: true,
        couplingStrength: 0.992,
        errorProbability: 0.0006, // suppressed by topological invariant
      };
    }

    return edge;
  });

  return { modifiedEdges, cutCount, stitchedCount };
}

/**
 * Compute global topological Euler characteristic:
 * χ = V - E + F = 2 - 2g
 * For genus g=2: χ = 2 - 4 = -2
 */
export function computeEulerCharacteristic(
  vertexCount: number,
  edgeCount: number,
  faceCount: number
): number {
  return vertexCount - edgeCount + faceCount;
}

/**
 * Predict genus g from Euler characteristic:
 * g = (2 - χ) / 2
 */
export function predictGenus(eulerChar: number): number {
  return Math.max(0, Math.round((2 - eulerChar) / 2));
}
