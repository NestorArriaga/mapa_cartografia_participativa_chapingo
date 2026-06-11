import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  moduleName: string;
  fallback?: ReactNode;
  onCatch?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`MapErrorBoundary caught an error in module ${this.props.moduleName}:`, error, errorInfo);
    if (this.props.onCatch) {
      this.props.onCatch(error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="absolute top-4 left-4 z-50 bg-[#030712]/90 border border-[#FF4D5E]/30 rounded-xl p-3 flex items-center gap-3 backdrop-blur-md">
          <AlertTriangle size={16} className="text-[#FF4D5E]" />
          <div className="flex flex-col">
            <span className="text-white text-[10px] font-bold uppercase tracking-wider">Module Failure</span>
            <span className="text-[#9AA9BA] text-[10px]">{this.props.moduleName} could not render.</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
