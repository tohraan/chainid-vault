# API Architecture — N/A This Scope

No REST/GraphQL API. The "API" the frontend consumes is the deployed smart contract's ABI, called directly via ethers.js JSON-RPC to the local Hardhat node. Each contract function is effectively one API endpoint — see `07-smart-contracts/CONTRACT_SPECIFICATION.md` for the full function list, which doubles as the API surface for this build.
