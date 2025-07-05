// --- DOM Elements ---
const connectWalletBtn = document.getElementById('connectWalletBtn');
const userInfoDiv = document.getElementById('userInfo');
const userAddressSpan = document.getElementById('userAddress');
const networkNameSpan = document.getElementById('networkName');
const chainIdSpan = document.getElementById('chainId');
const contactListDiv = document.getElementById('contactList');
const chattingWithHeader = document.getElementById('chattingWith');
const messageListDiv = document.getElementById('messageList');
const recipientAddressInput = document.getElementById('recipientAddressInput');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const clearCacheBtn = document.getElementById('clearCacheBtn');
const qrCodeModal = document.getElementById('qrCodeModal');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const closeModalBtn = document.querySelector('.modal .close-button');
const registerKeyBtn = document.getElementById('registerKeyBtn');

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
registerKeyBtn.addEventListener('click', registerPublicKeyOnChain);

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

async function encryptDataWC(data) {
    if (!webCryptoEncryptionKey) throw new Error("No encryption key.");
    const str = JSON.stringify(data);
    const encoded = new TextEncoder().encode(str);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, webCryptoEncryptionKey, encoded);
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...result));
}

async function decryptDataWC(base64) {
    if (!webCryptoEncryptionKey) throw new Error("No encryption key.");
    const data = new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
    const iv = data.slice(0, 12);
    const enc = data.slice(12);
    try {
        const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, webCryptoEncryptionKey, enc);
        return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (err) {
        console.warn("Decryption failed:", err);
        return null;
    }
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
    const content = messageInput.value.trim();
    if (!recipient || !content) return;

    const msg = {
        id: crypto.randomUUID(),
        sender: currentUserAddress,
        recipient,
        content,
        timestamp: new Date().toISOString(),
    };

    await saveMessageToLocalCache(recipient, msg);
    await addOrUpdateContact(recipient, content, msg.timestamp);
    messageInput.value = '';
});

async function saveMessageToLocalCache(address, message) {
    if (!webCryptoEncryptionKey) return;

    const key = `messages_${address.toLowerCase()}`;
    const existing = await localforage.getItem(key);
    let messages = [];

    if (existing) {
        const decrypted = await decryptDataWC(existing);
        if (decrypted) messages = decrypted;
    }

    messages.push(message);
    const encrypted = await encryptDataWC(messages);
    await localforage.setItem(key, encrypted);
}

async function addOrUpdateContact(addr, msg, time) {
    if (!webCryptoEncryptionKey) return;

    const key = `contacts_${currentUserAddress.toLowerCase()}`;
    const existing = await localforage.getItem(key);
    let list = [];

    if (existing) {
        const decrypted = await decryptDataWC(existing);
        if (decrypted) list = decrypted;
    }

    const idx = list.findIndex(c => c.address === addr);
    if (idx > -1) {
        list[idx].lastMessage = msg;
        list[idx].lastTimestamp = time;
    } else {
        list.push({ address: addr, lastMessage: msg, lastTimestamp: time });
    }

    list.sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));
    const encrypted = await encryptDataWC(list);
    await localforage.setItem(key, encrypted);
    renderContactList(list);
}

async function loadContactsFromCache() {
    const key = `contacts_${currentUserAddress.toLowerCase()}`;
    const encrypted = await localforage.getItem(key);
    if (encrypted) {
        const decrypted = await decryptDataWC(encrypted);
        if (decrypted) renderContactList(decrypted);
    }
}

function renderContactList(contacts) {
    contactListDiv.innerHTML = '';
    for (const c of contacts) {
        const div = document.createElement('div');
        div.className = 'contact-item';
        div.dataset.address = c.address;
        div.innerHTML = `<p><strong>${c.address.slice(0, 6)}...${c.address.slice(-4)}</strong></p><p>${c.lastMessage}</p>`;
        div.onclick = () => loadMessagesForChat(c.address);
        contactListDiv.appendChild(div);
    }
}

async function loadMessagesForChat(address) {
    currentChatAddress = address;
    const key = `messages_${address.toLowerCase()}`;
    const encrypted = await localforage.getItem(key);
    messageListDiv.innerHTML = '';
    if (encrypted) {
        const decrypted = await decryptDataWC(encrypted);
        if (decrypted) {
            decrypted.forEach(displayMessage);
        }
    }
}

function displayMessage(msg) {
    const div = document.createElement('div');
    div.className = 'message ' + (msg.sender === currentUserAddress ? 'sent' : 'received');
    div.innerHTML = `<p>${msg.content}</p><span class="timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</span>`;
    messageListDiv.appendChild(div);
}

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

async function registerPublicKeyOnChain() {
    if (!ethersSigner || !currentUserAddress) {
        showStatusMessage("Connect your wallet first!", true);
        return;
    }

    try {
        const pubKey = await window.ethereum.request({
            method: "eth_getEncryptionPublicKey",
            params: [currentUserAddress],
        });

        const message = `cid:${pubKey}`;
        const tx = await ethersSigner.sendTransaction({
            to: currentUserAddress,
            value: 0,
            data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message))
        });

        showStatusMessage(`Public key published! Tx hash: ${tx.hash}`);
    } catch (err) {
        console.error("Failed to publish key:", err);
        showStatusMessage("Could not publish key. Did you reject MetaMask permission?", true);
    }
}
