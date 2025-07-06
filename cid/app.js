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
  encrypt: function ({ publicKey, data, version }) {
    if (!window.nacl) throw new Error("nacl not loaded.");
    const ephemKeyPair = nacl.box.keyPair();
    const msgParams = naclUtil.decodeUTF8(data);
    const nonce = nacl.randomBytes(24);
    const encryptedMessage = nacl.box(
      msgParams,
      nonce,
      naclUtil.decodeBase64(publicKey),
      ephemKeyPair.secretKey
    );

    return {
      version: version,
      ephemPublicKey: naclUtil.encodeBase64(ephemKeyPair.publicKey),
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
const contactListDiv = document.getElementById('contactList');
const chattingWithHeader = document.getElementById('chattingWith');
const messageListDiv = document.getElementById('messageList');
const recipientAddressInput = document.getElementById('recipientAddressInput');
const recipientPublicKeyInput = document.getElementById('recipientPublicKeyInput');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const clearCacheBtn = document.getElementById('clearCacheBtn');
const qrCodeModal = document.getElementById('qrCodeModal');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const closeModalBtn = document.querySelector('.modal .close-button');
const publicKeyBox = document.getElementById('publicKeyBox');
const publicKeyDisplay = document.getElementById('publicKeyDisplay');

let ethersProvider = null;
let ethersSigner = null;
let currentUserAddress = null;
let currentNetwork = null;
let currentChatAddress = null;
let webCryptoEncryptionKey = null;

const DB_NAME = 'web3MessengerDB';

localforage.config({
    driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
    name: 'web3MessengerCache'
});

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

        await deriveLocalEncryptionKey();
        updateUserInfoUI();
        clearCacheBtn.style.display = 'inline-block';
        showStatusMessage(`Connected: ${currentUserAddress}`);

        await loadContactsFromCache();

    } catch (err) {
        showStatusMessage(`Error connecting wallet: ${err.message}`, true);
    }

    connectWalletBtn.disabled = false;
    connectWalletBtn.textContent = 'Connect Wallet';
}

sendMessageBtn.addEventListener('click', async () => {
    const recipient = recipientAddressInput.value.trim();
    const recipientPubKey = recipientPublicKeyInput.value.trim();
    const content = messageInput.value.trim();
    const senderPrivateKeyHex = document.getElementById('senderPrivateKeyInput')?.value.trim();

    if (!recipient || !recipientPubKey || !content || !senderPrivateKeyHex) {
        showStatusMessage("Please enter recipient address, public key, message, and your private key.", true);
        return;
    }

    try {
        const senderPrivateKeyBytes = new Uint8Array(senderPrivateKeyHex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
        const senderKeyPair = nacl.box.keyPair.fromSecretKey(senderPrivateKeyBytes);

        const nonce = nacl.randomBytes(24);
        const messageBytes = naclUtil.decodeUTF8(content);
        const recipientPubKeyBytes = naclUtil.decodeBase64(recipientPubKey);

        const encrypted = nacl.box(messageBytes, nonce, recipientPubKeyBytes, senderPrivateKeyBytes);

        const payload = {
            version: 'x25519-xsalsa20-poly1305',
            nonce: naclUtil.encodeBase64(nonce),
            fromPublicKey: naclUtil.encodeBase64(senderKeyPair.publicKey),
            ciphertext: naclUtil.encodeBase64(encrypted)
        };

        const encryptedString = JSON.stringify(payload);
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
        showStatusMessage("Encryption failed. Check your private key and inputs.", true);
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
