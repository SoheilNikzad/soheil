window.addEventListener('DOMContentLoaded', () => {
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

  // 🔌 اتصال کیف پول
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

  // 📡 گرفتن public key از متامسک
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

  // 🧠 تابع رمزنگاری اصلی
  function encryptMessage(content, recipientPubKey, senderPrivKeyHex) {
    const privateKey = naclUtil.decodeBase64(senderPrivKeyHex);
    const senderKeyPair = nacl.box.keyPair.fromSecretKey(privateKey);
    const msgParams = naclUtil.decodeUTF8(content);
    const nonce = nacl.randomBytes(24);

    const encryptedMessage = nacl.box(
      msgParams,
      nonce,
      naclUtil.decodeBase64(recipientPubKey),
      senderKeyPair.secretKey
    );

    return {
      version: 'x25519-xsalsa20-poly1305',
      ephemPublicKey: naclUtil.encodeBase64(senderKeyPair.publicKey),
      nonce: naclUtil.encodeBase64(nonce),
      ciphertext: naclUtil.encodeBase64(encryptedMessage)
    };
  }

  // ✉️ ارسال تراکنش واقعی به شبکه
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
      const encryptedPayload = encryptMessage(content, recipientPubKey, privateKeyHex);
      const hexData = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(JSON.stringify(encryptedPayload))
      );

      const tx = await ethersSigner.sendTransaction({
        to: recipient,
        value: 0,
        data: hexData
      });

      alert("Message sent! Tx Hash: " + tx.hash);
      messageInput.value = '';
    } catch (err) {
      console.error(err);
      alert("Encryption or transaction failed: " + err.message);
    }
  });

  // 🔐 فقط رمزنگاری و نمایش خروجی
  encryptOnlyBtn?.addEventListener('click', () => {
    const recipientPubKey = recipientPublicKeyInput?.value.trim();
    const privateKeyHex = senderPrivateKeyInput?.value.trim();
    const content = messageInput?.value.trim();

    if (!recipientPubKey || !content || !privateKeyHex) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const encryptedPayload = encryptMessage(content, recipientPubKey, privateKeyHex);
      encryptedOutputBox.textContent = JSON.stringify(encryptedPayload, null, 2);
    } catch (err) {
      console.error(err);
      alert("Encryption failed: " + err.message);
    }
  });
});
