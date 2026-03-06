// CatBank.js — OP/Bitcoin Testnet

const CONFIG = {
  NETWORK: 'testnet3',
  TOKEN_ADDRESS: 'opt1...YOUR_TOKEN_ADDRESS_HERE',
  FARM_ADDRESS:  'opt1...YOUR_FARM_ADDRESS_HERE',
  OWNER_ADDRESS: 'opt1...YOUR_WALLET_ADDRESS_HERE'
};

const $ = (id) => document.getElementById(id);
const setText = (id, text) => { const el = $(id); if (el) el.textContent = text; };
const disable = (id, v = true) => { const el = $(id); if (el) el.disabled = v; };

const state = {
  address: null,
  network: null
};

function getProvider() {
  if (window.opwallet) return window.opwallet;
  if (window.unisat) return window.unisat;
  if (window.bitcoin) return window.bitcoin;
  return null;
}

async function connectWallet() {
  const provider = getProvider();
  if (!provider) {
    alert("OP Wallet provider not found. Install the extension.");
    return;
  }

  try {
    let accounts;
    if (provider.request) {
      accounts = await provider.request({ method: 'requestAccounts' }).catch(() => {});
      if (!accounts) accounts = await provider.request({ method: 'wallet_requestAccounts' }).catch(() => {});
    } 
    if (!accounts && provider.getAccounts) {
      accounts = await provider.getAccounts();
    }
    if (!accounts && provider.connect) {
      accounts = await provider.connect();
      if (accounts.address) accounts = [accounts.address];
    }

    if (Array.isArray(accounts) && accounts.length > 0) {
      state.address = accounts[0];
    } else if (typeof accounts === 'string') {
      state.address = accounts;
    }

    if (state.address) {
      state.network = CONFIG.NETWORK;
      updateUI();
      console.log("Connected:", state.address);
    } else {
      alert("Failed to get address. Unlock wallet.");
    }
  } catch (error) {
    console.error("Connection error:", error);
    alert("Connection error: " + error.message);
  }
}

async function signAction(actionName, details) {
  const provider = getProvider();
  if (!provider) return;

  const message = `${actionName}\nDetails: ${details}\nDate: ${new Date().toISOString()}`;
  
  try {
    let signature;
    if (provider.signMessage) {
      signature = await provider.signMessage(message);
    } else if (provider.request) {
      signature = await provider.request({ method: 'signMessage', params: [message] });
    }
    
    alert(`Successfully signed! (${actionName})\nThis is demo mode. Real transaction would be sent here.`);
    console.log("Signature:", signature);
  } catch (e) {
    console.error(e);
    alert("Cancelled or signature error.");
  }
}

async function mint() {
  if (!state.address) return alert("Connect wallet first!");
  await signAction("MINT YARA", `Mint 10 tokens to ${state.address}`);
}

async function stake() {
  if (!state.address) return alert("Connect wallet first!");
  const amount = $("inpAmount").value;
  if (!amount || amount <= 0) return alert("Enter amount > 0");
  await signAction("STAKE", `Stake ${amount} YARA into Farm`);
}

async function unstake() {
  if (!state.address) return alert("Connect wallet first!");
  await signAction("UNSTAKE", `Unstake all from Farm`);
}

function updateUI() {
  setText("walletAddress", state.address || "Not connected");
  setText("netLabel", state.network || "unknown");
  setText("tokenAddrLabel", CONFIG.TOKEN_ADDRESS);
  setText("farmAddrLabel", CONFIG.FARM_ADDRESS);
}

function refresh() {
  updateUI();
  console.log("UI Refreshed");
}

document.addEventListener("DOMContentLoaded", () => {
  const btnConnect = $("connectButton");
  const btnMint = $("mintButton");
  const btnStake = $("stakeButton");
  const btnUnstake = $("unstakeButton");
  const btnRefresh = $("refreshButton");

  if (btnConnect) btnConnect.addEventListener("click", connectWallet);
  if (btnMint)    btnMint.addEventListener("click", mint);
  if (btnStake)   btnStake.addEventListener("click", stake);
  if (btnUnstake) btnUnstake.addEventListener("click", unstake);
  if (btnRefresh) btnRefresh.addEventListener("click", refresh);

  refresh();
});
