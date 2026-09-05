# Network Configuration

## `hardhat.config.ts` (contracts-app)

```ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
};
export default config;
```

Pin the Solidity version explicitly (don't leave it as a range) — avoids any compiler-version drift mid-build. Check `@openzeppelin/contracts`'s installed version's required Solidity version and match it (OZ v5.x needs Solidity ^0.8.20+; confirm via `npm info @openzeppelin/contracts version` at install time and adjust the pin here if needed).

## Frontend RPC config (`frontend/src/lib/provider.ts`)

```ts
import { ethers } from "ethers";
export const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545", {
  chainId: 31337,
  name: "hardhat-local",
});
```

## Two terminals required at all times during dev AND demo

Terminal 1: `npx hardhat node` (must stay running — this IS the blockchain). Terminal 2: `npm run dev` in `frontend/`. See `10-operations/LOCAL_DEVELOPMENT.md` for the exact boot sequence.
