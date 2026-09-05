import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// Solidity version is pinned to 0.8.24 per build/09-engineering/TECH_STACK.md.
// OpenZeppelin Contracts v5.6.1 declares `pragma solidity ^0.8.24` in ERC721 /
// ERC721Enumerable, so 0.8.24 is the lowest compiler that satisfies it.
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // OpenZeppelin v5.6.1's utils/Bytes.sol uses the `mcopy` opcode, which is
      // Cancun-only. solc 0.8.24 still defaults to the Paris EVM target, so
      // without this the OZ dependency fails to compile with
      // `DeclarationError: Function "mcopy" not found.`
      evmVersion: "cancun",
    },
  },
  networks: {
    // `npx hardhat node` serves here; `--network localhost` targets it.
    // Local throwaway chain only — no testnet/mainnet this scope
    // (build/01-product/OUT_OF_SCOPE.md).
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    scripts: "./scripts",
  },
};

export default config;
