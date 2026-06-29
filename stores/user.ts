import type { LoginToken, UserInfo } from "@/api/user";
import { getPerson, loginByMiniPhone, loginByPhone } from "@/api/user";
import { useStore } from "@/.cool";

export function useUserStore() {
	const { user } = useStore();

	function saveToken(data: LoginToken) {
		user.setToken(data);
	}

	function setUserInfo(info: UserInfo | null) {
		if (info) {
			user.set(info);
		} else {
			user.remove();
		}
	}

	async function fetchUserInfo() {
		if (!user.token) {
			return null;
		}

		const info = await getPerson();
		setUserInfo(info);
		return info;
	}

	async function phoneLogin(phone: string, smsCode: string) {
		const data = await loginByPhone(phone, smsCode);
		saveToken(data);
		await fetchUserInfo();
	}

	async function miniPhoneLogin(payload: { code: string; encryptedData: string; iv: string }) {
		const data = await loginByMiniPhone(payload);
		saveToken(data);
		await fetchUserInfo();
	}

	function logout() {
		user.clear();
	}

	return {
		get token() {
			return user.token || "";
		},
		get refreshToken() {
			return "";
		},
		get userInfo() {
			return (user.info.value as UserInfo | null) || null;
		},
		get isLogin() {
			return !!user.token;
		},
		saveToken,
		setUserInfo,
		fetchUserInfo,
		phoneLogin,
		miniPhoneLogin,
		logout
	};
}
