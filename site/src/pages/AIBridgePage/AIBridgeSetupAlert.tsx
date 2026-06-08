import type { FC } from "react";
import { Alert, AlertDescription, AlertTitle } from "#/components/Alert/Alert";
import { Link } from "#/components/Link/Link";
import { docs } from "#/utils/docs";

export const AIBridgeSetupAlert: FC = () => {
	return (
		<Alert className="mb-12" severity="warning" prominent>
			<AlertTitle>
				AI Bridge 已包含在您的许可证中，但尚未设置。
			</AlertTitle>
			<AlertDescription>
				您可以使用 AI 治理功能，但仍需进行设置。请查看{" "}
				<Link href={docs("/ai-coder/ai-bridge")} target="_blank">
					AI Bridge
				</Link>{" "}
				文档以开始使用。
			</AlertDescription>
		</Alert>
	);
};
