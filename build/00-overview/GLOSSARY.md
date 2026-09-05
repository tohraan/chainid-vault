# Glossary

- **DID (Decentralized Identifier):** W3C standard for self-sovereign identity. NOT implemented this scope (no DID resolver/method) — we use a plain string identifier stored against a wallet address as a stand-in. See `01-product/OUT_OF_SCOPE.md`.
- **VC (Verifiable Credential):** W3C standard for cryptographically signed claims. NOT implemented this scope.
- **RBAC (Role-Based Access Control):** Permission model where roles (Admin, Manager, Auditor, User) get specific rights. Implemented via OpenZeppelin `AccessControl.sol`.
- **NFT (Non-Fungible Token):** Unique on-chain token, ERC-721 standard, one token = one asset, non-duplicable.
- **ERC-721:** The Ethereum token standard for NFTs. OpenZeppelin's audited implementation is what we extend.
- **Hardhat:** Local Ethereum development environment — compiles contracts, runs a local test blockchain node, runs tests.
- **Hardhat node:** A local, in-memory Ethereum blockchain (`npx hardhat node`) with pre-funded test accounts. Used INSTEAD of a public testnet for demo reliability (no network dependency).
- **ethers.js:** JavaScript library the frontend uses to call smart contract functions and read events.
- **Signer:** An account (wallet) capable of sending transactions. In this MVP, "switching accounts" in the UI = swapping which local Hardhat signer the frontend uses — no real wallet connect.
- **Revert:** When a smart contract function call fails a check (e.g. wrong role) and undoes itself, returning an error message. This is the mechanism behind the "provable rejection" demo moment.
- **Event (on-chain event / log):** A record a contract emits when something happens (mint, role grant, transfer). Queryable after the fact — this is what the "audit trail" reads from, no database needed.
- **Role hash:** OpenZeppelin `AccessControl` roles are `bytes32` (keccak256 hash of a name like `"ADMIN_ROLE"`), not plain strings.
- **Oracle-approved transfer:** Production-vision feature (external verifier signs off on a transfer). NOT built this scope.
- **IPFS:** Decentralized file storage for asset metadata blobs. NOT built this scope — metadata is a plain string on-chain.
