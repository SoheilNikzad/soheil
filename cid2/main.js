const connectWalletBtn = document.getElementById('connectWalletBtn');
const statusDiv = document.getElementById('status');
const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const recipientAddressInput = document.getElementById('recipientAddressInput');
const setRecipientBtn = document.getElementById('setRecipientBtn');
const currentRecipientDiv = document.getElementById('currentRecipient');
const fileInput = document.getElementById('fileInput');
const sendFileBtn = document.getElementById('sendFileBtn');
const fileStatusDiv = document.getElementById('fileStatus');

let signer;
let xmtpClient;
let activeConversation;
let currentRecipientAddress = null;

connectWalletBtn.addEventListener('click', async () => {
  try {
    statusDiv.textContent = 'در حال اتصال به کیف پول...';
    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      statusDiv.textContent = `کیف پول متصل شد: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
      connectWalletBtn.style.display = 'none';
      await initXmtp(signer);
    } else {
      statusDiv.textContent = 'MetaMask نصب نیست.';
    }
  } catch (err) {
    statusDiv.textContent = `خطا در اتصال کیف پول: ${err.message || err}`;
  }
});

async function initXmtp(signer) {
  try {
    statusDiv.textContent += ' در حال راه‌اندازی XMTP...';
    xmtpClient = await window.xmtpWeb.Client.create(signer, { env: 'dev' });
    await xmtpClient.publishUserContact();
    statusDiv.textContent = `XMTP فعال شد: ${xmtpClient.address.substring(0, 6)}...${xmtpClient.address.slice(-4)}`;
    listenForNewConversations();
  } catch (error) {
    console.error(error);
    statusDiv.textContent = `خطا در راه‌اندازی XMTP: ${error.message || error}`;
  }
}

setRecipientBtn.addEventListener('click', async () => {
  const address = recipientAddressInput.value.trim();
  if (address.length === 42 && address.startsWith('0x')) {
    currentRecipientAddress = address;
    currentRecipientDiv.textContent = `گیرنده فعلی: ${address.substring(0, 6)}...${address.slice(-4)}`;
    await startOrLoadConversation(currentRecipientAddress);
  } else {
    statusDiv.textContent = 'آدرس گیرنده نامعتبر است.';
  }
});

async function startOrLoadConversation(peerAddress) {
  try {
    const canMessage = await xmtpClient.canMessage(peerAddress);
    if (!canMessage) {
      statusDiv.textContent = `گیرنده در شبکه XMTP نیست.`;
      return;
    }
    activeConversation = await xmtpClient.conversations.newConversation(peerAddress);
    statusDiv.textContent = `مکالمه با ${peerAddress.substring(0, 6)}... آماده شد.`;
    await loadMessages(activeConversation);
    listenForMessages(activeConversation);
  } catch (error) {
    console.error(error);
    statusDiv.textContent = `خطا در مکالمه: ${error.message || error}`;
  }
}

async function loadMessages(conv) {
  chatArea.innerHTML = '';
  const messages = await conv.messages();
  messages.forEach(displayMessage);
  chatArea.scrollTop = chatArea.scrollHeight;
}

async function listenForMessages(conv) {
  const stream = await conv.streamMessages();
  for await (const msg of stream) {
    displayMessage(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
  }
}

async function listenForNewConversations() {
  const stream = await xmtpClient.conversations.stream();
  for await (const newConv of stream) {
    if (newConv.peerAddress !== currentRecipientAddress) {
      statusDiv.textContent = `پیام جدید از ${newConv.peerAddress}`;
    }
  }
}

sendBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text || !activeConversation) return;
  try {
    await activeConversation.send(text);
    messageInput.value = '';
  } catch (error) {
    statusDiv.textContent = `ارسال پیام ناموفق: ${error.message || error}`;
  }
});

function displayMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.classList.add(message.senderAddress === xmtpClient.address ? 'self' : 'other');
  div.textContent = `${message.senderAddress.substring(0, 6)}...: ${message.content}`;
  chatArea.appendChild(div);
}
