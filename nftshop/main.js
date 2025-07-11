const CONTRACT_ADDRESS = "0x7738A5b38c66ccf85bC6AaD0E20428E4b490c221";

const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "mintNFT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function mintNFT() {
  if (typeof window.ethereum === "undefined") {
    alert("لطفاً افزونه متامسک رو نصب کن.");
    return;
  }

  const web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const accounts = await web3.eth.getAccounts();
  const user = accounts[0];

  const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

  try {
    const tx = await contract.methods
      .mintNFT(user, tokenURI)
      .send({ from: user });

    console.log("✅ NFT ساخته شد:", tx.transactionHash);
    alert("NFT با موفقیت ساخته شد!");
  } catch (err) {
    console.error("❌ خطا در ساخت NFT:", err);
    alert("مشکلی پیش اومد. جزئیات توی Console مرورگر هست.");
  }
}
