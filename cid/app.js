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
