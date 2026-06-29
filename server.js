import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const CHAT_ID   = process.env.CHAT_ID   || '';

app.use(express.json());
app.use(express.static(__dirname));

// ارسال پیام به تلگرام از سمت سرور
app.post('/api/send', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.json({ ok: false });

  try {
    const r = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: 'Markdown'
        })
      }
    );
    const j = await r.json();
    res.json(j);
  } catch (e) {
    console.error('Telegram error:', e.message);
    res.json({ ok: false, error: e.message });
  }
});

// دریافت IP واقعی و اطلاعات جغرافیایی کاربر از سمت سرور
app.get('/api/geo', async (req, res) => {
  try {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.headers['x-real-ip'] ||
      req.socket.remoteAddress ||
      '';

    const r = await fetch(`http://ip-api.com/json/${ip}?lang=en&fields=status,country,city,query`);
    const j = await r.json();

    res.json({
      ip:      j.query   || ip,
      city:    j.city    || '',
      country: j.country || ''
    });
  } catch(e) {
    res.json({ ip: 'خطا', city: '', country: '' });
  }
});

// صفحه اصلی
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
