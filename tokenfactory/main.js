let provider;
let signer;
let contract;
let adminConnected = false;
let isLoading = false;

// Contract configuration - Updated with new contract address
const CONTRACT_ADDRESS = "0x0e3308ed95adaf1523006b139881edfb7afc84db";

console.log('Contract address:', CONTRACT_ADDRESS);

// RequestManager ABI - Complete and accurate ABI from the deployed contract
const requestManagerABI = [
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
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"name": "MessageSent",
		"type": "event"
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
				"name": "tokenAddress",
				"type": "address"
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
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "adminAddress",
				"type": "address"
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
		"name": "sendMessage",
		"outputs": [],
		"stateMutability": "nonpayable",
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
			},
			{
				"internalType": "address",
				"name": "_adminAddress",
				"type": "address"
			}
		],
		"name": "submitRequest",
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
				"internalType": "address",
				"name": "_adminAddress",
				"type": "address"
			}
		],
		"name": "getPendingRequestsForAdmin",
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
				"internalType": "address",
				"name": "adminAddress",
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
			},
			{
				"internalType": "address",
				"name": "deployedTokenAddress",
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
		"name": "getRequestMessages",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "senders",
				"type": "address[]"
			},
			{
				"internalType": "string[]",
				"name": "messages",
				"type": "string[]"
			},
			{
				"internalType": "uint256[]",
				"name": "timestamps",
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
			},
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "isAdminForRequest",
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
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "requestMessages",
		"outputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "message",
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
				"internalType": "address",
				"name": "adminAddress",
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
			},
			{
				"internalType": "address",
				"name": "deployedTokenAddress",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// DOM elements
const output = document.getElementById("output");
const adminStatusDiv = document.getElementById("adminStatus");
const requestsContainer = document.getElementById("requestsContainer");
const userRequestsSection = document.getElementById("userRequestsSection");
const userRequestsContainer = document.getElementById("userRequestsContainer");

// Utility functions
function showLoading(element, text = "Loading...") {
    element.innerHTML = `<span class="loading"></span> ${text}`;
    element.disabled = true;
}

function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Connect wallet function
async function connectWallet() {
    try {
        if (isLoading) return;
        isLoading = true;
        
        const connectBtn = document.getElementById('connectWallet');
        const originalText = connectBtn.innerHTML;
        showLoading(connectBtn, "Connecting...");
        
        console.log('Ethers object:', ethers);
        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            const address = await signer.getAddress();
            
            hideLoading(connectBtn, originalText);
            connectBtn.innerHTML = '<i class="fas fa-check"></i> Connected';
            connectBtn.disabled = true;
            connectBtn.style.background = 'linear-gradient(45deg, #10b981, #059669)';
            
            document.getElementById('status').innerHTML = `
                <i class="fas fa-wallet"></i> Wallet connected: ${address.substring(0, 6)}...${address.substring(38)}
            `;
            
            // Initialize contract
            contract = new ethers.Contract(CONTRACT_ADDRESS, requestManagerABI, signer);
            console.log('Contract initialized:', contract);
            
            output.innerHTML = `
                <div style="color: #10b981; font-weight: 500;">
                    <i class="fas fa-check-circle"></i> Wallet connected successfully! You can now submit token requests.
                </div>
            `;
            
            showNotification('Wallet connected successfully!', 'success');
            
            // Load user's requests
            await loadUserRequests();
        } else {
            hideLoading(connectBtn, originalText);
            output.innerHTML = `
                <div style="color: #ef4444; font-weight: 500;">
                    <i class="fas fa-exclamation-triangle"></i> Please install MetaMask to use this application!
                </div>
            `;
            showNotification('Please install MetaMask!', 'error');
        }
    } catch (error) {
        const connectBtn = document.getElementById('connectWallet');
        hideLoading(connectBtn, '<i class="fas fa-wallet"></i> Connect Wallet');
        
        output.innerHTML = `
            <div style="color: #ef4444; font-weight: 500;">
                <i class="fas fa-exclamation-circle"></i> Error connecting wallet: ${error.message}
            </div>
        `;
        showNotification(`Connection failed: ${error.message}`, 'error');
    } finally {
        isLoading = false;
    }
}

// Connect admin wallet function
async function connectAdminWallet() {
    try {
        if (isLoading) return;
        isLoading = true;
        
        const connectBtn = document.getElementById('adminConnectBtn');
        const originalText = connectBtn.innerHTML;
        showLoading(connectBtn, "Connecting...");
        
        console.log('Connecting admin wallet...');
        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            const address = await signer.getAddress();
            
            console.log('Connected address:', address);
            
            hideLoading(connectBtn, originalText);
            connectBtn.innerHTML = '<i class="fas fa-check"></i> Admin Connected';
            connectBtn.disabled = true;
            connectBtn.style.background = 'linear-gradient(45deg, #10b981, #059669)';
            
            adminStatusDiv.innerHTML = `
                <div style="color: #10b981; font-weight: 500;">
                    <i class="fas fa-shield-alt"></i> Admin wallet connected: ${address.substring(0, 6)}...${address.substring(38)}
                </div>
            `;
            adminConnected = true;
            
            // Initialize contract
            contract = new ethers.Contract(CONTRACT_ADDRESS, requestManagerABI, signer);
            console.log('Loading pending requests...');
            
            showNotification('Admin wallet connected successfully!', 'success');
            await loadPendingRequests();
        } else {
            hideLoading(connectBtn, originalText);
            adminStatusDiv.innerHTML = `
                <div style="color: #ef4444; font-weight: 500;">
                    <i class="fas fa-exclamation-triangle"></i> Please install MetaMask!
                </div>
            `;
            showNotification('Please install MetaMask!', 'error');
        }
    } catch (error) {
        const connectBtn = document.getElementById('adminConnectBtn');
        hideLoading(connectBtn, '<i class="fas fa-user-shield"></i> Connect Admin Wallet');
        
        adminStatusDiv.innerHTML = `
            <div style="color: #ef4444; font-weight: 500;">
                <i class="fas fa-exclamation-circle"></i> Error connecting admin wallet: ${error.message}
            </div>
        `;
        showNotification(`Admin connection failed: ${error.message}`, 'error');
    } finally {
        isLoading = false;
    }
}

// Submit token request
async function submitTokenRequest() {
    try {
        if (isLoading) return;
        isLoading = true;
        
        if (!contract) {
            output.innerHTML = `
                <div style="color: #ef4444; font-weight: 500;">
                    <i class="fas fa-exclamation-triangle"></i> Please connect your wallet first!
                </div>
            `;
            showNotification('Please connect your wallet first!', 'error');
            return;
        }

        const name = document.getElementById("name").value.trim();
        const symbol = document.getElementById("symbol").value.trim();
        const description = document.getElementById("description").value.trim();
        const whitepaper = document.getElementById("whitepaper").value.trim();
        const totalSupply = document.getElementById("totalSupply").value;
        const adminAddress = document.getElementById("adminAddress").value.trim();

        if (!name || !symbol || !description || !whitepaper || !totalSupply || !adminAddress) {
            output.innerHTML = `
                <div style="color: #f59e0b; font-weight: 500;">
                    <i class="fas fa-exclamation-triangle"></i> Please fill in all fields!
                </div>
            `;
            showNotification('Please fill in all fields!', 'error');
            return;
        }

        // Validate inputs
        if (name.length < 3) {
            output.innerHTML = `
                <div style="color: #f59e0b; font-weight: 500;">
                    <i class="fas fa-exclamation-triangle"></i> Token name must be at least 3 characters long!
                </div>
            `;
            showNotification('Token name must be at least 3 characters!', 'error');
            return;
        }

        if (symbol.length < 2 || symbol.length > 10) {
            output.innerHTML = `
                <div style="color: #f59e0b; font-weight: 500;">
                    <i class="fas fa-exclamation-triangle"></i> Token symbol must be between 2 and 10 characters!
                </div>
            `;
            showNotification('Token symbol must be 2-10 characters!', 'error');
            return;
        }

        if (parseInt(totalSupply) <= 0) {
            output.innerHTML = `
                <div style="color: #f59e0b; font-weight: 500;">
                    <i class="fas fa-exclamation-triangle"></i> Total supply must be greater than 0!
                </div>
            `;
            showNotification('Total supply must be greater than 0!', 'error');
            return;
        }

        // Validate admin address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(adminAddress)) {
            output.innerHTML = `
                <div style="color: #f59e0b; font-weight: 500;">
                    <i class="fas fa-exclamation-triangle"></i> Please enter a valid admin wallet address!
                </div>
            `;
            showNotification('Please enter a valid admin wallet address!', 'error');
            return;
        }

        const submitBtn = document.getElementById('createToken');
        const originalText = submitBtn.innerHTML;
        showLoading(submitBtn, "Submitting...");

        output.innerHTML = `
            <div style="color: #3b82f6; font-weight: 500;">
                <i class="fas fa-spinner fa-spin"></i> Submitting request... Please wait...
            </div>
        `;

        console.log('Submitting request...');
        const tx = await contract.submitRequest(name, symbol, description, whitepaper, totalSupply, adminAddress);
        console.log('Transaction sent:', tx.hash);
        
        output.innerHTML = `
            <div style="color: #3b82f6; font-weight: 500;">
                <i class="fas fa-spinner fa-spin"></i> Transaction submitted! Waiting for confirmation...
                <br>Hash: ${tx.hash}
            </div>
        `;
        
        await tx.wait();
        console.log('Transaction confirmed!');
        console.log('Transaction hash:', tx.hash);

        hideLoading(submitBtn, originalText);
        
        output.innerHTML = `
            <div style="color: #10b981; font-weight: 500;">
                <i class="fas fa-check-circle"></i> Request submitted successfully!
                <br>Transaction: ${tx.hash}
            </div>
        `;
        
        showNotification('Token request submitted successfully!', 'success');
        
        // Clear form
        document.getElementById("name").value = "";
        document.getElementById("symbol").value = "";
        document.getElementById("description").value = "";
        document.getElementById("whitepaper").value = "";
        document.getElementById("totalSupply").value = "";
        
        // Reload user's requests
        await loadUserRequests();
        
    } catch (error) {
        const submitBtn = document.getElementById('createToken');
        hideLoading(submitBtn, '<i class="fas fa-paper-plane"></i> Submit for Review');
        
        output.innerHTML = `
            <div style="color: #ef4444; font-weight: 500;">
                <i class="fas fa-exclamation-circle"></i> Error submitting request: ${error.message}
            </div>
        `;
        showNotification(`Submission failed: ${error.message}`, 'error');
    } finally {
        isLoading = false;
    }
}

// Load all requests for admin (pending, approved, rejected, revision requested)
async function loadPendingRequests() {
    try {
        console.log('loadPendingRequests called');
        console.log('adminConnected:', adminConnected);
        console.log('contract:', contract);
        if (!adminConnected || !contract) {
            console.log('Early return - admin not connected or no contract');
            return;
        }

        const adminAddress = await signer.getAddress();
        console.log('Admin address:', adminAddress);

        console.log('Getting all requests for admin...');
        const totalRequests = await contract.requestCount();
        console.log('Total requests:', totalRequests.toNumber());
        requestsContainer.innerHTML = "";

        if (totalRequests.toNumber() === 0) {
            console.log('No requests found');
            requestsContainer.innerHTML = `
                <div style="text-align: center; color: var(--color-muted); padding: 2rem;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>No requests found at the moment.</p>
                </div>
            `;
            return;
        }

        let adminRequestCount = 0;

        for (let i = 0; i < totalRequests.toNumber(); i++) {
            const request = await contract.getRequest(i);
            
            // Check if current admin is the admin for this request
            const isAdminForThisRequest = await contract.isAdminForRequest(i, adminAddress);
            
            if (isAdminForThisRequest) {
                adminRequestCount++;
                const statusText = getStatusText(request.status);
                const statusClass = getStatusClass(request.status);
                
                const requestDiv = document.createElement("div");
                requestDiv.className = "request-item";
                requestDiv.innerHTML = `
                    <div class="request-info">
                        <h4><i class="fas fa-file-alt"></i> Request #${i}</h4>
                        <p><strong><i class="fas fa-tag"></i> Name:</strong> ${request.name}</p>
                        <p><strong><i class="fas fa-hashtag"></i> Symbol:</strong> ${request.symbol}</p>
                        <p><strong><i class="fas fa-align-left"></i> Description:</strong> ${request.description}</p>
                        <p><strong><i class="fas fa-file-alt"></i> Whitepaper:</strong> ${request.whitepaper}</p>
                        <p><strong><i class="fas fa-coins"></i> Supply:</strong> ${request.supply.toString()}</p>
                        <p><strong><i class="fas fa-user"></i> Requester:</strong> ${request.requester}</p>
                        <p><strong><i class="fas fa-info-circle"></i> Status:</strong> <span class="${statusClass}">${statusText}</span></p>
                        <p><strong><i class="fas fa-clock"></i> Submitted:</strong> ${new Date(request.timestamp * 1000).toLocaleString()}</p>
                        ${request.deployedTokenAddress !== '0x0000000000000000000000000000000000000000' ? `<p><strong><i class="fas fa-link"></i> Token Address:</strong> <a href="https://polygonscan.com/address/${request.deployedTokenAddress}" target="_blank" style="color: var(--color-primary);">${request.deployedTokenAddress}</a></p>` : ''}
                    </div>
                    <div class="request-actions">
                        ${request.status === 0 ? `
                            <button onclick="approveRequest(${i})" class="btn-approve">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button onclick="rejectRequest(${i})" class="btn-reject">
                                <i class="fas fa-times"></i> Reject
                            </button>
                            <button onclick="requestRevision(${i})" class="btn-revision">
                                <i class="fas fa-edit"></i> Request Revision
                            </button>
                        ` : ''}
                    </div>
                    ${request.status === 3 ? `
                        <div style="margin-bottom: 1rem;">
                            <button onclick="toggleChat(${i})" class="btn-revision" style="width: auto; min-width: 100px; font-size: 0.9rem; padding: 0.6rem 1rem;">
                                <i class="fas fa-comments"></i> Toggle Chat
                            </button>
                        </div>
                        <div class="chat-section" id="chat-${i}">
                            <div class="chat-messages" id="messages-${i}">
                                <!-- Messages will be loaded here -->
                            </div>
                            <div class="chat-input">
                                <input type="text" id="message-input-${i}" placeholder="Type your message..." />
                                <button onclick="sendAdminMessage(${i})" class="btn-send">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    ` : ''}
                `;
                requestsContainer.appendChild(requestDiv);
            }
        }

        if (adminRequestCount === 0) {
            requestsContainer.innerHTML = `
                <div style="text-align: center; color: var(--color-muted); padding: 2rem;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>No requests for your admin address at the moment.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error loading requests:", error);
        requestsContainer.innerHTML = `
            <div style="color: #ef4444; font-weight: 500; text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle"></i> Error loading requests: ${error.message}
            </div>
        `;
        showNotification(`Failed to load requests: ${error.message}`, 'error');
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
        
        // Try to get request count safely
        let totalRequests = 0;
        try {
            totalRequests = await contract.requestCount();
            console.log('Total requests:', totalRequests.toNumber());
        } catch (error) {
            console.log('Error getting request count, trying alternative method...');
            // Try to get it as a variable
            try {
                totalRequests = await contract.requestCount;
                console.log('Total requests (as variable):', totalRequests.toNumber());
            } catch (error2) {
                console.log('Both methods failed, setting to 0');
                totalRequests = { toNumber: () => 0 };
            }
        }
        
        userRequestsContainer.innerHTML = "";

        if (totalRequests.toNumber() === 0) {
            console.log('No requests found');
            userRequestsSection.style.display = "none";
            return;
        }

        let userRequestCount = 0;

        console.log('User address:', userAddress);
        for (let i = 0; i < totalRequests.toNumber(); i++) {
            const request = await contract.getRequest(i);
            console.log(`Request ${i}:`, request);
            console.log('Request requester:', request.requester);
            console.log('Request name:', request.name);
            console.log('Request symbol:', request.symbol);
            console.log('User address:', userAddress);
            
            if (request.requester.toLowerCase() === userAddress.toLowerCase()) {
                console.log('Found user request!');
                userRequestCount++;
                const statusText = getStatusText(request.status);
                const statusClass = getStatusClass(request.status);
                
                const requestDiv = document.createElement("div");
                requestDiv.className = "user-request-item";
                requestDiv.innerHTML = `
                    <div class="user-request-info">
                        <h4><i class="fas fa-file-alt"></i> Request #${i}</h4>
                        <p><strong><i class="fas fa-tag"></i> Name:</strong> ${request.name}</p>
                        <p><strong><i class="fas fa-hashtag"></i> Symbol:</strong> ${request.symbol}</p>
                        <p><strong><i class="fas fa-align-left"></i> Description:</strong> ${request.description}</p>
                        <p><strong><i class="fas fa-file-alt"></i> Whitepaper:</strong> ${request.whitepaper}</p>
                        <p><strong><i class="fas fa-coins"></i> Supply:</strong> ${request.supply.toString()}</p>
                        <p><strong><i class="fas fa-user-shield"></i> Admin Address:</strong> ${request.adminAddress}</p>
                        <p><strong><i class="fas fa-info-circle"></i> Status:</strong> <span class="${statusClass}">${statusText}</span></p>
                        <p><strong><i class="fas fa-clock"></i> Submitted:</strong> ${new Date(request.timestamp * 1000).toLocaleString()}</p>
                                        ${request.deployedTokenAddress !== '0x0000000000000000000000000000000000000000' ? `
                            <p><strong><i class="fas fa-link"></i> Token Contract:</strong> <a href="https://polygonscan.com/address/${request.deployedTokenAddress}" target="_blank" style="color: var(--color-primary);">${request.deployedTokenAddress}</a></p>
                            <p><strong><i class="fas fa-coins"></i> Token Distribution:</strong> 99% to you, 1% to admin</p>
                        ` : ''}
                    </div>
                    ${request.status === 3 ? `
                        <div class="chat-section" id="user-chat-${i}">
                            <div class="chat-messages" id="user-messages-${i}">
                                <!-- Messages will be loaded here -->
                            </div>
                            <div class="chat-input">
                                <input type="text" id="user-message-input-${i}" placeholder="Type your message..." />
                                <button onclick="sendUserMessage(${i})" class="btn-send">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                        <div style="margin-top: 1rem;">
                            <button onclick="toggleUserChat(${i})" class="btn-revision" style="width: auto; min-width: 100px; font-size: 0.9rem; padding: 0.6rem 1rem;">
                                <i class="fas fa-comments"></i> Toggle Chat
                            </button>
                        </div>
                    ` : ''}
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
        userRequestsContainer.innerHTML = `
            <div style="color: #ef4444; font-weight: 500; text-align: center; padding: 1rem;">
                <i class="fas fa-exclamation-triangle"></i> Error loading your requests: ${error.message}
            </div>
        `;
        showNotification(`Failed to load your requests: ${error.message}`, 'error');
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
            showNotification('Admin not connected!', 'error');
            return;
        }

        if (isLoading) return;
        isLoading = true;

        const tx = await contract.approveRequest(requestId);
        showNotification('Approving request...', 'info');
        
        // Get the deployed token address from the event
        const receipt = await tx.wait();
        const event = receipt.events?.find(e => e.event === 'RequestApproved');
        const tokenAddress = event?.args?.tokenAddress;
        
        adminStatusDiv.innerHTML = `
            <div style="color: #10b981; font-weight: 500;">
                <i class="fas fa-check-circle"></i> Request #${requestId} approved successfully!
                <br>Transaction: ${tx.hash}
                <br>Token Contract: <a href="https://polygonscan.com/address/${tokenAddress}" target="_blank" style="color: #10b981;">${tokenAddress}</a>
            </div>
        `;
        
        showNotification(`Request #${requestId} approved successfully! Token deployed at: ${tokenAddress}`, 'success');
        await loadPendingRequests(); // Refresh the list
    } catch (error) {
        adminStatusDiv.innerHTML = `
            <div style="color: #ef4444; font-weight: 500;">
                <i class="fas fa-exclamation-circle"></i> Error approving request: ${error.message}
            </div>
        `;
        showNotification(`Failed to approve request: ${error.message}`, 'error');
    } finally {
        isLoading = false;
    }
}

async function rejectRequest(requestId) {
    try {
        if (!adminConnected || !contract) {
            showNotification('Admin not connected!', 'error');
            return;
        }

        if (isLoading) return;
        isLoading = true;

        const tx = await contract.rejectRequest(requestId);
        showNotification('Rejecting request...', 'info');
        
        await tx.wait();
        
        adminStatusDiv.innerHTML = `
            <div style="color: #ef4444; font-weight: 500;">
                <i class="fas fa-times-circle"></i> Request #${requestId} rejected successfully!
                <br>Transaction: ${tx.hash}
            </div>
        `;
        
        showNotification(`Request #${requestId} rejected successfully!`, 'success');
        await loadPendingRequests(); // Refresh the list
    } catch (error) {
        adminStatusDiv.innerHTML = `
            <div style="color: #ef4444; font-weight: 500;">
                <i class="fas fa-exclamation-circle"></i> Error rejecting request: ${error.message}
            </div>
        `;
        showNotification(`Failed to reject request: ${error.message}`, 'error');
    } finally {
        isLoading = false;
    }
}

async function requestRevision(requestId) {
    try {
        if (!adminConnected || !contract) {
            showNotification('Admin not connected!', 'error');
            return;
        }

        if (isLoading) return;
        isLoading = true;

        const message = prompt("Enter revision message:");
        if (!message) {
            isLoading = false;
            return;
        }

        const tx = await contract.requestRevision(requestId, message);
        showNotification('Requesting revision...', 'info');
        
        await tx.wait();
        
        adminStatusDiv.innerHTML = `
            <div style="color: #f59e0b; font-weight: 500;">
                <i class="fas fa-edit"></i> Revision requested for #${requestId}!
                <br>Transaction: ${tx.hash}
            </div>
        `;
        
        showNotification(`Revision requested for #${requestId}!`, 'success');
        await loadPendingRequests(); // Refresh the list
    } catch (error) {
        adminStatusDiv.innerHTML = `
            <div style="color: #ef4444; font-weight: 500;">
                <i class="fas fa-exclamation-circle"></i> Error requesting revision: ${error.message}
            </div>
        `;
        showNotification(`Failed to request revision: ${error.message}`, 'error');
    } finally {
        isLoading = false;
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
        const targetElement = document.getElementById(targetId + '-tab');
        if (targetElement) {
            targetElement.classList.add('active');
        }
    });
});

// Event listeners
document.getElementById('connectWallet').addEventListener('click', connectWallet);
document.getElementById('createToken').addEventListener('click', submitTokenRequest);
document.getElementById('adminConnectBtn').addEventListener('click', connectAdminWallet);

// Form validation
document.getElementById('name').addEventListener('input', function() {
    if (this.value.length >= 3) {
        this.style.borderColor = '#10b981';
    } else {
        this.style.borderColor = '#2e374a';
    }
});

document.getElementById('symbol').addEventListener('input', function() {
    if (this.value.length >= 2 && this.value.length <= 10) {
        this.style.borderColor = '#10b981';
    } else {
        this.style.borderColor = '#2e374a';
    }
});

document.getElementById('totalSupply').addEventListener('input', function() {
    if (parseInt(this.value) > 0) {
        this.style.borderColor = '#10b981';
    } else {
        this.style.borderColor = '#2e374a';
    }
});

// Initialize
output.innerHTML = `
    <div style="color: var(--color-muted); text-align: center; padding: 2rem;">
        <i class="fas fa-wallet" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <p>Please connect your wallet to submit token requests.</p>
    </div>
`;

adminStatusDiv.innerHTML = `
    <div style="color: var(--color-muted); text-align: center; padding: 2rem;">
        <i class="fas fa-shield-alt" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <p>Please connect admin wallet to review requests.</p>
    </div>
`;

// Manual refresh functions
async function refreshUserRequests() {
    if (contract && signer && !adminConnected) {
        await loadUserRequests();
        showNotification('User requests refreshed!', 'success');
    }
}

async function refreshAdminRequests() {
    if (contract && signer && adminConnected) {
        await loadPendingRequests();
        showNotification('Admin requests refreshed!', 'success');
    }
}

// Message functions
async function viewMessages(requestId) {
    try {
        const request = await contract.getRequest(requestId);
        const messages = await contract.getRequestMessages(requestId);
        let messageHtml = '<div class="messages-container">';
        messageHtml += '<h4><i class="fas fa-comments"></i> Messages for Request #' + requestId + '</h4>';
        
        // Add initial admin message if exists
        if (request.adminMessage && request.adminMessage.trim() !== '') {
            messageHtml += `
                <div class="message admin-message">
                    <div class="message-header">
                        <strong>Admin:</strong> Initial Revision Request
                        <span class="message-time">${new Date(request.timestamp * 1000).toLocaleString()}</span>
                    </div>
                    <div class="message-content">${request.adminMessage}</div>
                </div>
            `;
        }
        
        // Add conversation messages
        if (messages.senders.length === 0) {
            if (!request.adminMessage || request.adminMessage.trim() === '') {
                messageHtml += '<p>No messages yet.</p>';
            }
        } else {
            for (let i = 0; i < messages.senders.length; i++) {
                const isAdmin = await contract.isAdminForRequest(requestId, messages.senders[i]);
                const senderType = isAdmin ? 'Admin' : 'User';
                const senderClass = isAdmin ? 'admin-message' : 'user-message';
                
                messageHtml += `
                    <div class="message ${senderClass}">
                        <div class="message-header">
                            <strong>${senderType}:</strong> ${messages.senders[i]}
                            <span class="message-time">${new Date(messages.timestamps[i] * 1000).toLocaleString()}</span>
                        </div>
                        <div class="message-content">${messages.messages[i]}</div>
                    </div>
                `;
            }
        }
        
        messageHtml += '</div>';
        
        // Show messages in a modal or alert
        alert(messageHtml.replace(/<[^>]*>/g, '')); // Simple text version for now
    } catch (error) {
        console.error("Error loading messages:", error);
        showNotification(`Failed to load messages: ${error.message}`, 'error');
    }
}

async function viewUserMessages(requestId) {
    try {
        const request = await contract.getRequest(requestId);
        const messages = await contract.getRequestMessages(requestId);
        let messageHtml = '<div class="messages-container">';
        messageHtml += '<h4><i class="fas fa-comments"></i> Messages for Request #' + requestId + '</h4>';
        
        // Add initial admin message if exists
        if (request.adminMessage && request.adminMessage.trim() !== '') {
            messageHtml += `
                <div class="message admin-message">
                    <div class="message-header">
                        <strong>Admin:</strong> Initial Revision Request
                        <span class="message-time">${new Date(request.timestamp * 1000).toLocaleString()}</span>
                    </div>
                    <div class="message-content">${request.adminMessage}</div>
                </div>
            `;
        }
        
        // Add conversation messages
        if (messages.senders.length === 0) {
            if (!request.adminMessage || request.adminMessage.trim() === '') {
                messageHtml += '<p>No messages yet.</p>';
            }
        } else {
            for (let i = 0; i < messages.senders.length; i++) {
                const isAdmin = await contract.isAdminForRequest(requestId, messages.senders[i]);
                const senderType = isAdmin ? 'Admin' : 'User';
                const senderClass = isAdmin ? 'admin-message' : 'user-message';
                
                messageHtml += `
                    <div class="message ${senderClass}">
                        <div class="message-header">
                            <strong>${senderType}:</strong> ${messages.senders[i]}
                            <span class="message-time">${new Date(messages.timestamps[i] * 1000).toLocaleString()}</span>
                        </div>
                        <div class="message-content">${messages.messages[i]}</div>
                    </div>
                `;
            }
        }
        
        messageHtml += '</div>';
        
        // Show messages in a modal or alert
        alert(messageHtml.replace(/<[^>]*>/g, '')); // Simple text version for now
    } catch (error) {
        console.error("Error loading messages:", error);
        showNotification(`Failed to load messages: ${error.message}`, 'error');
    }
}

async function sendUserMessage(requestId) {
    try {
        const messageInput = document.getElementById(`user-message-input-${requestId}`);
        const message = messageInput.value.trim();
        
        if (!message) {
            return;
        }

        const tx = await contract.sendMessage(requestId, message);
        showNotification('Sending message...', 'info');
        
        await tx.wait();
        
        showNotification('Message sent successfully!', 'success');
        
        // Clear input and refresh messages
        messageInput.value = '';
        await loadChatMessages(requestId, 'user');
    } catch (error) {
        console.error("Error sending message:", error);
        showNotification(`Failed to send message: ${error.message}`, 'error');
    }
}

async function sendAdminMessage(requestId) {
    try {
        const messageInput = document.getElementById(`message-input-${requestId}`);
        const message = messageInput.value.trim();
        
        if (!message) {
            return;
        }

        const tx = await contract.sendMessage(requestId, message);
        showNotification('Sending message...', 'info');
        
        await tx.wait();
        
        showNotification('Message sent successfully!', 'success');
        
        // Clear input and refresh messages
        messageInput.value = '';
        await loadChatMessages(requestId, 'admin');
    } catch (error) {
        console.error("Error sending message:", error);
        showNotification(`Failed to send message: ${error.message}`, 'error');
    }
}

// Chat functions
async function toggleChat(requestId) {
    const chatSection = document.getElementById(`chat-${requestId}`);
    if (chatSection.style.display === 'none' || chatSection.style.display === '') {
        chatSection.style.display = 'block';
        await loadChatMessages(requestId, 'admin');
    } else {
        chatSection.style.display = 'none';
    }
}

async function toggleUserChat(requestId) {
    const chatSection = document.getElementById(`user-chat-${requestId}`);
    if (chatSection.style.display === 'none' || chatSection.style.display === '') {
        chatSection.style.display = 'block';
        await loadChatMessages(requestId, 'user');
    } else {
        chatSection.style.display = 'none';
    }
}

async function loadChatMessages(requestId, type) {
    try {
        const request = await contract.getRequest(requestId);
        const messages = await contract.getRequestMessages(requestId);
        const messagesContainer = document.getElementById(type === 'admin' ? `messages-${requestId}` : `user-messages-${requestId}`);
        
        let messagesHtml = '';
        
        // Add initial admin message if exists
        if (request.adminMessage && request.adminMessage.trim() !== '') {
            messagesHtml += `
                <div class="chat-message admin-message">
                    <div class="message-sender">Admin</div>
                    <div class="message-text">${request.adminMessage}</div>
                    <div class="message-time">${new Date(request.timestamp * 1000).toLocaleString()}</div>
                </div>
            `;
        }
        
        // Add conversation messages
        for (let i = 0; i < messages.senders.length; i++) {
            const isAdmin = await contract.isAdminForRequest(requestId, messages.senders[i]);
            const senderType = isAdmin ? 'Admin' : 'User';
            const messageClass = isAdmin ? 'admin-message' : 'user-message';
            
            messagesHtml += `
                <div class="chat-message ${messageClass}">
                    <div class="message-sender">${senderType}</div>
                    <div class="message-text">${messages.messages[i]}</div>
                    <div class="message-time">${new Date(messages.timestamps[i] * 1000).toLocaleString()}</div>
                </div>
            `;
        }
        
        messagesContainer.innerHTML = messagesHtml;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error("Error loading chat messages:", error);
    }
}
