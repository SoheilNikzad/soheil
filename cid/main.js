let signer, address, secretKey;

async function generateSecretKey() {
  const sig = await signer.signMessage("ENCRYPTION_KEY");
  const hash = await crypto.subtle.digest("SHA-256", ethers.utils.arrayify(sig));
  return hash;
}

function getSharedKeyHash(addr1, addr2, rawKey) {
  const sorted = [addr1.toLowerCase(), addr2.toLowerCase()].sort().join(":");
  const combined = ethers.utils.toUtf8Bytes(sorted);
  const total = new Uint8Array([...combined, ...new Uint8Array(rawKey)]);
  return crypto.subtle.digest("SHA-256", total);
}

async function getSharedKey(peerAddress) {
  const sharedHash = await getSharedKeyHash(address, peerAddress, secretKey);
  return crypto.subtle.importKey("raw", sharedHash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

function hexToBytes(hex) {
  if (hex.startsWith("0x")) hex = hex.slice(2);
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

document.getElementById("connectBtn").onclick = async () => {
  if (!window.ethereum) return alert("Install MetaMask first");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  address = await signer.getAddress();
  secretKey = await generateSecretKey();
  document.getElementById("status").textContent = `✅ Wallet connected: ${address}`;
};

document.getElementById("sendBtn").onclick = async () => {
  const peer = document.getElementById("recipient").value.trim();
  const msg = document.getElementById("message").value.trim();
  if (!peer || !msg || !signer || !secretKey) return alert("Fill all fields + connect wallet");

  const sharedKey = await getSharedKey(peer);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(msg);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, sharedKey, encoded);
  const payload = ethers.utils.hexlify(iv) + ethers.utils.hexlify(new Uint8Array(encrypted)).slice(2);

  const tx = await signer.sendTransaction({
    to: peer,
    value: 0,
    data: payload
  });

  document.getElementById("status").textContent = "📤 Message sent! Tx: " + tx.hash;
  document.getElementById("message").value = "";
};

document.getElementById("fetchBtn").onclick = async () => {
  if (!signer || !secretKey) return alert("Connect wallet first");
  const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
  const history = await provider.getHistory(address);
  const inbox = document.getElementById("inbox");
  inbox.innerHTML = "<b>Inbox:</b><br/>";
  for (const tx of history) {
    if (tx.to && tx.to.toLowerCase() === address.toLowerCase() && tx.data && tx.data.length > 2) {
      try {
        const raw = hexToBytes(tx.data);
        const iv = raw.slice(0, 12);
        const data = raw.slice(12);
        const sharedKey = await getSharedKey(tx.from);
        const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, sharedKey, data);
        const msg = new TextDecoder().decode(decrypted);
        inbox.innerHTML += `🟣 From ${tx.from}:<br/>${msg}<br/><br/>`;
      } catch (e) {
        // Ignore failed decryptions
      }
    }
  }
};
