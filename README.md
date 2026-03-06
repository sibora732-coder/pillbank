# Pill Bank (YARA) 🐱💊

A tiny OP_NET testnet dApp to mint and stake an OP_20 token called YARA (aka "pills" for my cat).  
Connect OP Wallet, mint demo tokens, and stake them into a simple vault (farm).

## Features
- Connect OP Wallet (testnet).
- Mint YARA tokens (owner-only, for demo purposes).
- Approve + Stake YARA into a farm contract.
- Unstake and view balances (tBTC, YARA, staked YARA).

## Prerequisites
- OP Wallet installed.
- Test BTC for gas from the faucet.

## Quick Start
1. Clone this repo and open `index.html` in a modern browser.
2. Build the front-end script from TypeScript to JavaScript:
   ```bash
   # If you don't have TypeScript:
   npm install --global typescript
   # Compile CatBank.ts -> CatBank.js (outputs in the same folder by default)
   tsc CatBank.ts --target ES2020 --module ES2020 --outFile CatBank.js
   ```
   Alternatively, add a `tsconfig.json` and run `tsc`.
3. Set your contract addresses in `CatBank.ts`:
   ```ts
   const TOKEN_ADDRESS = "0x403925f98169763bd2dd78b73cdc20421a4b2df7fa3ea171abba278dce2458ca"; // your YARA token
   const FARM_ADDRESS  = ""; // your farm (optional initially)
   const DEPLOYER_ADDRESS = "0x756915aae71715090c4c5249d93eebb255820bd37ab754c84686596f6b09092e"; // the wallet that can mint
   ```
4. Open `index.html`, click "Connect Wallet", mint and (once farm is deployed) stake.

## Deploy (testnet)
- Token and farm deployment steps are documented in `deploy-opnet.md`.
- You can test minting without a farm. Staking requires a farm address.

## Notes
- This app is for OP_NET testnet only.
- UI strings and documentation are in English (required for submission).
