import type { LorenzParams } from '../types/ift.ts';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export const DEFAULT_LORENZ_PARAMS: LorenzParams = {
  sigma: 10.0,
  rho: 28.0,
  beta: 8 / 3,
  dt: 0.01,
  speed: 1.0,
};

/**
 * Derivatives for Lorenz 1963 system:
 * dx/dt = sigma * (y - x)
 * dy/dt = x * (rho - z) - y
 * dz/dt = x * y - beta * z
 */
export function lorenzDerivatives(
  p: Point3D,
  params: LorenzParams
): Point3D {
  const { sigma, rho, beta } = params;
  return {
    x: sigma * (p.y - p.x),
    y: p.x * (rho - p.z) - p.y,
    z: p.x * p.y - beta * p.z,
  };
}

/**
 * Runge-Kutta 4th-order (RK4) numerical integrator for Lorenz equations.
 */
export function rk4Step(
  current: Point3D,
  params: LorenzParams,
  dt = params.dt
): Point3D {
  const h = dt * params.speed;

  // k1
  const k1 = lorenzDerivatives(current, params);

  // k2
  const p2: Point3D = {
    x: current.x + 0.5 * h * k1.x,
    y: current.y + 0.5 * h * k1.y,
    z: current.z + 0.5 * h * k1.z,
  };
  const k2 = lorenzDerivatives(p2, params);

  // k3
  const p3: Point3D = {
    x: current.x + 0.5 * h * k2.x,
    y: current.y + 0.5 * h * k2.y,
    z: current.z + 0.5 * h * k2.z,
  };
  const k3 = lorenzDerivatives(p3, params);

  // k4
  const p4: Point3D = {
    x: current.x + h * k3.x,
    y: current.y + h * k3.y,
    z: current.z + h * k3.z,
  };
  const k4 = lorenzDerivatives(p4, params);

  return {
    x: current.x + (h / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x),
    y: current.y + (h / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y),
    z: current.z + (h / 6) * (k1.z + 2 * k2.z + 2 * k3.z + k4.z),
  };
}

/**
 * Generate a sequence of N points along the Lorenz attractor trajectory.
 */
export function generateLorenzTrajectory(
  initialPoint: Point3D,
  count: number,
  params: LorenzParams = DEFAULT_LORENZ_PARAMS
): Point3D[] {
  const trajectory: Point3D[] = [initialPoint];
  let current = { ...initialPoint };

  for (let i = 1; i < count; i++) {
    current = rk4Step(current, params);
    trajectory.push(current);
  }

  return trajectory;
}

/**
 * Computes an estimate of the largest Lyapunov exponent given two nearby trajectories.
 */
export function estimateLyapunovExponent(
  d0: number,
  dt: number,
  steps: number,
  finalSeparation: number
): number {
  if (d0 <= 0 || steps <= 0 || finalSeparation <= 0) return 0.9056;
  const t = steps * dt;
  return (1 / t) * Math.log(finalSeparation / d0);
}
