import type { FC } from "react";
import type { AlertColor } from "#/components/Alert/Alert";
import { AlertVariant, ProvisionerAlert } from "./ProvisionerAlert";

interface ProvisionerStatusAlertProps {
	matchingProvisioners: number | undefined;
	availableProvisioners: number | undefined;
	tags: Record<string, string>;
	variant?: AlertVariant;
}

export const ProvisionerStatusAlert: FC<ProvisionerStatusAlertProps> = ({
	matchingProvisioners,
	availableProvisioners,
	tags,
	variant = AlertVariant.Standalone,
}) => {
	let title: string;
	let detail: string;
	let severity: AlertColor;
	switch (true) {
		case matchingProvisioners === 0:
			title = "构建等待配置程序部署";
			detail =
				"您的构建已排队，但没有接受所需标签的配置程序。一旦有兼容的配置程序可用，您的构建将继续。请与您的管理员联系。";
			severity = "warning";
			break;
		case availableProvisioners === 0:
			title = "构建延迟";
			detail =
				"接受所需标签的配置程序的响应时间比预期要长。这可能会导致您的构建延迟。如果您的构建未完成，请联系管理员。";
			severity = "warning";
			break;
		default:
			title = "构建已排队";
			detail =
				"您的构建已排队，一旦有配置程序可用，将开始处理。";
			severity = "info";
	}

	return (
		<ProvisionerAlert
			title={title}
			detail={detail}
			severity={severity}
			tags={tags}
			variant={variant}
		/>
	);
};
