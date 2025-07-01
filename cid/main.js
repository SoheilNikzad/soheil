let signer;
let derivedPrivateKey; // Uint8Array

async function sha256(msgUint8) {
  const hash = await crypto.subtle.digest('SHA-256', msgUint8);
  return new Uint8Array(hash);
}

async function hkdf(inputKeyMaterial, length = 32) {
  const salt = new Uint8Array(32); // zero salt
  const key = await crypto.subtle.importKey(
    "raw", inputKeyMaterial, "HKDF", false, ["deriveBits", "deriveKey"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt,
      info: new TextEncoder().encode("RAAKH Messenger Encryption")
    },
    key,
    length * 8
  );
  return new Uint8Array(derivedBits);
}

document.getElementById("connectBtn").onclick = async () => {
  if (!window.ethereum) return alert("Install MetaMask");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();

  const signature = await signer.signMessage("Generate encryption keys for RAAKH Messenger");
  const sigBytes = ethers.utils.arrayify(signature);
  const digest = await sha256(sigBytes);
  derivedPrivateKey = await hkdf(digest);

  document.getElementById("status").innerText = "✅ Wallet connected & key derived";
  document.getElementById("chatBox").classList.remove("hidden");

  const publicKeyHex = Array.from(derivedPrivateKey).map(b => b.toString(16).padStart(2, '0')).join('');
  console.log("Public Key (hex):", publicKeyHex);
};

document.getElementById("sendBtn").onclick = async () => {
  const msg = document.getElementById("message").value;
  const receiverHex = document.getElementById("receiverPub").value;

  if (!msg || !receiverHex) {
    alert("Please enter message and receiver's public key");
    return;
  }

  // simulate E2E encryption using AES-GCM + shared secret
  const keyBytes = Uint8Array.from(receiverHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const sharedKey = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(msg);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, sharedKey, encoded);

  const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

  document.getElementById("status").innerHTML =
    `🔐 Encrypted message:<br><textarea style="width:100%;height:100px">${ivHex}:${encryptedBase64}</textarea>`;
};
