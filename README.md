# نظامي الشخصي — Mobile PWA + Google Sheets

## ما الموجود؟
- Dashboard عربية داكنة مشابهة لفكرة الصور.
- Habit Tracker.
- Tasks.
- Sleep tracking.
- Goals + steps + progress.
- Yearly summary.
- يعمل محليًا Offline عبر localStorage.
- قابل للتثبيت على شاشة iPhone الرئيسية كتطبيق Web App.
- مزامنة مع Google Sheets عبر Google Apps Script.

## التشغيل محليًا
افتح المجلد بواسطة أي static web server.
مثال:
python -m http.server 8000

ثم:
http://localhost:8000

## ربط Google Sheets
1. أنشئ Google Sheet جديد.
2. من Extensions > Apps Script.
3. احذف الكود الافتراضي، والصق محتوى الملف `apps-script.gs`.
4. Deploy > New deployment > Web app.
5. Execute as: Me.
6. Who has access: Anyone (أو الإعداد المناسب لحسابك).
7. اضغط Deploy وانسخ رابط `/exec`.
8. افتح التطبيق > ⚙️ > ألصق الرابط > حفظ.
9. اضغط "مزامنة الآن".

## التثبيت على iPhone
1. ارفع ملفات الموقع إلى استضافة HTTPS مثل GitHub Pages / Netlify / Vercel.
2. افتح الرابط في Safari.
3. Share > Add to Home Screen.
4. فعّل Open as Web App إن ظهر الخيار.

## ملاحظات أمنية
- هذا الإصدار مصمم للاستخدام الشخصي.
- إذا ستشاركه مع مستخدمين آخرين، أضف نظام دخول وصلاحيات قبل النشر العام.
- لا تضع أي أسرار أو مفاتيح API داخل ملفات JavaScript العامة.
