window.addEventListener("DOMContentLoaded", () => {

  // --------------------- 🔐 nacl-util ---------------------
  const naclUtil = {
    encodeUTF8: arr => new TextDecoder("utf-8").decode(arr),
    decodeUTF8: str => new TextEncoder().encode(str),
    encodeBase64: arr => btoa(String.fromCharCode(...arr)),
    decodeBase64: str => Uint8Array.from(atob(str), c => c.charCodeAt(0)),
  };

  const get = id => document.getElementById(id);

  // --------------------- 📦 DOM Elements ---------------------
  const connectWalletBtn = get('connectWalletBtn');
  const registerKeyBtn = get('registerKeyBtn');
  const checkMessagesBtn = get('checkMessagesBtn');
  const chatList = get('chatList');
  const messageList = get('messageList');
  const decryptAllBtn = get('decryptAllBtn');
  const decryptSenderPubKey = get('decryptSenderPubKey');
  const decryptReceiverPrivKey = get('decryptReceiverPrivKey');

  const recipientAddressInput = get('recipientAddressInput');
  const recipientPublicKeyInput = get('recipientPublicKeyInput');
  const senderPrivateKeyInput = get('senderPrivateKeyInput');
  const messageInput = get('messageInput');
  const sendMessageBtn = get('sendMessageBtn');
  const encryptOnlyBtn = get('encryptOnlyBtn');
  const encryptedOutputBox = get('encryptedOutputBox');

  const userAddressSpan = get('userAddress');
  const networkNameSpan = get('networkName');
  const chainIdSpan = get('chainId');
  const publicKeyBox = get('publicKeyBox');
  const publicKeyDisplay = get('publicKeyDisplay');

  let ethersProvider = null;
  let ethersSigner = null;
  let currentUserAddress = null;
  let conversations = {};
  let selectedChatAddress = null;

  // --------------------- 🔌 Connect Wallet ---------------------
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', async () => {
      if (!window.ethereum) return alert("Please install MetaMask!");

      connectWalletBtn.disabled = true;
      connectWalletBtn.textContent = "Connecting...";

      try {
        await ethereum.request({ method: 'eth_requestAccounts' });
        ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        ethersSigner = ethersProvider.getSigner();
        currentUserAddress = await ethersSigner.getAddress();
        const net = await ethersProvider.getNetwork();

        get('userInfo').style.display = 'block';
        userAddressSpan.textContent = currentUserAddress;
        networkNameSpan.textContent = net.name;
        chainIdSpan.textContent = net.chainId;
      } catch (err) {
        alert("Connection failed: " + err.message);
      }

      connectWalletBtn.disabled = false;
      connectWalletBtn.textContent = "Connect Wallet";
    });
  }

  // --------------------- 📤 Register Public Key ---------------------
  if (registerKeyBtn) {
    registerKeyBtn.addEventListener('click', async () => {
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
  }

  // --------------------- 📬 Load Messages ---------------------
  if (checkMessagesBtn) {
    checkMessagesBtn.addEventListener('click', async () => {
      if (!currentUserAddress) return alert("Connect wallet first.");

      const apiKey = "EPXHHSG4JEV3PVR3U4XNAQ61BDHI4I8V3U";
      const url = `https://api.polygonscan.com/api?module=account&action=txlist&address=${currentUserAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.status !== "1") return alert("API Error: " + data.message);

        const txs = data.result.filter(tx => tx.input && tx.input !== "0x");

        conversations = {};

        txs.forEach(tx => {
          const isSender = tx.from.toLowerCase() === currentUserAddress.toLowerCase();
          const isReceiver = tx.to && tx.to.toLowerCase() === currentUserAddress.toLowerCase();

          const other = isSender ? tx.to : tx.from;
          if (!other) return;

          if (!conversations[other]) conversations[other] = [];

          conversations[other].push({
            from: tx.from,
            to: tx.to,
            input: tx.input,
            hash: tx.hash,
            time: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()
          });
        });

        renderChatList();
      } catch (err) {
        console.error(err);
        alert("Failed to load messages: " + err.message);
      }
    });
  }

  // --------------------- 🗂️ Render Sidebar ---------------------
  function renderChatList() {
    chatList.innerHTML = '';
    Object.keys(conversations).forEach(addr => {
      const item = document.createElement('div');
      item.className = 'contact-item';
      item.textContent = addr;
      item.onclick = () => {
        selectedChatAddress = addr;
        renderChatMessages();
        document.querySelectorAll('.contact-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      };
      chatList.appendChild(item);
    });
  }

  // --------------------- 💬 Render Chat ---------------------
  function renderChatMessages() {
    const msgs = conversations[selectedChatAddress] || [];
    messageList.innerHTML = '';
    msgs.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = 'message ' + (msg.from.toLowerCase() === currentUserAddress.toLowerCase() ? 'sent' : 'received');
      bubble.innerHTML = `
        <div>${msg.decryptedText || msg.input}</div>
        <div class="timestamp">${msg.time}</div>
      `;
      messageList.appendChild(bubble);
    });
  }

  // --------------------- 🔐 Decrypt All ---------------------
  if (decryptAllBtn) {
    decryptAllBtn.addEventListener('click', () => {
      const pubKey = decryptSenderPubKey.value.trim();
      const privHex = decryptReceiverPrivKey.value.trim();
      if (!pubKey || !privHex) return alert("Fill in both keys.");

      try {
        const receiverPriv = Uint8Array.from(privHex.match(/.{1,2}/g).map(h => parseInt(h, 16)));
        const receiverKeyPair = nacl.box.keyPair.fromSecretKey(receiverPriv);

        const msgs = conversations[selectedChatAddress] || [];
        msgs.forEach(msg => {
          try {
            const cleanedHex = msg.input.startsWith('0x') ? msg.input.slice(2) : msg.input;
            const utf8 = ethers.utils.toUtf8String("0x" + cleanedHex);
            const payload = JSON.parse(utf8);

            const nonce = naclUtil.decodeBase64(payload.nonce);
            const ciphertext = naclUtil.decodeBase64(payload.ciphertext);

            const decrypted = nacl.box.open(
              ciphertext,
              nonce,
              naclUtil.decodeBase64(pubKey),
              receiverKeyPair.secretKey
            );

            if (decrypted) {
              msg.decryptedText = naclUtil.encodeUTF8(decrypted);
            } else {
              msg.decryptedText = "(❌ Decryption failed)";
            }
          } catch (err) {
            msg.decryptedText = "(⚠️ Invalid message format)";
          }
        });

        renderChatMessages();
      } catch (err) {
        alert("Decryption failed: " + err.message);
      }
    });
  }

});
