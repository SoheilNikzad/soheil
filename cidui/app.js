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
