import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[MapVivo Fatal Error]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          data-testid="fatal-error-panel"
          style={{
            minHeight: "100vh",
            width: "100vw",
            background: "#030712",
            color: "#F4F7FB",
            display: "grid",
            placeItems: "center",
            padding: 32,
            fontFamily: "system-ui, sans-serif",
            margin: 0,
          }}
        >
          <div
            style={{
              maxWidth: 600,
              width: "100%",
              border: "1px solid rgba(255,255,255,.15)",
              borderRadius: 16,
              padding: 32,
              background: "rgba(15,23,42,.92)",
            }}
          >
            <h1
              style={{
                color: "#FF4D5E",
                fontSize: 20,
                margin: "0 0 12px 0",
                fontWeight: 700,
              }}
            >
              Mapa Vivo no pudo iniciar correctamente
            </h1>
            <p style={{ color: "#9AA9BA", fontSize: 14, margin: "0 0 16px 0" }}>
              Ocurrio un error fatal de JavaScript. El equipo tecnico ha sido
              notificado.
            </p>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "rgba(0,0,0,.4)",
                padding: 16,
                borderRadius: 8,
                overflow: "auto",
                fontSize: 12,
                color: "#FB923C",
                margin: "0 0 20px 0",
                maxHeight: 200,
              }}
            >
              {this.state.error?.message}
              {"\n"}
              {this.state.error?.stack?.split("\n").slice(0, 5).join("\n")}
            </pre>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => window.location.reload()}
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
                Recargar
              </button>
              <button
                onClick={() => {
                  window.location.href = "/?safe";
                }}
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
                Activar modo seguro
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
