// app.js

const chatItems = document.querySelectorAll('.chat-item');
const headerName = document.querySelector('.chat-header h3');
const headerAvatar = document.querySelector('.chat-header .avatar');
const input = document.querySelector('.chat-input input');
const button = document.querySelector('.chat-input button');
const messages = document.querySelector('.chat-messages');

// هندل انتخاب چت از لیست
chatItems.forEach(item => {
  item.addEventListener('click', () => {
    // تغییر کلاس active
    document.querySelector('.chat-item.active')?.classList.remove('active');
    item.classList.add('active');

    // آپدیت هدر با اسم و آواتار جدید
    const name = item.dataset.name;
    const avatar = item.dataset.avatar;
    headerName.textContent = name;
    headerAvatar.src = avatar;

    // پیام‌ها رو فعلاً پاک می‌کنیم (برای نسخه ساده)
    messages.innerHTML = '';
  });
});

// هندل ارسال پیام ساده
button.addEventListener('click', () => {
  const text = input.value.trim();
  if (text) {
    const msg = document.createElement('div');
    msg.className = 'message sent';
    msg.textContent = text;
    messages.appendChild(msg);
    input.value = '';

    // اسکرول به آخر پیام‌ها
    messages.scrollTop = messages.scrollHeight;
  }
});

// Wallet connect logic
const walletBtn = document.getElementById('wallet-connect-btn');
const walletIcon = document.getElementById('wallet-connect-icon');

function showWalletAlert(message, type) {
  // Remove existing alert if any
  document.querySelectorAll('.wallet-alert').forEach(e => e.remove());
  const alert = document.createElement('div');
  alert.className = `wallet-alert ${type}`;
  alert.textContent = message;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 4000);
}

walletBtn.addEventListener('click', async () => {
  // Remove previous color states
  walletIcon.classList.remove('wallet-success', 'wallet-error');
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      walletIcon.classList.add('wallet-success');
      showWalletAlert('Wallet connected successfully!', 'success');
    } catch (err) {
      walletIcon.classList.add('wallet-error');
      showWalletAlert('Wallet connection failed!', 'error');
    }
  } else {
    walletIcon.classList.add('wallet-error');
    showWalletAlert('MetaMask is not installed!', 'error');
  }
  // No timeout to remove color; color stays until next click
});

// Custom tooltip for wallet connect
const walletTooltipText = 'Wallet Connect';
let walletTooltip;

walletBtn.addEventListener('mouseenter', (e) => {
  if (walletTooltip) walletTooltip.remove();
  walletTooltip = document.createElement('div');
  walletTooltip.className = 'custom-tooltip show';
  walletTooltip.textContent = walletTooltipText;
  document.body.appendChild(walletTooltip);
  // Position above the button
  const rect = walletBtn.getBoundingClientRect();
  walletTooltip.style.left = rect.left + rect.width / 2 + 'px';
  walletTooltip.style.top = (rect.top - walletTooltip.offsetHeight - 12) + 'px';
  walletTooltip.style.transform = 'translateX(-50%)';
});
walletBtn.addEventListener('mouseleave', () => {
  if (walletTooltip) walletTooltip.remove();
});

// Public Key Modal logic
const showPubKeyBtn = document.getElementById('show-public-key-btn');
const pubKeyModal = document.getElementById('public-key-modal');
let currentAccount = null;
let cachedPublicKey = null;

// Listen for wallet connect to update currentAccount
if (window.ethereum) {
  window.ethereum.on && window.ethereum.on('accountsChanged', (accounts) => {
    currentAccount = accounts && accounts[0] ? accounts[0] : null;
    cachedPublicKey = null; // reset cached public key on account change
  });
}

async function getCurrentAccount() {
  if (typeof window.ethereum === 'undefined') return null;
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts && accounts[0] ? accounts[0] : null;
  } catch {
    return null;
  }
}

// Helper: recover public key from signature (ethers.js logic, but pure JS)
function recoverPublicKey(msg, sig) {
  // Use ethereumjs-util for ecrecover, but here is a pure JS version for secp256k1
  // We'll use the built-in web3 method if available, otherwise fallback to a simple implementation
  // But since we can't use external libs, we'll use a minimalistic approach
  // The easiest way is to use ethereumjs-util's ecrecover, but here we use a minimal version
  // We'll use ethers.js's recoverPublicKey logic, but in pure JS
  // For simplicity, we'll use the built-in web3 method if available
  if (window.ethereum && window.ethereum._metamask) {
    // Metamask exposes a recover method (not standard, but for some wallets)
    // But in most browsers, we need to use ethers.js or ethereumjs-util
    // Here, we fallback to a minimal implementation
    return null; // Not supported natively, so we show the signature instead
  }
  return null;
}

showPubKeyBtn.addEventListener('click', async () => {
  const account = await getCurrentAccount();
  if (!account) {
    showWalletAlert('Please connect your wallet first.', 'error');
    return;
  }
  if (cachedPublicKey) {
    showPublicKeyModal(cachedPublicKey);
    return;
  }
  // Request public encryption key from MetaMask
  try {
    const publicKey = await window.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [account]
    });
    cachedPublicKey = publicKey;
    showPublicKeyModal(publicKey);
  } catch (err) {
    showWalletAlert('User denied or MetaMask does not support public key request.', 'error');
  }
});

function showPublicKeyModal(pubKey) {
  pubKeyModal.innerHTML = `
    <div class="public-key-box">
      <button class="close-btn" title="Close">&times;</button>
      <div class="public-key-title">Your Public Key</div>
      <div class="public-key-value" id="public-key-value">${pubKey}</div>
      <button class="copy-btn" id="copy-public-key">Copy</button>
    </div>
  `;
  pubKeyModal.style.display = 'flex';

  // Copy logic
  document.getElementById('copy-public-key').onclick = () => {
    const value = document.getElementById('public-key-value').textContent;
    navigator.clipboard.writeText(value).then(() => {
      showWalletAlert('Copied!', 'success');
    }, () => {
      showWalletAlert('Copy failed!', 'error');
    });
  };
  // Close logic
  pubKeyModal.querySelector('.close-btn').onclick = () => {
    pubKeyModal.style.display = 'none';
  };
  // Close on overlay click
  pubKeyModal.onclick = (e) => {
    if (e.target === pubKeyModal) pubKeyModal.style.display = 'none';
  };
}

// Custom tooltip for public key button
const pubKeyTooltipText = 'Get Public Key';
let pubKeyTooltip;

showPubKeyBtn.addEventListener('mouseenter', (e) => {
  if (pubKeyTooltip) pubKeyTooltip.remove();
  pubKeyTooltip = document.createElement('div');
  pubKeyTooltip.className = 'custom-tooltip show';
  pubKeyTooltip.textContent = pubKeyTooltipText;
  document.body.appendChild(pubKeyTooltip);
  // Position above the button
  const rect = showPubKeyBtn.getBoundingClientRect();
  pubKeyTooltip.style.left = rect.left + rect.width / 2 + 'px';
  pubKeyTooltip.style.top = (rect.top - pubKeyTooltip.offsetHeight - 12) + 'px';
  pubKeyTooltip.style.transform = 'translateX(-50%)';
});
showPubKeyBtn.addEventListener('mouseleave', () => {
  if (pubKeyTooltip) pubKeyTooltip.remove();
});

// Private Key Modal logic
const showPrivateKeyBtn = document.getElementById('show-private-key-btn');
let cachedPrivateKey = null;

showPrivateKeyBtn.addEventListener('click', () => {
  showPrivateKeyModal();
});

function showPrivateKeyModal() {
  const modal = document.getElementById('public-key-modal');
  modal.innerHTML = `
    <div class="private-key-box">
      <button class="close-btn" title="Close">&times;</button>
      <div class="private-key-title">Enter Your Private Key</div>
      <div class="private-key-box-input-row">
        <input id="private-key-input" class="private-key-input" type="password" placeholder="Private Key" value="${cachedPrivateKey ? cachedPrivateKey : ''}" autocomplete="off" />
        <button id="toggle-visibility" class="toggle-visibility-btn" tabindex="-1" title="Show/Hide">
          <svg id="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
      <button class="save-btn" id="save-private-key">Save</button>
    </div>
  `;
  modal.style.display = 'flex';

  const input = document.getElementById('private-key-input');
  const toggleBtn = document.getElementById('toggle-visibility');
  const eyeIcon = document.getElementById('eye-icon');
  let visible = false;
  toggleBtn.onclick = () => {
    visible = !visible;
    input.type = visible ? 'text' : 'password';
    // Toggle SVG (open/closed eye)
    eyeIcon.innerHTML = visible
      ? '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/><line x1="1" y1="1" x2="23" y2="23"/>'
      : '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>';
  };
  document.getElementById('save-private-key').onclick = () => {
    cachedPrivateKey = input.value;
    modal.style.display = 'none';
    showWalletAlert('Private key saved successfully!', 'success');
  };
  modal.querySelector('.close-btn').onclick = () => {
    modal.style.display = 'none';
  };
  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };
}

// Custom tooltip for private key button
const privKeyTooltipText = 'Add Private Key';
let privKeyTooltip;

showPrivateKeyBtn.addEventListener('mouseenter', (e) => {
  if (privKeyTooltip) privKeyTooltip.remove();
  privKeyTooltip = document.createElement('div');
  privKeyTooltip.className = 'custom-tooltip show';
  privKeyTooltip.textContent = privKeyTooltipText;
  document.body.appendChild(privKeyTooltip);
  // Position above the button
  const rect = showPrivateKeyBtn.getBoundingClientRect();
  privKeyTooltip.style.left = rect.left + rect.width / 2 + 'px';
  privKeyTooltip.style.top = (rect.top - privKeyTooltip.offsetHeight - 12) + 'px';
  privKeyTooltip.style.transform = 'translateX(-50%)';
});
showPrivateKeyBtn.addEventListener('mouseleave', () => {
  if (privKeyTooltip) privKeyTooltip.remove();
});

// --- Add Contact (User) Button Logic ---
const addContactBtn = document.getElementById('add-contact-btn');
let addContactModal;

addContactBtn.addEventListener('click', () => {
  if (addContactModal) addContactModal.remove();
  addContactModal = document.createElement('div');
  addContactModal.className = 'modal-overlay';
  addContactModal.innerHTML = `
    <div class="add-contact-box">
      <div class="add-contact-title">Add Contact</div>
      <div class="add-contact-input-row">
        <input class="add-contact-input" type="text" placeholder="User Name" id="contact-username" maxlength="32" />
      </div>
      <div class="add-contact-input-row">
        <input class="add-contact-input" type="text" placeholder="Wallet Address" id="contact-wallet" maxlength="42" />
      </div>
      <div class="add-contact-input-row">
        <input class="add-contact-input" type="text" placeholder="Public Key" id="contact-pubkey" maxlength="128" />
      </div>
      <button class="add-contact-btn">Add Contact</button>
      <button class="close-btn" style="position:absolute;top:1.2rem;right:1.2rem;">&times;</button>
    </div>
  `;
  document.body.appendChild(addContactModal);

  // Close logic
  addContactModal.querySelector('.close-btn').onclick = () => {
    addContactModal.remove();
    addContactModal = null;
  };
  // Optional: Close on overlay click
  addContactModal.onclick = (e) => {
    if (e.target === addContactModal) {
      addContactModal.remove();
      addContactModal = null;
    }
  };
  // Add Contact logic
  addContactModal.querySelector('.add-contact-btn').onclick = async () => {
    const name = document.getElementById('contact-username').value.trim();
    const address = document.getElementById('contact-wallet').value.trim();
    const pubkey = document.getElementById('contact-pubkey').value.trim();
    if (!name || !address || !pubkey) {
      showWalletAlert('Please fill in all fields.', false);
      return;
    }
    if (!window.ethereum) {
      showWalletAlert('MetaMask is not installed!', false);
      return;
    }
    // Check wallet connection
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (!accounts || !accounts[0]) {
      showWalletAlert('Please connect your wallet first.', false);
      return;
    }
    const userAddress = accounts[0];
    if (!cachedPublicKey) {
      showWalletAlert('Please get your public key first.', false);
      return;
    }
    // Prepare contact data
    const nonce = nacl.randomBytes(24);
    const contactObj = { name, address, pubkey };
    const contactStr = JSON.stringify(contactObj);
    try {
      // Encrypt with nacl.box using user's MetaMask public key (Base64)
      const recipientPubKey = nacl.util.decodeBase64(cachedPublicKey); // 32 bytes
      const ephemeralKeyPair = nacl.box.keyPair();
      const messageUint8 = nacl.util.decodeUTF8(contactStr);
      const box = nacl.box(messageUint8, nonce, recipientPubKey, ephemeralKeyPair.secretKey);
      // Prepare payload: ephemeralPubKey + nonce + ciphertext, all base64
      const payload = {
        ephPub: nacl.util.encodeBase64(ephemeralKeyPair.publicKey),
        nonce: nacl.util.encodeBase64(nonce),
        box: nacl.util.encodeBase64(box)
      };
      const dataField = '***' + btoa(JSON.stringify(payload));
      // Send 0 ETH tx to self with data
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      showWalletAlert('Sending transaction...', 'info');
      const tx = await signer.sendTransaction({
        to: '0x000000000000000000000000000000000000dEaD', // Send to burn address
        value: ethers.utils.parseEther('0'), // Try with 0; if not allowed, user can set to 0.00001
        data: ethers.utils.hexlify(new TextEncoder().encode(dataField))
      });
      
      showWalletAlert('Transaction sent! Waiting for confirmation...', 'info');
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        showWalletAlert('Contact added successfully! Transaction confirmed.', 'success');
      } else {
        showWalletAlert('Transaction failed!', 'error');
      }
      
      addContactModal.remove();
      addContactModal = null;
    } catch (err) {
      showWalletAlert('Failed to add contact: ' + (err && err.message ? err.message : 'Unknown error'), false);
    }
  };
});

// --- Decrypt Contacts Button Logic ---
let contacts = [];

// Initial decrypt button event listener
document.addEventListener('DOMContentLoaded', () => {
  const initialDecryptBtn = document.getElementById('decrypt-contacts-btn');
  if (initialDecryptBtn) {
    initialDecryptBtn.addEventListener('click', async () => {
      // Check if wallet is connected
      if (!window.ethereum) {
        showWalletAlert('MetaMask is not installed!', 'error');
        return;
      }

      // Check if private key is entered
      if (!cachedPrivateKey) {
        showWalletAlert('Please enter your private key first!', 'error');
        return;
      }

      try {
        // Show loading state
        initialDecryptBtn.style.opacity = '0.5';
        initialDecryptBtn.disabled = true;
        
        // Get current account
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (!accounts || !accounts[0]) {
          showWalletAlert('Please connect your wallet first!', 'error');
          return;
        }
        
        const userAddress = accounts[0];
        
        // Decrypt contacts
        await decryptContacts(userAddress);
        
        // Update UI
        updateContactsList();
        
        showWalletAlert('Contacts decrypted successfully!', 'success');
      } catch (error) {
        showWalletAlert('Failed to decrypt contacts: ' + error.message, 'error');
      } finally {
        // Reset button state
        initialDecryptBtn.style.opacity = '1';
        initialDecryptBtn.disabled = false;
      }
    });
  }
});

async function decryptContacts(userAddress) {
  try {
    // Get provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Get transactions to burn address (Polygon burn address)
    const burnAddress = '0x000000000000000000000000000000000000dEaD';
    
    // Get block number to limit search
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 1000); // Search last 1k blocks instead of 10k
    
    showWalletAlert('Searching for transactions...', 'info');
    
    // Get logs for transactions to burn address
    const filter = {
      address: burnAddress,
      fromBlock: fromBlock,
      toBlock: 'latest'
    };
    
    const logs = await provider.getLogs(filter);
    
    showWalletAlert(`Found ${logs.length} transactions, processing...`, 'info');
    
    // Process each transaction
    let processedCount = 0;
    for (const log of logs) {
      try {
        // Get transaction details using Etherscan API v2 for better performance
        try {
          const txResponse = await fetch(`https://api.etherscan.io/v2/api?chainid=137&module=proxy&action=eth_getTransactionByHash&txhash=${log.transactionHash}&apikey=173I6KJ1QIKXC4M5Z9KE43ZF17CD2JK7YD`);
          const txData = await txResponse.json();
          
          if (txData.result && txData.result.input && txData.result.input !== '0x') {
            // Decode data
            const decodedData = ethers.utils.toUtf8String(txData.result.input);
            
            // Check if it's our encrypted data (starts with ***)
            if (decodedData.startsWith('***')) {
              const encryptedData = decodedData.substring(3); // Remove ***
              const payload = JSON.parse(atob(encryptedData));
              
              // Decrypt the contact data
              const decryptedContact = await decryptContactData(payload);
              
              if (decryptedContact) {
                contacts.push(decryptedContact);
              }
            }
          }
        } catch (txError) {
          console.log('Error getting transaction details:', txError);
          // Fallback to provider method
          try {
            const tx = await provider.getTransaction(log.transactionHash);
            if (tx.data && tx.data !== '0x') {
              const decodedData = ethers.utils.toUtf8String(tx.data);
              if (decodedData.startsWith('***')) {
                const encryptedData = decodedData.substring(3);
                const payload = JSON.parse(atob(encryptedData));
                const decryptedContact = await decryptContactData(payload);
                if (decryptedContact) {
                  contacts.push(decryptedContact);
                }
              }
            }
          } catch (fallbackError) {
            console.log('Fallback also failed:', fallbackError);
          }
        }
        processedCount++;
        
        // Update progress every 10 transactions
        if (processedCount % 10 === 0) {
          showWalletAlert(`Processed ${processedCount}/${logs.length} transactions...`, 'info');
        }
      } catch (error) {
        console.log('Error processing transaction:', error);
        processedCount++;
        continue;
      }
    }
  } catch (error) {
    console.log('Provider logs failed, trying Etherscan API...');
    
    // Use Etherscan API v2 for Polygon with API key
    try {
      const response = await fetch(`https://api.etherscan.io/v2/api?chainid=137&module=account&action=txlist&address=${burnAddress}&startblock=${fromBlock}&endblock=99999999&sort=desc&apikey=173I6KJ1QIKXC4M5Z9KE43ZF17CD2JK7YD`);
      const data = await response.json();
      
      if (data.status === '1' && data.result) {
        showWalletAlert(`Found ${data.result.length} transactions via API, processing...`, 'info');
        
        let processedCount = 0;
        for (const tx of data.result) {
          try {
            if (tx.input && tx.input !== '0x') {
              // Decode data
              const decodedData = ethers.utils.toUtf8String(tx.input);
              
              // Check if it's our encrypted data (starts with ***)
              if (decodedData.startsWith('***')) {
                const encryptedData = decodedData.substring(3);
                const payload = JSON.parse(atob(encryptedData));
                
                // Decrypt the contact data
                const decryptedContact = await decryptContactData(payload);
                
                if (decryptedContact) {
                  contacts.push(decryptedContact);
                }
              }
            }
            processedCount++;
            
            if (processedCount % 10 === 0) {
              showWalletAlert(`Processed ${processedCount}/${data.result.length} transactions...`, 'info');
            }
          } catch (error) {
            console.log('Error processing API transaction:', error);
            processedCount++;
            continue;
          }
        }
      } else {
        throw new Error('No transactions found or API error');
      }
    } catch (apiError) {
      throw new Error('Failed to fetch transactions: ' + error.message + ' | API fallback also failed: ' + apiError.message);
    }
  }
}

async function decryptContactData(payload) {
  try {
    // Decode base64 data
    const ephemeralPubKey = nacl.util.decodeBase64(payload.ephPub);
    const nonce = nacl.util.decodeBase64(payload.nonce);
    const encryptedBox = nacl.util.decodeBase64(payload.box);
    
    // Create keypair from user's private key
    const userPrivateKey = nacl.util.decodeUTF8(cachedPrivateKey);
    const userKeyPair = nacl.box.keyPair.fromSecretKey(userPrivateKey);
    
    // Decrypt the data
    const decryptedBytes = nacl.box.open(encryptedBox, nonce, ephemeralPubKey, userKeyPair.secretKey);
    
    if (!decryptedBytes) {
      return null; // Decryption failed
    }
    
    // Convert to string and parse
    const decryptedString = nacl.util.encodeUTF8(decryptedBytes);
    const contactData = JSON.parse(decryptedString);
    
    return {
      name: contactData.name,
      address: contactData.address,
      pubkey: contactData.pubkey,
      avatar: `https://i.pravatar.cc/40?img=${Math.abs(contactData.name.charCodeAt(0)) % 70 + 1}`,
      lastMessage: 'Contact added'
    };
  } catch (error) {
    console.log('Error decrypting contact:', error);
    return null;
  }
}

function updateContactsList() {
  const chatList = document.querySelector('.chat-list');
  
  if (contacts.length === 0) {
    chatList.innerHTML = `
      <div class="empty-contacts">
        <p>No contacts found</p>
        <p>Connect wallet and decrypt to see your contacts</p>
        <button id="decrypt-contacts-btn" class="decrypt-btn">Decrypt Contacts</button>
      </div>
    `;
    
    // Re-add event listener for the new decrypt button
    const newDecryptBtn = document.getElementById('decrypt-contacts-btn');
    if (newDecryptBtn) {
      newDecryptBtn.addEventListener('click', async () => {
        // Check if wallet is connected
        if (!window.ethereum) {
          showWalletAlert('MetaMask is not installed!', 'error');
          return;
        }

        // Check if private key is entered
        if (!cachedPrivateKey) {
          showWalletAlert('Please enter your private key first!', 'error');
          return;
        }

        try {
          // Show loading state
          newDecryptBtn.style.opacity = '0.5';
          newDecryptBtn.disabled = true;
          
          // Get current account
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (!accounts || !accounts[0]) {
            showWalletAlert('Please connect your wallet first!', 'error');
            return;
          }
          
          const userAddress = accounts[0];
          
          // Decrypt contacts
          await decryptContacts(userAddress);
          
          // Update UI
          updateContactsList();
          
          showWalletAlert('Contacts decrypted successfully!', 'success');
        } catch (error) {
          showWalletAlert('Failed to decrypt contacts: ' + error.message, 'error');
        } finally {
          // Reset button state
          newDecryptBtn.style.opacity = '1';
          newDecryptBtn.disabled = false;
        }
      });
    }
    return;
  }
  
  // Clear existing content
  chatList.innerHTML = '';
  
  // Add each contact
  contacts.forEach((contact, index) => {
    const contactElement = document.createElement('div');
    contactElement.className = 'chat-item' + (index === 0 ? ' active' : '');
    contactElement.dataset.name = contact.name;
    contactElement.dataset.avatar = contact.avatar;
    
    contactElement.innerHTML = `
      <img class="avatar" src="${contact.avatar}" alt="avatar">
      <div class="chat-details">
        <h4>${contact.name}</h4>
        <p>${contact.lastMessage}</p>
      </div>
    `;
    
    // Add click event
    contactElement.addEventListener('click', () => {
      // Update active state
      document.querySelector('.chat-item.active')?.classList.remove('active');
      contactElement.classList.add('active');
      
      // Update header
      const headerName = document.querySelector('.chat-header h3');
      const headerAvatar = document.querySelector('.chat-header .avatar');
      headerName.textContent = contact.name;
      headerAvatar.src = contact.avatar;
      
      // Clear messages
      const messages = document.querySelector('.chat-messages');
      messages.innerHTML = '';
    });
    
    chatList.appendChild(contactElement);
  });
}


