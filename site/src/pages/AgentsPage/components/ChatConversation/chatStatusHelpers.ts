import type * as TypesGen from "#/api/typesGenerated";

const PROVIDER_STATUS_URLS: Record<string, string> = {
	anthropic: "https://status.anthropic.com",
};

const normalizeProvider = (provider?: string): string | undefined => {
	const normalized = provider?.trim().toLowerCase();
	if (!normalized) {
		return undefined;
	}

	switch (normalized) {
		case "azure openai":
		case "azure-openai":
			return "azure";
		case "openai compat":
		case "openai compatible":
		case "openai_compat":
			return "openai-compat";
		default:
			return normalized;
	}
};

export const getErrorTitle = (
	kind: TypesGen.ChatErrorKind,
	mode: "retry" | "error",
): string => {
	switch (kind) {
		case "overloaded":
			return "服务过载";
		case "rate_limit":
			return "请求频率限制";
		case "timeout":
			return "请求超时";
		case "stream_silence_timeout":
			return "响应停滞";
		case "auth":
			return "身份验证失败";
		case "config":
			return "配置错误";
		case "usage_limit":
			return "用量限额已达";
		case "missing_key":
			return "对话中断";
		case "provider_disabled":
			return "提供商已禁用";
		default:
			return mode === "retry" ? "正在重试请求" : "请求失败";
	}
};

export const getProviderStatusURL = (
	kind: TypesGen.ChatErrorKind,
	provider?: string,
): string | undefined => {
	if (kind !== "overloaded") {
		return undefined;
	}
	const normalized = normalizeProvider(provider);
	return normalized ? PROVIDER_STATUS_URLS[normalized] : undefined;
};
