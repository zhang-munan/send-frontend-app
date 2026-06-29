import { config } from "@/config";
import { request as coolRequest, storage, useStore } from "@/.cool";

export const STORAGE_KEY = {
	TOKEN: "token",
	REFRESH_TOKEN: "refreshToken",
	USER_INFO: "userInfo"
} as const;

export interface ApiResult<T = any> {
	code: number;
	message: string;
	data: T;
}

export interface RequestOptions {
	url: string;
	method?: "GET" | "POST" | "PUT" | "DELETE";
	data?: Record<string, any>;
	header?: Record<string, string>;
	auth?: boolean;
	refresh?: boolean;
	silent?: boolean;
}

export function getToken(): string {
	return (storage.get(STORAGE_KEY.TOKEN) as string | null) || "";
}

export function getRefreshToken(): string {
	return (storage.get(STORAGE_KEY.REFRESH_TOKEN) as string | null) || "";
}

export function setToken(token: string, refreshToken?: string): void {
	storage.set(STORAGE_KEY.TOKEN, token, 0);

	if (refreshToken !== undefined) {
		storage.set(STORAGE_KEY.REFRESH_TOKEN, refreshToken, 0);
	}

	const { user } = useStore();
	user.token = token;
}

export function clearToken(): void {
	const { user } = useStore();
	user.clear();
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
	return coolRequest({
		url: options.url,
		method: options.method,
		data: options.data,
		header: options.header
	}) as Promise<T>;
}

export function get<T = any>(
	url: string,
	data?: Record<string, any>,
	options?: Partial<RequestOptions>
) {
	return request<T>({ url, method: "GET", data, ...options });
}

export function post<T = any>(
	url: string,
	data?: Record<string, any>,
	options?: Partial<RequestOptions>
) {
	return request<T>({ url, method: "POST", data, ...options });
}

export function getBaseUrl() {
	return config.baseUrl;
}
