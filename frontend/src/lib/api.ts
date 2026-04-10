import { browser } from "$app/environment";

const devApi = "http://localhost:8787";

export function getApiUrl(path: string, origin?: string) {
    if (browser) {
        // In browser, use the SvelteKit origin (handled by Vite proxy in dev)
        return path;
    }
    
    // Server-side
    const isDev = process.env.NODE_ENV === "development";
    const apiBase = isDev ? devApi : (origin || "");
    
    return `${apiBase}${path}`;
}
