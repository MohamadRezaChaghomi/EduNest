let refreshPromise = null;

export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => {
      if (!res.ok) throw new Error('Refresh failed');
      return res.json();
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}