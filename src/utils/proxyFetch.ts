const PROXY_BASE = 'https://api.allorigins.win/raw?url=';

export async function proxyFetch(url: string, init?: RequestInit) {
  const endpoint = `${PROXY_BASE}${encodeURIComponent(url)}`;
  const response = await fetch(endpoint, init);
  if (!response.ok) {
    throw new Error(`Proxy fetch failed: ${response.status} ${response.statusText}`);
  }
  return response;
}
