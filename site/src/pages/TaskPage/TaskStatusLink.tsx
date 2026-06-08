import {
	BugIcon,
	ExternalLinkIcon,
	GitPullRequestArrowIcon,
} from "lucide-react";
import type { FC } from "react";
import { Button } from "#/components/Button/Button";
import { ExternalImage } from "#/components/ExternalImage/ExternalImage";

type TaskStatusLinkProps = {
	uri: string;
};

export const TaskStatusLink: FC<TaskStatusLinkProps> = ({ uri }) => {
	let icon = <ExternalLinkIcon />;
	let label = uri;

	try {
		const parsed = new URL(uri);
		switch (parsed.protocol) {
			// For file URIs, strip off the `file://`.
			case "file:":
				label = uri.replace(/^file:\/\//, "");
				break;
			case "http:":
			case "https:":
				// For GitHub URIs, use a short representation.
				if (parsed.host === "github.com") {
					const [_, org, repo, type, number] = parsed.pathname.split("/");
					switch (type) {
						case "pull":
							icon = <GitPullRequestArrowIcon />;
							label =
								number === "new"
									? `${org}/${repo} 创建拉取请求`
									: number
										? `${org}/${repo}#${number}`
										: `${org}/${repo} 拉取请求`;
							break;
						case "issues":
							icon = <BugIcon />;
							label =
								number === "new"
									? `${org}/${repo} 创建新问题`
									: number
										? `${org}/${repo}#${number}`
										: `${org}/${repo} 问题`;
							break;
						default:
							icon = <ExternalImage src="/icon/github.svg" />;
							if (org && repo) {
								label = `${org}/${repo}`;
							}
							break;
					}
				}
				break;
		}
	} catch (_error) {
		// Invalid URL, probably.
		return null;
	}

	return (
		<Button asChild variant="outline" size="sm" className="min-w-0">
			<a href={uri} target="_blank" rel="noreferrer">
				{icon}
				<span className="truncate">{label}</span>
			</a>
		</Button>
	);
};
