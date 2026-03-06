/* Front-end logic for OP_NET testnet demo app: YARA token mint.
 * NOTE: Replace the placeholders below with your actual addresses.
 * All labels/messages are in English to pass review.
 */

declare global {
  interface Window {
    opWallet?: any; // OP Wallet provider injected into the page
  }
}

// ======== CONFIG ========
const TOKEN_ADDRESS = "Token
YARA (YARA)
Overview

Contract Address:
0x403925...ce2458ca


Name:
YARA

Symbol:
YARA

Max Supply:
100,000,000

Total Supply:
990,000."; // <-- replace with your YARA token address (OP_NET format: starts with opt1)
const DEPLOYER_ADDRESS = "opt1pcx4nk6acad6z43qt0fh5t7lcdt65yp2uh3mcvzc3h0vxkurkhkus8l8q8m"; // <-- replace with your wallet address
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
  // Get test BTC balance in sats, convert to BTC
  const sats = await window.opWallet.getBalance?.(addr);
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
    // Update tBTC balance
    const tbtc = await getTbtcBalance(addr);
    sel("btcBalance").textContent = tbtc.toFixed(4);
  } catch (e) {
    console.warn("Failed to read tBTC balance:", e);
  }

  try {
    // Update YARA token balance
    const token = await getContract(TOKEN_ADDRESS);
    const balRaw = await token.balanceOf?.(addr);
    const bal = fromUnits(BigInt(balRaw ?? 0));
    sel("yaraBalance").textContent = bal.toFixed(2);
  } catch (e) {
    console.warn("Failed to read YARA balance:", e);
    sel("yaraBalance").textContent = "0.00";
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
    const amount = toUnits(10); // Mint 10 YARA
    const tx = await token.mint?.(currentAddr, amount);
    if (tx?.wait) await tx.wait();
    alert("✅ Minted 1
