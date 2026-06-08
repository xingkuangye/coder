import { ArrowLeftIcon } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "#/components/Alert/Alert";
import { Button } from "#/components/Button/Button";
import { useAuthenticated } from "#/hooks/useAuthenticated";
import { RequirePermission } from "#/modules/permissions/RequirePermission";
import { pageTitle } from "#/utils/page";
import { addableProviders } from "../components/addableProviderTypes";
import AddProviderPageView from "./AddProviderPageView";

const AddProviderPage: React.FC = () => {
	const { permissions } = useAuthenticated();
	const hasPermission = permissions.viewAnyAIProvider;
	const [searchParams] = useSearchParams();
	const typeParam = searchParams.get("type");

	const provider = addableProviders.find((p) => p.value === typeParam);
	if (!provider) {
		return (
			<div className="flex flex-col items-start gap-4 pt-4 px-6">
				<Link to="/ai/settings">
					<Button variant="subtle">
						<ArrowLeftIcon />
						<span>返回提供者</span>
					</Button>
				</Link>
				<Alert severity="warning">
					<AlertTitle>未找到提供者类型</AlertTitle>
					<AlertDescription>
						您尝试添加的提供者类型无效。请重试。
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<RequirePermission isFeatureVisible={hasPermission}>
			<title>
				{pageTitle(`新建 ${provider.label} 提供者`, "AI 提供者")}
			</title>

			<AddProviderPageView provider={provider} />
		</RequirePermission>
	);
};

export default AddProviderPage;
