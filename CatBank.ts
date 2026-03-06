/* CatBank.ts
 * Front-end logic for OP_NET testnet demo app: YARA token mint + simple staking.
 * NOTE: Replace the placeholders below with your actual addresses.
 * All labels/messages are in English to pass review.
 */

declare global {
  interface Window {
    opWallet?: any; // OP Wallet provider injected into the page
  }
}

// ======== CONFIG ========
const TOKEN_ADDRESS = "opt1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // <-- replace with your YARA token address
const FARM_ADDRESS  = "opt1yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"; // <-- replace with your farm address (keep as placeholder if not deployed yet)
const DEPLOYER_ADDRESS = "opt1zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"; // <-- replace with your wallet address (token owner)
const DECIMALS = 18;

// ======== HELPERS ========
const toUnits = (amount: number) => BigInt(Math.floor(amount * 10 ** DECIMALS));
const fromUnits = (raw: bigint) => Number(raw) / 10 ** DECIMALS;
const sel = (id: string) => document.getElementById(id)!;

function ensureWallet() {
  if (!window.opWallet) {
    alert("OP Wallet not detected. Please install OP Wallet.");
    throw new Error("OP Wallet not found");
  }
}

async function getConnectedAddress(): Promise<string | null> {
  ensureWallet();
  try {
    const accounts = await window.opWallet.requestAccounts?.();
    if (accounts && accounts.length > 0) return accounts[0];
    return null;
  } catch {
    return null;
  }
}

async function connectWallet(): Promise<string> {
  ensureWallet();
  const accounts = await window.opWallet.requestAccounts?.();
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts returned by OP Wallet");
  }
  return accounts[0];
}

async function getTbtcBalance(addr: string): Promise<number> {
  ensureWallet();
  // Placeholder: actual tBTC balance method may differ depending on OP Wallet API
  const sats = await window.opWallet.getBalance?.(addr); // returns sats? adjust if needed
  const btc = typeof sats === "number" ? sats / 1e8 : (Number(sats) / 1e8);
  return Number.isFinite(btc) ? btc : 0;
}

async function getContract(address: string): Promise<any> {
  ensureWallet();
  const c = await window.opWallet.getContract?.(address);
  if (!c) throw new Error(`Contract not found for ${address}`);
  return c;
}

// ======== UI BINDINGS ========
async function refreshAll() {
  const addr = sel("walletAddress").textContent || "";
  if (!addr || addr === "Not connected") return;

  try {
    // tBTC
    const tbtc = await getTbtcBalance(addr);
    sel("btcBalance").textContent = tbtc.toFixed(4);
  } catch (e) {
    console.warn("Failed to read tBTC balance:", e);
  }

  try {
    // Token balance
    const token = await getContract(TOKEN_ADDRESS);
    const balRaw = await token.balanceOf?.(addr);
    const bal = fromUnits(BigInt(balRaw ?? 0));
    sel("yaraBalance").textContent = bal.toFixed(2);
  } catch (e) {
    console.warn("Failed to read YARA balance:", e);
    sel("yaraBalance").textContent = "0.00";
  }

  try {
    // Staked balance
    const farm = await getContract(FARM_ADDRESS);
    const stRaw = await farm.stakedBalance?.(addr);
    const st = fromUnits(BigInt(stRaw ?? 0));
    sel("stakedBalance").textContent = st.toFixed(2);
  } catch {
    // Farm not deployed or unreadable
    sel("stakedBalance").textContent = "0.00";
  }
}

async function onConnect() {
  try {
    const addr = await connectWallet();
    sel("walletAddress").textContent = addr;
    await refreshAll();
  } catch (e: any) {
    alert(`Failed to connect wallet: ${e?.message ?? e}`);
  }
}

async function onMint() {
  const currentAddr = sel("walletAddress").textContent || "";
  if (!currentAddr || currentAddr === "Not connected") {
    alert("Please connect OP Wallet first.");
    return;
  }
  if (!DEPLOYER_ADDRESS || DEPLOYER_ADDRESS.length < 10) {
    alert("DEPLOYER_ADDRESS not set. Update config in CatBank.ts.");
    return;
  }
  try {
    const token = await getContract(TOKEN_ADDRESS);

    // Many OP_20 test tokens implement 'mint(address to, uint256 amount)'
    // If your token uses a different signature, adjust accordingly.
    const amount = toUnits(10); // 10 YARA
    const tx = await token.mint?.(currentAddr, amount);
    if (tx?.wait) await tx.wait();
    alert("✅ Minted 10 YARA.");
    await refreshAll();
  } catch (e: any) {
    alert(`Mint failed: ${e?.message ?? e}`);
  }
}

function parseAmount(): bigint | null {
  const v = (sel("inpAmount") as HTMLInputElement).value.trim();
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return toUnits(n);
}

async function onStake() {
  const currentAddr = sel("walletAddress").textContent || "";
  if (!currentAddr || currentAddr === "Not connected") {
    alert("Please connect OP Wallet first.");
    return;
  }
  if (!FARM_ADDRESS || FARM_ADDRESS.includes("yyyy")) {
    alert("Farm not configured yet. Deploy farm and set FARM_ADDRESS in CatBank.ts.");
    return;
  }
  const amount = parseAmount();
  if (!amount) {
    alert("Enter a valid amount.");
    return;
  }

  try {
    const token = await getContract(TOKEN_ADDRESS);
    const farm  = await getContract(FARM_ADDRESS);

    // Approve farm to spend tokens
    const approveTx = await token.approve?.(FARM_ADDRESS, amount);
    if (approveTx?.wait) await approveTx.wait();

    // Stake
    const tx = await farm.stake?.(amount);
    if (tx?.wait) await tx.wait();

    alert("✅ Staked successfully.");
    await refreshAll();
  } catch (e: any) {
    alert(`Stake failed: ${e?.message ?? e}`);
  }
}

async function onUnstake() {
  const currentAddr = sel("walletAddress").textContent || "";
  if (!currentAddr || currentAddr === "Not connected") {
    alert("Please connect OP Wallet first.");
    return;
  }
  if (!FARM_ADDRESS || FARM_ADDRESS.includes("yyyy")) {
    alert("Farm not configured yet. Deploy farm and set FARM_ADDRESS in CatBank.ts.");
    return;
  }
  const amount = parseAmount();
  if (!amount) {
    alert("Enter a valid amount.");
    return;
  }

  try {
    const farm = await getContract(FARM_ADDRESS);
    const tx = await farm.unstake?.(amount);
    if (tx?.wait) await tx.wait();

    alert("✅ Unstaked successfully.");
    await refreshAll();
  } catch (e: any) {
    alert(`Unstake failed: ${e?.message ?? e}`);
  }
}

// ======== INIT ========
function init() {
  // Labels for addresses
  sel("tokenAddrLabel").textContent = TOKEN_ADDRESS;
  sel("farmAddrLabel").textContent = FARM_ADDRESS;

  // Farm notice
  const notice = sel("farmNotice");
  if (!FARM_ADDRESS || FARM_ADDRESS.includes("yyyy")) {
    notice.textContent = "Farm not deployed yet. Stake/Unstake is disabled until you set a valid FARM_ADDRESS.";
  } else {
    notice.textContent = "Farm is set. You can stake/unstake YARA tokens.";
  }

  sel("btnConnect").addEventListener("click", onConnect);
  sel("btnMint").addEventListener("click", onMint);
  sel("btnStake").addEventListener("click", onStake);
  sel("btnUnstake").addEventListener("click", onUnstake);

  // Auto-connect attempt
  (async () => {
    const addr = await getConnectedAddress();
    if (addr) {
      sel("walletAddress").textContent = addr;
      await refreshAll();
    }
  })();
}

document.addEventListener("DOMContentLoaded", init);
