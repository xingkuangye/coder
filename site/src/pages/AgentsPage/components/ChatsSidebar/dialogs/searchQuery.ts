// 后端的搜索查询解析器在遇到每个 `"` 时切换其引号状态，且不支持反斜杠转义，因此在此处转义引号会产生后端无法解析的查询。从纯文本中移除引号可确保最终的 `title:"..."` 筛选器格式正确，以便后端处理。
const sanitizeChatSearchValue = (value: string): string => {
	return value.replaceAll('"', "");
};

// Filter keys that may pass through to the backend unchanged. `title` is not
// listed here because bare text and `title:` filters are merged into a single
// title filter; see the title-handling branch in normalizeChatSearchInput.
const passthroughChatSearchFilterKeys = new Set([
	"archived",
	"diff_url",
	"has_unread",
	"pr_status",
]);

const splitSearchInput = (input: string): string[] => {
	const tokens: string[] = [];
	let token = "";
	let quoted = false;

	for (const character of input) {
		if (character === '"') {
			quoted = !quoted;
		}

		if (/\s/.test(character) && !quoted) {
			if (token !== "") {
				tokens.push(token);
				token = "";
			}
			continue;
		}

		token += character;
	}

	if (token !== "") {
		tokens.push(token);
	}

	return tokens;
};

const getKeyValueDelimiterIndex = (token: string): number | undefined => {
	let quoted = false;

	for (const [index, character] of [...token].entries()) {
		if (character === '"') {
			quoted = !quoted;
		}

		if (character === ":" && !quoted) {
			return index;
		}
	}

	return undefined;
};

const getKeyValuePair = (
	token: string,
): { key: string; value: string } | undefined => {
	const delimiterIndex = getKeyValueDelimiterIndex(token);
	if (
		delimiterIndex === undefined ||
		delimiterIndex === 0 ||
		delimiterIndex === token.length - 1
	) {
		return undefined;
	}

	return {
		key: token.slice(0, delimiterIndex).replaceAll('"', "").toLowerCase(),
		value: token.slice(delimiterIndex + 1).replace(/^"|"$/g, ""),
	};
};

/**
 * 将原始搜索输入规范化为聊天搜索 API 可接受的查询字符串。
 *
 * 纯文本和 `title:` 过滤器被合并为一个 `title:"..."` 过滤器（后端不允许同一参数出现多次）。
 * 已知的 `key:value` 过滤器会原样传递。
 */
export const normalizeChatSearchInput = (
	rawInput: string,
): string | undefined => {
	const trimmedInput = rawInput.trim();
	if (trimmedInput === "") {
		return undefined;
	}

	const tokens = splitSearchInput(trimmedInput);
	const keyValuePairs: string[] = [];
	const titleTerms: string[] = [];
	let hasBareTitleText = false;

	for (const token of tokens) {
		const keyValuePair = getKeyValuePair(token);
		if (!keyValuePair) {
			titleTerms.push(token);
			hasBareTitleText = true;
			continue;
		}

		if (keyValuePair.key === "title") {
			titleTerms.push(keyValuePair.value);
			continue;
		}

		if (!passthroughChatSearchFilterKeys.has(keyValuePair.key)) {
			titleTerms.push(token);
			hasBareTitleText = true;
			continue;
		}

		keyValuePairs.push(token);
	}

	// Multiple title values must be merged into a single title filter because
	// the backend's query parser rejects the same key appearing more than once.
	if (titleTerms.length > 1) {
		hasBareTitleText = true;
	}

	if (!hasBareTitleText) {
		return trimmedInput;
	}

	return [
		...keyValuePairs,
		`title:"${sanitizeChatSearchValue(titleTerms.join(" "))}"`,
	].join(" ");
};
