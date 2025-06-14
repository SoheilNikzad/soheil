const RPC = "https://rpc.raakh.net";
const output = document.getElementById("output");

async function rpcCall(method, params = []) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  return json.result;
}

function dateToUnix(dateStr) {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

async function handleSearch() {
  const q = document.getElementById("query").value.trim();
  const fromTime = dateToUnix(document.getElementById("from").value);
  const toTime = dateToUnix(document.getElementById("to").value);

  if (!q.startsWith("0x") || q.length < 10) {
    output.innerHTML = "❌ Invalid address or tx hash.";
    return;
  }

  if (!fromTime || !toTime || fromTime >= toTime) {
    output.innerHTML = "❌ Invalid date range.";
    return;
  }

  output.innerHTML = "⏳ Searching...";

  if (q.length === 66) {
    const tx = await rpcCall("eth_getTransactionByHash", [q]);
    const receipt = await rpcCall("eth_getTransactionReceipt", [q]);
    output.innerHTML = `<h3>Transaction Details</h3><pre>${JSON.stringify({ ...tx, receipt }, null, 2)}</pre>`;
    return;
  }

  const latest = parseInt(await rpcCall("eth_blockNumber"), 16);
  const results = [];

  for (let i = latest; i >= 0; i--) {
    const hex = "0x" + i.toString(16);
    const block = await rpcCall("eth_getBlockByNumber", [hex, true]);
    if (!block || !block.timestamp) continue;

    const ts = parseInt(block.timestamp, 16);
    if (ts < fromTime) break;
    if (ts > toTime) continue;

    const txs = block.transactions.filter(tx =>
      tx.from?.toLowerCase() === q.toLowerCase() ||
      tx.to?.toLowerCase() === q.toLowerCase()
    );
    if (txs.length > 0) results.push(...txs);

    output.innerHTML = `🔄 Scanning block ${i}... Found ${results.length} tx(s).`;
  }

  output.innerHTML = `<h3>Transactions for ${q}</h3><pre>${JSON.stringify(results, null, 2)}</pre>`;
}
