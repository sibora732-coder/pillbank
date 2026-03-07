/* ====== Конфигурация контрактов ====== */
const TOKEN_ADDRESS  = "0xYourTokenAddress";
const STAKING_ADDRESS = "0xYourStakingAddress";

const tokenAbi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function approve(address spender, uint256 amount)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const stakingAbi = [
  "function stake(uint256 amount)",
  "function unstake(uint256 amount)",
  "function stakedBalance(address owner) view returns (uint256)"
];

/* ====== Вспомогательные ====== */
function getProvider() {
  if (window.ethereum?.providers) {
    return window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum.providers[0];
  }
  return window.ethereum ?? null;
}

function formatUnits(value, decimals = 18) {
  if (!value) return "0";
  return Number(ethers.utils.formatUnits(value, decimals)).toLocaleString("en-US", {
    maximumFractionDigits: 4
  });
}

function short(addr) {
  if (!addr) return "—";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

/* ====== UI ====== */
window.addEventListener("DOMContentLoaded", () => {
  const provider = getProvider();
  if (!provider) {
    alert("Нет обнаруженных EVM-кошельков. Установите MetaMask или аналог.");
    return;
  }

  const connectBtn   = document.getElementById("connect-btn");
  const mintBtn      = document.getElementById("mint-btn");
  const approveBtn   = document.getElementById("approve-btn");
  const stakeBtn     = document.getElementById("stake-btn");
  const unstakeBtn   = document.getElementById("unstake-btn");

  const statusBox    = document.getElementById("status");
  const walletSpan   = document.getElementById("wallet-address");
  const btcSpan      = document.getElementById("btc-balance");
  const yaraSpan     = document.getElementById("yara-balance");
  const stakedSpan   = document.getElementById("staked-balance");

  function log(message) {
    const time = new Date().toLocaleTimeString();
    statusBox.innerHTML += `<div>[${time}] ${message}</div>`;
    statusBox.scrollTop = statusBox.scrollHeight;
  }

  async function refreshBalances(signer) {
    try {
      const address = await signer.getAddress();
      const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const staking = new ethers.Contract(STAKING_ADDRESS, stakingAbi, signer);

      const [decimals, tokenBalance, stakedBalance] = await Promise.all([
        token.decimals(),
        token.balanceOf(address),
        staking.stakedBalance(address)
      ]);

      walletSpan.textContent = short(address);
      yaraSpan.textContent   = formatUnits(tokenBalance, decimals);
      stakedSpan.textContent = formatUnits(stakedBalance, decimals);
    } catch (err) {
      log(`Ошибка обновления балансов: ${err.message ?? err}`);
    }
  }

  async function refreshNativeBalance(signer) {
    try {
      const address = await signer.getAddress();
      const balance = await signer.provider.getBalance(address);
      btcSpan.textContent = formatUnits(balance, 18);
    } catch (err) {
      log(`Ошибка баланса нативной монеты: ${err.message ?? err}`);
    }
  }

  /* ====== Кнопки ====== */

  connectBtn.addEventListener("click", async () => {
    try {
      await provider.request({ method: "eth_requestAccounts" });
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();

      connectBtn.disabled = true;
      mintBtn.disabled = false;
      approveBtn.disabled = false;
      stakeBtn.disabled = false;
      unstakeBtn.disabled = false;

      log("Кошелёк подключён");
      await refreshBalances(signer);
      await refreshNativeBalance(signer);
    } catch (err) {
      log(`Отмена или ошибка подключения: ${err.message ?? err}`);
    }
  });

  mintBtn.addEventListener("click", async () => {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);

      const amount = prompt("Введите количество YARA для минтинга", "1000");
      if (!amount) return;

      const decimals = await token.decimals();
      const tx = await token.mint(await signer.getAddress(), ethers.utils.parseUnits(amount, decimals));
      log(`Mint отправлен. Хэш: ${tx.hash}`);
      await tx.wait();
      log("Mint подтверждён");
      await refreshBalances(signer);
    } catch (err) {
      log(`Ошибка mint: ${err.message ?? err}`);
    }
  });

  approveBtn.addEventListener("click", async () => {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);

      const amount = prompt("Сколько YARA одобрить для стейкинга?", "1000");
      if (!amount) return;

      const decimals = await token.decimals();
      const tx = await token.approve(STAKING_ADDRESS, ethers.utils.parseUnits(amount, decimals));
      log(`Approve отправлен: ${tx.hash}`);
      await tx.wait();
      log("Approve подтверждён");
    } catch (err) {
      log(`Ошибка approve: ${err.message ?? err}`);
    }
  });

  stakeBtn.addEventListener("click", async () => {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const staking = new ethers.Contract(STAKING_ADDRESS, stakingAbi, signer);
      const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);

      const amount = prompt("Сколько YARA отправить в стейкинг?", "100");
      if (!amount) return;

      const decimals = await token.decimals();
      const tx = await staking.stake(ethers.utils.parseUnits(amount, decimals));
      log(`Stake tx: ${tx.hash}`);
      await tx.wait();
      log("Stake подтверждён");
      await refreshBalances(signer);
    } catch (err) {
      log(`Ошибка stake: ${err.message ?? err}`);
    }
  });

  unstakeBtn.addEventListener("click", async () => {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const staking = new ethers.Contract(opt1pcx4nk6acad6z43qt0fh5t7lcdt65yp2uh3mcvzc3h0vxkurkhkus8l8q8m);
      const token = new ethers.Contract(0x403925f98169763bd2dd78b73cdc20421a4b2df7fa3ea171abba278dce2458ca);

      const amount = prompt("Сколько YARA забрать?", "100");
      if (!amount) return;

      const decimals = await token.decimals();
      const tx = await staking.unstake(ethers.utils.parseUnits(amount, decimals));
      log(`Unstake tx: ${tx.hash}`);
      await tx.wait();
      log("Unstake подтверждён");
      await refreshBalances(signer);
    } catch (err) {
      log(`Ошибка unstake: ${err.message ?? err}`);
    }
  });
});

/* ====== Подключаем ethers, если нужно ====== */
if (typeof ethers === "undefined") {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.min.js";
  document.head.appendChild(script);
}
