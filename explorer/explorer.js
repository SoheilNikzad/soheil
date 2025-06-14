const RPC = "https://rpc.raakh.net";
const out = document.getElementById("output");

async function rpc(method, params = []) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  const json = await res.json();
  return json.result;
}

function fmtTS(hex) {
  const d = new Date(parseInt(hex, 16) * 1000);
  return d.toLocaleString();
}

function toEth(hex) {
  return parseInt(hex, 16) / 1e18;
}

function applyFilters(arr) {
  const min = parseFloat(document.getElementById("minValue").value) || 0;
  const max = parseFloat(document.getElementById("maxValue").value) || Infinity;
  const bMin = parseInt(document.getElementById("blockMin").value) || 0;
  const bMax = parseInt(document.getElementById("blockMax").value) || Infinity;
  const addr = document.getElementById("addrFilter").value.trim().toLowerCase();
  const status = document.getElementById("statusFilter").value;

  return arr.filter(tx => {
    const val = toEth(tx.value);
    const blockNum = parseInt(tx.blockNumber, 16);
    const from = tx.from?.toLowerCase() || "";
    const to = tx.to?.toLowerCase() || "";
    const txStatus = tx.receipt?.status === "0x1" ? "success" : "failed";

    return (
      val >= min &&
      val <= max &&
      blockNum >= bMin &&
      blockNum <= bMax &&
      (!addr || from.includes(addr) || to.includes(addr)) &&
      (!status || status === txStatus)
    );
  });
}

function applySort(arr) {
  const sort = document.getElementById("sortBy").value;
  return arr.sort((a, b) => {
    const va = sort.includes("value") ? toEth(a.value) :
               sort.includes("block") ? parseInt(a.blockNumber, 16) :
               parseInt(a.timestamp, 16);
    const vb = sort.includes("value") ? toEth(b.value) :
               sort.includes("block") ? parseInt(b.blockNumber, 16) :
               parseInt(b.timestamp, 16);
    return sort.endsWith("_asc") ? va - vb : vb - va;
  });
}

function renderTable(txs) {
  if (!txs.length) return "<p>No transactions found.</p>";
  return `
    <table>
      <thead>
        <tr>
          <th>Block</th>
          <th>Tx Hash</th>
          <th>Time</th>
          <th>From</th>
          <th>To</th>
          <th>Value (ETH)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${txs.map(tx => {
          const value = toEth(tx.value).toFixed(6);
          const status = tx.receipt?.status === "0x1" ? "success" : "failed";
          return `
            <tr>
              <td>${parseInt(tx.blockNumber, 16)}</td>
              <td>${tx.hash.slice(0, 10)}...</td>
              <td>${fmtTS(tx.timestamp)}</td>
              <td>${tx.from}</td>
              <td>${tx.to || '-'}</td>
              <td>${value}</td>
              <td class="status-${status}">${status}</td>
            </tr>`;
        }).join("")}
      </tbody>
    </table>`;
}

async function handleSearch() {
  const q = document.getElementById("query").value.trim().toLowerCase();
  const fromT = new Date(document.getElementById("from").value).getTime() / 1000;
  const toT = new Date(document.getElementById("to").value).getTime() / 1000;
  out.innerHTML = "⏳ Searching...";

  if (!q.startsWith("0x") || q.length < 10) {
    out.innerHTML = "❌ Invalid input";
    return;
  }

  let arr = [];

  if (q.length === 66) {
    const tx = await rpc("eth_getTransactionByHash", [q]);
    if (!tx) return out.innerHTML = "❌ Transaction not found";
    tx.receipt = await rpc("eth_getTransactionReceipt", [q]);
    const blk = await rpc("eth_getBlockByNumber", [tx.blockNumber, true]);
    tx.timestamp = blk.timestamp;
    arr = [tx];
  } else {
    const latest = parseInt(await rpc("eth_blockNumber"), 16);
    for (let i = latest; i >= 0; i--) {
      const blk = await rpc("eth_getBlockByNumber", ["0x" + i.toString(16), true]);
      if (!blk) continue;
      const ts = parseInt(blk.timestamp, 16);
      if (ts < fromT) break;
      if (ts > toT) continue;
      blk.transactions.forEach(tx => {
        if (tx.from?.toLowerCase() === q || tx.to?.toLowerCase() === q) {
          tx.receipt = null;
          tx.timestamp = blk.timestamp;
          arr.push(tx);
        }
      });
    }
    for (let tx of arr) {
      tx.receipt = await rpc("eth_getTransactionReceipt", [tx.hash]);
    }
  }

  arr = applyFilters(arr);
  arr = applySort(arr);
  out.innerHTML = renderTable(arr);
}
