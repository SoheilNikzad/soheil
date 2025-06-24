let provider;
let signer;
let connected = false;

const connectBtn = document.getElementById('connectBtn');
const statusDiv = document.getElementById('status');
const yourWalletInput = document.getElementById('yourWallet');
const networkInfo = document.getElementById('networkInfo');

connectBtn.addEventListener('click', connectWallet);

async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    statusDiv.innerText = '❌ MetaMask نصب نشده است.';
    return;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    yourWalletInput.value = address;
    statusDiv.innerText = `✅ Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
    networkInfo.innerText = `🌐 Network: ${network.name || 'Unknown'} (Chain ID: ${network.chainId})`;

    connected = true;
  } catch (err) {
    statusDiv.innerText = '❌ اتصال به کیف پول لغو شد یا خطا داشت.';
    console.error(err);
  }
}
