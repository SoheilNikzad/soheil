// main.js

// اینجا به جای import از CDN، فرض می‌کنیم noble-secp256k1 و CryptoJS به صورت گلوبال لود شده‌اند.
// noble-secp256k1 معمولاً خودش را به عنوان 'nobleSecp256k1' در global scope قرار می‌دهد.
// CryptoJS معمولاً خودش را به عنوان 'CryptoJS' در global scope قرار می‌دهد.

const secp = nobleSecp256k1; // استفاده از متغیر گلوبال 'nobleSecp256k1'
const { getPublicKey, utils } = secp; // استخراج توابع مورد نیاز از آن

// Helper function to convert bytes to hex
const bytesToHex = (bytes) => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

async function runECIES() {
  const outputDiv = document.getElementById("output");
  outputDiv.innerText = "⏳ Running simulation...";

  // 1. تولید کلیدهای Alice (فرستنده) و Bob (گیرنده)
  const alicePrivateKey = utils.randomPrivateKey();
  const alicePublicKey = getPublicKey(alicePrivateKey);

  const bobPrivateKey = utils.randomPrivateKey();
  const bobPublicKey = getPublicKey(bobPrivateKey);

  // 2. محاسبه Shared Secret از دید Alice: privA * pubB (با استفاده از ECDH)
  // noble-secp256k1.getSharedSecret خودش خروجی 32 بایتی Shared Secret رو میده
  const sharedSecretAliceView = await secp.getSharedSecret(alicePrivateKey, bobPublicKey);

  // 3. هش کردن Shared Secret برای تولید کلید AES (SHA256)
  const aesKeyAlice = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(bytesToHex(sharedSecretAliceView))).toString();

  // 4. پیام و IV
  const message = "Hello Dear Ehsan! This is a secure message.";
  const ivBytes = crypto.getRandomValues(new Uint8Array(16)); // 16 بایت IV تصادفی
  const iv = CryptoJS.enc.Hex.parse(bytesToHex(ivBytes)); // تبدیل به WordArray

  // 5. رمزنگاری پیام با AES-256-CBC
  const encrypted = CryptoJS.AES.encrypt(
    message,
    CryptoJS.enc.Hex.parse(aesKeyAlice), // کلید AES
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  // 6. محاسبه Shared Secret از دید Bob: privB * pubA
  const sharedSecretBobView = await secp.getSharedSecret(bobPrivateKey, alicePublicKey);
  const aesKeyBob = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(bytesToHex(sharedSecretBobView))).toString();

  // 7. رمزگشایی پیام از سمت Bob
  const decrypted = CryptoJS.AES.decrypt(
    encrypted.toString(), // encrypted.toString() برای گرفتن string کامل شامل cipher + salt + iv
    CryptoJS.enc.Hex.parse(aesKeyBob),
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  outputDiv.innerHTML = `
<pre>
🔐 Alice Private Key: ${bytesToHex(alicePrivateKey)}
🔓 Alice Public Key : ${bytesToHex(alicePublicKey)}

🔑 Bob Private Key  : ${bytesToHex(bobPrivateKey)}
🔓 Bob Public Key   : ${bytesToHex(bobPublicKey)}

---
Shared Secret (Alice's View): ${bytesToHex(sharedSecretAliceView)}
Shared Secret (Bob's View):   ${bytesToHex(sharedSecretBobView)}
✅ Shared Secrets Match? ${bytesToHex(sharedSecretAliceView) === bytesToHex(sharedSecretBobView)}

---
🔑 AES Key (from Alice's SS): ${aesKeyAlice}
🔑 AES Key (from Bob's SS):   ${aesKeyBob}
✅ AES Keys Match? ${aesKeyAlice === aesKeyBob}

---
📨 Original Message: ${message}
🧊 IV (Initialization Vector): ${bytesToHex(ivBytes)}
🔐 Encrypted Message (Ciphertext): ${encrypted.ciphertext.toString(CryptoJS.enc.Hex)}

---
📬 Decrypted Message (by Bob): ${decrypted.toString(CryptoJS.enc.Utf8)}
✅ Decryption Successful? ${message === decrypted.toString(CryptoJS.enc.Utf8)}
</pre>`;
}

// برای اینکه تابع runECIES از طریق onclick قابل دسترسی باشه
window.runECIES = runECIES;

// برای اینکه تابع در زمان لود شدن صفحه هم اجرا بشه (اختیاری)
document.addEventListener('DOMContentLoaded', runECIES);
