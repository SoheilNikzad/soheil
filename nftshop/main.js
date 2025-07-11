let provider;
let signer;
let currentAccount = "";
const networkSelect = document.getElementById('networkSelect');
const networkStatusDiv = document.getElementById('networkStatus');
const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletAddressDiv = document.getElementById('walletAddress');
const loadBlocksBtn = document.getElementById('loadBlocksBtn');
const blockExplorerDiv = document.getElementById('blockExplorer');

const nftContractAddressInput = document.getElementById('nftContractAddress');
const recipientAddressInput = document.getElementById('recipientAddress');
const tokenURIInput = document.getElementById('tokenURI');
const mintNftBtn = document.getElementById('mintNftBtn');
const mintingStatusDiv = document.getElementById('mintingStatus');
const nftContractABI = [
  {
    "inputs": [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721IncorrectOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721InsufficientApproval",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC721InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721NonexistentToken",
		"type": "error"
	},
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
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_fromTokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_toTokenId",
				"type": "uint256"
			}
		],
		"name": "BatchMetadataUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			}
		],
		"name": "MetadataUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nextTokenId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

// --- Event Listeners ---
networkSelect.addEventListener('change', changeNetwork);
connectWalletBtn.addEventListener('click', connectWallet);
loadBlocksBtn.addEventListener('click', loadBlocks);
mintNftBtn.addEventListener('click', mintNFT);

// Initialize network connection on page load based on selected default
document.addEventListener('DOMContentLoaded', () => {
  if (networkSelect.value) {
    changeNetwork();
  }
});

function changeNetwork() {
  const rpcUrl = networkSelect.value;
  if (!rpcUrl) {
    networkStatusDiv.textContent = "❌ Please select a network.";
    provider = null; // Reset provider if no URL
    return;
  }
  try {
    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    provider.getBlockNumber().then(block => {
      networkStatusDiv.textContent = `✅ Connected to ${networkSelect.options[networkSelect.selectedIndex].text}. Latest block: ${block}`;
    }).catch(err => {
      console.error("Network connection error:", err);
      networkStatusDiv.textContent = `❌ Failed to connect to ${networkSelect.options[networkSelect.selectedIndex].text}.`;
      provider = null; // Reset provider on error
    });
  } catch (err) {
    console.error("Error initializing provider:", err);
    networkStatusDiv.textContent = `❌ Error setting up network provider for ${networkSelect.options[networkSelect.selectedIndex].text}.`;
    provider = null;
  }
}

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      currentAccount = accounts[0];
      // Re-initialize provider and signer with Web3Provider for wallet interaction
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = web3Provider.getSigner();
      provider = web3Provider; // Use the wallet's provider for subsequent operations

      walletAddressDiv.textContent = "Connected: " + currentAccount;
      // Optionally, re-check network status with the new provider
      if (networkSelect.value) {
          provider.getBlockNumber().then(block => {
            networkStatusDiv.textContent = `✅ Connected to ${networkSelect.options[networkSelect.selectedIndex].text} via Wallet. Latest block: ${block}`;
          }).catch(err => {
            networkStatusDiv.textContent = `⚠️ Wallet connected, but issue fetching block from ${networkSelect.options[networkSelect.selectedIndex].text}.`;
          });
      } else {
          networkStatusDiv.textContent = "Wallet connected. Please select a network to see block details."
      }

    } catch (error) {
      console.error("Wallet connection error:", error);
      walletAddressDiv.textContent = "❌ Wallet connection failed. " + (error.message || "");
      signer = null; // Reset signer
    }
  } else {
    walletAddressDiv.textContent = "❌ MetaMask (or other Web3 wallet) not available. Please install it.";
    signer = null; // Reset signer
  }
}

async function loadBlocks() {
  if (!provider) {
    blockExplorerDiv.innerHTML = "❌ Connect to a network first (and ensure it's the correct one if wallet is connected).";
    return;
  }
  blockExplorerDiv.innerHTML = "⏳ Loading blocks...";
  try {
    const latest = await provider.getBlockNumber();
    let html = "";
    const blockCount = 5; // Number of blocks to fetch
    for (let i = 0; i < blockCount; i++) {
      const blockNumber = latest - i;
      if (blockNumber < 0) break; // Stop if we go below block 0

      const block = await provider.getBlockWithTransactions(blockNumber);
      if (block) {
        html += `<div><b>🔸 Block #${block.number}</b> | Miner: ${block.miner.substring(0,10)}... | Txs: ${block.transactions.length}</div>`;
        block.transactions.slice(0, 3).forEach(tx => { // Show first 3 txs
          html += `<div style="margin-left: 1rem; font-size: 0.9rem;">↳ From: ${tx.from.substring(0,10)}... → To: ${(tx.to || '🌀 Contract creation').substring(0,10)}...</div>`;
        });
      } else {
        html += `<div>⚠️ Could not load block #${blockNumber}</div>`;
      }
      html += "<hr/>";
    }
    blockExplorerDiv.innerHTML = html || "No blocks found or unable to fetch.";
  } catch (error) {
    console.error("Error loading blocks:", error);
    blockExplorerDiv.innerHTML = `❌ Error loading blocks: ${error.message}`;
  }
}

async function mintNFT() {
  mintingStatusDiv.textContent = "⏳ Preparing to mint...";

  if (!signer) {
    mintingStatusDiv.textContent = "❌ Please connect your wallet first.";
    return;
  }

  const contractAddress = nftContractAddressInput.value;
  const recipient = recipientAddressInput.value;
  const uri = tokenURIInput.value;

  if (!ethers.utils.isAddress(contractAddress)) {
    mintingStatusDiv.textContent = "❌ Invalid NFT Contract Address.";
    return;
  }
  if (!ethers.utils.isAddress(recipient)) {
    mintingStatusDiv.textContent = "❌ Invalid Recipient Address.";
    return;
  }
  if (!uri) { 
    mintingStatusDiv.textContent = "❌ Token URI cannot be empty.";
    return;
  }

  mintingStatusDiv.textContent = `ℹ️ Minting NFT... Contract: ${contractAddress.substring(0,6)}... Recipient: ${recipient.substring(0,6)}... URI: ${uri.substring(0,20)}...`;

  try {
    const nftContract = new ethers.Contract(contractAddress, nftContractABI, signer);
    
    mintingStatusDiv.textContent = "⏳ Sending transaction to your wallet for approval...";

    const tx = await nftContract.safeMint(recipient, uri); 
    
    mintingStatusDiv.innerHTML = `✅ Transaction sent! Hash: <a href="#" onclick="alert('Explorer link not implemented yet, but hash is: ${tx.hash}'); return false;">${tx.hash}</a><br/>⏳ Waiting for confirmation...`;

    await tx.wait(); 

    mintingStatusDiv.innerHTML = `🎉 NFT Minted Successfully!<br/>Transaction Hash: <a href="#" onclick="alert('Explorer link not implemented yet, but hash is: ${tx.hash}'); return false;">${tx.hash}</a>`;
    
  } catch (error) {
    console.error("NFT Minting Error:", error);
    let errorMessage = error.message;
    if (error.data && error.data.message) { 
        errorMessage = error.data.message;
    } else if (error.reason) {
        errorMessage = error.reason;
    }
    mintingStatusDiv.textContent = `❌ Minting Failed: ${errorMessage}`;
  }
}
