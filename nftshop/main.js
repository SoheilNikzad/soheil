import { ethers } from "./ethers-5.6.esm.min.js";
import { Web3Storage } from "https://cdn.jsdelivr.net/npm/web3.storage/dist/bundle.esm.min.js";

const abi = [
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
	}
];

const bytecode = "0x60806040526004361061009c5760003560e01c806306fdde03146100a1578063081812fc146100f057806323b872dd1461013357806325a3a94c146101565780632e1a7d4d14610179578063313ce5671461019c57806339509351146101bd57806342842e0e146101e05780636352211e1461020457806370a0823114610225578063753b0203146102465780638da5cb5b1461026757806395d89b4114610288578063a22cb465146102a9578063a457c2d7146102ca578063a9059cbb146102ed578063b88d4fde14610310578063c87b56dd14610334578063e985e9c514610357578063f2fde38b14610378575b600080fd5b3480156100ad57600080fd5b506100f86100bc366004610e0f565b6001600160a01b031660009081526005602052604090205490565b604051901515815260200160405180910390f35b3480156100fc57600080fd5b5061012161010b366004610e39565b6001600160a01b031660009081526005602052604090205460ff1690565b60405160ff909116815260200160405180910390f35b34801561012f57600080fd5b506100f861013e366004610e0f565b60056020526000908152604090205481565b34801561016257600080fd5b506100f8610177366004610e8a565b60036020526000908152604090205481565b34801561018557600080fd5b5061018e6103a6565b60405161019b9190610f35565b60405180910390f35b3480156101a857600080fd5b506100f86101b7366004610e0f565b60046020526000908152604090205481565b3480156101c957600080fd5b506100f86101d8366004610e0f565b60026020526000908152604090205481565b3480156101ec57600080fd5b50610121610201366004610f55565b600760209081526000928352604080842090915290825290205460ff1681565b34801561021057600080fd5b5061018e61021f366004610e39565b6103b4565b34801561023157600080fd5b506100f8610240366004610e0f565b60066020526000908152604090205481565b34801561025257600080fd5b5061018e610261366004610e39565b6103e2565b34801561027357600080fd5b5061018e610282366004610f86565b6103ee565b34801561029457600080fd5b5061018e6102a3366004610e39565b6103fb565b3480156102b557600080fd5b506100f86102c4366004610e0f565b60016020526000908152604090205481565b3480156102d657600080fd5b506100f86102e5366004610e0f565b600460209081526000928352604080842090915290825290205481565b3480156102f957600080fd5b506100f8610308366004610e0f565b600360209081526000928352604080842090915290825290205481565b34801561031c57600080fd5b5061018e61032b366004610f55565b61040d565b34801561034057600080fd5b5061012161034f366004610f55565b60086020526000908152604090205460ff1681565b34801561036357600080fd5b506100f8610372366004610e0f565b6001600160a01b031660009081526003602052604090205481565b34801561038457600080fd5b50610121610393366004610f55565b600960209081526000928352604080842090915290825290205460ff1690565b600080604083850312156103c557600080fd5b50508035926020909101359150565b6000602082840312156103e457600080fd5b5035919050565b6000602082840312156103fd57600080fd5b5051919050565b60006020828403121561041757600080fd5b815160ff8116811461042857600080fd5b9392505050565b600081905092915050565b600080fd5b61044781610434565b811461045257600080fd5b5056fea2646970667358221220a03740fdfec148d9ae603b10651f5d16f5a0fc3c54136be90e20a8d97fdf6a2864736f6c63430008140033";

const connectBtn = document.getElementById("connectBtn");
const createTokenBtn = document.getElementById("createToken");
const generateMetadataBtn = document.getElementById("generateMetadataBtn");
const mintNftBtn = document.getElementById("mintNftBtn");

const yourWallet = document.getElementById("yourWallet");
const nameInput = document.getElementById("name");
const symbolInput = document.getElementById("symbol");
const nftNameInput = document.getElementById("nftName");
const nftDescriptionInput = document.getElementById("nftDescription");
const nftImageUrlInput = document.getElementById("nftImageUrl");
const nftMetadataIpfsUrlInput = document.getElementById("nftMetadataIpfsUrl");

const status = document.getElementById("status");
const output = document.getElementById("output");
const mintingSection = document.getElementById("mintingSection");
const metadataJsonOutput = document.getElementById("metadataJsonOutput");
const mintOutput = document.getElementById("mintOutput");

let provider, signer;
let contract;
let contractAddress;

async function connectWallet() {
  if (!window.ethereum) {
    status.innerText = "MetaMask or compatible wallet not detected.";
    return;
  }
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    yourWallet.value = userAddress;
    status.innerText = `Connected: ${userAddress}`;
    createTokenBtn.disabled = false;
  } catch (err) {
    status.innerText = `Wallet connection error: ${err.message}`;
  }
}

async function createToken() {
  const name = nameInput.value.trim();
  const symbol = symbolInput.value.trim();

  if (!name || !symbol) {
    status.innerText = "Please enter both name and symbol for the token.";
    return;
  }

  if (!signer) {
    status.innerText = "Please connect your wallet first.";
    return;
  }

  status.innerText = "Deploying contract, please wait...";
  createTokenBtn.disabled = true;

  try {
    const factory = new ethers.ContractFactory(abi, bytecode, signer);

    // Deploy contract: constructor(string name, string symbol, string baseURI)
    // You can set baseURI as empty string "" or your IPFS base URL
    contract = await factory.deploy(name, symbol, "");
    await contract.deployed();

    contractAddress = contract.address;
    output.innerHTML = `
      Contract deployed at: <a href="https://etherscan.io/address/${contractAddress}" target="_blank">${contractAddress}</a>
    `;

    status.innerText = "Contract deployed successfully! You can now generate metadata and mint NFTs.";
    mintingSection.style.display = "block";
    generateMetadataBtn.disabled = false;

  } catch (err) {
    status.innerText = `Contract deployment failed: ${err.message}`;
    createTokenBtn.disabled = false;
  }
}

function createMetadataJson(name, description, imageUrl) {
  return {
    name: name,
    description: description,
    image: imageUrl,
  };
}

async function generateMetadata() {
  const nftName = nftNameInput.value.trim();
  const nftDescription = nftDescriptionInput.value.trim();
  const nftImageUrl = nftImageUrlInput.value.trim();

  if (!nftName || !nftDescription || !nftImageUrl) {
    status.innerText = "Please fill all NFT metadata fields.";
    return;
  }

  // Create JSON metadata object
  const metadata = createMetadataJson(nftName, nftDescription, nftImageUrl);

  // Convert to Blob for IPFS upload
  const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });

  // Upload to IPFS via Web3.Storage
  try {
    status.innerText = "Uploading metadata to IPFS...";
    generateMetadataBtn.disabled = true;

    // You must replace this with your own Web3.Storage API token
    const web3storageToken = "YOUR_WEB3STORAGE_API_TOKEN_HERE";
    const client = new Web3Storage({ token: web3storageToken });

    const cid = await client.put([new File([metadataBlob], "metadata.json")]);
    const metadataUrl = `ipfs://${cid}/metadata.json`;

    nftMetadataIpfsUrlInput.value = metadataUrl;
    metadataJsonOutput.innerText = JSON.stringify(metadata, null, 2);
    status.innerText = "Metadata uploaded to IPFS successfully!";

    mintNftBtn.disabled = false;
  } catch (err) {
    status.innerText = `IPFS upload failed: ${err.message}`;
    generateMetadataBtn.disabled = false;
  }
}

async function mintNft() {
  const metadataUri = nftMetadataIpfsUrlInput.value.trim();

  if (!contract) {
    status.innerText = "Contract not deployed or connected.";
    return;
  }
  if (!metadataUri) {
    status.innerText = "Please generate and upload metadata first.";
    return;
  }

  mintNftBtn.disabled = true;
  status.innerText = "Minting NFT, please confirm transaction in your wallet...";

  try {
    const userAddress = await signer.getAddress();
    // Call mintNFT(address to, string memory tokenURI)
    const tx = await contract.mintNFT(userAddress, metadataUri);
    const receipt = await tx.wait();

    mintOutput.innerText = `NFT minted! Transaction Hash: ${receipt.transactionHash}`;
    status.innerText = "NFT minted successfully!";
  } catch (err) {
    status.innerText = `Minting failed: ${err.message}`;
  } finally {
    mintNftBtn.disabled = false;
  }
}

connectBtn.onclick = connectWallet;
createTokenBtn.onclick = createToken;
generateMetadataBtn.onclick = generateMetadata;
mintNftBtn.onclick = mintNft;

// Initial UI state
createTokenBtn.disabled = true;
generateMetadataBtn.disabled = true;
mintNftBtn.disabled = true;
mintingSection.style.display = "none";
