// --------------------- 🔐 nacl-util (درون‌سازی‌شده) ---------------------
const naclUtil = {
  encodeUTF8: function (arr) {
    if (!(arr instanceof Uint8Array)) throw new TypeError("encodeUTF8 needs Uint8Array.");
    return new TextDecoder("utf-8").decode(arr);
  },
  decodeUTF8: function (str) {
    if (typeof str !== "string") throw new TypeError("decodeUTF8 needs string.");
    return new TextEncoder().encode(str);
  },
  encodeBase64: function (arr) {
    if (!(arr instanceof Uint8Array)) throw new TypeError("encodeBase64 needs Uint8Array.");
    let bin = "";
    for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
    return btoa(bin);
  },
  decodeBase64: function (str) {
    if (typeof str !== "string") throw new TypeError("decodeBase64 needs string.");
    const bin = atob(str);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
};

// --------------------- 🔐 ethSigUtil.encrypt (درون‌سازی‌شده) ---------------------
const ethSigUtil = {
  encrypt: function ({ publicKey, data, privateKey }) {
    if (!window.nacl) throw new Error("nacl not loaded.");
    const nonce = nacl.randomBytes(24);
    const msgParams = naclUtil.decodeUTF8(data);
    const encryptedMessage = nacl.box(
      msgParams,
      nonce,
      naclUtil.decodeBase64(publicKey),
      naclUtil.decodeBase64(privateKey)
    );

    return {
      version: 'x25519-xsalsa20-poly1305',
      nonce: naclUtil.encodeBase64(nonce),
      ciphertext: naclUtil.encodeBase64(encryptedMessage)
    };
  }
};

// --------------------- 🧠 Web3 Messenger Logic ---------------------
const connectWalletBtn = document.getElementById('connectWalletBtn');
const registerKeyBtn = document.getElementById('registerKeyBtn');
const userInfoDiv = document.getElementById('userInfo');
const userAddressSpan = document.getElementById('userAddress');
const networkNameSpan = document.getElementById('networkName');
const chainIdSpan = document.getElementById('chainId');
const recipientAddressInput = document.getElementById('recipientAddressInput');
const recipientPublicKeyInput = document.getElementById('recipientPublicKeyInput');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const privateKeyInput = document.getElementById('privateKeyInput');
const publicKeyBox = document.getElementById('publicKeyBox');
const publicKeyDisplay = document.getElementById('publicKeyDisplay');

let ethersProvider = null;
let ethersSigner = null;
let currentUserAddress = null;
let currentNetwork = null;

function showStatusMessage(message, isError = false) {
  console.log(isError ? `ERROR: ${message}` : `STATUS: ${message}`);
  if (isError) alert(message);
}

connectWalletBtn.addEventListener('click', connectWallet);
registerKeyBtn.addEventListener('click', displayPublicKey);

async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    alert('Please install MetaMask');
    return;
  }

  connectWalletBtn.disabled = true;
  connectWalletBtn.textContent = 'Connecting...';

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    ethersSigner = ethersProvider.getSigner();
    currentUserAddress = await ethersSigner.getAddress();
    currentNetwork = await ethersProvider.getNetwork();

    updateUserInfoUI();
    showStatusMessage(`Connected: ${currentUserAddress}`);
  } catch (err) {
    showStatusMessage(`Error connecting wallet: ${err.message}`, true);
  }

  connectWalletBtn.disabled = false;
  connectWalletBtn.textContent = 'Connect Wallet';
}

function updateUserInfoUI() {
  if (currentUserAddress && currentNetwork) {
    userInfoDiv.style.display = 'block';
    userAddressSpan.textContent = currentUserAddress;
    networkNameSpan.textContent = currentNetwork.name;
    chainIdSpan.textContent = currentNetwork.chainId;
  }
}

sendMessageBtn.addEventListener('click', async () => {
  const recipient = recipientAddressInput.value.trim();
  const recipientPubKey = recipientPublicKeyInput.value.trim();
  const content = messageInput.value.trim();
  const privateKey = privateKeyInput.value.trim();

  if (!recipient || !recipientPubKey || !content || !privateKey) {
    showStatusMessage("Please fill all fields including private key.", true);
    return;
  }

  if (!ethersSigner || !currentUserAddress) {
    showStatusMessage("Connect your wallet first.", true);
    return;
  }

  try {
    const encrypted = ethSigUtil.encrypt({
      publicKey: recipientPubKey,
      privateKey: privateKey,
      data: content
    });

    const encryptedString = JSON.stringify(encrypted);
    const hexData = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(encryptedString));

    const tx = await ethersSigner.sendTransaction({
      to: recipient,
      value: 0,
      data: hexData
    });

    showStatusMessage(`Message sent! Tx hash: ${tx.hash}`);
    messageInput.value = '';

  } catch (err) {
    console.error("Failed to send encrypted message:", err);
    showStatusMessage("Failed to send message. Check MetaMask and inputs.", true);
  }
});

async function displayPublicKey() {
  if (!currentUserAddress) {
    showStatusMessage("Connect your wallet first!", true);
    return;
  }

  try {
    const pubKey = await window.ethereum.request({
      method: "eth_getEncryptionPublicKey",
      params: [currentUserAddress],
    });

    publicKeyDisplay.value = pubKey;
    publicKeyBox.style.display = 'block';
  } catch (err) {
    console.error("Failed to retrieve public key:", err);
    showStatusMessage("MetaMask permission denied or failed to get public key.", true);
  }
}
