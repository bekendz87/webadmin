type RequestOptions = {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    body?: Record<string, any>;
    params?: Record<string, any>;
    headers?: Record<string, string>;
    cache?: boolean; // Add cache support
};

export async function request<T>({ method, url, body, params, headers, cache }: RequestOptions): Promise<T> {
    // Build query string from params
    const queryString = params
        ? '?' +
        Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&')
        : '';

    // Handle both relative and absolute URLs
    const fullUrl = url.startsWith('http') ? `${url}${queryString}` : `${url}${queryString}`;
    console.log('Request URL:', fullUrl);
    
    const fetchOptions: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers, // Cookie sẽ được truyền qua đây
        },
        body: body ? JSON.stringify(body) : undefined,
    };

    // Add cache control if specified
    if (cache === false) {
        fetchOptions.cache = 'no-cache';
    }

    const response = await fetch(fullUrl, fetchOptions);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }
    
    const data = await response.json();
    return data;
}