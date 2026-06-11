import { useState, useEffect } from "react";

export default function SafeApp() {
  const [status, setStatus] = useState("Iniciando...");
  const [dataStatus, setDataStatus] = useState<string>("pendiente");
  const [layerCounts, setLayerCounts] = useState<{
    zones: number;
    nodes: number;
    routes: number;
  } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setStatus("Modo seguro activo");

    // Try loading data in safe mode
    (async () => {
      try {
        const { loadSafeMapVivoData } = await import(
          "./lib/safeMapVivoDataLoader"
        );
        const result = await loadSafeMapVivoData();
        if (result.ok) {
          setDataStatus("cargado");
          const zones = result.layers.filter((l) =>
            l.geometryType.includes("Polygon")
          ).length;
          const nodes = result.layers.filter((l) =>
            l.geometryType.includes("Point")
          ).length;
          const routes = result.layers.filter((l) =>
            l.geometryType.includes("Line")
          ).length;
          setLayerCounts({ zones, nodes, routes });
        } else {
          setDataStatus("parcial");
          setErrors(result.errors);
        }
      } catch (err: any) {
        setDataStatus("error");
        setErrors((prev) => [...prev, err.message]);
      }
    })();
  }, []);

  return (
    <div
      className="safe-app"
      data-testid="app-root"
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#030712",
        color: "#F4F7FB",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui, sans-serif",
        margin: 0,
        padding: 32,
      }}
    >
      <div
        data-testid="safe-app"
        style={{
          maxWidth: 700,
          width: "100%",
        }}
      >
        <h1
          style={{
            color: "#D6A83A",
            fontSize: 24,
            margin: "0 0 8px 0",
            fontWeight: 700,
          }}
        >
          Mapa Vivo UACh-Texcoco
        </h1>
        <p
          style={{
            color: "#9AA9BA",
            fontSize: 14,
            margin: "0 0 24px 0",
          }}
        >
          Modo seguro visible
        </p>

        {/* Status */}
        <div
          style={{
            background: "rgba(15,23,42,.88)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              color: "#9AA9BA",
              letterSpacing: "0.05em",
              marginBottom: 12,
            }}
          >
            Estado del sistema
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <StatusRow label="Aplicacion" value={status} ok={true} />
            <StatusRow
              label="Datos GeoJSON"
              value={dataStatus}
              ok={dataStatus === "cargado"}
            />
            {layerCounts && (
              <>
                <StatusRow
                  label="Capas tipo zona"
                  value={String(layerCounts.zones)}
                  ok={layerCounts.zones > 0}
                />
                <StatusRow
                  label="Capas tipo nodo"
                  value={String(layerCounts.nodes)}
                  ok={layerCounts.nodes > 0}
                />
                <StatusRow
                  label="Capas tipo ruta"
                  value={String(layerCounts.routes)}
                  ok={layerCounts.routes > 0}
                />
              </>
            )}
          </div>
        </div>

        {/* Safe map fallback */}
        <div
          data-testid="safe-map-fallback"
          style={{
            width: "100%",
            height: 300,
            background: "#0B1220",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            marginBottom: 16,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ textAlign: "center", zIndex: 1 }}>
            <div
              style={{
                fontSize: 13,
                color: "#9AA9BA",
                marginBottom: 8,
              }}
            >
              Area de mapa (modo seguro)
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6B7B8D",
              }}
            >
              19.4553 N, -98.8800 W | Chapingo, Texcoco
            </div>
          </div>
          {/* Grid lines for visual reference */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Diagnostics */}
        <div
          data-testid="safe-diagnostics"
          style={{
            background: "rgba(15,23,42,.88)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              color: "#9AA9BA",
              letterSpacing: "0.05em",
              marginBottom: 12,
            }}
          >
            Diagnostico
          </div>
          {errors.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {errors.map((e, i) => (
                <div
                  key={i}
                  style={{ fontSize: 11, color: "#FF4D5E", fontFamily: "monospace" }}
                >
                  {e}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#35D07F" }}>
              Sin errores detectados
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              background: "#D6A83A",
              color: "#030712",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Reintentar mapa
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "transparent",
              color: "#9AA9BA",
              border: "1px solid rgba(255,255,255,.15)",
              borderRadius: 8,
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Volver a visor estable
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 12,
      }}
    >
      <span style={{ color: "#9AA9BA" }}>{label}</span>
      <span
        style={{
          color: ok ? "#35D07F" : "#FB923C",
          fontFamily: "monospace",
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    </div>
  );
}
