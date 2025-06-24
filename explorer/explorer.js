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
