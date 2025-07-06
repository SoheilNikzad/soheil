// --------------------- 🔐 nacl-util ---------------------
const naclUtil = {
  encodeUTF8: arr => new TextDecoder("utf-8").decode(arr),
  decodeUTF8: str => new TextEncoder().encode(str),
  encodeBase64: arr => btoa(String.fromCharCode(...arr)),
  decodeBase64: str => Uint8Array.from(atob(str), c => c.charCodeAt(0)),
};

// --------------------- 🧠 Web3 Messenger ---------------------
const get = id => document.getElementById(id);

const connectWalletBtn = get('connectWalletBtn');
const registerKeyBtn = get('registerKeyBtn');
const loadInboxBtn = get('loadInboxBtn');
const userAddressSpan = get('userAddress');
const networkNameSpan = get('networkName');
const chainIdSpan = get('chainId');
const recipientAddressInput = get('recipientAddressInput');
const recipientPublicKeyInput = get('recipientPublicKeyInput');
const senderPrivateKeyInput = get('senderPrivateKeyInput');
const messageInput = get('messageInput');
const sendMessageBtn = get('sendMessageBtn');
const encryptOnlyBtn = get('encryptOnlyBtn');
const encryptedOutputBox = get('encryptedOutputBox');
const publicKeyBox = get('publicKeyBox');
const publicKeyDisplay = get('publicKeyDisplay');
const inboxSection = get('inboxSection');
const inboxContainer = get('inboxContainer');

let ethersProvider = null;
let ethersSigner = null;
let currentUserAddress = null;
let currentNetwork = null;

// 🔌 Connect Wallet
connectWalletBtn?.addEventListener('click', async () => {
  if (!window.ethereum) return alert("Please install MetaMask!");

  connectWalletBtn.disabled = true;
  connectWalletBtn.textContent = "Connecting...";

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    ethersSigner = ethersProvider.getSigner();
    currentUserAddress = await ethersSigner.getAddress();
    currentNetwork = await ethersProvider.getNetwork();

    userAddressSpan.textContent = currentUserAddress;
    networkNameSpan.textContent = currentNetwork.name;
    chainIdSpan.textContent = currentNetwork.chainId;
    get('userInfo').style.display = 'block';
  } catch (err) {
    alert("Wallet connection failed: " + err.message);
  }

  connectWalletBtn.disabled = false;
  connectWalletBtn.textContent = "Connect Wallet";
});

// 🔓 Display Public Key
registerKeyBtn?.addEventListener('click', async () => {
  if (!currentUserAddress) return alert("Connect your wallet first!");

  try {
    const pubKey = await ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [currentUserAddress]
    });
    publicKeyDisplay.value = pubKey;
    publicKeyBox.style.display = 'block';
  } catch (err) {
    alert("Failed to get public key: " + err.message);
  }
});

// ✉️ Send Message (on-chain)
sendMessageBtn?.addEventListener('click', async () => {
  const recipient = recipientAddressInput?.value.trim();
  const recipientPubKey = recipientPublicKeyInput?.value.trim();
  const privateKeyHex = senderPrivateKeyInput?.value.trim();
  const content = messageInput?.value.trim();

  if (!recipient || !recipientPubKey || !content || !privateKeyHex) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const privateKey = Uint8Array.from(privateKeyHex.match(/.{1,2}/g).map(h => parseInt(h, 16)));
    const senderKeyPair = nacl.box.keyPair.fromSecretKey(privateKey);
    const nonce = nacl.randomBytes(24);
    const msgParams = naclUtil.decodeUTF8(content);

    const encryptedMessage = nacl.box(
      msgParams,
      nonce,
      naclUtil.decodeBase64(recipientPubKey),
      senderKeyPair.secretKey
    );

    const payload = {
      nonce: naclUtil.encodeBase64(nonce),
      ciphertext: naclUtil.encodeBase64(encryptedMessage),
    };

    const hexData = ethers.utils.hexlify(
      ethers.utils.toUtf8Bytes(JSON.stringify(payload))
    );

    const tx = await ethersSigner.sendTransaction({
      to: recipient,
      value: 0,
      data: hexData
    });

    alert("Message sent on-chain!\nTx Hash:\n" + tx.hash);
    messageInput.value = '';
  } catch (err) {
    console.error(err);
    alert("Encryption or transaction failed: " + err.message);
  }
});

// 🔒 Just Encrypt & Show
encryptOnlyBtn?.addEventListener('click', () => {
  const recipientPubKey = recipientPublicKeyInput?.value.trim();
  const privateKeyHex = senderPrivateKeyInput?.value.trim();
  const content = messageInput?.value.trim();

  if (!recipientPubKey || !content || !privateKeyHex) {
    alert("Fill in public key, private key and message first.");
    return;
  }

  try {
    const privateKey = Uint8Array.from(privateKeyHex.match(/.{1,2}/g).map(h => parseInt(h, 16)));
    const senderKeyPair = nacl.box.keyPair.fromSecretKey(privateKey);
    const nonce = nacl.randomBytes(24);
    const msgParams = naclUtil.decodeUTF8(content);

    const encryptedMessage = nacl.box(
      msgParams,
      nonce,
      naclUtil.decodeBase64(recipientPubKey),
      senderKeyPair.secretKey
    );

    const payload = {
      nonce: naclUtil.encodeBase64(nonce),
      ciphertext: naclUtil.encodeBase64(encryptedMessage),
    };

    encryptedOutputBox.textContent = JSON.stringify(payload, null, 2);
  } catch (err) {
    console.error(err);
    alert("Encryption failed: " + err.message);
  }
});

// 📬 Load Inbox from PolygonScan API
loadInboxBtn?.addEventListener('click', async () => {
  if (!currentUserAddress) return alert("Connect your wallet first!");

  inboxContainer.innerHTML = '';
  inboxSection.style.display = 'block';

  try {
    const apiKey = "EPXHHSG4JEV3PVR3U4XNAQ61BDHI4I8V3U";
    const url = `https://api.polygonscan.com/api?module=account&action=txlist&address=${currentUserAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    console.log("📡 Polygonscan API Raw Response:", data); // 🐞 برای بررسی خروجی

    if (!Array.isArray(data.result)) {
      console.error("❗ Unexpected API response:", data);
      inboxContainer.innerHTML = '<p>❌ Unexpected API response. Check console for details.</p>';
      return;
    }

    const messages = data.result.filter(tx => tx.input && tx.input !== "0x");

    if (messages.length === 0) {
      inboxContainer.innerHTML = '<p>No encrypted messages found.</p>';
      return;
    }

    messages.forEach((tx, index) => {
      let decoded;
      try {
        decoded = JSON.parse(ethers.utils.toUtf8String(tx.input));
      } catch (e) {
        return;
      }

      const card = document.createElement('div');
      card.className = 'user-info';
      card.innerHTML = `
        <p><strong>From:</strong> ${tx.from}</p>
        <p><strong>Tx Hash:</strong> ${tx.hash}</p>
        <textarea rows="1" readonly>Nonce: ${decoded.nonce}</textarea>
        <textarea rows="2" readonly>Ciphertext: ${decoded.ciphertext}</textarea>
        <input type="text" placeholder="Sender's Public Key" class="senderPubKeyInput" />
        <input type="text" placeholder="Your Private Key (hex)" class="receiverPrivKeyInput" />
        <button class="decryptBtn glow-button-small" data-index="${index}">Decrypt</button>
        <pre class="decryptedOutput" style="white-space: pre-wrap; color: lime;"></pre>
      `;
      inboxContainer.appendChild(card);
    });

    // Add event listeners for all decrypt buttons
    document.querySelectorAll('.decryptBtn').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const card = btn.parentElement;
        const nonce = card.querySelector('textarea').value.replace('Nonce: ', '').trim();
        const ciphertext = card.querySelectorAll('textarea')[1].value.replace('Ciphertext: ', '').trim();
        const pubKey = card.querySelector('.senderPubKeyInput').value.trim();
        const privKeyHex = card.querySelector('.receiverPrivKeyInput').value.trim();

        try {
          const privKey = Uint8Array.from(privKeyHex.match(/.{1,2}/g).map(h => parseInt(h, 16)));
          const recipientKeyPair = nacl.box.keyPair.fromSecretKey(privKey);
          const decrypted = nacl.box.open(
            naclUtil.decodeBase64(ciphertext),
            naclUtil.decodeBase64(nonce),
            naclUtil.decodeBase64(pubKey),
            recipientKeyPair.secretKey
          );

          if (!decrypted) throw new Error("Failed to decrypt.");
          const message = naclUtil.encodeUTF8(decrypted);
          card.querySelector('.decryptedOutput').textContent = message;
        } catch (err) {
          alert("Decryption failed: " + err.message);
        }
      });
    });

  } catch (err) {
    console.error("❌ Inbox loading failed:", err);
    alert("Failed to load inbox: " + err.message);
  }
});
