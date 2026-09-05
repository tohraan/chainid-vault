import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ACCOUNTS } from "../lib/accounts";
import type { DemoAccount } from "../lib/accounts";

// The only global state in the app. Everything else is local component state or
// read straight from the chain — see build/03-architecture/FRONTEND_ARCHITECTURE.md.
interface ActiveAccountValue {
  account: DemoAccount;
  setAccountIndex: (index: number) => void;
  accountIndex: number;
}

const ActiveAccountContext = createContext<ActiveAccountValue | null>(null);

export function ActiveAccountProvider({ children }: { children: ReactNode }) {
  // Index 0 is the Admin/deployer — the demo starts "Acting as: Admin",
  // per Journey 1 in build/01-product/USER_JOURNEYS.md.
  const [accountIndex, setAccountIndex] = useState(0);

  const value = useMemo(
    () => ({ account: ACCOUNTS[accountIndex], accountIndex, setAccountIndex }),
    [accountIndex],
  );

  return (
    <ActiveAccountContext.Provider value={value}>
      {children}
    </ActiveAccountContext.Provider>
  );
}

export function useActiveAccount(): ActiveAccountValue {
  const ctx = useContext(ActiveAccountContext);
  if (!ctx) {
    throw new Error("useActiveAccount must be used inside ActiveAccountProvider");
  }
  return ctx;
}
