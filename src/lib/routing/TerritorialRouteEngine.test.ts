import { describe, it, expect } from "vitest";
import { calculateTerritorialRoute, RouteRequest } from "./TerritorialRouteEngine";

describe("TerritorialRouteEngine", () => {
  const origin: [number, number] = [-98.8820, 19.4930]; // DICIFO
  const destFar: [number, number] = [-98.8700, 19.4800]; // Far destination
  const destBoyeros: [number, number] = [-98.8890, 19.4990]; // Boyeros

  it("should calculate a trayecto_directo and include the standard warnings and disclaimer", () => {
    const request: RouteRequest = {
      origin,
      destination: destFar,
      profile: "trayecto_directo"
    };

    const result = calculateTerritorialRoute(request);

    expect(result.profile).toBe("trayecto_directo");
    expect(result.exposureIndex).toBe(80);
    expect(result.ethicalDisclaimer).toBe("Este trayecto es una orientación aproximada. No garantiza condiciones de ningún tipo.");
    expect(result.warnings).toContain("Este trayecto no evalúa condiciones territoriales. Úsalo con criterio propio.");
    expect(result.passesThroughBoyeros).toBe(false);
  });

  it("should warn about crossing boyeros when calculating a route to boyeros", () => {
    const request: RouteRequest = {
      origin,
      destination: destBoyeros,
      profile: "trayecto_balanceado"
    };

    const result = calculateTerritorialRoute(request);

    expect(result.passesThroughBoyeros).toBe(true);
    expect(result.warnings).toContain("Este trayecto cruza zona de validación cualitativa (Boyeros).");
  });

  it("never includes forbidden vocabulary like 'segura' in the output", () => {
    const request: RouteRequest = {
      origin,
      destination: destFar,
      profile: "trayecto_menor_exposicion"
    };

    const result = calculateTerritorialRoute(request);
    const json = JSON.stringify(result).toLowerCase();
    
    expect(json).not.toContain("segura");
    expect(json).not.toContain("seguro");
    expect(json).not.toContain("riesgo");
    expect(json).not.toContain("peligro");
    expect(result.exposureIndex).toBe(20);
  });
});
