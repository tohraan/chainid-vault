# Project Structure

```
chainid-vault/                     # git root
├── build/                         # this documentation package
├── contracts-app/
│   ├── contracts/
│   │   ├── IdentityRegistry.sol
│   │   └── AssetNFT.sol
│   ├── test/
│   │   ├── IdentityRegistry.test.ts
│   │   └── AssetNFT.test.ts
│   ├── scripts/
│   │   └── deploy.ts              # deploy + seed combined, see 02-planning/PHASE_03.md
│   ├── artifacts/                 # generated, gitignore compiled output but not needed to gitignore ABI copies once moved to frontend
│   ├── hardhat.config.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── abi/
│   │   ├── lib/
│   │   ├── context/
│   │   ├── components/
│   │   ├── App.tsx (or .jsx)
│   │   └── main.tsx (or .jsx)
│   ├── tailwind.config.js
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md                      # top-level, points into build/ and explains how to run the demo
```

Full detail on `contracts-app/` internals: `03-architecture/APPLICATION_ARCHITECTURE.md`. Full detail on `frontend/src/`: `03-architecture/FRONTEND_ARCHITECTURE.md`.
