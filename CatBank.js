// CONFIGURATION
const CONFIG = {
    NETWORK: 'testnet3',
    TOKEN_ADDRESS: '0x403925f98169763bd2dd78b73cdc20421a4b2df7fa3ea171abba278dce2458ca',
    FARM_ADDRESS: '', // Empty means staking is disabled
    OWNER_ADDRESS: 'opt1pcx4nk6acad6z43qt0fh5t7lcdt65yp2uh3mcvzc3h0vxkurkhkus8l8q8m'
};

// GLOBAL STATE
let state = {
    connected: false,
    address: "",
    walletType: "", // "unisat" or "opnet"
    balanceBTC: 0,
    balanceYARA: 0,
    stakedYARA: 0
};

// DOM ELEMENTS
const connectBtn = document.getElementById("connect-btn");
const mintBtn = document.getElementById("mint-btn");
const approveBtn = document.getElementById("approve-btn");
const stakeBtn = document.getElementById("stake-btn");
const unstakeBtn = document.getElementById("unstake-btn");
const walletAddressSpan = document.getElementById("wallet-address");
const btcBalanceSpan = document.getElementById("btc-balance");
const yaraBalanceSpan = document.getElementById("yara-balance");
const stakedBalanceSpan = document.getElementById("staked-balance");
const statusDiv = document.getElementById("status");

// HELPER: LOGGING
function log(msg, type = "info") {
    const color = type === "error" ? "red" : (type === "success" ? "green" : "black");
    statusDiv.innerHTML = `<span style="color:${color}">[${new Date().toLocaleTimeString()}] ${msg}</span><br>` + statusDiv.innerHTML;
    console.log(`[${type.toUpperCase()}] ${msg}`);
}

// 1. CONNECT WALLET
async function connectWallet() {
    try {
        // Check for OP Wallet or Unisat
        if (typeof window.opnet !== 'undefined') {
            log("Found OP Wallet...", "info");
            await window.opnet.requestAccounts();
            state.walletType = "opnet";
            state.address = await window.opnet.getAddress();
        } 
        else if (typeof window.unisat !== 'undefined') {
            log("Found Unisat Wallet...", "info");
            await window.unisat.requestAccounts();
            state.walletType = "unisat";
            state.address = await window.unisat.getAccounts().then(acc => acc[0]);
        } 
        else {
            alert("No OP_NET compatible wallet found! Please install OP Wallet.");
            return;
        }

        // Validate Network
        const network = state.walletType === "opnet" ? await window.opnet.getNetwork() : await window.unisat.getNetwork();
        if (network !== CONFIG.NETWORK) {
            alert(`Wrong network! Please switch wallet to ${CONFIG.NETWORK}.`);
            return;
        }

        // Update UI
        state.connected = true;
        walletAddressSpan.innerText = state.address;
        connectBtn.innerText = "Connected";
        connectBtn.disabled = true;

        // Enable Mint button only for Owner
        if (state.address === CONFIG.OWNER_ADDRESS) {
            mintBtn.disabled = false;
        } else {
            log("You are not the owner. Minting disabled.", "info");
        }
        
        // Enable Staking only if Farm Address is set
        if (CONFIG.FARM_ADDRESS) {
            approveBtn.disabled = false;
            stakeBtn.disabled = false;
            unstakeBtn.disabled = false;
        } else {
            log("Staking disabled (Farm contract not deployed yet).", "info");
        }

        log(`Connected: ${state.address}`, "success");
        await updateBalances();

    } catch (err) {
        log(`Connection failed: ${err.message}`, "error");
    }
}

// 2. MINT TOKENS (Owner Only)
async function mintTokens() {
    if (!state.connected) return;

    try {
        log("Minting 10 YARA...", "info");
        
        // Example Mint Logic (Simplified for OP_NET)
        // Usually involves calling a 'mint' method on the token contract
        // Here we simulate a transfer/interaction
        
        const amount = 10; // Mint amount
        // Note: Real minting requires interaction with the token contract method 'mint'
        // Since we are using generic wallet calls, we assume a standard OP_20 mint call structure
        // If your token uses a specific 'mint' endpoint, replace this logic.
        
        // For demonstration, we'll try to sign a message or transaction
        // In a real scenario: await window.opnet.signTransaction(...)
        
        const msg = `Mint ${amount} YARA to ${state.address}\nDate: ${new Date().toISOString()}`;
        
        let signature;
        if (state.walletType === "opnet") {
            signature = await window.opnet.signMessage(msg);
        } else {
            signature = await window.unisat.signMessage(msg);
        }

        log(`Mint simulated! Signature: ${signature.slice(0, 20)}...`, "success");
        alert(`Minted 10 YARA! (Simulation)\nTx: ${signature.slice(0,10)}...`);
        
        // Refresh balances
        await updateBalances();

    } catch (err) {
        log(`Minting failed: ${err.message}`, "error");
    }
}

// 3. UPDATE BALANCES
async function updateBalances() {
    if (!state.connected) return;
    
    // Simulate fetching balances
    // In real OP_NET, use: await window.opnet.getBalance()
    
    // Randomize for demo purposes if no real RPC is connected
    state.balanceBTC = (Math.random() * 0.1).toFixed(4); 
    state.balanceYARA = (Math.random() * 1000).toFixed(0); 

    btcBalanceSpan.innerText = state.balanceBTC;
    yaraBalanceSpan.innerText = state.balanceYARA;
    
    if (CONFIG.FARM_ADDRESS) {
        stakedBalanceSpan.innerText = "0"; // Placeholder
    }
}

// EVENT LISTENERS
connectBtn.addEventListener('click', connectWallet);
mintBtn.addEventListener('click', mintTokens);

// Placeholder listeners for disabled buttons
approveBtn.addEventListener('click', () => alert("Farm contract not set!"));
stakeBtn.addEventListener('click', () => alert("Farm contract not set!"));
unstakeBtn.addEventListener('click', () => alert("Farm contract not set!"));

// INITIALIZATION
log("App loaded. Waiting for wallet connection...", "info");
