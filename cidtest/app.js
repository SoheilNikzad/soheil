let provider;
let signer;

document.getElementById("connectBtn").onclick = async () => {
  if (window.ethereum) {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      document.getElementById("walletAddress").innerText = `Connected: ${address}`;
    } catch (err) {
      alert("Connection failed: " + err.message);
    }
  } else {
    alert("Please install MetaMask!");
  }
};

document.getElementById("sendBtn").onclick = async () => {
  const to = document.getElementById("to").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!ethers.utils.isAddress(to)) {
    alert("Invalid address");
    return;
  }

  // 👇 استفاده از متد سازگار با مرورگر
  const hexMessage = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));

  try {
    const tx = await signer.sendTransaction({
      to: to,
      value: ethers.utils.parseEther("0"),
      data: hexMessage,
    });

    document.getElementById("status").innerText = `Transaction sent: ${tx.hash}`;
  } catch (err) {
    document.getElementById("status").innerText = "Error: " + err.message;
  }
};
