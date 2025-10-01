import type { paths } from './schema';

// Options for the HTTP request
interface HttpOptions<P extends keyof paths, M extends keyof paths[P]> {
    method: M extends string ? M : never;
    body?: any;
    params?: Record<string, string>;
    headers?: Record<string, string>;
}

// Type-safe HTTP client function with logging
export default async function http<P extends keyof paths, M extends keyof paths[P]>(
    path: P,
    options: HttpOptions<P, M>
): Promise<any> {
    const { method, body, params, headers } = options;

    let url = path as string;

    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    console.log(`[HTTP] Request: ${method} ${url}`);
    try {
        const response = await fetch(import.meta.env.VITE_BACKEND_SERVICE + url, {
            method: method as string,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        console.log(`[HTTP] Response status: ${response.status}`);

        const data = await response.json().catch(() => null);
        console.log('[HTTP] Response data:', data);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        return data;
    } catch (err) {
        console.error('[HTTP] Request failed:', err);
        throw err;
    }
}
