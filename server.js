const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());

// إنشاء قاعدة بيانات لتخزين المفاتيح
const db = new sqlite3.Database('./keys.db', (err) => {
    if (err) console.error('خطأ في قاعدة البيانات', err.message);
    else console.log('تم اتصال قاعدة البيانات بنجاح.');
});

// إنشاء جدول المفاتيح تلقائياً إذا لم يكن موجوداً
db.run(`CREATE TABLE IF NOT EXISTS keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_code TEXT UNIQUE,
    is_active INTEGER DEFAULT 1
)`);

// 1. مسار لإضافة مفتاح جديد (تستدعيه أنت لإصدار المفاتيح للزبائن)
app.post('/api/add-key', (req, res) => {
    const { key_code } = req.body;
    if (!key_code) {
        return res.json({ success: false, message: 'الرجاء إدخال المفتاح' });
    }
    
    db.run(`INSERT INTO keys (key_code) VALUES (?)`, [key_code], (err) => {
        if (err) {
            return res.json({ success: false, message: 'المفتاح موجود مسبقاً' });
        }
        res.json({ success: true, message: 'تم إضافة المفتاح بنجاح' });
    });
});

// 2. مسار التحقق (تستدعيه اللعبة لما اللاعب يحط المفتاح ويضغط تفعيل)
app.post('/api/verify', (req, res) => {
    const { key_code } = req.body;

    db.get(`SELECT * FROM keys WHERE key_code = ? AND is_active = 1`, [key_code], (err, row) => {
        if (err || !row) {
            // المفتاح خطأ أو غير موجود أو غير مفعل
            return res.status(401).json({ success: false, message: 'المفتاح غير صالح' });
        }
        
        // المفتاح صحيح 100%
        res.json({ success: true, message: 'المفتاح صحيح، تم تفعيل البوتات' });
    });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`السيرفر شغال على المنفذ: ${PORT}`);
});
