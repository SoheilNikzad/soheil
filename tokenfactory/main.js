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
  "constructor(string name, string symbol, uint8 decimals, uint256 totalSupply)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint)",
  "function transfer(address to, uint amount) returns (bool)"
];

const erc20Bytecode = "0x608060405234801561001057600080fd5b506040516104e03803806104e083398181016040528101906100329190610087565b806000819055505061009f565b60008151905061004a816100d9565b92915050565b60006020828403121561006657600080fd5b60006100748482850161003f565b91505092915050565b61048f8061008d6000396000f3fe60806040526004361061003f5760003560e01c806370a0823114610044578063a9059cbb1461006a578063dd62ed3e14610090575b600080fd5b34801561005057600080fd5b506100596100b3565b604051610066919061030a565b60405180910390f35b6100726100c9565b60405161007f919061030a565b60405180910390f35b34801561009c57600080fd5b506100a56100ee565b6040516100b2919061030a565b60405180910390f35b60008054905090565b600080546001019055565b60005481565b600160405180604001604052808381526020018481525090806001815401808255809150509060018203906000526020600020905b81548152906001019060200180831161014f57829003601f168201915b505050505081565b600080546001019055565b600160405180604001604052808381526020018481525090806001815401808255809150509060018203906000526020600020905b8154815290600101906020018083116101df57829003601f168201915b505050505081565b6000813590506101f5816103d9565b92915050565b60006020828403121561021157600080fd5b600061021f848285016101e6565b91505092915050565b610231816103a2565b82525050565b600060208201905061024c6000830184610228565b92915050565b6000604051905090565b6000670de0b6b3a764000081111561027a57600080fd5b61028483826103c6565b90505b92915050565b600080fd5b61029a816103a2565b81146102a557600080fd5b50565b6000813590506102b7816103f1565b92915050565b600080604083850312156102d257600080fd5b60006102e085828601610289565b92505060206102f185828601610289565b9150509250929050565b60006020828403121561030d57600080fd5b600061031b84828501610289565b9150509291505056fea264697066735822122000b06e675801104c8493c0bc9218f82e48ce3cc6b97c0c2a93dd8652b183438c64736f6c634300080a0033";

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
    const contract = await factory.deploy(name, symbol, decimals, totalSupply);

    output.textContent = `🚀 در حال انتشار...\nTX: ${contract.deploymentTransaction().hash}`;
    await contract.waitForDeployment();
    output.textContent += `\n✅ قرارداد ساخته شد در آدرس: ${await contract.getAddress()}`;
  } catch (err) {
    output.textContent = `❌ خطا: ${err.message || err}`;
    console.error(err);
  }
});
