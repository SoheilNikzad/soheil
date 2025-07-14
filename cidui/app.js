// app.js

const chatItems = document.querySelectorAll('.chat-item');
const headerName = document.querySelector('.chat-header h3');
const headerAvatar = document.querySelector('.chat-header .avatar');
const input = document.querySelector('.chat-input input');
const button = document.querySelector('.chat-input button');
const messages = document.querySelector('.chat-messages');

// هندل انتخاب چت از لیست
chatItems.forEach(item => {
  item.addEventListener('click', () => {
    // تغییر کلاس active
    document.querySelector('.chat-item.active')?.classList.remove('active');
    item.classList.add('active');

    // آپدیت هدر با اسم و آواتار جدید
    const name = item.dataset.name;
    const avatar = item.dataset.avatar;
    headerName.textContent = name;
    headerAvatar.src = avatar;

    // پیام‌ها رو فعلاً پاک می‌کنیم (برای نسخه ساده)
    messages.innerHTML = '';
  });
});

// هندل ارسال پیام ساده
button.addEventListener('click', () => {
  const text = input.value.trim();
  if (text) {
    const msg = document.createElement('div');
    msg.className = 'message sent';
    msg.textContent = text;
    messages.appendChild(msg);
    input.value = '';

    // اسکرول به آخر پیام‌ها
    messages.scrollTop = messages.scrollHeight;
  }
});
const connectButton = document.getElementById("connectWallet");
const walletAddress = document.getElementById("walletAddress");

async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      walletAddress.textContent = shortenAddress(address);
      connectButton.style.display = "none"; // دکمه رو مخفی می‌کنیم بعد از اتصال
    } catch (err) {
      console.error("User rejected the connection");
    }
  } else {
    alert("لطفاً MetaMask را نصب کنید!");
  }
}

function shortenAddress(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

connectButton.addEventListener("click", connectWallet);
const getPubKeyBtn = document.getElementById("getPubKey");
const publicKeyBox = document.getElementById("publicKeyBox");

getPubKeyBtn.addEventListener("click", async () => {
  if (!window.ethereum || !ethereum.selectedAddress) {
    alert("اول کیف پول رو وصل کن");
    return;
  }

  try {
    const publicKey = await window.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [ethereum.selectedAddress],
    });

    publicKeyBox.textContent = publicKey;
  } catch (err) {
    if (err.code === 4001) {
      alert("درخواست رد شد.");
    } else {
      console.error(err);
      alert("خطا در دریافت کلید عمومی");
    }
  }
});


