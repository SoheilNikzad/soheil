let signer;
let myKeyPair;

document.getElementById("connectBtn").onclick = async () => {
  if (!window.ethereum) return alert("Install MetaMask first");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  const address = await signer.getAddress();

  const sig = await signer.signMessage("RAAKH_ENCRYPTION_KEY");
  const hash = await crypto.subtle.digest("SHA-256", ethers.utils.arrayify(sig));
  const keyMaterial = await crypto.subtle.importKey("raw", hash, { name: "HKDF" }, false, ["deriveKey"]);

  myKeyPair = await crypto.subtle.deriveKey({
    name: "HKDF",
    hash: "SHA-256",
    salt: new Uint8Array(32),
    info: new TextEncoder().encode("msg-key")
  }, keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);

  document.getElementById("status").textContent = `✅ Wallet connected: ${address}`;
};

document.getElementById("sendBtn").onclick = async () => {
  const receiver = document.getElementById("recipient").value.trim();
  const message = document.getElementById("message").value.trim();
  if (!receiver || !message || !signer || !myKeyPair) return alert("Fill all fields + connect wallet");

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(message);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, myKeyPair, encoded);
  const fullData = ethers.utils.hexlify(iv) + ethers.utils.hexlify(new Uint8Array(encrypted)).slice(2);

  const tx = await signer.sendTransaction({
    to: receiver,
    value: 0,
    data: fullData
  });

  document.getElementById("status").textContent = "📤 Message sent! Tx: " + tx.hash;
  document.getElementById("message").value = "";
};
