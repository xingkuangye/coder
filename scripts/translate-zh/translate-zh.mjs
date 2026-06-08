#!/usr/bin/env node
// translate-zh.mjs — translate Coder webui user-facing English to Simplified Chinese
// Uses DeepSeek v4-pro. Writes in-place. Validates output, retries on bad output.

import { readFile, writeFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, sep } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_KEY = process.env.DEEPSEEK_API_KEY || "sk-79e4afee983949f8a2cb073a20695171";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";
const API_URL = process.env.DEEPSEEK_URL || "https://api.deepseek.com/v1/chat/completions";
const SITE_SRC = process.env.SITE_SRC || "E:/coder/site/src";
const CONCURRENCY = Number(process.env.CONCURRENCY || 100);
const MAX_RETRIES = Number(process.env.MAX_RETRIES || 3);
const MAX_FILE_BYTES = Number(process.env.MAX_FILE_BYTES || 200_000);
const DRY_RUN = process.env.DRY_RUN === "1";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
const SKIP_IF_NO_ENGLISH = process.env.SKIP_IF_NO_ENGLISH !== "0";

const SYSTEM_PROMPT = `You are a precise code translator. Your single job: take a TypeScript or TSX source file and return the same file with all user-facing English text translated to Simplified Chinese (简体中文, zh-CN).

CRITICAL RULES — violating any of these breaks the build:

1. Translate ONLY user-facing English text. This includes:
   - JSX text content (text between tags, NOT in attributes)
   - String literals displayed to end users (toast messages, error messages, alerts, dialog text, button labels, tooltips, placeholders, aria-labels, title text)
   - User-visible comments at the top of files (file header / @file docblocks) — translate them too
   - Enum or constant values that are displayed to users (translate the VALUE, keep the key)
   - Schema or form labels and helper text (translate the text, keep field names)

2. DO NOT translate ANY of the following — leave them EXACTLY as-is, character-for-character:
   - Variable names, function names, type names, interface names, class names
   - Import statements (import paths, package names, side-effect imports)
   - Export names, default exports
   - CSS class names, Tailwind class names, inline style values
   - Enum keys, object keys, string keys used as identifiers (e.g. status: "running")
   - API endpoint paths, route names, URL paths, file paths
   - URLs, hostnames, email addresses, regex patterns
   - Numeric literals, boolean literals
   - JSON keys, config keys
   - Code-internal comments (// or /* */) — keep these in English; do NOT translate them
   - Test descriptions, expect() messages, storybook story names — keep in English
   - i18n keys, translation keys (e.g. t("workspace.list.title")) — DO NOT translate the key
   - Logged strings, debugging strings that won't be shown to users
   - Anything inside backticks that looks like code, file paths, or technical identifiers

3. PRESERVE all code structure exactly:
   - All imports, exports, types, interfaces, generics
   - All function signatures, class definitions, JSX attributes
   - All whitespace, indentation, line breaks, semicolons
   - All template-literal structure (only translate the visible parts, not the placeholders)
   - File encoding: output must be valid UTF-8
   - Trailing newline: keep the file's final newline EXACTLY as it was in the input. If the input ends with \\n, output must end with \\n. If the input has no trailing newline, output must also have no trailing newline.

4. Output format:
   - Return ONLY the complete translated file content
   - Do NOT wrap in markdown code fences
   - Do NOT add any explanation, prefix, suffix, or commentary
   - NEVER truncate the file — output MUST be the complete file from first character to last
   - If a file has no user-facing English text, return it unchanged

INTERPOLATION HANDLING:
- In JSX: <div>Hello, {name}!</div> → <div>你好，{name}！</div>  (keep {name} intact)
- In strings: \`Hello, \${name}!\` → \`你好，\${name}!\`
- In strings with React i18n: t("Workspace") → keep as t("Workspace") (don't translate keys)

CHINESE STYLE:
- Use Simplified Chinese, mainland conventions
- Keep technical proper nouns (GitHub, React, API, JSON, URL, etc.) in English
- Use natural Chinese phrasing, not word-for-word translation
- For very short labels, prefer concise equivalents`;

function buildUserPrompt(filePath, content) {
	return `File path: ${filePath}
File length: ${content.length} bytes
Has trailing newline: ${content.endsWith("\n")}

Translate the following file per the rules above. Return the complete translated file content (NO truncation, NO code fences, NO commentary):

\`\`\`
${content}
\`\`\``;
}

async function* walk(dir) {
	const { readdir } = await import("node:fs/promises");
	const entries = await readdir(dir, { withFileTypes: true });
	for (const e of entries) {
		const full = join(dir, e.name);
		if (e.isDirectory()) yield* walk(full);
		else yield full;
	}
}

const SKIP_PATTERNS = [
	/\.test\.(ts|tsx)$/,
	/\.stories\.(ts|tsx)$/,
	/__mocks__/,
	/[/\\]@types[/\\]/,
	/typesGenerated/,
	/\.d\.ts$/,
];

function isTranslatable(file) {
	const rel = relative(SITE_SRC, file).split(sep).join("/");
	if (ONLY && !ONLY.some((p) => rel === p || rel.endsWith("/" + p))) return false;
	if (ONLY) return true;
	if (!/\.(ts|tsx)$/.test(file)) return false;
	for (const p of SKIP_PATTERNS) if (p.test(file)) return false;
	return true;
}

const ENGLISH_HINT = /[A-Za-z]{4,}/;
function looksLikeHasEnglishText(content) {
	if (content.length < 200) return false;
	if (!ENGLISH_HINT.test(content)) return false;
	const textChars = (content.match(/[A-Za-z ]{6,}/g) || []).length;
	return textChars > 2;
}

async function translateOnce(filePath, content, attempt = 0) {
	const body = {
		model: MODEL,
		messages: [
			{ role: "system", content: SYSTEM_PROMPT },
			{ role: "user", content: buildUserPrompt(filePath, content) },
		],
		temperature: 0.1,
		max_tokens: Number(process.env.MAX_TOKENS || 32768),
		stream: false,
	};
	const ctrl = new AbortController();
	const timeoutMs = Number(process.env.TIMEOUT_MS || 600_000);
	const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(API_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
			body: JSON.stringify(body),
			signal: ctrl.signal,
		});
		if (!res.ok) {
			const txt = await res.text();
			throw new Error(`HTTP ${res.status}: ${txt.slice(0, 300)}`);
		}
		const data = await res.json();
		const out = data?.choices?.[0]?.message?.content;
		if (typeof out !== "string") throw new Error("No content in response");
		if (data.choices[0].finish_reason === "length") {
			throw new Error("Output truncated: finish_reason=length (hit max_tokens)");
		}
		return out;
	} catch (err) {
		if (attempt < MAX_RETRIES) {
			const wait = 2000 * (attempt + 1);
			await new Promise((r) => setTimeout(r, wait));
			return translateOnce(filePath, content, attempt + 1);
		}
		throw err;
	} finally {
		clearTimeout(timeout);
	}
}

function stripCodeFences(s) {
	const m = s.match(/^```[a-zA-Z]*\n([\s\S]*?)\n?```\s*$/);
	return m ? m[1] : s;
}

function fixTrailingNewline(content, original) {
	const origHad = original.endsWith("\n");
	const outHas = content.endsWith("\n");
	if (origHad && !outHas) return content + "\n";
	if (!origHad && outHas) return content.replace(/\n+$/, "");
	return content;
}

function stripStrayFences(content, original) {
	// If original had no ``` but translated does, strip the stray lines
	if (original.includes("```")) return content;
	return content.replace(/^```[a-zA-Z]*\n/gm, "").replace(/\n?```\s*$/m, "");
}

function validateOutput(content, original) {
	// 1. Length: translated must be at least 50% of original
	if (content.length < original.length * 0.5) {
		return `too short: ${content.length} < ${original.length}*0.5`;
	}
	// 2. Bracket balance
	const o = (content.match(/[\{\[\(]/g) || []).length;
	const c = (content.match(/[\}\]\)]/g) || []).length;
	if (Math.abs(o - c) > 5) return `unbalanced: ${o} open vs ${c} close`;
	// 3. Has import statement (key code structure check)
	if (/^import\s/m.test(original) && !/^import\s/m.test(content)) {
		return "missing imports";
	}
	// 4. Has export default if original did
	if (/export\s+default\s/m.test(original) && !/export\s+default\s/m.test(content)) {
		return "missing export default";
	}
	return null;
}

async function processOne(file) {
	const rel = relative(SITE_SRC, file);
	const st = await stat(file);
	if (st.size > MAX_FILE_BYTES) return { file: rel, status: "skip", reason: `too large (${st.size}B)` };
	const content = await readFile(file, "utf-8");
	if (SKIP_IF_NO_ENGLISH && !looksLikeHasEnglishText(content)) {
		return { file: rel, status: "skip", reason: "no english text" };
	}
	const t0 = Date.now();
	let raw, out, validationErr;
	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			raw = await translateOnce(file, content, 0);
		} catch (err) {
			if (attempt === MAX_RETRIES) return { file: rel, status: "error", error: String(err.message || err) };
			continue;
		}
		out = stripCodeFences(raw);
		out = stripStrayFences(out, content);
		out = fixTrailingNewline(out, content);
		validationErr = validateOutput(out, content);
		if (!validationErr) break;
		if (attempt === MAX_RETRIES) {
			return { file: rel, status: "error", error: `validation failed after ${MAX_RETRIES + 1} attempts: ${validationErr}` };
		}
	}
	const ms = Date.now() - t0;
	if (DRY_RUN) {
		const { mkdir } = await import("node:fs/promises");
		await mkdir(join(__dirname, "logs"), { recursive: true });
		const preview = join(__dirname, "logs", "preview_" + rel.replace(/[\\/]/g, "__") + ".diff.txt");
		await writeFile(preview, "--- ORIGINAL ---\n" + content + "\n\n--- TRANSLATED ---\n" + out, "utf-8");
		return { file: rel, status: "dry", len: out.length, original: content.length, ms, preview };
	}
	await writeFile(file, out, "utf-8");
	return { file: rel, status: "ok", len: out.length, original: content.length, ms };
}

async function runPool(files) {
	const queue = files.slice();
	const results = [];
	const inflight = new Set();
	const logEvery = 25;
	let done = 0;
	const t0 = Date.now();
	while (queue.length > 0 || inflight.size > 0) {
		while (inflight.size < CONCURRENCY && queue.length > 0) {
			const f = queue.shift();
			const p = processOne(f).then((r) => {
				inflight.delete(p);
				results.push(r);
				done += 1;
				if (done % logEvery === 0 || r.status === "error") {
					const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
					const rate = (done / (elapsed || 1)).toFixed(2);
					const remain = ((queue.length + inflight.size) / (rate || 1)).toFixed(0);
					process.stdout.write(
						`[${done}/${files.length}] ${r.status.padEnd(5)} ${r.file}  ` +
							`(${elapsed}s, ${rate}/s, ~${remain}s left)\n`,
					);
				}
				return r;
			});
			inflight.add(p);
		}
		if (inflight.size > 0) await Promise.race(inflight);
	}
	return results;
}

async function main() {
	console.log(`[config] model=${MODEL} concurrency=${CONCURRENCY} src=${SITE_SRC}`);
	console.log(`[config] max_file_bytes=${MAX_FILE_BYTES} max_retries=${MAX_RETRIES} dry_run=${DRY_RUN}`);
	const allFiles = [];
	for await (const f of walk(SITE_SRC)) {
		if (isTranslatable(f)) allFiles.push(f);
	}
	console.log(`[scan] ${allFiles.length} translatable files`);
	const results = await runPool(allFiles);
	const stats = results.reduce((acc, r) => {
		acc[r.status] = (acc[r.status] || 0) + 1;
		return acc;
	}, {});
	console.log(`[done] status distribution:`, stats);
	const errs = results.filter((r) => r.status === "error");
	if (errs.length > 0) {
		console.log(`[errors] first 20:`);
		for (const e of errs.slice(0, 20)) console.log(`  - ${e.file}: ${e.error}`);
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
