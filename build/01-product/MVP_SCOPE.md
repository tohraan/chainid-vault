# MVP Scope — Authoritative Cutline

If it's not in this list, don't build it without human approval. This is the single most important file for stopping scope creep in a 12-hour window.

## IN (build these, in this order)

1. `IdentityRegistry.sol` — register identity, read all identities
2. OpenZeppelin `AccessControl` wired into both contracts — 4 roles
3. `AssetNFT.sol` — ERC-721, admin-only mint, read tokens-of-owner
4. Hardhat tests for all of the above (min 6, see `NON_FUNCTIONAL_REQUIREMENTS.md` NFR-5)
5. Deploy + seed script — local Hardhat node, 4 named accounts pre-assigned roles
6. React (Vite) + Tailwind frontend, 3 screens: Admin Dashboard, User View, Audit Trail
7. "Acting as" account switcher (swap ethers.js signer, no wallet-connect)
8. Live audit trail via `contract.on(...)` / `queryFilter`
9. Visible on-screen revert/rejection display for the negative-role demo

## STRETCH (only after 1-9 are done AND tested AND demo-rehearsed)

10. Asset transfer function (owner or admin-initiated)
11. Simple CSS/motion polish pass on the 3 screens

## OUT (do not build, full list in `OUT_OF_SCOPE.md`)

DID/VC, IPFS, database, backend server, testnet/mainnet deploy, wallet-connect/MetaMask, CI/CD, oracle-approved transfers, multi-org support, upgradeable contracts.

## Cutline rule for Claude Code

If at any point remaining time < 2 hours and items 1-9 aren't done, STOP building new items and go into polish/rehearsal/bugfix mode on whatever subset works end-to-end. A narrower WORKING demo beats a broader BROKEN one. This rule overrides any other instruction to "keep building features."
