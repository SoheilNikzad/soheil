let provider, signer, connected = false;
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
    statusDiv.innerText = `✅ Wallet connected: ${address.slice(0,6)}...${address.slice(-4)}`;
    connected = true;
  } catch (err) {
    statusDiv.innerText = '❌ اتصال لغو یا خطا.';
    console.error(err);
  }
}

// OpenZeppelin ERC-721 ABI + bytecode باید از کامپایلر یا IPFS دریافت شود
const erc721ABI = [ 
  // حداقل constructor و mint و transfer برای مدل ساده
  {
    "inputs":[{"internalType":"string","name":"name","type":"string"},
              {"internalType":"string","name":"symbol","type":"string"}],
    "stateMutability":"nonpayable","type":"constructor"
  },
  {
    "inputs":[{"internalType":"address","name":"to","type":"address"},
              {"internalType":"uint256","name":"tokenId","type":"uint256"},
              {"internalType":"string","name":"uri","type":"string"}],
    "name":"mintNFT",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  }
];
const erc721Bytecode = "0x..."; // جایگزین با بایت‌کد کامپایل‌شده‌ی قرارداد NFT

document.getElementById("createNft").addEventListener("click", async () => {
  const output = document.getElementById("output");
  output.textContent = "";

  if (!connected) {
    output.textContent = "⛔ لطفاً ابتدا کیف پول را متصل کن.";
    return;
  }
  const name = document.getElementById("name").value.trim();
  const symbol = document.getElementById("symbol").value.trim();
  const desc = document.getElementById("description").value.trim();
  const file = document.getElementById("image").files[0];

  if (!name || !symbol || !desc || !file) {
    output.textContent = "⚠️ همه‌چیز را کامل کن (نام، سمبل، توضیح، تصویر).";
    return;
  }

  try {
    // آپلود فایل + متادیتا روی IPFS جداگانه
    output.textContent = "⌛ آپلود فایل و metadata ...";
    const metadataURI = await uploadToIPFS(file, { name, description: desc });
    output.textContent = "📝 metadata در: " + metadataURI;

    output.textContent += "\n🚀 در حال انتشار قرارداد NFT...";
    const factory = new ethers.ContractFactory(erc721ABI, erc721Bytecode, signer);
    const contract = await factory.deploy(name, symbol);
    await contract.waitForDeployment();
    const cAddr = await contract.getAddress();
    output.textContent += `\n✅ قرارداد منتشر شد: ${cAddr}`;

    output.textContent += "\n🚀 mint کردن NFT...";
    const tokenId = Date.now(); 
    const tx = await contract.mintNFT(await signer.getAddress(), tokenId, metadataURI);
    output.textContent += `\nTX: ${tx.hash}`;
    await tx.wait();
    output.textContent += `\n✅ NFT mint شد: ${cAddr} TokenID ${tokenId}`;

  } catch (err) {
    output.textContent += `\n❌ خطا: ${err.message}`;
    console.error(err);
  }
});

async function uploadToIPFS(file, metadata) {
  // این تابع placeholder هست؛ اینجا باید متادیتا + تصویر را به IPFS آپلود کنی
  // مثلاً با Pinata یا NFT.Storage سپس URI برگردانی
  return "ipfs://مثال/your-metadata.json";
}
