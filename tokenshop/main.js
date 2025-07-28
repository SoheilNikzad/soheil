let provider;
let signer;
let contract;
let adminConnected = false;

// Contract configuration
const CONTRACT_ADDRESS = "0x55417ba2ba2543ffd585190be6db3f272520066d";
const ADMIN_ADDRESS = "0x81C24aEDaC6fCe6F69a3e0135290Ab2aE61AaDd0";

// RequestManager ABI
const requestManagerABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			}
		],
		"name": "RequestApproved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			}
		],
		"name": "RequestRejected",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "requester",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			}
		],
		"name": "RequestSubmitted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"name": "RevisionRequested",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "admin",
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
				"name": "_requestId",
				"type": "uint256"
			}
		],
		"name": "approveRequest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPendingRequests",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_requestId",
				"type": "uint256"
			}
		],
		"name": "getRequest",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "whitepaper",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "supply",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "requester",
				"type": "address"
			},
			{
				"internalType": "enum RequestManager.RequestStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "adminMessage",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
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
				"name": "_requestId",
				"type": "uint256"
			}
		],
		"name": "rejectRequest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "requestCount",
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
				"name": "_requestId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_message",
				"type": "string"
			}
		],
		"name": "requestRevision",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "requests",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "whitepaper",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "supply",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "requester",
				"type": "address"
			},
			{
				"internalType": "enum RequestManager.RequestStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "adminMessage",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_symbol",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_whitepaper",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_supply",
				"type": "uint256"
			}
		],
		"name": "submitRequest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

// UI Elements
const output = document.getElementById("output");
const adminStatusDiv = document.getElementById("adminStatus");
const requestsContainer = document.getElementById("requestsContainer");
const userRequestsSection = document.getElementById("userRequestsSection");
const userRequestsContainer = document.getElementById("userRequestsContainer");

// Connect wallet function
async function connectWallet() {
    try {
        console.log('Ethers object:', ethers);
        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            const address = await signer.getAddress();
            document.getElementById('connectWallet').textContent = "Connected";
            document.getElementById('connectWallet').disabled = true;
            document.getElementById('status').textContent = `Wallet connected: ${address.substring(0, 6)}...${address.substring(38)}`;
            
            // Initialize contract
            contract = new ethers.Contract(CONTRACT_ADDRESS, requestManagerABI, signer);
            
            output.textContent = "Wallet connected successfully! You can now submit token requests.";
            
            // Load user's requests
            loadUserRequests();
        } else {
            output.textContent = "Please install MetaMask!";
        }
    } catch (error) {
        output.textContent = `Error connecting wallet: ${error.message}`;
    }
}

// Connect admin wallet function
async function connectAdminWallet() {
    try {
        console.log('Connecting admin wallet...');
        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            const address = await signer.getAddress();
            
            // Check if connected wallet is admin
            console.log('Connected address:', address);
            console.log('Admin address:', ADMIN_ADDRESS);
            if (address.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
                adminStatusDiv.textContent = "Error: Connected wallet is not the admin wallet!";
                return;
            }
            
            document.getElementById('adminConnectBtn').textContent = "Admin Connected";
            document.getElementById('adminConnectBtn').disabled = true;
            adminStatusDiv.textContent = `Admin wallet connected: ${address.substring(0, 6)}...${address.substring(38)}`;
            adminConnected = true;
            
            // Initialize contract
            contract = new ethers.Contract(CONTRACT_ADDRESS, requestManagerABI, signer);
            console.log('Loading pending requests...');
            loadPendingRequests();
        } else {
            adminStatusDiv.textContent = "Please install MetaMask!";
        }
    } catch (error) {
        adminStatusDiv.textContent = `Error connecting admin wallet: ${error.message}`;
    }
}

// Submit token request
async function submitTokenRequest() {
    try {
        if (!contract) {
            output.textContent = "Please connect your wallet first!";
            return;
        }

        const name = document.getElementById("name").value.trim();
        const symbol = document.getElementById("symbol").value.trim();
        const description = document.getElementById("description").value.trim();
        const whitepaper = document.getElementById("whitepaper").value.trim();
        const totalSupply = document.getElementById("totalSupply").value;

        if (!name || !symbol || !description || !whitepaper || !totalSupply) {
            output.textContent = "Please fill in all fields!";
            return;
        }

        output.textContent = "Submitting request... Please wait...";
        document.getElementById('createToken').disabled = true;

        console.log('Submitting request...');
        const tx = await contract.submitRequest(name, symbol, description, whitepaper, totalSupply);
        console.log('Transaction sent:', tx.hash);
        await tx.wait();
        console.log('Transaction confirmed!');

        output.textContent = `Request submitted successfully! Transaction: ${tx.hash}`;
        document.getElementById('createToken').disabled = false;
        
        // Clear form
        document.getElementById("name").value = "";
        document.getElementById("symbol").value = "";
        document.getElementById("description").value = "";
        document.getElementById("whitepaper").value = "";
        document.getElementById("totalSupply").value = "";
        
        // Reload user's requests
        loadUserRequests();
        
    } catch (error) {
        output.textContent = `Error submitting request: ${error.message}`;
        document.getElementById('createToken').disabled = false;
    }
}

// Load pending requests for admin
async function loadPendingRequests() {
    try {
        console.log('loadPendingRequests called');
        console.log('adminConnected:', adminConnected);
        console.log('contract:', contract);
        if (!adminConnected || !contract) {
            console.log('Early return - admin not connected or no contract');
            return;
        }

        console.log('Getting pending requests...');
        const pendingRequestIds = await contract.getPendingRequests();
        console.log('Pending request IDs:', pendingRequestIds);
        requestsContainer.innerHTML = "";

        if (pendingRequestIds.length === 0) {
            console.log('No pending requests found');
            requestsContainer.innerHTML = "<p>No pending requests.</p>";
            return;
        }

        for (const requestId of pendingRequestIds) {
            const request = await contract.getRequest(requestId);
            
            const requestDiv = document.createElement("div");
            requestDiv.className = "request-item";
            requestDiv.innerHTML = `
                <div class="request-info">
                    <h4>Request #${requestId}</h4>
                    <p><strong>Name:</strong> ${request.name}</p>
                    <p><strong>Symbol:</strong> ${request.symbol}</p>
                    <p><strong>Description:</strong> ${request.description}</p>
                    <p><strong>Whitepaper:</strong> ${request.whitepaper}</p>
                    <p><strong>Supply:</strong> ${request.supply.toString()}</p>
                    <p><strong>Requester:</strong> ${request.requester}</p>
                    <p><strong>Timestamp:</strong> ${new Date(request.timestamp * 1000).toLocaleString()}</p>
                </div>
                <div class="request-actions">
                    <button onclick="approveRequest(${requestId})" class="btn-approve">Approve</button>
                    <button onclick="rejectRequest(${requestId})" class="btn-reject">Reject</button>
                    <button onclick="requestRevision(${requestId})" class="btn-revision">Request Revision</button>
                </div>
            `;
            requestsContainer.appendChild(requestDiv);
        }
    } catch (error) {
        console.error("Error loading pending requests:", error);
        requestsContainer.innerHTML = `<p>Error loading requests: ${error.message}</p>`;
    }
}

// Load user's requests
async function loadUserRequests() {
    try {
        if (!contract || !signer) {
            return;
        }

        const userAddress = await signer.getAddress();
        console.log('Getting total requests...');
        const totalRequests = await contract.requestCount();
        console.log('Total requests:', totalRequests.toNumber());
        userRequestsContainer.innerHTML = "";

        if (totalRequests.toNumber() === 0) {
            console.log('No requests found');
            userRequestsSection.style.display = "none";
            return;
        }

        let userRequestCount = 0;

        for (let i = 0; i < totalRequests.toNumber(); i++) {
            const request = await contract.getRequest(i);
            
            if (request.requester.toLowerCase() === userAddress.toLowerCase()) {
                userRequestCount++;
                const statusText = getStatusText(request.status);
                const statusClass = getStatusClass(request.status);
                
                const requestDiv = document.createElement("div");
                requestDiv.className = "user-request-item";
                requestDiv.innerHTML = `
                    <div class="user-request-info">
                        <h4>Request #${i}</h4>
                        <p><strong>Name:</strong> ${request.name}</p>
                        <p><strong>Symbol:</strong> ${request.symbol}</p>
                        <p><strong>Description:</strong> ${request.description}</p>
                        <p><strong>Whitepaper:</strong> ${request.whitepaper}</p>
                        <p><strong>Supply:</strong> ${request.supply.toString()}</p>
                        <p><strong>Status:</strong> <span class="${statusClass}">${statusText}</span></p>
                        <p><strong>Submitted:</strong> ${new Date(request.timestamp * 1000).toLocaleString()}</p>
                        ${request.adminMessage ? `<p><strong>Admin Message:</strong> ${request.adminMessage}</p>` : ''}
                    </div>
                `;
                userRequestsContainer.appendChild(requestDiv);
            }
        }

        if (userRequestCount > 0) {
            userRequestsSection.style.display = "block";
        } else {
            userRequestsSection.style.display = "none";
        }
    } catch (error) {
        console.error("Error loading user requests:", error);
        userRequestsContainer.innerHTML = `<p>Error loading your requests: ${error.message}</p>`;
    }
}

// Helper function to get status text
function getStatusText(status) {
    switch (status) {
        case 0: return "Pending";
        case 1: return "Approved";
        case 2: return "Rejected";
        case 3: return "Revision Requested";
        default: return "Unknown";
    }
}

// Helper function to get status CSS class
function getStatusClass(status) {
    switch (status) {
        case 0: return "status-pending";
        case 1: return "status-approved";
        case 2: return "status-rejected";
        case 3: return "status-revision";
        default: return "status-unknown";
    }
}

// Admin functions
async function approveRequest(requestId) {
    try {
        if (!adminConnected || !contract) {
            return;
        }

        const tx = await contract.approveRequest(requestId);
        await tx.wait();
        
        adminStatusDiv.textContent = `Request #${requestId} approved successfully! Transaction: ${tx.hash}`;
        loadPendingRequests(); // Refresh the list
    } catch (error) {
        adminStatusDiv.textContent = `Error approving request: ${error.message}`;
    }
}

async function rejectRequest(requestId) {
    try {
        if (!adminConnected || !contract) {
            return;
        }

        const tx = await contract.rejectRequest(requestId);
        await tx.wait();
        
        adminStatusDiv.textContent = `Request #${requestId} rejected successfully! Transaction: ${tx.hash}`;
        loadPendingRequests(); // Refresh the list
    } catch (error) {
        adminStatusDiv.textContent = `Error rejecting request: ${error.message}`;
    }
}

async function requestRevision(requestId) {
    try {
        if (!adminConnected || !contract) {
            return;
        }

        const message = prompt("Enter revision message:");
        if (!message) {
            return;
        }

        const tx = await contract.requestRevision(requestId, message);
        await tx.wait();
        
        adminStatusDiv.textContent = `Revision requested for #${requestId}! Transaction: ${tx.hash}`;
        loadPendingRequests(); // Refresh the list
    } catch (error) {
        adminStatusDiv.textContent = `Error requesting revision: ${error.message}`;
    }
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Show corresponding content
        const targetId = button.getAttribute('data-tab');
        document.getElementById(targetId).classList.add('active');
    });
});

// Event listeners
document.getElementById('connectWallet').addEventListener('click', connectWallet);
document.getElementById('createToken').addEventListener('click', submitTokenRequest);
document.getElementById('adminConnectBtn').addEventListener('click', connectAdminWallet);

// Initialize
output.textContent = "Please connect your wallet to submit token requests.";
adminStatusDiv.textContent = "Please connect admin wallet to review requests.";
