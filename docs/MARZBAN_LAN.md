# Marzban على الشبكة المحلية (LAN)

دليل ربط **vpnnovo** بلوحة Marzban المحلية حتى يعمل تطبيق Windows عبر `/api/client/vpn/*`.

## المتطلبات

| المتغير | مثال |
|---------|------|
| `MARZBAN_API_URL` | `https://192.168.1.50:8000` أو عنوان النفق |
| `MARZBAN_USERNAME` | `admin` |
| `MARZBAN_PASSWORD` | كلمة لوحة Marzban |
| `MARZBAN_VLESS_INBOUND` | `VLESS TCP REALITY` (مطابق لـ Host Settings) |

لا تضع هذه القيم في تطبيق Windows — تبقى على السيرفر فقط.

## سيناريوهات الوصول

### 1) vpnnovo يعمل محلياً (تطوير)

```bash
cd vpnnovo
cp .env.example .env.local
# عدّل MARZBAN_API_URL إلى IP المحلي
npm run dev
```

التطبيق يستدعي `http://127.0.0.1:3000/api/client/vpn/...`.

### 2) vpnnovo على Vercel + Marzban على LAN

لوحة Marzban غير متاحة من الإنترنت. استخدم نفقاً آمناً:

| أداة | ملاحظة |
|------|--------|
| **Cloudflare Tunnel** | `cloudflared tunnel` → `MARZBAN_API_URL=https://marzban.yourdomain.com` |
| **Tailscale** | `MARZBAN_API_URL=https://100.x.x.x:8000` على نفس الشبكة الافتراضية |
| **ngrok** | للتجربة فقط — `ngrok http 8000` |

بعد النفق، اختبر من جهاز خارج LAN:

```bash
curl -k "$MARZBAN_API_URL/api/admin/token" -d "username=admin&password=..." 
```

### 3) تطبيق Windows → vpnnovo

في `.env` لتطبيق Windows (أو `VITE_API_BASE_URL`):

```
VITE_API_BASE_URL=https://your-vpnnovo-domain.com
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

أضف أصول CORS في vpnnovo (اختياري):

```
WINDOWS_APP_CORS_ORIGINS=tauri://localhost,http://localhost:1420
```

## عقدة VLESS (Data Plane)

Marzban المحلي **يدير** المستخدمين؛ حركة VPN تمر عبر **Node** (Xray على VPS أو سيرفرك).

1. Panel → **Nodes** → أضف العقدة العامة.
2. تأكد أن inbound `MARZBAN_VLESS_INBOUND` موجود على العقدة.
3. أنشئ مستخدم تجريبي وتحقق من الاشتراك في لوحة Marzban.

## استكشاف الأخطاء

| العرض | الحل |
|-------|------|
| `502` عند `/vpn/profile` | تحقق من `MARZBAN_API_URL` والنفق؛ راجع logs السيرفر |
| اشتراك فارغ | المستخدم بدون inbound — راجع `MARZBAN_VLESS_INBOUND` |
| TLS / self-signed | معالجة تلقائية server-side (`rejectUnauthorized: false`) |
| CORS من Tauri | أضف `WINDOWS_APP_CORS_ORIGINS` |

## اختبار API

```bash
# بعد تسجيل الدخول في المتصفح أو من التطبيق — استبدل TOKEN
export TOKEN="eyJ..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://127.0.0.1:3000/api/client/vpn/status" | jq
```
