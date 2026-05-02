'use client';
import { useState } from 'react';

export default function TestLoginPage() {
  const [identifier, setIdentifier] = useState('admin@edunest.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, rememberMe: true }),
      });

      const data = await res.json();
      console.log('پاسخ سرور:', data);

      if (res.ok && data.token) {
        // ذخیره توکن در localStorage
        localStorage.setItem('accessToken', data.token);
        setMessage('✅ لاگین موفق! در حال انتقال به پروفایل...');
        // هدایت به صفحه پروفایل
        window.location.href = '/profile';
      } else {
        setMessage(`❌ خطا: ${data.message || 'ورود ناموفق'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage(`❌ خطای شبکه: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>صفحه تست لاگین (بدون وابستگی)</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="ایمیل یا شماره موبایل"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input
            type="password"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 8 }}>
          {loading ? 'در حال ورود...' : 'ورود'}
        </button>
      </form>
      {message && <p style={{ marginTop: 16, textAlign: 'center' }}>{message}</p>}
    </div>
  );
}