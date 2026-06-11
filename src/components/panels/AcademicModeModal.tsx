import React from "react";

interface AcademicModeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AcademicModeModal: React.FC<AcademicModeModalProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div data-testid="academic-consent-modal" style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "grid",
      placeItems: "center",
      background: "rgba(3, 7, 18, 0.85)",
      backdropFilter: "blur(8px)",
      padding: 24
    }}>
      <div style={{
        maxWidth: 500,
        width: "100%",
        background: "#07140F", // deepCanopy
        border: "1px solid #D6A83A", // chapingoGold
        borderRadius: 24,
        padding: 32,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
        fontFamily: "var(--font-ui), system-ui, sans-serif"
      }}>
        <h2 style={{
          margin: "0 0 16px 0",
          fontFamily: "var(--font-title), sans-serif",
          fontSize: "1.5rem",
          color: "#D6A83A"
        }}>
          Modo académico interno
        </h2>
        <p style={{
          margin: "0 0 24px 0",
          fontSize: "0.95rem",
          lineHeight: "1.6",
          color: "#F4F7FB"
        }}>
          Este modo usa señales de revisión y datos protegidos como agregados para análisis académico. No representa publicación pública ni ubicación exacta de eventos sensibles.
        </p>
        <div style={{
          display: "flex",
          gap: 12,
          justifyContent: "flex-end"
        }}>
          <button 
            onClick={onCancel}
            style={{
              background: "transparent",
              color: "#9AA9BA",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "10px 20px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.875rem",
              transition: "all 0.2s"
            }}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            style={{
              background: "#D6A83A",
              color: "#030712",
              border: "none",
              borderRadius: 12,
              padding: "10px 20px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.875rem",
              transition: "all 0.2s"
            }}
          >
            Entiendo y activar modo académico
          </button>
        </div>
      </div>
    </div>
  );
};
