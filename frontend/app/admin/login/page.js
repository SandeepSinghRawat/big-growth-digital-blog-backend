'use client';

export default function LoginPage() {
  return (
    <main className="page-shell admin-shell">
      <section className="auth-panel max-w-lg mx-auto">
        <h1 className="text-3xl font-semibold text-slate-950">Admin Login</h1>
        <p className="text-slate-600 mb-8">Secure JWT authentication for the content manager.</p>
        <form
          action="/admin/dashboard"
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const email = formData.get('email');
            const password = formData.get('password');

            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.accessToken) {
                  window.localStorage.setItem('bgd_access_token', data.accessToken);
                  window.localStorage.setItem('bgd_refresh_token', data.refreshToken);
                  window.location.href = '/admin/dashboard';
                }
              });
          }}
        >
          <label>
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              required
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <button type="submit" className="button primary w-full">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
