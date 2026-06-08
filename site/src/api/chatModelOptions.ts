import schema from "./chatModelOptionsGenerated.json";

/**
 * 描述一个聊天模型提供商的单个可配置字段。
 * 通过 `scripts/modeloptionsgen` 从 Go 结构体标签生成。
 */
export interface FieldSchema {
	/** API 载荷中使用的 JSON 键（可使用点号表示法表示嵌套字段）。 */
	json_name: string;
	/** 对应的 Go 结构体字段名称。 */
	go_name: string;
	/** 该字段的 JSON Schema 类型。 */
	type: "string" | "integer" | "number" | "boolean" | "array" | "object";
	/** 字段的人类可读描述。某些字段可能没有。 */
	description?: string;
	/** 可选的显示标签覆盖。如果未提供，则从 json_name 推导。 */
	label?: string;
	/** 配置提供商时该字段是否为必填项。 */
	required: boolean;
	/** 前端应如何渲染输入控件的提示。 */
	input_type: "input" | "select" | "json";
	/** 如果存在，字段值必须为这些选项之一。 */
	enum?: string[];
	/** 如果为 true，则不应在管理界面表单中渲染该字段。 */
	hidden?: boolean;
}

/**
 * 属于单个提供商或通用部分的字段组。
 */
export interface ProviderSchema {
	fields: FieldSchema[];
}

/**
 * 描述所有可配置聊天模型选项的顶层模式。
 *
 * - `general` 包含与提供商无关的字段（例如 temperature）。
 * - `providers` 将规范的提供商名称映射到其特定字段。
 * - `provider_aliases` 将替代名称映射到规范的提供商名称
 *   （例如 "azure" → "openai"）。
 */
export interface ModelOptionsSchema {
	general: ProviderSchema;
	providers: Record<string, ProviderSchema>;
	provider_aliases: Record<string, string>;
}

/** 导入的模式，类型为 {@link ModelOptionsSchema}。 */
export const modelOptionsSchema: ModelOptionsSchema =
	schema as ModelOptionsSchema;

const syntheticGeneralFields: FieldSchema[] = [
	{
		json_name: "cost.input_price_per_million_tokens",
		go_name: "Cost.InputPricePerMillionTokens",
		type: "number",
		description: "输入 token 价格（美元/百万 token）",
		required: false,
		input_type: "input",
	},
	{
		json_name: "cost.output_price_per_million_tokens",
		go_name: "Cost.OutputPricePerMillionTokens",
		type: "number",
		description: "输出 token 价格（美元/百万 token）",
		required: false,
		input_type: "input",
	},
	{
		json_name: "cost.cache_read_price_per_million_tokens",
		go_name: "Cost.CacheReadPricePerMillionTokens",
		type: "number",
		description: "缓存读取 token 价格（美元/百万 token）",
		required: false,
		input_type: "input",
	},
	{
		json_name: "cost.cache_write_price_per_million_tokens",
		go_name: "Cost.CacheWritePricePerMillionTokens",
		type: "number",
		description:
			"缓存写入或缓存创建 token 价格（美元/百万 token）",
		required: false,
		input_type: "input",
	},
];

/**
 * 获取通用（与提供商无关）字段，例如 temperature 和 max_output_tokens。
 */
export function getGeneralFields(): FieldSchema[] {
	const fields = [...modelOptionsSchema.general.fields];
	for (const field of syntheticGeneralFields) {
		if (!fields.some((existing) => existing.json_name === field.json_name)) {
			fields.push(field);
		}
	}
	return fields;
}

/**
 * 获取给定提供商的提供商特定字段。
 * 处理别名（例如 "azure" → "openai"，"bedrock" → "anthropic"）。
 * 对于未知提供商，返回空数组。
 */
export function getProviderFields(provider: string): FieldSchema[] {
	const resolved = resolveProvider(provider);
	return modelOptionsSchema.providers[resolved]?.fields ?? [];
}

/**
 * 通过别名表解析提供商名称。
 * 如果名称是别名，则返回规范的提供商；
 * 否则原样返回原始名称。
 *
 * @example
 * resolveProvider("azure")   // "openai"
 * resolveProvider("bedrock") // "anthropic"
 * resolveProvider("openai")  // "openai"
 */
export function resolveProvider(provider: string): string {
	return modelOptionsSchema.provider_aliases[provider] ?? provider;
}

/**
 * 获取所有规范提供商名称（不包括别名）。
 * 顺序与 JSON 模式一致，且不保证在重新生成时保持稳定。
 */
export function getProviderNames(): string[] {
	return Object.keys(modelOptionsSchema.providers);
}

/**
 * 检查提供商是否已知，无论是作为规范名称还是别名。
 */
export function isKnownProvider(provider: string): boolean {
	const resolved = resolveProvider(provider);
	return resolved in modelOptionsSchema.providers;
}

/**
 * 将 snake_case 段转换为 camelCase。
 * 仅将每个下划线后的第一个字符大写；
 * 前导字符保持小写。
 */
export function snakeToCamel(s: string): string {
	return s.replace(/_([a-z0-9])/g, (_, ch: string) => ch.toUpperCase());
}

/**
 * 将点号表示法的 `json_name` 转换为给定提供商下的表单字段键。
 * 每个由点分隔的段都从 snake_case 转换为 camelCase 并用点重新连接，
 * 然后再加上提供商名称作为前缀。
 *
 * 这在 JSON 模式（snake_case、扁平的 `json_name`）和
 * 典型的 React 表单状态树（camelCase、点分隔路径）之间架起了桥梁。
 *
 * @example
 * toFormFieldKey("anthropic", "thinking.budget_tokens")
 * // "anthropic.thinking.budgetTokens"
 *
 * toFormFieldKey("openai", "max_completion_tokens")
 * // "openai.maxCompletionTokens"
 */
export function toFormFieldKey(provider: string, jsonName: string): string {
	const camelSegments = jsonName.split(".").map(snakeToCamel);
	return `${provider}.${camelSegments.join(".")}`;
}

/** 仅获取提供商的可见（非隐藏）字段。 */
export function getVisibleProviderFields(provider: string): FieldSchema[] {
	return getProviderFields(provider).filter((f) => !f.hidden);
}

/** 仅获取通用可见（非隐藏）字段。 */
export function getVisibleGeneralFields(): FieldSchema[] {
	return getGeneralFields().filter((f) => !f.hidden);
}
