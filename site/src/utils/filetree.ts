import get from "lodash/get";
import has from "lodash/has";
import set from "lodash/set";
import unset from "lodash/unset";

export type FileTree = {
	[key: string]: FileTree | string;
};

export const createFile = (
	path: string,
	fileTree: FileTree,
	value: string,
): FileTree => {
	if (existsFile(path, fileTree)) {
		throw new Error(`文件 ${path} 已存在`);
	}
	const pathError = validatePath(path, fileTree);
	if (pathError) {
		throw new Error(pathError);
	}

	const updatedFileTree = structuredClone(fileTree);
	return set(updatedFileTree, path.split("/"), value);
};

export const validatePath = (
	path: string,
	fileTree: FileTree,
): string | undefined => {
	const paths = path.split("/");
	paths.pop(); // The last item is the filename
	for (let i = 0; i <= paths.length; i++) {
		const path = paths.slice(0, i + 1);
		const pathStr = path.join("/");
		if (existsFile(pathStr, fileTree) && !isFolder(pathStr, fileTree)) {
			return `路径无效。路径 ${path} 不是一个文件夹`;
		}
	}
};

export const updateFile = (
	path: string,
	content: FileTree | string,
	fileTree: FileTree,
): FileTree => {
	const updatedFileTree = structuredClone(fileTree);
	return set(updatedFileTree, path.split("/"), content);
};

export const existsFile = (path: string, fileTree: FileTree) => {
	return has(fileTree, path.split("/"));
};

export const removeFile = (path: string, fileTree: FileTree) => {
	const updatedFileTree = structuredClone(fileTree);
	unset(updatedFileTree, path.split("/"));
	return updatedFileTree;
};

export const moveFile = (
	currentPath: string,
	newPath: string,
	fileTree: FileTree,
) => {
	const content = getFileContent(currentPath, fileTree);
	if (typeof content !== "string") {
		throw new Error("不允许移动文件夹");
	}
	fileTree = removeFile(currentPath, fileTree);
	fileTree = createFile(newPath, fileTree, content);
	return fileTree;
};

export const getFileContent = (path: string, fileTree: FileTree) => {
	return get(fileTree, path.split("/")) as string | FileTree;
};

export const getFileText = (path: string, fileTree: FileTree) => {
	const content = getFileContent(path, fileTree);
	if (typeof content !== "string") {
		throw new Error("文件不是文本文件");
	}
	return content;
};

export const isFolder = (path: string, fileTree: FileTree) => {
	const content = getFileContent(path, fileTree);
	return typeof content === "object";
};

export const traverse = (
	fileTree: FileTree,
	callback: (
		content: FileTree | string,
		filename: string,
		fullPath: string,
	) => void,
	parent?: string,
) => {
	for (const [filename, content] of Object.entries(fileTree).sort(([a], [b]) =>
		a.localeCompare(b),
	)) {
		const fullPath = parent ? `${parent}/${filename}` : filename;
		callback(content, filename, fullPath);
		if (typeof content === "object") {
			traverse(content, callback, fullPath);
		}
	}
};
