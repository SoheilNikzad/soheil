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
    const address = item.dataset.address;
    
    headerName.textContent = name;
    headerAvatar.textContent = avatar;
    
    // Update address if available
    const headerAddress = document.querySelector('.contact-address');
    if (headerAddress) {
      headerAddress.textContent = address || '';
    }

    // پیام‌ها رو فعلاً پاک می‌کنیم (برای نسخه ساده)
    messages.innerHTML = '';
  });
});

// Enter key support for sending messages
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    button.click();
  }
});

// Refresh messages button
const refreshBtn = document.getElementById('refresh-messages-btn');
refreshBtn.addEventListener('click', async () => {
  const selectedContact = document.querySelector('.chat-item.active');
  if (selectedContact) {
    await loadMessagesForContact(selectedContact.dataset.address);
    showWalletAlert('Messages refreshed!', 'success');
  }
});

// هندل ارسال پیام
button.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return;

  // Check if wallet is connected
  if (!window.ethereum) {
    showWalletAlert('MetaMask is not installed!', 'error');
    return;
  }

  // Check if a contact is selected
  const selectedContact = document.querySelector('.chat-item.active');
  if (!selectedContact) {
    showWalletAlert('Please select a contact first!', 'error');
    return;
  }

  try {
    // Disable input during sending
    input.disabled = true;
    button.disabled = true;
    button.textContent = 'Sending...';

    // Create message element
    const msg = document.createElement('div');
    msg.className = 'message sent';
    
    const { timeString, dateString } = formatMessageDateTime(Date.now());
    
    msg.innerHTML = `
      <div class="message-content">${text}</div>
      <div class="message-time">
        ${dateString ? `<div class="message-date">${dateString}</div>` : ''}
        <div class="message-time-text">${timeString}</div>
        <div class="message-status">Sending...</div>
      </div>
    `;
    
    // Remove overlay if exists
    const overlay = messages.querySelector('.chat-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    messages.appendChild(msg);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Get current account
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (!accounts || !accounts[0]) {
      throw new Error('Wallet not connected');
    }

    // Prepare transaction data
    const messageData = {
      to: selectedContact.dataset.name,
      message: text,
      timestamp: Date.now()
    };

    const dataField = 'MSG' + btoa(unescape(encodeURIComponent(JSON.stringify(messageData))));

    // Send transaction to recipient
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Get recipient address from selected contact
    const recipientAddress = selectedContact.dataset.address;
    
    // Get current network
    const network = await provider.getNetwork();
    console.log('Current network:', network);
    console.log('Sending message to:', recipientAddress);
    
    // Estimate gas
    const gasEstimate = await provider.estimateGas({
      to: recipientAddress,
      value: ethers.utils.parseEther('0'),
      data: ethers.utils.hexlify(new TextEncoder().encode(dataField))
    });
    
    console.log('Estimated gas:', gasEstimate.toString());
    
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: ethers.utils.parseEther('0'),
      data: ethers.utils.hexlify(new TextEncoder().encode(dataField)),
      gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
    });

    // Update message status
    const statusSpan = msg.querySelector('.message-status');
    statusSpan.textContent = 'Sent';

    showWalletAlert('Message sent successfully!', 'success');

  } catch (error) {
    console.error('Error sending message:', error);
    
    let errorMessage = 'Failed to send message';
    if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient balance for gas fee';
    } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      errorMessage = 'Transaction failed - try again';
    } else if (error.message.includes('user rejected')) {
      errorMessage = 'Transaction cancelled by user';
    } else if (error.message.includes('Internal JSON-RPC error')) {
      errorMessage = 'Network error - check your connection';
    } else {
      errorMessage = 'Failed to send message: ' + error.message;
    }
    
    showWalletAlert(errorMessage, 'error');
    
    // Remove failed message
    const failedMsg = messages.querySelector('.message.sent:last-child');
    if (failedMsg) {
      failedMsg.remove();
    }
  } finally {
    // Re-enable input
    input.disabled = false;
    button.disabled = false;
    button.textContent = 'Send';
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
    let privateKey = input.value.trim();
    
    // اضافه کردن 0x اگر نباشه
    if (privateKey && !privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
    
    cachedPrivateKey = privateKey;
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

// --- Settings Button Logic ---
const settingsBtn = document.querySelector('.action-btn[title="Settings"]');
let settingsModal;

settingsBtn.addEventListener('click', () => {
  if (settingsModal) settingsModal.remove();
  settingsModal = document.createElement('div');
  settingsModal.className = 'modal-overlay';
  
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  
  settingsModal.innerHTML = `
    <div class="settings-box">
      <div class="settings-title">Settings</div>
      <div class="settings-option">
        <span class="settings-option-label">Theme</span>
        <div class="theme-toggle ${currentTheme === 'light' ? 'active' : ''}" id="theme-toggle">
        </div>
      </div>
      <button class="close-btn" style="position:absolute;top:1.2rem;right:1.2rem;">&times;</button>
    </div>
  `;
  document.body.appendChild(settingsModal);

  // Theme toggle logic
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.classList.toggle('active');
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    showWalletAlert(`Theme changed to ${newTheme} mode!`, 'success');
  });

  // Close logic
  settingsModal.querySelector('.close-btn').onclick = () => {
    settingsModal.remove();
    settingsModal = null;
  };
  
  // Close on overlay click
  settingsModal.onclick = (e) => {
    if (e.target === settingsModal) {
      settingsModal.remove();
      settingsModal = null;
    }
  };
});

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
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
      console.log('Sending transaction with data:', dataField.substring(0, 50) + '...');
      const tx = await signer.sendTransaction({
        to: '0x000000000000000000000000000000000000dEaD', // Send to burn address
        value: ethers.utils.parseEther('0'), // Try with 0; if not allowed, user can set to 0.00001
        data: ethers.utils.hexlify(new TextEncoder().encode(dataField))
      });
      
      console.log('Transaction hash:', tx.hash);
      
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
        console.log('Final contacts array:', contacts);
        updateContactsList();
        
        // Remove chat overlay if contacts found
        if (contacts.length > 0) {
          const chatOverlay = document.querySelector('.chat-overlay');
          if (chatOverlay) {
            chatOverlay.remove();
          }
          
                // Enable chat input and refresh button
      const chatInput = document.querySelector('.chat-input input');
      const sendButton = document.querySelector('.chat-input button');
      const refreshButton = document.getElementById('refresh-messages-btn');
      if (chatInput) chatInput.disabled = false;
      if (sendButton) sendButton.disabled = false;
      if (refreshButton) refreshButton.disabled = false;
        }
        
        showWalletAlert(`Contacts decrypted successfully! Found ${contacts.length} contacts.`, 'success');
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
    
    // Get block number to limit search - search all blocks
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = 0; // Search all blocks from beginning
    
    showWalletAlert('Searching for transactions...', 'info');
    
    // Use Etherscan API to get all transactions from user's wallet
    console.log('Making API call to get user transactions...');
    // Get both sent and received transactions
    const response = await fetch(`https://api.etherscan.io/v2/api?chainid=137&module=account&action=txlist&address=${userAddress}&startblock=${fromBlock}&endblock=99999999&sort=desc&apikey=54HEW6DVQAGFZKD3TJZXBCX8KJTGQGUA2K`);
    const data = await response.json();
    console.log('Raw API response:', data);
    
    if (data.status === '1' && data.result) {
      console.log('API Response:', data);
      showWalletAlert(`Found ${data.result.length} transactions via API, processing...`, 'info');
      
      // Log first few transactions to see their structure
      console.log('First 3 transactions:', data.result.slice(0, 3));
      
      let processedCount = 0;
      for (const tx of data.result) {
        try {
          if (tx.input && tx.input !== '0x') {
            console.log('Transaction with data found:', tx.hash);
            console.log('Input data:', tx.input.substring(0, 100) + '...');
            // Decode data - convert hex to string
            const decodedData = ethers.utils.toUtf8String(tx.input);
            console.log('Decoded data:', decodedData.substring(0, 50) + '...');
            
            // Check if it's our encrypted data (starts with ***)
            if (decodedData.startsWith('***')) {
              console.log('Found encrypted data:', decodedData.substring(0, 50) + '...');
              try {
                const encryptedData = decodedData.substring(3);
                const payload = JSON.parse(atob(encryptedData));
                console.log('Decoded payload:', payload);
                
                // Decrypt the contact data
                const decryptedContact = await decryptContactData(payload);
                console.log('Decrypted contact:', decryptedContact);
                
                if (decryptedContact) {
                  contacts.push(decryptedContact);
                  console.log('Contact added to list. Total contacts:', contacts.length);
                }
              } catch (decryptError) {
                console.log('Error decrypting data:', decryptError);
              }
            } else {
              console.log('Data does not start with ***:', decodedData.substring(0, 50) + '...');
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
    } else if (data.status === '0' && data.message === 'No transactions found') {
      showWalletAlert('No transactions found for this address. Try adding a contact first!', 'info');
      return; // Don't throw error, just return
    } else {
      throw new Error('No transactions found or API error');
    }
  } catch (error) {
    console.log('Failed to fetch transactions:', error);
    throw new Error('Failed to fetch transactions: ' + error.message);
  }
}

async function decryptContactData(payload) {
  try {
    // Decode base64 data
    const ephemeralPubKey = nacl.util.decodeBase64(payload.ephPub);
    const nonce = nacl.util.decodeBase64(payload.nonce);
    const encryptedBox = nacl.util.decodeBase64(payload.box);
    
    // Create keypair from user's private key
    // Convert hex private key to bytes - handle both 64 and 65 character keys
    let privateKeyHex = cachedPrivateKey;
    
    // اطمینان از وجود 0x
    if (privateKeyHex && !privateKeyHex.startsWith('0x')) {
      privateKeyHex = '0x' + privateKeyHex;
    }
    
    if (privateKeyHex.length === 67) { // 0x + 64 chars
      privateKeyHex = privateKeyHex.slice(0, 66); // Remove last character if 67 chars
    }
    
    const userPrivateKey = ethers.utils.arrayify(privateKeyHex);
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
      avatar: contactData.name.charAt(0).toUpperCase(),
      lastMessage: 'Contact added'
    };
  } catch (error) {
    console.log('Error decrypting contact:', error);
    return null;
  }
}

async function loadMessagesForContact(contactAddress) {
  try {
    const messages = document.querySelector('.chat-messages');
    
    // Show loading state
    messages.innerHTML = `
      <div class="chat-overlay">
        <div class="chat-overlay-message">
          Loading messages...
        </div>
      </div>
    `;
    
    // Get current user address
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (!accounts || !accounts[0]) {
      throw new Error('Wallet not connected');
    }
    const userAddress = accounts[0];
    
    // Get provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Get transactions sent to this user from the contact (received messages)
    const receivedResponse = await fetch(`https://api.etherscan.io/v2/api?chainid=137&module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&sort=desc&apikey=54HEW6DVQAGFZKD3TJZXBCX8KJTGQGUA2K`);
    const receivedData = await receivedResponse.json();
    
    // Get transactions sent by this user to the contact (sent messages)
    const sentResponse = await fetch(`https://api.etherscan.io/v2/api?chainid=137&module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&sort=desc&apikey=54HEW6DVQAGFZKD3TJZXBCX8KJTGQGUA2K`);
    const sentData = await sentResponse.json();
    
    let allMessageTransactions = [];
    
    if (receivedData.status === '1' && receivedData.result) {
      const receivedMessages = receivedData.result.filter(tx => 
        tx.from.toLowerCase() === contactAddress.toLowerCase() && 
        tx.to.toLowerCase() === userAddress.toLowerCase() &&
        tx.input && tx.input !== '0x'
      );
      allMessageTransactions = allMessageTransactions.concat(receivedMessages);
    }
    
        if (sentData.status === '1' && sentData.result) {
      const sentMessages = sentData.result.filter(tx => 
        tx.from.toLowerCase() === userAddress.toLowerCase() && 
        tx.to.toLowerCase() === contactAddress.toLowerCase() &&
        tx.input && tx.input !== '0x'
      );
      allMessageTransactions = allMessageTransactions.concat(sentMessages);
    }
    
    if (allMessageTransactions.length === 0) {
        messages.innerHTML = `
          <div class="chat-overlay">
            <div class="chat-overlay-message">
              Start a conversation with this contact
            </div>
          </div>
        `;
        return;
      }
      
      // Clear overlay and display messages
      messages.innerHTML = '';
      
      // Sort messages by timestamp
      allMessageTransactions.sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp));
      
      for (const tx of allMessageTransactions) {
        try {
          const decodedData = ethers.utils.toUtf8String(tx.input);
          
          if (decodedData.startsWith('MSG')) {
            const messageData = JSON.parse(decodeURIComponent(escape(atob(decodedData.substring(3)))));
            
            const msg = document.createElement('div');
            // Determine if message is sent or received
            const isSent = tx.from.toLowerCase() === userAddress.toLowerCase();
            msg.className = isSent ? 'message sent' : 'message received';
            
            const { timeString, dateString } = formatMessageDateTime(parseInt(messageData.timestamp));
            
            msg.innerHTML = `
              <div class="message-content">${messageData.message}</div>
              <div class="message-time">
                ${dateString ? `<div class="message-date">${dateString}</div>` : ''}
                <div class="message-time-text">${timeString}</div>
                <div class="message-status">${isSent ? 'Sent' : 'Received'}</div>
              </div>
            `;
            
            messages.appendChild(msg);
          }
        } catch (error) {
          console.log('Error processing message transaction:', error);
        }
      }
      
      // Scroll to bottom
      messages.scrollTop = messages.scrollHeight;
  } catch (error) {
    console.error('Error loading messages:', error);
    const messages = document.querySelector('.chat-messages');
    messages.innerHTML = `
      <div class="chat-overlay">
        <div class="chat-overlay-message">
          Error loading messages
        </div>
      </div>
    `;
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
          
          // Remove chat overlay if contacts found
          if (contacts.length > 0) {
            const chatOverlay = document.querySelector('.chat-overlay');
            if (chatOverlay) {
              chatOverlay.remove();
            }
            
            // Enable chat input and refresh button
            const chatInput = document.querySelector('.chat-input input');
            const sendButton = document.querySelector('.chat-input button');
            const refreshButton = document.getElementById('refresh-messages-btn');
            if (chatInput) chatInput.disabled = false;
            if (sendButton) sendButton.disabled = false;
            if (refreshButton) refreshButton.disabled = false;
          }
          
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
    contactElement.dataset.address = contact.address;
    
    contactElement.innerHTML = `
      <div class="avatar-placeholder">${contact.avatar}</div>
      <div class="chat-details">
        <h4>${contact.name}</h4>
        <p>${contact.lastMessage}</p>
      </div>
    `;
    
    // Add click event
    contactElement.addEventListener('click', async () => {
      // Update active state
      document.querySelector('.chat-item.active')?.classList.remove('active');
      contactElement.classList.add('active');
      
      // Update header
      const headerName = document.querySelector('.chat-header h3');
      const headerAvatar = document.querySelector('.chat-header .avatar-placeholder');
      const headerAddress = document.querySelector('.contact-address');
      
      headerName.textContent = contact.name;
      headerAvatar.textContent = contact.avatar;
      headerAddress.textContent = contact.address;
      
      // Load messages for this contact
      await loadMessagesForContact(contact.address);
      
      // Enable chat input
      const chatInput = document.querySelector('.chat-input input');
      const sendButton = document.querySelector('.chat-input button');
      if (chatInput) chatInput.disabled = false;
      if (sendButton) sendButton.disabled = false;
    });
    
    chatList.appendChild(contactElement);
  });
}

// Helper function to format date and time
function formatMessageDateTime(timestamp) {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
  
  // Format time
  const timeString = messageDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  
  // Determine date display
  let dateString = '';
  if (messageDay.getTime() === today.getTime()) {
    // Today
    dateString = 'Today';
  } else if (messageDay.getTime() === yesterday.getTime()) {
    // Yesterday
    dateString = 'Yesterday';
  } else {
    // Other days - show full date
    const englishMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const month = englishMonths[messageDate.getMonth()];
    const day = messageDate.getDate();
    const year = messageDate.getFullYear();
    
    // Show year only if not current year
    if (year === now.getFullYear()) {
      dateString = `${month} ${day}`;
    } else {
      dateString = `${month} ${day}, ${year}`;
    }
  }
  
  return { timeString, dateString };
}


