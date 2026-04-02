# 🕌 منصة الدعوة الإسلامية
> منصة تفاعلية للرد على الشبهات وعرض فيديوهات الدعوة

---

## 🚀 خطوات الإعداد الكاملة

### 1. إنشاء مشروع Supabase

1. اذهب لـ [supabase.com](https://supabase.com) وأنشئ مشروع جديد
2. انتظر حتى يكتمل الإعداد (دقيقة واحدة)
3. اذهب لـ **SQL Editor** وشغّل ملف `supabase-schema.sql` بالكامل

### 2. إعداد Supabase Auth

```
Authentication → Settings → Email Auth
✅ Enable Email Signup
❌ Confirm email: OFF  ← مهم جداً! علشان ما يطلبش تأكيد email
```

### 3. إضافة أول مشرف (Admin)

بعد ما تسجّل أول حساب، شغّل هذا الـ SQL:

```sql
-- غيّر 'your_username' لاسم المستخدم اللي سجلته
UPDATE public.profiles 
SET role = 'admin' 
WHERE username = 'your_username';
```

### 4. إعداد المشروع المحلي

```bash
# تثبيت الحزم
npm install

# إنشاء ملف البيئة
cp .env.local.example .env.local
# عدّل القيم داخل .env.local

# تشغيل المشروع
npm run dev
```

### 5. النشر على Netlify

```bash
# بناء المشروع
npm run build

# في لوحة Netlify:
# Environment Variables:
#   NEXT_PUBLIC_SUPABASE_URL = ...
#   NEXT_PUBLIC_SUPABASE_ANON_KEY = ...

# Build Command: npm run build
# Publish Directory: .next
```

---

## 📁 هيكل المشروع

```
dawah-platform/
├── app/
│   ├── layout.tsx           # Layout عام (RTL + خط Cairo)
│   ├── page.tsx             # الصفحة الرئيسية (بحث + فئات + أحدث فيديوهات)
│   ├── auth/page.tsx        # تسجيل دخول وإنشاء حساب
│   ├── admin/page.tsx       # لوحة الإدارة (محمية)
│   ├── live/page.tsx        # صفحة البث المباشر
│   └── [category]/page.tsx  # صفحة التصنيف الديناميكية
├── components/
│   ├── layout/Navbar.tsx    # شريط التنقل
│   ├── ui/SearchBar.tsx     # شريط البحث
│   ├── ui/LogoutButton.tsx  # زر تسجيل الخروج
│   ├── video/VideoCard.tsx  # بطاقة الفيديو مع react-player
│   └── video/VideoSkeleton.tsx # حالة التحميل
├── lib/
│   ├── auth-actions.ts      # تسجيل دخول/خروج/تسجيل
│   ├── video-actions.ts     # CRUD للفيديوهات
│   └── supabase/            # Supabase clients
├── types/index.ts           # TypeScript types
├── middleware.ts            # حماية المسارات
└── supabase-schema.sql      # قاعدة البيانات الكاملة
```

---

## 🔐 نظام الصلاحيات

| الإجراء | زائر | مستخدم | أدمن |
|---------|------|--------|------|
| مشاهدة الفيديوهات | ✅ | ✅ | ✅ |
| البحث | ✅ | ✅ | ✅ |
| مشاهدة البث | ✅ | ✅ | ✅ |
| إضافة فيديو | ❌ | ❌ | ✅ |
| حذف فيديو | ❌ | ❌ | ✅ |
| إدارة البث | ❌ | ❌ | ✅ |

---

## 💡 حل مشكلة Username بدون Email

الـ Supabase Auth يعتمد على Email فقط، لذلك نستخدم هذا الـ trick:

```
المستخدم يكتب: ahmed
يُحفظ داخلياً: ahmed@dawah-platform.app
```

المستخدم لا يرى أي email في أي وقت — فقط يكتب username وpassword.

---

## 🎬 لماذا YouTube Embed وليس رفع فيديوهات؟

| رفع ملفات | YouTube Embed |
|-----------|---------------|
| يستهلك GB من Supabase ❌ | لا يستهلك شيئاً ✅ |
| بطيء في التحميل ❌ | سريع جداً ✅ |
| يكلف مساحة Netlify ❌ | مجاني ✅ |
| يحتاج CDN ❌ | YouTube هو الـ CDN ✅ |

---

## 📞 التصنيفات المتاحة

- **Atheism** → الرد على الإلحاد
- **Christianity** → الحوار مع النصارى  
- **Doubts** → الشبهات والردود

---

## ⚙️ متطلبات النظام

- Node.js 18+
- npm أو yarn
- حساب Supabase (مجاني يكفي)
- حساب Netlify (مجاني يكفي)
