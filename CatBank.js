// ======== CONFIG ========
const TOKEN_ADDRESS = "0x403925f98169763bd2dd78b73cdc20421a4b2df7fa3ea171abba278dce2458ca";
const DEPLOYER_ADDRESS = "opt1pcx4nk6acad6z43qt0fh5t7lcdt65yp2uh3mcvzc3h0vxkurkhkus8l8q8m";
const DECIMALS = 18;

// ======== HELPERS ========
const pow10n = (n) => 10n ** BigInt(n);

function toUnits(amount) {
  // Поддерживаем целые и дробные в простом виде: если передать строку "1.5" — лучше парсить отдельно.
  const num = Number(amount);
  if (!Number.isFinite(num)) throw new Error("Invalid amount");
  // Преобразуем целую часть и дробную (ограниченно):
  const whole = BigInt(Math.trunc(num));
  return whole * pow10n(DECIMALS);
}

function fromUnits(raw) {
  if (raw === null || raw === undefined) return 0;
  const v = typeof raw === "bigint" ? raw : BigInt(raw.toString?.() ?? String(raw));
  return Number(v) / Number(pow10n(DECIMALS));
}

function sel(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element with id="${id}" not found`);
  return el;
}

function ensureWallet() {
  if (!window.opWallet) {
    alert("OP Wallet not detected. Please install OP Wallet.");
    throw new Error("OP Wallet not found");
  }
}

async function connectWallet() {
  ensureWallet();
  const accounts = await window.opWallet.requestAccounts?.();
  if (!accounts || accounts.length === 0) throw new Error("No accounts returned by OP Wallet");
  return accounts[0];
}

async function getTbtcBalance(addr) {
  ensureWallet();
  const sats = await window.opWallet.getBalance?.(addr);
  if (sats === null || sats === undefined) return 0;
  if (typeof sats === "bigint") return Number(sats) / 1e8;
  if (typeof sats === "string" && /^\d+$/.test(sats)) return Number(BigInt(sats)) / 1e8;
  const n = Number(sats);
  return Number.isFinite(n) ? n / 1e8 : 0;
}

async function getContract(address) {
  ensureWallet();
  const c = await window.opWallet.getContract?.(address);
  if (!c) throw new Error(`Contract not found for ${address}`);
  return c;
}

// ======== UI BINDINGS ========
async function refreshAll() {
  let addr = "";
  try { addr = sel("walletAddress").textContent || ""; } catch (e) { return; }
  if (!addr || addr === "Not connected") return;

  try {
    const tbtc = await getTbtcBalance(addr);
    sel("btcBalance").textContent = tbtc.toFixed(4);
  } catch (e) {
    console.warn("Failed to read tBTC balance:", e);
  }

  try {
    const token = await getContract(TOKEN_ADDRESS);
    const balRaw = await token.balanceOf?.(addr);
    const bal = fromUnits(typeof balRaw === "bigint" ? balRaw : balRaw?.toString?.());
    sel("yaraBalance").textContent = bal.toFixed(2);
  } catch (e) {
    console.warn("Failed to read YARA balance:", e);
    try { sel("yaraBalance").textContent = "0.00"; } catch {}
  }
}

async function onConnect() {
  try {
    const addr = await connectWallet();
    sel("walletAddress").textContent = addr;
    await refreshAll();
  } catch (e) {
    alert(`Failed to connect wallet: ${e?.message ?? e}`);
  }
}

async function onMint() {
  let currentAddr = "";
  try { currentAddr = sel("walletAddress").textContent || ""; } catch (e) { alert("walletAddress element not found"); return; }
  if (!currentAddr || currentAddr === "Not connected") { alert("Please connect OP Wallet first."); return; }
  if (!DEPLOYER_ADDRESS || DEPLOYER_ADDRESS.length < 10) { alert("DEPLOYER_ADDRESS not set. Update config."); return; }

  try {
    const token = await getContract(TOKEN_ADDRESS);
    if (!token.mint) { alert("Mint function not available — check contract/network"); return; }
    const amount = toUnits(10); // Mint 10 YARA
    const tx = await token.mint?.(currentAddr, amount);
    if (tx?.wait) await tx.wait();
    alert("✅ Minted 10 YARA!");
    await refreshAll();
  } catch (e) {
    console.error(e);
    alert("Error during minting.");
  }
}

// Привязки кнопок (если они есть в HTML)
document.addEventListener("DOMContentLoaded", () => {
  try {
    sel("connectButton").addEventListener("click", onConnect);
    sel("mintButton").addEventListener("click", onMint);
    sel("refreshButton").addEventListener("click", refreshAll);
  } catch (e) {
    console.warn("Some UI elements are missing; ensure ids exist in HTML", e);
  }
});
