const PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://thingproxy.freeboard.io/fetch/',
];

function timeoutFetch(resource: string, init?: RequestInit, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(resource, { ...init, signal: controller.signal }).finally(() => clearTimeout(id));
}

export async function proxyFetch(url: string, init?: RequestInit) {
  let lastError: Error | null = null;

  for (const base of PROXIES) {
    const endpoint = `${base}${encodeURIComponent(url)}`;
    try {
      const response = await timeoutFetch(endpoint, init, 8000);
      if (response.ok) return response;
      lastError = new Error(`Proxy ${base} returned ${response.status} ${response.statusText}`);
      // try next proxy
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // try next proxy
    }
  }

  throw new Error(`Proxy fetch failed: ${lastError?.message ?? 'no proxy available'}`);
}
