import type { FC } from "react";
import { Link } from "#/components/Link/Link";

interface TermsOfServiceLinkProps {
	url?: string;
}

export const TermsOfServiceLink: FC<TermsOfServiceLinkProps> = ({ url }) => {
	return (
		<div className="pt-3 text-base">
			继续操作即表示您同意
			<Link
				className="font-medium whitespace-nowrap"
				href={url}
				target="_blank"
				rel="noreferrer"
			>
				服务条款
			</Link>
		</div>
	);
};
