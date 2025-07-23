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
  // Ask user to sign a message
  const msg = 'Show my public key';
  try {
    const from = account;
    let params = [
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes(msg)),
      from
    ];
    let method = 'personal_sign';
    let signature;
    try {
      signature = await window.ethereum.request({ method, params });
    } catch (err1) {
      // Try reversed params for compatibility
      params = [from, ethers.utils.hexlify(ethers.utils.toUtf8Bytes(msg))];
      try {
        signature = await window.ethereum.request({ method, params });
      } catch (err2) {
        showWalletAlert('Signature rejected or failed.', 'error');
        return;
      }
    }
    // Recover public key using ethers.js
    const msgHash = ethers.utils.hashMessage(msg);
    const pubKey = ethers.utils.recoverPublicKey(msgHash, signature);
    cachedPublicKey = pubKey;
    showPublicKeyModal(pubKey);
  } catch (err) {
    showWalletAlert('Signature rejected or failed.', 'error');
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
