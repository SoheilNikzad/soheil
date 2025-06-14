const RPC = "https://rpc.raakh.net";
const output = document.getElementById("output");

async function rpcCall(method, params = []) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1, method, params
    }),
  });
  const json = await res.json();
  return json.result;
}

async function handleSearch() {
  const q = document.getElementById("query").value.trim();
  const b = parseInt(document.getElementById("blocks").value.trim());
  output.innerHTML = "⏳ Searching...";

  if (!q.startsWith("0x") || q.length < 10) {
    output.innerHTML = "❌ Invalid input.";
    return;
  }

  if (q.length === 66) {
    // Transaction hash
    const tx = await rpcCall("eth_getTransactionByHash", [q]);
    if (!tx) {
      output.innerHTML = "❌ Transaction not found.";
      return;
    }
    const receipt = await rpcCall("eth_getTransactionReceipt", [q]);
    output.innerHTML = `<h3>Transaction Details</h3><pre>${JSON.stringify({ ...tx, receipt }, null, 2)}</pre>`;
  } else if (q.length === 42) {
    // Wallet address
    const latestBlock = parseInt(await rpcCall("eth_blockNumber"), 16);
    const scanLimit = isNaN(b) ? 100 : b;
    let allTxs = [];

    for (let i = latestBlock; i > latestBlock - scanLimit && i >= 0; i--) {
      const hexNum = "0x" + i.toString(16);
      const block = await rpcCall("eth_getBlockByNumber", [hexNum, true]);
      if (!block || !block.transactions) continue;

      const matches = block.transactions.filter(tx =>
        tx.from?.toLowerCase() === q.toLowerCase() ||
        tx.to?.toLowerCase() === q.toLowerCase()
      );
      if (matches.length > 0) allTxs.push(...matches);

      output.innerHTML = `⏳ Scanning block ${i}... Found ${allTxs.length} tx(s).`;
    }

    output.innerHTML = `<h3>Transactions for ${q}</h3><pre>${JSON.stringify(allTxs, null, 2)}</pre>`;
  } else {
    output.innerHTML = "❌ Unknown input format.";
  }
}
