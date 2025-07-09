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
const checkMessagesBtn = get('checkMessagesBtn');
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

const rawInputData = get('rawInputData');
const manualSenderPubKey = get('manualSenderPubKey');
const manualReceiverPrivKey = get('manualReceiverPrivKey');
const manualDecryptBtn = get('manualDecryptBtn');
const manualDecryptedOutput = get('manualDecryptedOutput');

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

// 🧪 Manual Decryption
manualDecryptBtn?.addEventListener('click', () => {
  const rawHex = rawInputData?.value.trim();
  const senderPubKey = manualSenderPubKey?.value.trim();
  const receiverPrivHex = manualReceiverPrivKey?.value.trim();

  if (!rawHex || !senderPubKey || !receiverPrivHex) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const cleanedHex = rawHex.startsWith('0x') ? rawHex.slice(2) : rawHex;
    const utf8Data = ethers.utils.toUtf8String("0x" + cleanedHex);

    const payload = JSON.parse(utf8Data);
    const nonce = naclUtil.decodeBase64(payload.nonce);
    const ciphertext = naclUtil.decodeBase64(payload.ciphertext);
    const receiverPriv = Uint8Array.from(receiverPrivHex.match(/.{1,2}/g).map(h => parseInt(h, 16)));
    const receiverKeyPair = nacl.box.keyPair.fromSecretKey(receiverPriv);

    const decrypted = nacl.box.open(
      ciphertext,
      nonce,
      naclUtil.decodeBase64(senderPubKey),
      receiverKeyPair.secretKey
    );

    if (!decrypted) throw new Error("Decryption failed");

    const message = naclUtil.encodeUTF8(decrypted);
    manualDecryptedOutput.textContent = message;
  } catch (err) {
    console.error(err);
    alert("Decryption failed: " + err.message);
  }
});

// 📬 Check Incoming Messages via Etherscan V2 API
checkMessagesBtn?.addEventListener('click', async () => {
  if (!currentUserAddress) {
    alert("Connect your wallet first.");
    return;
  }

  const apiKey = "EPXHHSG4JEV3PVR3U4XNAQ61BDHI4I8V3U";
  const url = `https://api.etherscan.io/v2/api?module=account&action=txlist&chainid=137&address=${currentUserAddress}&sort=desc&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "1") {
      alert("No transactions found or API error: " + data.message);
      return;
    }

    const txs = data.result.filter(tx =>
      tx.to &&
      tx.to.toLowerCase() === currentUserAddress.toLowerCase() &&
      tx.input &&
      tx.input !== "0x"
    );

    if (txs.length === 0) {
      alert("No encrypted messages found.");
      return;
    }

    const section = get('manualDecryptSection');
    section.innerHTML += `
      <hr style="margin:15px 0;border:1px solid #444;">
      <h3 style="color:#ffa500;">Incoming Encrypted Messages</h3>
    `;

    txs.forEach(tx => {
      section.innerHTML += `
        <div style="margin-bottom:15px; padding:10px; background:#333; border-radius:5px;">
          <p><strong>From:</strong> ${tx.from}</p>
          <p><strong>Tx Hash:</strong> <a href="https://polygonscan.com/tx/${tx.hash}" target="_blank">${tx.hash}</a></p>
          <textarea readonly style="width:100%; background:#222; color:#ffa500; border:none; padding:8px; font-family:monospace;">${tx.input}</textarea>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    alert("Error fetching messages: " + err.message);
  }
});
