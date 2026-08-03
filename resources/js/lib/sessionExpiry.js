export const SESSION_EXPIRED_EVENT = 'session:expired';

export function emitSessionExpired() {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

export async function refreshCsrfCookie() {
    await window.axios.get('/sanctum/csrf-cookie');
}

export function installAxiosSessionExpiryInterceptor(axiosInstance = window.axios) {
    if (!axiosInstance || axiosInstance.__sessionExpiryInterceptorInstalled) {
        return;
    }

    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const { response, config } = error;

            if (!response || response.status !== 419 || !config) {
                return Promise.reject(error);
            }

            if (config._retryAfterCsrfRefresh) {
                emitSessionExpired();
                return Promise.reject(error);
            }

            config._retryAfterCsrfRefresh = true;

            try {
                await refreshCsrfCookie();

                if (config.headers) {
                    delete config.headers['X-XSRF-TOKEN'];
                    delete config.headers['X-CSRF-TOKEN'];
                    delete config.headers['x-xsrf-token'];
                    delete config.headers['x-csrf-token'];
                }

                return axiosInstance.request(config);
            } catch {
                emitSessionExpired();
                return Promise.reject(error);
            }
        },
    );

    axiosInstance.__sessionExpiryInterceptorInstalled = true;
}
