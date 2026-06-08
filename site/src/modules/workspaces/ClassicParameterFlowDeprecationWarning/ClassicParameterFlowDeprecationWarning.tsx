import type { FC } from "react";
import { Alert } from "#/components/Alert/Alert";
import { Link } from "#/components/Link/Link";
import { docs } from "#/utils/docs";

interface ClassicParameterFlowDeprecationWarningProps {
	templateSettingsLink: string;
	isEnabled: boolean;
}

export const ClassicParameterFlowDeprecationWarning: FC<
	ClassicParameterFlowDeprecationWarningProps
> = ({ templateSettingsLink, isEnabled }) => {
	if (!isEnabled) {
		return null;
	}

	return (
		<Alert severity="warning" className="mb-2" prominent>
			<div>
				此模板正在使用经典参数流，该参数流将{" "}
				<strong>被弃用</strong>并在未来版本中移除。请{" "}
				迁移到{" "}
				<a
					href={docs("/admin/templates/extending-templates/dynamic-parameters")}
					className="text-content-link"
				>
					动态参数
				</a>{" "}
				（在模板设置中）以获得改进的功能。
			</div>

			<Link className="text-xs" href={templateSettingsLink}>
				前往模板设置
			</Link>
		</Alert>
	);
};
