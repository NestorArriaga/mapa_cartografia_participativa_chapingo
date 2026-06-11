import { describe, it, expect } from "vitest";
import {
  calculateZonePriority,
  TerritorialSignal
} from "./TerritorialPriorityEngine";

describe("TerritorialPriorityEngine", () => {
  it("should calculate correct score for zone with all components", () => {
    const signals: TerritorialSignal[] = [
      { id: "1", zoneId: "z1", signalType: "quantitative_survey", rawScore: 80, confidence: "alta" },
      { id: "2", zoneId: "z1", signalType: "qualitative_testimony", rawScore: 70, confidence: "media" },
      { id: "3", zoneId: "z1", signalType: "documentary_evidence", rawScore: 90, confidence: "alta" },
      { id: "4", zoneId: "z1", signalType: "protected_signal", rawScore: 60, confidence: "baja" },
      { id: "5", zoneId: "z1", signalType: "participatory_feedback", rawScore: 85, confidence: "media" },
      { id: "6", zoneId: "z1", signalType: "mobility_connectivity", rawScore: 50, confidence: "baja" },
    ];

    const result = calculateZonePriority("z1", "Zona Central", signals);
    
    // Calculation:
    // 0.35 * 80 (28) + 0.25 * 70 (17.5) + 0.15 * 90 (13.5) + 0.10 * 60 (6) + 0.10 * 85 (8.5) + 0.05 * 50 (2.5)
    // 28 + 17.5 + 13.5 + 6 + 8.5 + 2.5 = 76
    expect(result.priorityScore).toBe(76);
    expect(result.priorityLabel).toBe("prioridad_alta");
    expect(result.componentsAvailable).toBe(6);
    expect(result.componentsMissing.length).toBe(0);
  });

  it("should return validacion_cualitativa for zone with qualitative only", () => {
    const signals: TerritorialSignal[] = [
      { id: "1", zoneId: "z2", signalType: "qualitative_testimony", rawScore: 60, confidence: "baja" }
    ];
    
    const result = calculateZonePriority("z2", "Zona Periferia", signals);
    expect(result.priorityScore).toBe(60); // only one component, redistributes 100% weight to it
    expect(result.priorityLabel).toBe("validacion_cualitativa");
    expect(result.hasQualitativeOnly).toBe(true);
  });

  it("boyeros should always return validacion_cualitativa and never sin_datos", () => {
    // Pass empty signals to boyeros
    const result = calculateZonePriority("boyeros", "Colonia Boyeros", []);
    
    expect(result.priorityLabel).toBe("validacion_cualitativa");
    expect(result.validationStatus).toBe("validacion_cualitativa");
    expect(result.priorityScore).toBe(70); // forced by rule
    expect(result.hasQualitativeOnly).toBe(true);
    // Ensure no forbidden words
    expect(result.warnings[0]).not.toMatch(/riesgo|peligros/i);
    expect(result.warnings[0]).toMatch(/Boyeros/);
  });

  it("normalizes weights when components are missing", () => {
    const signals: TerritorialSignal[] = [
      { id: "1", zoneId: "z3", signalType: "quantitative_survey", rawScore: 100, confidence: "alta" }, // 0.35
      { id: "2", zoneId: "z3", signalType: "documentary_evidence", rawScore: 100, confidence: "alta" } // 0.15
    ];
    // available weights sum = 0.50
    // redistributed: quant gets 0.35/0.50 = 0.70, doc gets 0.15/0.50 = 0.30
    // final score = 100 * 0.70 + 100 * 0.30 = 100
    
    const result = calculateZonePriority("z3", "Zona Norte", signals);
    expect(result.priorityScore).toBe(100);
    expect(result.componentsMissing.length).toBe(4);
    expect(result.componentsAvailable).toBe(2);
  });

  it("forbidden vocabulary is absent from all outputs", () => {
    const result = calculateZonePriority("boyeros_test", "Trayecto Boyeros", []);
    const text = JSON.stringify(result);
    expect(text).not.toMatch(/riesgo/i);
    expect(text).not.toMatch(/peligroso/i);
    expect(text).not.toMatch(/ruta segura/i);
  });
});
