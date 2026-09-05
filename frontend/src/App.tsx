import { useCallback, useEffect, useState } from "react";
import AccountSwitcher from "./components/AccountSwitcher";
import AdminDashboard from "./components/AdminDashboard";
import AuditTrail from "./components/AuditTrail";
import CustodyPipeline from "./components/CustodyPipeline";
import IdentityCentre from "./components/IdentityCentre";
import RevertDisplay from "./components/RevertDisplay";
import type { RevertInfo } from "./components/RevertDisplay";
import ToastStack from "./components/Toast";
import UserView from "./components/UserView";
import VerifyAsset from "./components/VerifyAsset";
import { ActiveAccountProvider } from "./context/ActiveAccountContext";
import { isNodeReachable } from "./lib/provider";
import { useToasts } from "./lib/useToasts";

type Screen = "pipeline" | "admin" | "identity" | "user" | "verify" | "audit";

// Ordered as the demo walks them: issue -> govern -> hold -> verify -> audit.
const TABS: Array<{ id: Screen; label: string }> = [
  { id: "pipeline", label: "Pipeline" },
  { id: "admin", label: "Admin" },
  { id: "identity", label: "Identities" },
  { id: "user", label: "User" },
  { id: "verify", label: "Verify" },
  { id: "audit", label: "Audit" },
];

function Shell() {
  // The pipeline is the demo's front door: the workflow, not the toolbox.
  const [screen, setScreen] = useState<Screen>("pipeline");
  const [revert, setRevert] = useState<RevertInfo | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [nodeUp, setNodeUp] = useState<boolean | null>(null);
  const { toasts, push, update, dismiss } = useToasts();

  useEffect(() => {
    isNodeReachable().then(setNodeUp);
  }, []);

  // Any successful write bumps this so every mounted screen re-reads the chain.
  const onChainChanged = useCallback(() => setRefreshKey((k) => k + 1), []);

  // A new action supersedes the previous rejection banner.
  const onRevert = useCallback((info: RevertInfo) => setRevert(info), []);
  const goTo = useCallback((next: Screen) => {
    setScreen(next);
    setRevert(null);
  }, []);

  if (nodeUp === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-lg rounded-lg border-2 border-danger bg-danger-bg p-6 shadow-lg">
          <h1 className="text-xl font-bold text-danger">Cannot connect to local node</h1>
          <p className="mt-2 text-sm text-danger/80">
            Is <code className="font-mono">npx hardhat node</code> running in
            <code className="mx-1 font-mono">contracts-app/</code>? Start it, then
            re-run the deploy script and reload this page.
          </p>
        </div>
      </div>
    );
  }

  const screenProps = {
    onRevert,
    pushToast: push,
    updateToast: update,
    refreshKey,
    onChainChanged,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-brand shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
          <span className="text-lg font-bold text-white">ChainID Vault</span>
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => goTo(tab.id)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                  screen === tab.id
                    ? "bg-white text-brand"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <AccountSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {revert && <RevertDisplay info={revert} onDismiss={() => setRevert(null)} />}
        {screen === "pipeline" && <CustodyPipeline onChainChanged={onChainChanged} />}
        {screen === "admin" && <AdminDashboard {...screenProps} />}
        {screen === "identity" && <IdentityCentre {...screenProps} />}
        {screen === "user" && <UserView {...screenProps} />}
        {screen === "verify" && <VerifyAsset />}
        {screen === "audit" && <AuditTrail refreshKey={refreshKey} />}
      </main>

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export default function App() {
  return (
    <ActiveAccountProvider>
      <Shell />
    </ActiveAccountProvider>
  );
}
