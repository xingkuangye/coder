import type { ChangeTypes } from "@pierre/diffs";

/** 将差异更改类型映射到 Tailwind 文本颜色类。 */
export function changeColor(type?: ChangeTypes): string | undefined {
	switch (type) {
		case "new":
			return "text-git-added";
		case "deleted":
			return "text-git-deleted";
		case "rename-pure":
		case "rename-changed":
			return "text-git-modified";
		case "change":
			return "text-git-modified";
		default:
			return undefined;
	}
}

/** 文件名后显示的简短字母，与 VS Code 风格一致。 */
export function changeLabel(type: ChangeTypes): string {
	switch (type) {
		case "new":
			return "A";
		case "deleted":
			return "D";
		case "rename-pure":
		case "rename-changed":
			return "R";
		case "change":
			return "M";
		default:
			return "";
	}
}
