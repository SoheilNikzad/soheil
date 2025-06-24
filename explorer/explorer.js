const RPC = "https://rpc.raakh.net";
const out = document.getElementById("output");
const balanceSection = document.getElementById("balances");
const balanceList = document.getElementById("balanceList");

async function rpc(m, p = []) {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: m, params: p }),
  });
  return (await r.json()).result;
}

function fmtTS(hex) {
  const d = new Date(parseInt(hex, 16) * 1000);
  return d.toLocaleString();
}

function short(addr) {
  return addr.slice(0, 4) + "..." + addr.slice(-2);
}

function openPopup(content) {
  document.getElementById("popupContent").innerText = content;
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

async function getTxType(tx) {
  const addr = tx.to;
  if (!addr) return "S.C";

  try {
    const nameData = await rpc("eth_call", [
      { to: addr, data: "0x06fdde03" },
      "latest",
    ]);
    const symbolData = await rpc("eth_call", [
      { to: addr, data: "0x95d89b41" },
      "latest",
    ]);
    if (nameData && symbolData && symbolData !== "0x") {
      const hex = symbolData.slice(2);
      const buf = hex.match(/.{1,2}/g).map((b) => String.fromCharCode(parseInt(b, 16)));
      const symbol = buf.join("").replace(/\u0000/g, "");
      if (symbol) return symbol;
    }
  } catch (e) {}

  try {
    const support721 = await rpc("eth_call", [
      {
        to: addr,
        data: "0x01ffc9a7" + "0000000000000000000000000000000000000000000000000000000080ac58cd",
      },
      "latest",
    ]);
    if (support721 === "0x1") return "NFT";
  } catch (e) {}

  return "KHAS";
}

function renderTable(txs) {
  if (!txs.length) return "<p>No transactions found.</p>";
  return `<table><thead><tr>
  <th>Block</th><th>Tx Hash</th><th>Time</th><th>Type</th>
  <th>From</th><th>To</th><th>Value (ETH)</th><th>Status</th>
  </tr></thead><tbody>` +
    txs
      .map((tx) => {
        const vals = (parseInt(tx.value, 16) / 1e18).toFixed(6);
        const status = tx.receipt?.status === "0x1" ? "success" : "failed";
        return `<tr>
        <td>${parseInt(tx.blockNumber, 16)}</td>
        <td onclick="openPopup('${tx.hash}')" style="cursor:pointer;" title="Click to view full">${short(tx.hash)}</td>
        <td>${fmtTS(tx.timestamp)}</td>
        <td>${tx.type || "..."}</td>
        <td onclick="openPopup('${tx.from}')" style="cursor:pointer;" title="Click to view full">${short(tx.from)}</td>
        <td onclick="openPopup('${tx.to || "-"}')" style="cursor:pointer;" title="Click to view full">${tx.to ? short(tx.to) : "-"}</td>
        <td>${vals}</td>
        <td class="status-${status}">${status}</td>
      </tr>`;
      })
      .join("") +
    "</tbody></table>";
}

async function displayBalances(address, tokenAddresses) {
  balanceList.innerHTML = "";

  // KHAS native balance
  const native = await rpc("eth_getBalance", [address, "latest"]);
  const val = (parseInt(native, 16) / 1e18).toFixed(6);
  const el = document.createElement("li");
  el.innerText = `KHAS: ${val}`;
  balanceList.appendChild(el);

  // ERC20 tokens
  const seen = new Set();
  for (const tokenAddr of tokenAddresses) {
    if (!tokenAddr || tokenAddr === "0x0000000000000000000000000000000000000000") continue;
    if (seen.has(tokenAddr)) continue;
    seen.add(tokenAddr);

    try {
      const symbolData = await rpc("eth_call", [
        {
          to: tokenAddr,
          data: "0x95d89b41",
        },
        "latest",
      ]);
      const hex = symbolData.slice(2);
      const symbol = hex.match(/.{1,2}/g).map((b) => String.fromCharCode(parseInt(b, 16))).join("").replace(/\u0000/g, "");

      const balanceHex = await rpc("eth_call", [
        {
          to: tokenAddr,
          data: "0x70a08231" + address.slice(2).padStart(64, "0"),
        },
        "latest",
      ]);
      const bal = parseInt(balanceHex, 16);
      if (bal > 0) {
        const li = document.createElement("li");
        li.innerText = `${symbol || "Token"}: ${(bal / 1e18).toFixed(6)}`;
        balanceList.appendChild(li);
      }
    } catch (e) {}
  }

  balanceSection.style.display = "block";
}

async function handleSearch() {
  const qRaw = document.getElementById("query").value.trim();
  const q = qRaw.toLowerCase();
  const fromT = new Date(document.getElementById("from").value).getTime() / 1000;
  const toT = new Date(document.getElementById("to").value).getTime() / 1000;
  out.innerHTML = "⏳ Searching...";
  balanceSection.style.display = "none";

  // 📦 حالت شماره بلاک
  if (/^\d+$/.test(q)) {
    const blk = await rpc("eth_getBlockByNumber", ["0x" + parseInt(q).toString(16), true]);
    if (!blk || !blk.transactions) return out.innerHTML = "❌ Block not found.";
    const txs = blk.transactions;
    for (const tx of txs) {
      tx.timestamp = blk.timestamp;
      const rec = await rpc("eth_getTransactionReceipt", [tx.hash]);
      tx.receipt = rec;
      tx.type = await getTxType(tx);
    }
    out.innerHTML = renderTable(txs);
    return;
  }

  if (!q.startsWith("0x")) return (out.innerHTML = "❌ Invalid input");

  if (q.length === 66) {
    const tx = await rpc("eth_getTransactionByHash", [q]);
    const rec = await rpc("eth_getTransactionReceipt", [q]);
    tx.receipt = rec;
    tx.timestamp = (await rpc("eth_getBlockByNumber", [tx.blockNumber, true])).timestamp;
    tx.type = await getTxType(tx);
    out.innerHTML = renderTable([tx]);

    const tokens = rec.logs.map(l => l.address.toLowerCase());
    await displayBalances(tx.from.toLowerCase(), tokens);
  } else {
    const latest = parseInt(await rpc("eth_blockNumber"), 16);
    let acc = [];
    let tokenSet = new Set();
    for (let i = latest; i >= 0; i--) {
      const blk = await rpc("eth_getBlockByNumber", ["0x" + i.toString(16), true]);
      if (!blk) continue;
      const ts = parseInt(blk.timestamp, 16);
      if (ts < fromT) break;
      if (ts > toT) continue;

      blk.transactions.forEach((tx) => {
        if (tx.from.toLowerCase() === q || tx.to?.toLowerCase() === q) {
          tx.receipt = null;
          acc.push(tx);
        }
      });
      out.innerHTML = `🔄 scanning block ${i}, found ${acc.length} tx(s)...`;
    }

    for (const tx of acc) {
      const blk = await rpc("eth_getBlockByNumber", [tx.blockNumber, true]);
      tx.timestamp = blk.timestamp;
      const rec = await rpc("eth_getTransactionReceipt", [tx.hash]);
      tx.receipt = rec;
      tx.type = await getTxType(tx);
      rec.logs.forEach(l => tokenSet.add(l.address.toLowerCase()));
    }

    out.innerHTML = renderTable(acc);
    await displayBalances(q, Array.from(tokenSet));
  }
}
