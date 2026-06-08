import { RotateCcwIcon } from "lucide-react";
import type { FC } from "react";
import type { Workspace } from "#/api/typesGenerated";
import { TopbarButton } from "#/components/FullPageLayout/Topbar";
import { BuildParametersPopover } from "./BuildParametersPopover";
import type { ActionButtonProps } from "./Buttons";

type RetryButtonProps = Omit<ActionButtonProps, "loading"> & {
	enableBuildParameters: boolean;
	workspace: Workspace;
};

export const RetryButton: FC<RetryButtonProps> = ({
	handleAction,
	workspace,
	enableBuildParameters,
}) => {
	const mainAction = (
		<TopbarButton onClick={() => handleAction()}>
			<RotateCcwIcon />
			重试
		</TopbarButton>
	);

	if (!enableBuildParameters) {
		return mainAction;
	}

	return (
		<div className="flex gap-1 items-center">
			{mainAction}
			<BuildParametersPopover
				label="使用构建参数重试"
				workspace={workspace}
				onSubmit={handleAction}
			/>
		</div>
	);
};
