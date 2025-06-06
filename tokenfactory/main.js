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
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

const erc20Bytecode = "0x608060405234801561001057600080fd5b506040516104c63803806104c683398101604081905261002f91610058565b60008151905061003d816100b6565b92915050565b60006020828403121561005957600080fd5b600061006784828501610038565b91505092915050565b6101d8806100786000396000f3fe6080604052600436106100315760003560e01c806370a0823114610036578063a9059cbb1461005c578063dd62ed3e1461008c575b600080fd5b6100406100b6565b60405161004d9190610103565b60405180910390f35b61007660048036038101906100719190610143565b6100d0565b6040516100839190610103565b60405180910390f35b6100aa60048036038101906100a59190610143565b6100dc565b6040516100b79190610103565b60405180910390f35b60006020528060005260406000206000915090505481565b60016000808282540192505081905550565b600060208201905061010a60008301846100e6565b92915050565b600080fd5b61011e816100b6565b811461012957600080fd5b50565b60008135905061013b81610115565b92915050565b600060208284031215610157576101566100e1565b5b60006101658482850161012c565b9150509291505056fea26469706673582212200cfa2f5272d4b4b7c32c91b6a1b34aeb7a26ad59ff3fbc3fa8ef9f0f445aa2da64736f6c634300080e0033";

document.getElementById("createToken").addEventListener("click", async () => {
  const output = document.getElementById("output");
  output.textContent = "";

  if (!connected || !signer) {
    output.textContent = "⛔ لطفاً ابتدا کیف پول خود را متصل کنید.";
    return;
  }

  const name = document.getElementById("name").value.trim();
  const symbol = document.getElementById("symbol").value.trim();
  const decimals = Number(document.getElementById("decimals").value);
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
