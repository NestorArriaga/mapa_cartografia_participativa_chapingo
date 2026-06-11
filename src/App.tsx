import SafeApp from "./App.safe";
import StableApp from "./App.stable";

const FORCE_SAFE = new URLSearchParams(window.location.search).has("safe");

export default function App() {
  if (FORCE_SAFE) return <SafeApp />;
  return <StableApp />;
}
