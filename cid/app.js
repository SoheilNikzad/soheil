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

// --------------------- 🔐 ethSigUtil (درون‌سازی‌شده) ---------------------
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

// ✅ تغییر قسمت ارسال پیام برای استفاده از پرایوت‌کی دستی
sendMessageBtn.addEventListener('click', async () => {
  const recipient = recipientAddressInput.value.trim();
  const recipientPubKey = recipientPublicKeyInput.value.trim();
  const senderPrivKey = document.getElementById('senderPrivateKeyInput').value.trim();
  const content = messageInput.value.trim();

  if (!recipient || !recipientPubKey || !content || !senderPrivKey) {
    showStatusMessage("Please enter all fields including your private key.", true);
    return;
  }

  try {
    // استفاده از nacl.box برای رمزنگاری با کلید خصوصی دستی
    const msgBytes = naclUtil.decodeUTF8(content);
    const nonce = nacl.randomBytes(24);
    const recipientPub = naclUtil.decodeBase64(recipientPubKey);
    const senderSecretKey = ethers.utils.arrayify(senderPrivKey);
    const encrypted = nacl.box(msgBytes, nonce, recipientPub, senderSecretKey);

    const payload = {
      version: 'x25519-xsalsa20-poly1305',
      nonce: naclUtil.encodeBase64(nonce),
      ephemPublicKey: '', // چون دستی رمزنگاری کردیم، نیازی به ephem key نیست
      ciphertext: naclUtil.encodeBase64(encrypted)
    };

    const encryptedString = JSON.stringify(payload);
    const hexData = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(encryptedString));

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const tx = await signer.sendTransaction({
      to: recipient,
      value: 0,
      data: hexData
    });

    showStatusMessage(`Message sent! Tx hash: ${tx.hash}`);
    messageInput.value = '';
  } catch (err) {
    console.error("Failed to send encrypted message:", err);
    showStatusMessage("Encryption or transaction failed.", true);
  }
});
