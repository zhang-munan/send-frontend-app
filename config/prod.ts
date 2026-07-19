import { get } from "@/.cool";
import { proxy } from "./proxy";

export const prod = () => {
	let host: string;
	let baseUrl: string;

	// #ifdef H5
	// H5 始终使用当前访问域名，交给容器 Nginx 把 /api 转发到后端。
	host = window.location.origin;
	baseUrl = "/api";
	// #endif

	// #ifndef H5
	host = get(proxy, `prod.target`) as string;
	baseUrl = host + "/api";
	// #endif

	return {
		host,
		baseUrl
	};
};
