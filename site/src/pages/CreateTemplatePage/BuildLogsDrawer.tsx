import Drawer from "@mui/material/Drawer";
import { TriangleAlertIcon, XIcon } from "lucide-react";
import type { FC } from "react";
import { JobError } from "#/api/queries/templates";
import type { TemplateVersion } from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import { Loader } from "#/components/Loader/Loader";
import { AlertVariant } from "#/modules/provisioners/ProvisionerAlert";
import { ProvisionerStatusAlert } from "#/modules/provisioners/ProvisionerStatusAlert";
import { useWatchVersionLogs } from "#/modules/templates/useWatchVersionLogs";
import { WorkspaceBuildLogs } from "#/modules/workspaces/WorkspaceBuildLogs/WorkspaceBuildLogs";
import { navHeight } from "#/theme/constants";

type BuildLogsDrawerProps = {
	error: unknown;
	open: boolean;
	onClose: () => void;
	templateVersion: TemplateVersion | undefined;
	variablesSectionRef: React.RefObject<HTMLDivElement | null>;
};

export const BuildLogsDrawer: FC<BuildLogsDrawerProps> = ({
	templateVersion,
	error,
	variablesSectionRef,
	...drawerProps
}) => {
	const logs = useWatchVersionLogs(templateVersion);

	const isMissingVariables =
		error instanceof JobError &&
		error.job.error_code === "REQUIRED_TEMPLATE_VARIABLES";

	const matchingProvisioners = templateVersion?.matched_provisioners?.count;
	const availableProvisioners =
		templateVersion?.matched_provisioners?.available;
	const hasLogs = logs && logs.length > 0;

	return (
		<Drawer anchor="right" {...drawerProps}>
			<div className="flex h-full w-[800px] flex-col">
				<header
					className="flex items-center justify-between border-b border-border px-6"
					style={{ height: navHeight }}
				>
					<h3 className="m-0 text-base font-medium">正在创建模板…</h3>
					<Button size="icon-lg" variant="subtle" onClick={drawerProps.onClose}>
						<XIcon />
						<span className="sr-only">关闭构建日志</span>
					</Button>
				</header>

				{isMissingVariables ? (
					<MissingVariablesBanner
						onFillVariables={() => {
							variablesSectionRef.current?.scrollIntoView({
								behavior: "smooth",
							});
							const firstVariableInput =
								variablesSectionRef.current?.querySelector("input");
							firstVariableInput?.focus();
							drawerProps.onClose();
						}}
					/>
				) : (
					<>
						{(matchingProvisioners === 0 || !hasLogs) && (
							<ProvisionerStatusAlert
								matchingProvisioners={matchingProvisioners}
								availableProvisioners={availableProvisioners}
								tags={templateVersion?.job.tags ?? {}}
								variant={AlertVariant.Inline}
							/>
						)}

						{hasLogs ? (
							<section className="flex-1 overflow-auto bg-surface-primary">
								<WorkspaceBuildLogs logs={logs} className="border-0" />
							</section>
						) : (
							<Loader />
						)}
					</>
				)}
			</div>
		</Drawer>
	);
};

type MissingVariablesBannerProps = { onFillVariables: () => void };

const MissingVariablesBanner: FC<MissingVariablesBannerProps> = ({
	onFillVariables,
}) => {
	return (
		<div className="flex items-center justify-center p-10">
			<div className="flex max-w-[360px] flex-col items-center text-center">
				<TriangleAlertIcon className="size-icon-lg text-content-warning" />
				<h4 className="m-0 mt-4 font-medium leading-none">缺少变量</h4>
				<p className="m-0 mt-2 text-sm leading-6 text-content-secondary">
					在构建过程中，我们发现了一些缺失的变量。请放心，我们已经自动将它们添加到了表单中。
				</p>
				<Button
					className="mt-4"
					size="sm"
					variant="outline"
					onClick={onFillVariables}
				>
					填写变量
				</Button>
			</div>
		</div>
	);
};
