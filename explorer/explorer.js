const RPC = "https://rpc.raakh.net";
const out = document.getElementById("output");

async function rpc(method, params = []) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  return (await res.json()).result;
}

function fmtTS(hex) {
  const ts = parseInt(hex, 16) * 1000;
  const date = new Date(ts);
  const now = Date.now();
  const diff = Math.floor((now - ts) / 1000);
  const relative = diff < 60 ? `${diff}s ago` :
                   diff < 3600 ? `${Math.floor(diff / 60)}m ago` :
                   diff < 86400 ? `${Math.floor(diff / 3600)}h ago` :
                   `${Math.floor(diff / 86400)}d ago`;
  return `${date.toLocaleString()} (${relative})`;
}

function formatEth(val) {
  return (parseInt(val, 16) / 1e18).toLocaleString(undefined, {maximumFractionDigits: 6});
}

function shorten(str, len = 10) {
  return str.length > len ? str.slice(0, len) + "..." : str;
}

function renderTable(txs) {
  if (!txs.length) return "<p>No transactions found.</p>";
  return `<table><thead><tr>
    <th>#</th><th>Block</th><th>Tx Hash</th><th>Time</th>
    <th>From</th><th>To</th><th>Value (ETH)</th><th>Status</th><th>Token Info</th>
  </tr></thead><tbody>` + txs.map((tx, i) => {
    const val = formatEth(tx.value || "0x0");
    const status = tx.receipt?.status === '0x1' ? "success" : "failed";
    const token = tx.tokenSymbol ? `${tx.tokenSymbol} (${tx.tokenDecimals})` : "-";
    return `<tr>
      <td>${i + 1}</td>
      <td>${parseInt(tx.blockNumber, 16)}</td>
      <td class="tooltip" data-full="${tx.hash}">${shorten(tx.hash)}</td>
      <td>${fmtTS(tx.timestamp)}</td>
      <td class="tooltip" data-full="${tx.from}">${shorten(tx.from)}</td>
      <td class="tooltip" data-full="${tx.to || '-'}">${shorten(tx.to || '-')}</td>
      <td>${val}</td>
      <td class="status-${status}">${status === "success" ? "✅" : "❌"}</td>
      <td>${token}</td>
    </tr>`;
  }).join("") + "</tbody></table>";
}

async function getTokenInfo(addr) {
  const calls = ['0x95d89b41', '0x06fdde03', '0x313ce567']; // symbol(), name(), decimals()
  const [sym, name, dec] = await Promise.all(calls.map(sig =>
    rpc("eth_call", [{ to: addr, data: sig }, "latest"])
  ));
  return {
    tokenSymbol: hexToStr(sym),
    tokenName: hexToStr(name),
    tokenDecimals: parseInt(dec, 16) || 18
  };
}

function hexToStr(hex) {
  try {
    let str = '';
    for (let i = 2; i < hex.length; i += 2) {
      const char = String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
      if (char !== '\u0000') str += char;
    }
    return str.trim();
  } catch {
    return '';
  }
}

async function handleSearch() {
  const q = document.getElementById("query").value.trim().toLowerCase();
  const fromT = new Date(document.getElementById("from").value).getTime() / 1000;
  const toT = new Date(document.getElementById("to").value).getTime() / 1000;
  if (!q.startsWith("0x")) return out.innerHTML = "❌ Invalid input";
  out.innerHTML = "⏳ Searching...";

  if (q.length === 66) {
    const tx = await rpc("eth_getTransactionByHash", [q]);
    const rec = await rpc("eth_getTransactionReceipt", [q]);
    tx.receipt = rec;
    const blk = await rpc("eth_getBlockByNumber", [tx.blockNumber, false]);
    tx.timestamp = blk.timestamp;
    if (rec && rec.to) Object.assign(tx, await getTokenInfo(rec.to));
    out.innerHTML = renderTable([tx]);
  } else {
    const latest = parseInt(await rpc("eth_blockNumber"), 16);
    let acc = [];
    for (let i = latest; i >= 0; i--) {
      const blk = await rpc("eth_getBlockByNumber", ["0x" + i.toString(16), true]);
      if (!blk) continue;
      const ts = parseInt(blk.timestamp, 16);
      if (ts < fromT) break;
      if (ts > toT) continue;
      for (const tx of blk.transactions) {
        if (tx.from === q || tx.to === q) {
          tx.receipt = await rpc("eth_getTransactionReceipt", [tx.hash]);
          tx.timestamp = blk.timestamp;
          if (tx.to) Object.assign(tx, await getTokenInfo(tx.to));
          acc.push(tx);
        }
      }
      out.innerHTML = `🔄 scanning block ${i}, found ${acc.length} tx(s)...`;
    }
    out.innerHTML = renderTable(acc);
  }
}
