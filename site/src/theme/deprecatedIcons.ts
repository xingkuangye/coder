/**
 * 废弃的图标是指不再维护的图标。
 * 它们保存在这里是为了向后兼容，但不会
 * 在表情选择器中显示，也不包含在图标列表中。
 */

export const DEPRECATED_ICONS = [
	// we have alternatives in `apple-black.svg`.
	"apple-grey.svg",
	// we have alternatives in `aws.svg`.
	"aws-monochrome.svg",
	// we already serve this in `aws.svg`.
	"aws.png",
	// we already serve this in `azure.svg`.
	"azure.png",
	// we already serve this in `do.svg`.
	"do.png",
	// we already serve this in `docker.svg`.
	"docker.png",
	// we have alternatives in `docker.svg`.
	"docker-white.svg",
	// we already serve this in `gcp.svg`.
	"gcp.png",
	// we already serve this in `k8s.svg`.
	"k8s.png",
	// we already serve this in `ruby.svg`.
	"ruby.png",
] satisfies string[];
