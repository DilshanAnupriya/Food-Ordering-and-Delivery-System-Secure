/**
 * Global authentication wiring for outgoing HTTP requests.
 *
 * Fix supporting V-AuthWeakness Test 1 (gateway now requires a valid JWT):
 * previously the app only attached the Authorization header in a handful of
 * places, so once the gateway started enforcing authentication most requests
 * would fail with 401. This module attaches the stored JWT to every request to
 * the API - for BOTH axios (default instance) and the native fetch() API - so
 * logged-in flows keep working. Anonymous requests (no token) simply send no
 * header and rely on the gateway's public allowlist.
 */
import axios, { AxiosInstance } from 'axios';

const API_HOST = 'localhost:8082';

/** Read the stored token and strip any leading "Bearer " so we never double it. */
function getBearerToken(): string | null {
    try {
        const raw = localStorage.getItem('token');
        if (!raw) return null;
        return raw.replace(/^Bearer\s+/i, '');
    } catch {
        return null;
    }
}

/** Only attach the token to our own API (relative URLs or the gateway host). */
function targetsApi(url?: string): boolean {
    if (!url) return true; // relative/unknown -> treat as same-origin API
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url.includes(API_HOST);
    }
    return true; // relative URL
}

/** Attach the auth interceptor to a given axios instance (default or custom). */
export function attachAuthInterceptor(instance: AxiosInstance): void {
    instance.interceptors.request.use((config) => {
        const token = getBearerToken();
        const fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
        if (token && targetsApi(fullUrl)) {
            config.headers = config.headers ?? {};
            (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
        return config;
    });
}

// Cover every call made through the default axios instance.
attachAuthInterceptor(axios);

// Cover every call made through the native fetch() API.
const originalFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
        const token = getBearerToken();
        if (token) {
            let url = '';
            if (typeof input === 'string') url = input;
            else if (input instanceof URL) url = input.toString();
            else if (input instanceof Request) url = input.url;

            if (targetsApi(url)) {
                const headers = new Headers(
                    init?.headers ?? (input instanceof Request ? input.headers : undefined)
                );
                if (!headers.has('Authorization')) {
                    headers.set('Authorization', `Bearer ${token}`);
                    init = { ...init, headers };
                }
            }
        }
    } catch {
        // If anything goes wrong, fall through to the original fetch unchanged.
    }
    return originalFetch(input as RequestInfo, init);
};
