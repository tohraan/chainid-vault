# Non-Functional Requirements

- **NFR-1 (Reliability > Performance):** Demo must work with zero network dependency. Local Hardhat node only. No NFR targets for gas cost, throughput, or mainnet finality — irrelevant this scope.
- **NFR-2 (Latency):** Audit trail SHALL reflect a new event within 2 seconds on local node (trivial at this scale — local blocks mine instantly).
- **NFR-3 (Usability):** UI text on revert/error states SHALL be human-readable, not raw hex/ABI-encoded errors — this is a demo requirement, not a nice-to-have, since the rejected-tx screen is a core demo beat (see `USER_JOURNEYS.md` Journey 2).
- **NFR-4 (Security):** Standard Solidity best practice (checks-effects-interactions, OpenZeppelin audited base contracts, no `tx.origin` auth, no unbounded loops over user-controlled arrays). Full security audit is explicitly out of scope — see `07-smart-contracts/SECURITY_CONSIDERATIONS.md` for what IS covered.
- **NFR-5 (Test coverage):** Minimum 6 Hardhat tests covering: identity register success, duplicate register revert, mint success, mint-by-non-admin revert, role grant, role-gated read. See `07-smart-contracts/TESTING_STRATEGY.md`.
- **NFR-6 (Accessibility):** Basic only — readable contrast, labeled buttons. No WCAG audit this scope.
- **NFR-7 (Portability):** Must run on any teammate's machine with Node.js installed, no OS-specific dependency, no cloud account required.
