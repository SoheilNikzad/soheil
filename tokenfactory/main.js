let provider;
let signer;
let connected = false;

const connectBtn = document.getElementById('connectBtn');
const statusDiv = document.getElementById('status');
const yourWalletInput = document.getElementById('yourWallet');

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

    yourWalletInput.value = address;
    statusDiv.innerText = `✅ Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
    connected = true;
  } catch (err) {
    statusDiv.innerText = '❌ اتصال به کیف پول لغو شد یا خطا داشت.';
    console.error(err);
  }
}

const erc20ABI = [
  "constructor(string name, string symbol, uint256 initialSupply)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint)",
  "function transfer(address to, uint amount) returns (bool)"
];

const erc20Bytecode = "0x608060405234801561001057600080fd5b506040516105f83803806105f88339818101604052810190610032919061007c565b80600081905550506100cf565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061005f82610034565b9050919050565b61006f8161005a565b811461007a57600080fd5b50565b60008151905061008c81610066565b92915050565b6000602082840312156100a8576100a7610034565b5b60006100b68482850161007d565b91505092915050565b6100c98161005a565b82525050565b60006020820190506100e460008301846100c0565b92915050565b60006100f5826100b9565b9150610100836100b9565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115610135576101346100ea565b5b82820190509291505056fea2646970667358221220cfa2f5272d4b4b7c...";

document.getElementById("createToken").addEventListener("click", async () => {
  const output = document.getElementById("output");
  output.textContent = "";

  if (!connected || !signer) {
    output.textContent = "⛔ لطفاً ابتدا کیف پول خود را متصل کنید.";
    return;
  }

  const name = document.getElementById("name").value.trim();
  const symbol = document.getElementById("symbol").value.trim();
  const decimals = Number(document.getElementById("decimals").value); // only used for UI
  const supply = document.getElementById("supply").value.trim();

  if (!name || !symbol || !supply) {
    output.textContent = "⚠️ لطفاً تمام فیلدها را پر کنید.";
    return;
  }

  try {
    const totalSupply = ethers.parseUnits(supply, decimals);
    const factory = new ethers.ContractFactory(erc20ABI, erc20Bytecode, signer);
    const contract = await factory.deploy(name, symbol, totalSupply);

    output.textContent = `🚀 در حال انتشار...\nTX: ${contract.deploymentTransaction().hash}`;
    await contract.waitForDeployment();
    output.textContent += `\n✅ قرارداد ساخته شد در آدرس: ${await contract.getAddress()}`;
  } catch (err) {
    output.textContent = `❌ خطا: ${err.message || err}`;
    console.error(err);
  }
});
