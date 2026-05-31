const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export async function fetchApi(path) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  console.log("url", url);
  
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    return null;
  }
  return response.json();
}
