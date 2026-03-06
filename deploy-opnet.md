
# Deploy on OP_NET Testnet

This guide explains how to deploy:
1) An OP_20 token (YARA), with an owner-only mint for demos.
2) A minimal staking "farm" (vault) that accepts YARA deposits.

> You can submit your assignment with only the token deployed. Staking becomes active once the farm is deployed and `FARM_ADDRESS` is configured in the app.

## Prerequisites
- OP Wallet installed and funded with test BTC (gas).
- Access to OP_NET testnet faucet (e.g., https://faucet.opnet.org).
- Node.js + TypeScript if you want to rebuild the front-end.

## 1. Deploy the YARA token (OP_20)
- Use the OP_20 token template for OP_NET. Adjust:
  - `name = "YARA"`, `symbol = "YARA"`, `decimals = 18`.
  - Mint logic: either mint total supply to `Context.sender` on deploy, or expose `mint(to, amount)` restricted to the owner.
- Build to WASM and deploy via OP Wallet:
  1. Compile contract to `.wasm` (follow the OP_20 template instructions).
  2. In OP Wallet → Deploy → pick the built `.wasm`.
  3. Confirm the transaction and record the token contract address (e.g., `opt1...`).
- Verify on the explorer that `Deployed By` is your wallet address.

## 2. Deploy the Farm (Vault)
A minimal farm typically needs:
- A reference to the YARA token address.
- Methods:
  - `stake(uint256 amount)` → `transferFrom(user, vault, amount)` and track user staked balances.
  - `unstake(uint256 amount)` → transfer back to user and reduce tracked balance.
  - `stakedBalance(address user)` → view function.

Implementation notes:
- Ensure the token supports `approve`/`transferFrom` (OP_20 compatible).
- Omit any hard checks like “token belongs to deployer” for testnet simplicity, or deploy the farm using the same deployer as the token.

Deploy steps:
1. Build the farm contract to `.wasm`.
2. Deploy via OP Wallet; record the farm address (`opt1...`).
3. Update your front-end config:
   ```ts
   const FARM_ADDRESS = "opt1...";
   ```
4. Test flow on the UI:
   - Connect wallet.
   - Mint YARA.
   - Stake an amount after calling `approve` (the UI handles approval automatically before `stake`).
   - Unstake and verify balances.

## 3. Post-Deployment Checklist
- Token shows correct `name/symbol/decimals` on the explorer.
- You can see mint and transfer transactions on the explorer.
- Farm address is set in `CatBank.ts` and the UI shows “Farm is set”.
- Staking/unstaking works end to end.

## Troubleshooting
- "Invalid token parameters: Token does not belong to deployer":
  - Deploy the farm from the same wallet that deployed the token, or remove the strict check in farm init (testnet only).
- "Mint failed":
  - Ensure your wallet is the token owner or the contract allows public minting in testnet.
- "Insufficient allowance":
  - The UI calls `approve` before `stake`, but make sure your token implements `approve/allowance/transferFrom`.
