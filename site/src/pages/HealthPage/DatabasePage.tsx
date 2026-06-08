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

const DatabasePage = () => {
	const healthStatus = useOutletContext<HealthcheckReport>();
	const database = healthStatus.database;

	return (
		<>
			<title>{pageTitle("数据库 - 健康")}</title>

			<Header>
				<HeaderTitle>
					<HealthyDot severity={database.severity} />
					数据库
				</HeaderTitle>
				<DismissWarningButton healthcheck="Database" />
			</Header>

			<Main>
				{database.warnings.map((warning) => {
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
					<GridDataLabel>可访问</GridDataLabel>
					<GridDataValue>{database.reachable ? "是" : "否"}</GridDataValue>

					<GridDataLabel>延迟</GridDataLabel>
					<GridDataValue>{database.latency_ms}ms</GridDataValue>

					<GridDataLabel>阈值</GridDataLabel>
					<GridDataValue>{database.threshold_ms}ms</GridDataValue>
				</GridData>
			</Main>
		</>
	);
};

export default DatabasePage;
