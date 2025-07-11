// app.js

// انتخاب چت از لیست
document.querySelectorAll('.chat-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelector('.chat-item.active')?.classList.remove('active');
    item.classList.add('active');
    // توی نسخه نهایی اینجا پیام‌های اون چت لود میشه
  });
});

// ارسال پیام (نمایشی)
const input = document.querySelector('.chat-input input');
const button = document.querySelector('.chat-input button');
const messages = document.querySelector('.chat-messages');

button.addEventListener('click', () => {
  const text = input.value.trim();
  if (text) {
    const msg = document.createElement('div');
    msg.className = 'message sent';
    msg.textContent = text;
    messages.appendChild(msg);
    input.value = '';

    // اسکرول به پایین
    messages.scrollTop = messages.scrollHeight;
  }
});
