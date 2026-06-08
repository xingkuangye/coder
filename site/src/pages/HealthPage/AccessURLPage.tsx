import { useOutletContext } from "react-router";
import type { HealthcheckReport } from "#/api/typesGenerated";
import { Alert } from "#/components/Alert/Alert";
import { pageTitle } from "#/utils/page";
import {
	GridData,
	GridDataLabel,
	GridDataValue,
	Header,
	HeaderTitle,
	HealthMessageDocsLink,
	HealthyDot,
	Main,
} from "./Content";
import { DismissWarningButton } from "./DismissWarningButton";

const AccessURLPage = () => {
	const healthStatus = useOutletContext<HealthcheckReport>();
	const accessUrl = healthStatus.access_url;

	return (
		<>
			<title>{pageTitle("访问 URL - 健康")}</title>

			<Header>
				<HeaderTitle>
					<HealthyDot severity={accessUrl.severity} />
					访问 URL
				</HeaderTitle>
				<DismissWarningButton healthcheck="AccessURL" />
			</Header>

			<Main>
				{accessUrl.error && <Alert severity="error">{accessUrl.error}</Alert>}

				{accessUrl.warnings.map((warning) => {
					return (
						<Alert
							actions={<HealthMessageDocsLink {...warning} />}
							key={warning.code}
							severity="warning"
							prominent
						>
							{warning.message}
						</Alert>
					);
				})}

				<GridData>
					<GridDataLabel>严重程度</GridDataLabel>
					<GridDataValue>{accessUrl.severity}</GridDataValue>

					<GridDataLabel>访问 URL</GridDataLabel>
					<GridDataValue>{accessUrl.access_url}</GridDataValue>

					<GridDataLabel>可访问</GridDataLabel>
					<GridDataValue>{accessUrl.reachable ? "是" : "否"}</GridDataValue>

					<GridDataLabel>状态码</GridDataLabel>
					<GridDataValue>{accessUrl.status_code}</GridDataValue>
				</GridData>
			</Main>
		</>
	);
};

export default AccessURLPage;
