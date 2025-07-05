// --- DOM Elements ---
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

async function deriveLocalEncryptionKey() {
    if (!ethersSigner || !currentUserAddress) return;

    try {
        const msg = `Login to Web3 Messenger: ${currentUserAddress}`;
        const sig = await ethersSigner.signMessage(msg);
        const hashHex = CryptoJS.SHA256(sig).toString(CryptoJS.enc.Hex);
        const keyHex = hashHex.substring(0, 64);
        const keyBuffer = new Uint8Array(keyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))).buffer;

        webCryptoEncryptionKey = await crypto.subtle.importKey(
            "raw",
            keyBuffer,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );
    } catch (e) {
        console.error("Key derivation failed:", e);
    }
}

// ✅ نمایش public key خود کاربر
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

// ✅ ارسال پیام رمزنگاری‌شده به صورت تراکنش واقعی روی شبکه
sendMessageBtn.addEventListener('click', async () => {
    const recipient = recipientAddressInput.value.trim();
    const recipientPubKey = recipientPublicKeyInput.value.trim();
    const content = messageInput.value.trim();

    if (!recipient || !recipientPubKey || !content) {
        showStatusMessage("Please enter recipient address, public key and message.", true);
        return;
    }

    if (!ethersSigner || !currentUserAddress) {
        showStatusMessage("Connect your wallet first.", true);
        return;
    }

    try {
        const encrypted = window.ethSigUtil.encrypt({
            publicKey: recipientPubKey,
            data: content,
            version: 'x25519-xsalsa20-poly1305'
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
        showStatusMessage("Failed to send message. Check MetaMask permissions and inputs.", true);
    }
});

// ✅ تابع‌های قبلی برای cache پیام‌ها و مخاطبین (در حال حاضر غیرفعال ولی باقی می‌مونن)
async function encryptDataWC(data) { /* ... */ }
async function decryptDataWC(base64) { /* ... */ }
async function saveMessageToLocalCache(address, message) { /* ... */ }
async function addOrUpdateContact(addr, msg, time) { /* ... */ }
async function loadContactsFromCache() { /* ... */ }
function renderContactList(contacts) { /* ... */ }
async function loadMessagesForChat(address) { /* ... */ }
function displayMessage(msg) { /* ... */ }

clearCacheBtn.addEventListener('click', async () => {
    if (!currentUserAddress) return;
    const key = `contacts_${currentUserAddress.toLowerCase()}`;
    const encrypted = await localforage.getItem(key);
    if (encrypted) {
        const contacts = await decryptDataWC(encrypted);
        if (contacts) {
            for (const c of contacts) {
                await localforage.removeItem(`messages_${c.address.toLowerCase()}`);
            }
        }
        await localforage.removeItem(key);
    }
    contactListDiv.innerHTML = '';
    messageListDiv.innerHTML = '<p class="system-message">Cache cleared. Start new chat.</p>';
});
