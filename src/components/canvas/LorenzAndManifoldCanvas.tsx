import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useExperiment } from '../../context/ExperimentContext.tsx';
import { rk4Step } from '../../simulation/lorenz.ts';
import { TopologicalVoid } from '../../types/ift.ts';

interface CanvasProps {
  mode: 'lorenz' | 'manifold' | 'tda';
  height?: string;
}

// Module-level scratch variables to prevent GC allocations
const _vec3 = new THREE.Vector3();
const _color = new THREE.Color();
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();

export const LorenzAndManifoldCanvas: React.FC<CanvasProps> = ({ mode, height = 'h-[500px]' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const {
    lorenzParams,
    setCurrentPhaseCoords,
    nodes,
    edges,
    voids,
    selectedVoid,
    setSelectedVoid,
    isAdaptive,
    isPerformingSurgery,
  } = useExperiment();

  // Internal visual state
  const [hoveredVoidName, setHoveredVoidName] = useState<string | null>(null);

  // References for render loop access without unmounting WebGL context
  const stateRef = useRef({
    mode,
    lorenzParams,
    nodes,
    edges,
    voids,
    isAdaptive,
    isPerformingSurgery,
    selectedVoid,
  });

  useEffect(() => {
    stateRef.current = {
      mode,
      lorenzParams,
      nodes,
      edges,
      voids,
      isAdaptive,
      isPerformingSurgery,
      selectedVoid,
    };
  }, [mode, lorenzParams, nodes, edges, voids, isAdaptive, isPerformingSurgery, selectedVoid]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 500;

    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712); // slate-950
    scene.fog = new THREE.FogExp2(0x030712, 0.015);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0, 15, 48);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.5); // sky-400
    keyLight.position.set(30, 40, 30);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 2.0); // purple-500
    rimLight.position.set(-30, -20, -30);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x06b6d4, 2.0, 60); // cyan-500
    fillLight.position.set(0, 0, 10);
    scene.add(fillLight);

    // Subtle studio grounding grid
    const gridHelper = new THREE.GridHelper(70, 35, 0x0284c7, 0x0f172a);
    gridHelper.position.y = -18;
    scene.add(gridHelper);

    // ==========================================
    // 1. Classical Lorenz Attractor Visuals
    // ==========================================
    const lorenzGroup = new THREE.Group();
    scene.add(lorenzGroup);

    // Trail ribbon for Lorenz trajectory
    const MAX_TRAIL_POINTS = 3200;
    const trailPositions = new Float32Array(MAX_TRAIL_POINTS * 3);
    const trailColors = new Float32Array(MAX_TRAIL_POINTS * 3);

    // Seed initial position
    let currentLorenz = { x: 0.1, y: 0.0, z: 0.0 };
    for (let i = 0; i < MAX_TRAIL_POINTS; i++) {
      currentLorenz = rk4Step(currentLorenz, stateRef.current.lorenzParams, 0.01);
      const i3 = i * 3;
      // Center the Lorenz attractor (z is typically around 25-28)
      trailPositions[i3] = currentLorenz.x * 0.9;
      trailPositions[i3 + 1] = (currentLorenz.z - 25) * 0.9;
      trailPositions[i3 + 2] = currentLorenz.y * 0.9;

      // Color gradient from cyan to violet along trajectory
      const t = i / MAX_TRAIL_POINTS;
      _color.setHSL(0.55 + t * 0.25, 0.9, 0.55);
      trailColors[i3] = _color.r;
      trailColors[i3 + 1] = _color.g;
      trailColors[i3 + 2] = _color.b;
    }

    const trailGeometry = new THREE.BufferGeometry();
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

    const trailMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const trailLine = new THREE.Line(trailGeometry, trailMaterial);
    lorenzGroup.add(trailLine);

    // Particle swarm around the attractor
    const PARTICLE_COUNT = 850;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleSpeeds = new Float32Array(PARTICLE_COUNT);

    // Distribute particles along the attractor
    let pState = { x: 1.0, y: 1.0, z: 1.0 };
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let s = 0; s < 4; s++) {
        pState = rk4Step(pState, stateRef.current.lorenzParams, 0.01);
      }
      const i3 = i * 3;
      particlePositions[i3] = pState.x * 0.9;
      particlePositions[i3 + 1] = (pState.z - 25) * 0.9;
      particlePositions[i3 + 2] = pState.y * 0.9;
      particleSpeeds[i] = 0.8 + Math.random() * 0.6;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.85,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMaterial);
    lorenzGroup.add(particleSystem);

    // ==========================================
    // 2. Quantum Manifold Visuals (Discrete Mesh)
    // ==========================================
    const manifoldGroup = new THREE.Group();
    scene.add(manifoldGroup);

    // Node spheres representing physical/logical qubits
    const nodeSpheres: THREE.Mesh[] = [];
    const nodeGeometry = new THREE.SphereGeometry(0.7, 16, 16);
    const nodeMaterialNormal = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // cyan-500
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });

    const nodeMaterialSyndrome = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // amber-500 syndrome nodes
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });

    // Edges (2-qubit couplers)
    const edgeLinesGroup = new THREE.Group();
    manifoldGroup.add(edgeLinesGroup);

    // Topological Void visualizers (energy bubbles for Betti voids)
    const voidMeshes: { mesh: THREE.Mesh; voidData: TopologicalVoid }[] = [];
    const voidSphereGeo = new THREE.SphereGeometry(1, 24, 24);

    const updateManifoldMeshes = () => {
      // Clear previous nodes
      while (manifoldGroup.children.length > 0) {
        manifoldGroup.remove(manifoldGroup.children[0]);
      }
      nodeSpheres.length = 0;
      voidMeshes.length = 0;

      const currentNodes = stateRef.current.nodes;
      const currentEdges = stateRef.current.edges;
      const currentVoids = stateRef.current.voids;

      // Add nodes
      currentNodes.forEach((node) => {
        const mat = node.isSyndromeNode ? nodeMaterialSyndrome : nodeMaterialNormal;
        const mesh = new THREE.Mesh(nodeGeometry, mat);
        mesh.position.set(node.x, node.y, node.z);
        mesh.userData = { nodeId: node.id, qubitIndex: node.qubitIndex };
        manifoldGroup.add(mesh);
        nodeSpheres.push(mesh);
      });

      // Add edges as tube/line segments
      const nodeMap = new Map(currentNodes.map(n => [n.id, n]));
      const edgePositions: number[] = [];
      const edgeColors: number[] = [];

      currentEdges.forEach((edge) => {
        const src = nodeMap.get(edge.source);
        const tgt = nodeMap.get(edge.target);
        if (src && tgt) {
          edgePositions.push(src.x, src.y, src.z);
          edgePositions.push(tgt.x, tgt.y, tgt.z);

          // Color based on edge state (cut = red, stitched = gold/cyan, normal = cyan)
          if (edge.isCut) {
            _color.setHex(0xef4444); // red cut
          } else if (edge.isStitched) {
            _color.setHex(0x10b981); // green/emerald stitched
          } else if (stateRef.current.isAdaptive) {
            _color.setHex(0x38bdf8); // sky blue
          } else {
            _color.setHex(0x64748b); // slate grey
          }

          edgeColors.push(_color.r, _color.g, _color.b);
          edgeColors.push(_color.r, _color.g, _color.b);
        }
      });

      const edgeGeometry = new THREE.BufferGeometry();
      edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
      edgeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(edgeColors, 3));

      const edgeMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });

      const lineSegments = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      manifoldGroup.add(lineSegments);

      // Add Topological Voids (visible in TDA mode or manifold mode)
      currentVoids.forEach((v) => {
        const isSelected = stateRef.current.selectedVoid?.id === v.id;
        const voidMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xa855f7 : 0x06b6d4,
          transparent: true,
          opacity: isSelected ? 0.45 : 0.22,
          roughness: 0.1,
          metalness: 0.1,
          wireframe: true,
        });

        const vMesh = new THREE.Mesh(voidSphereGeo, voidMat);
        vMesh.position.set(v.center[0], v.center[1], v.center[2]);
        vMesh.scale.setScalar(v.radius);
        vMesh.userData = { voidId: v.id, isVoid: true };
        manifoldGroup.add(vMesh);
        voidMeshes.push({ mesh: vMesh, voidData: v });

        // Add an equator ring around the void to visualize the 1-cycle generator (b_1)
        const ringGeo = new THREE.TorusGeometry(v.radius * 0.98, 0.12, 12, 36);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0xf43f5e : 0x38bdf8,
          transparent: true,
          opacity: 0.8,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        vMesh.add(ringMesh);
      });
    };

    updateManifoldMeshes();

    // ==========================================
    // Interactive Mouse Orbit and Raycasting
    // ==========================================
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationX = 0.2;
    let targetRotationY = 0;
    let targetDistance = 46;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        // Clamp vertical tilt
        targetRotationX = Math.max(-1.4, Math.min(1.4, targetRotationX));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }

      // Raycast against voids and nodes
      _raycaster.setFromCamera(_mouse, camera);
      const voidMeshList = voidMeshes.map(vm => vm.mesh);
      const intersects = _raycaster.intersectObjects(voidMeshList, false);
      if (intersects.length > 0) {
        const hit = voidMeshes.find(vm => vm.mesh === intersects[0].object);
        if (hit) {
          setHoveredVoidName(hit.voidData.name);
          renderer.domElement.style.cursor = 'pointer';
        }
      } else {
        setHoveredVoidName(null);
        renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      // If click was a tap without large drag, check selection
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_mouse, camera);

      const voidMeshList = voidMeshes.map(vm => vm.mesh);
      const intersects = _raycaster.intersectObjects(voidMeshList, false);
      if (intersects.length > 0) {
        const hit = voidMeshes.find(vm => vm.mesh === intersects[0].object);
        if (hit) {
          stateRef.current.selectedVoid = hit.voidData;
          setSelectedVoid(hit.voidData);
        }
      }

      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetDistance += e.deltaY * 0.035;
      targetDistance = Math.max(16, Math.min(95, targetDistance));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Handle container resize
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // Animation Loop
    // ==========================================
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let simPoint = { x: 0.1, y: 0.0, z: 0.0 };
    let frameCount = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      frameCount++;

      const currentMode = stateRef.current.mode;

      // Smooth camera position damping
      const phi = targetRotationX;
      const theta = targetRotationY;
      const r = targetDistance;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, r * Math.sin(theta) * Math.cos(phi), 4, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, r * Math.sin(phi) + 4, 4, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, r * Math.cos(theta) * Math.cos(phi), 4, delta);
      camera.lookAt(0, 0, 0);

      // Auto slow orbit when not user-dragging
      if (!isDragging) {
        targetRotationY += 0.002;
      }

      // Mode visibility & morphing
      if (currentMode === 'lorenz') {
        lorenzGroup.visible = true;
        manifoldGroup.visible = false;

        // Advance chaotic particle flow
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const i3 = i * 3;
          let p: { x: number; y: number; z: number } = {
            x: positions[i3] / 0.9,
            y: positions[i3 + 2] / 0.9,
            z: positions[i3 + 1] / 0.9 + 25,
          };

          p = rk4Step(p, stateRef.current.lorenzParams, 0.012 * particleSpeeds[i]);
          positions[i3] = p.x * 0.9;
          positions[i3 + 1] = (p.z - 25) * 0.9;
          positions[i3 + 2] = p.y * 0.9;
        }
        particleGeo.attributes.position.needsUpdate = true;

        // Update single tracker particle for HUD coordinates
        simPoint = rk4Step(simPoint, stateRef.current.lorenzParams, 0.015);
        if (frameCount % 6 === 0) {
          setCurrentPhaseCoords([
            parseFloat(simPoint.x.toFixed(3)),
            parseFloat(simPoint.y.toFixed(3)),
            parseFloat(simPoint.z.toFixed(3)),
          ]);
        }
      } else {
        lorenzGroup.visible = false;
        manifoldGroup.visible = true;

        // Subtle pulsing of topological voids and rotation
        voidMeshes.forEach(({ mesh, voidData }) => {
          const isSelected = stateRef.current.selectedVoid?.id === voidData.id;
          const time = clock.getElapsedTime();
          const pulse = 1 + 0.06 * Math.sin(time * 3 + voidData.radius);
          mesh.scale.setScalar(voidData.radius * pulse);

          if (mesh.children[0]) {
            mesh.children[0].rotation.z += 0.015;
          }

          if (isSelected) {
            (mesh.material as THREE.MeshStandardMaterial).color.setHex(0xa855f7);
          }
        });

        // Breathing of nodes
        nodeSpheres.forEach((nodeMesh, idx) => {
          const time = clock.getElapsedTime();
          const breathe = 1 + 0.08 * Math.sin(time * 2 + idx);
          nodeMesh.scale.setScalar(breathe);
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Reconstruct manifold mesh whenever nodes/edges change or mode changes
    const checkStateInterval = setInterval(() => {
      // If surgery or adaptive toggle occurred, update meshes
      updateManifoldMeshes();
    }, 400);

    return () => {
      clearInterval(checkStateInterval);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('wheel', onWheel);

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      trailGeometry.dispose();
      trailMaterial.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterialNormal.dispose();
      nodeMaterialSyndrome.dispose();
      voidSphereGeo.dispose();
    };
  }, [mode]);

  return (
    <div className={`relative w-full ${height} overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl`}>
      {/* Three.js mount container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Canvas HUD Overlay */}
      <div className="pointer-events-none absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 px-3 py-1.5 backdrop-blur-md border border-slate-700/60 text-xs font-mono text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>{mode === 'lorenz' ? '3D Classical Lorenz Attractor' : mode === 'manifold' ? '3D Quantum Circuit Manifold' : '3D Topological Data Analysis (TDA)'}</span>
        </div>
        {hoveredVoidName && (
          <div className="rounded-lg bg-purple-950/80 px-3 py-1.5 backdrop-blur-md border border-purple-500/50 text-xs font-mono text-purple-200 shadow-lg">
            Hovering: {hoveredVoidName}
          </div>
        )}
      </div>

      {/* Instruction badge */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-lg bg-slate-900/80 px-3 py-1.5 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-400">
        Click & Drag to Rotate • Scroll to Zoom
      </div>
    </div>
  );
};
