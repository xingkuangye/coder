/**
 * 读取一个值作为非空字符串，对于空字符串、null 或 undefined 值返回 undefined。
 */
export function readOptionalString(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed || undefined;
}

/**
 * 规范化提供者名称以进行不区分大小写的比较。
 */
export function normalizeProvider(provider: string): string {
	return provider.trim().toLowerCase();
}

const canonicalProviderBaseURLs: Record<string, string> = {
	anthropic: "https://api.anthropic.com",
	google: "https://generativelanguage.googleapis.com/v1beta",
	openai: "https://api.openai.com/v1",
	openrouter: "https://openrouter.ai/api/v1",
	vercel: "https://ai-gateway.vercel.sh/v1",
};

export function getDefaultProviderBaseURL(provider: string): string {
	return canonicalProviderBaseURLs[normalizeProvider(provider)] ?? "";
}

export function getProviderBaseURLPlaceholder(provider: string): string {
	switch (normalizeProvider(provider)) {
		case "azure":
			return "https://<资源名称>.openai.azure.com";
		case "bedrock":
			return "https://bedrock-runtime.<区域>.amazonaws.com";
		case "openai-compat":
			return "https://api.example.com/v1";
		default:
			return getDefaultProviderBaseURL(provider) || "https://api.example.com";
	}
}
