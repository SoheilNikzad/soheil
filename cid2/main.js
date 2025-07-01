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
        statusDiv.textContent = 'در حال اتصال به کیف پول... لطفاً MetaMask را تأیید کنید.';
        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            const address = await signer.getAddress();
            statusDiv.textContent = `کیف پول متصل شد: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
            connectWalletBtn.style.display = 'none';
            await initXmtp(signer);
        } else {
            statusDiv.textContent = 'لطفاً MetaMask یا کیف پول سازگار نصب کنید.';
        }
    } catch (error) {
        console.error("خطا در اتصال کیف پول:", error);
        statusDiv.textContent = `خطا در اتصال کیف پول: ${error.message || error}`;
    }
});

async function initXmtp(signer) {
    try {
        statusDiv.textContent += ' در حال راه‌اندازی XMTP Client...';
        // 🔧 اصلاح این خط
        xmtpClient = await window.Client.create(signer, { env: 'dev' });

        await xmtpClient.publishUserContact();

        statusDiv.textContent = `XMTP Client راه‌اندازی شد. آدرس شما: ${xmtpClient.address.substring(0, 6)}...${xmtpClient.address.substring(xmtpClient.address.length - 4)}`;
        listenForNewConversations();
    } catch (error) {
        console.error("خطا در راه‌اندازی XMTP:", error);
        statusDiv.textContent = `خطا در راه‌اندازی XMTP. ${error.message || error}`;
    }
}

setRecipientBtn.addEventListener('click', async () => {
    const address = recipientAddressInput.value.trim();
    if (address.length === 42 && address.startsWith('0x')) {
        currentRecipientAddress = address;
        currentRecipientDiv.textContent = `گیرنده فعلی: ${currentRecipientAddress.substring(0, 6)}...${currentRecipientAddress.substring(address.length - 4)}`;
        statusDiv.textContent = 'در حال بررسی فعال‌سازی XMTP گیرنده و شروع مکالمه...';
        await startOrLoadConversation(currentRecipientAddress);
    } else {
        statusDiv.textContent = 'لطفاً یک آدرس معتبر وارد کنید.';
    }
});

async function startOrLoadConversation(peerAddress) {
    if (!xmtpClient) {
        statusDiv.textContent = 'لطفاً ابتدا کیف پول را متصل و XMTP را راه‌اندازی کنید.';
        return;
    }
    try {
        const canMessage = await xmtpClient.canMessage(peerAddress);
        if (!canMessage) {
            statusDiv.textContent = `گیرنده (${peerAddress.substring(0, 6)}...) در شبکه XMTP فعال نیست.`;
            activeConversation = null;
            return;
        }
        activeConversation = await xmtpClient.conversations.newConversation(peerAddress);
        statusDiv.textContent = `مکالمه با ${peerAddress.substring(0, 6)}... آماده شد.`;
        await loadMessages(activeConversation);
        listenForMessages(activeConversation);
    } catch (error) {
        console.error("خطا در مکالمه:", error);
        statusDiv.textContent = `خطا در مکالمه با ${peerAddress}: ${error.message || error}`;
        activeConversation = null;
    }
}

async function loadMessages(conv) {
    chatArea.innerHTML = '';
    const messages = await conv.messages();
    messages.forEach(msg => displayMessage(msg));
    chatArea.scrollTop = chatArea.scrollHeight;
}

async function listenForMessages(conv) {
    if (conv.stream) conv.stream.return();
    const messageStream = await conv.streamMessages();
    conv.stream = messageStream;
    for await (const message of messageStream) {
        displayMessage(message);
        chatArea.scrollTop = chatArea.scrollHeight;
    }
}

async function listenForNewConversations() {
    if (!xmtpClient) return;
    for await (const newConversation of await xmtpClient.conversations.stream()) {
        if (newConversation.peerAddress === currentRecipientAddress) {
            await startOrLoadConversation(newConversation.peerAddress);
        } else {
            statusDiv.textContent = `مکالمه جدید از ${newConversation.peerAddress.substring(0, 6)}... دریافت شد.`;
        }
    }
}

sendBtn.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (text && activeConversation) {
        try {
            await activeConversation.send(text);
            messageInput.value = '';
        } catch (error) {
            console.error("خطا در ارسال پیام متنی:", error);
            statusDiv.textContent = `خطا در ارسال پیام متنی: ${error.message || error}`;
        }
    } else if (!activeConversation) {
        statusDiv.textContent = 'لطفاً گیرنده را تنظیم کنید.';
    }
});

sendFileBtn.addEventListener('click', async () => {
    if (!activeConversation) {
        fileStatusDiv.textContent = 'ابتدا کیف پول را متصل و گیرنده را تنظیم کنید.';
        return;
    }
    if (!fileInput.files.length) {
        fileStatusDiv.textContent = 'لطفاً یک فایل انتخاب کنید.';
        return;
    }
    const file = fileInput.files[0];
    fileStatusDiv.textContent = `در حال آماده‌سازی فایل "${file.name}"...`;

    try {
        await activeConversation.send(file, { contentType: window.Client.ContentTypes.Attachment });
        fileStatusDiv.textContent = `فایل "${file.name}" با موفقیت ارسال شد.`;
        fileInput.value = '';
    } catch (error) {
        console.error("خطا در ارسال فایل:", error);
        fileStatusDiv.textContent = `خطا در ارسال فایل: ${error.message || error}`;
    }
});

function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(message.senderAddress === xmtpClient.address ? 'self' : 'other');

    let contentToDisplay = message.content;
    const ContentTypes = window.Client.ContentTypes;

    if (message.contentType?.id === ContentTypes.Attachment.id) {
        contentToDisplay = `[پیوست: ${message.content.filename || 'فایل'}]`;
    } else if (message.contentType?.id === ContentTypes.RemoteAttachment.id) {
        contentToDisplay = `[پیوست از راه دور: ${message.content.filename || 'فایل'}]`;
    }

    messageDiv.textContent = `${message.senderAddress.substring(0, 6)}...: ${contentToDisplay}`;
    chatArea.appendChild(messageDiv);
}
