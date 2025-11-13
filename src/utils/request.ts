type RequestOptions = {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    body?: Record<string, any>;
    params?: Record<string, any>;
    headers?: Record<string, string>;
};

export async function request<T>({ method, url, body, params, headers }: RequestOptions): Promise<T> {
    // Build query string from params
    const queryString = params
        ? '?' +
        Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&')
        : '';


    const fullUrl = `${url}${queryString}`;
    console.log('Request URL:', fullUrl);
    


    const response = await fetch(fullUrl, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers, // Cookie sẽ được truyền qua đây
        },
        body: body ? JSON.stringify(body) : undefined,
    });


    if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || 'Request failed');
    }
    const data = await response.json()


    return data;
}