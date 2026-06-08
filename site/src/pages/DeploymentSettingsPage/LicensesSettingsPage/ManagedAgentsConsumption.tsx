import dayjs from "dayjs";
import { ChevronRightIcon } from "lucide-react";
import type { FC } from "react";
import type { Feature } from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "#/components/Collapsible/Collapsible";
import { Link } from "#/components/Link/Link";
import { cn } from "#/utils/cn";
import { docs } from "#/utils/docs";

interface ManagedAgentsConsumptionProps {
	managedAgentFeature?: Feature;
}

export const ManagedAgentsConsumption: FC<ManagedAgentsConsumptionProps> = ({
	managedAgentFeature,
}) => {
	// If no feature is provided or it's disabled, show disabled state
	if (!managedAgentFeature?.enabled) {
		return (
			<div className="min-h-60 flex items-center justify-center rounded-lg border border-solid p-12">
				<div className="flex flex-col gap-4 items-center justify-center">
					<div className="flex flex-col gap-2 items-center justify-center">
						<span className="text-base">代理工作区构建已禁用</span>
						<span className="text-content-secondary text-center max-w-[464px] mt-2">
							您的当前许可计划不包含代理工作区构建功能。请联系{" "}
							<Link href="mailto:sales@coder.com">销售团队</Link>{" "}
							升级许可并解锁此功能。
						</span>
					</div>
				</div>
			</div>
		);
	}

	const usage = managedAgentFeature.actual;
	const included = managedAgentFeature.limit;
	const startDate = managedAgentFeature.usage_period?.start;
	const endDate = managedAgentFeature.usage_period?.end;

	if (usage === undefined || usage < 0) {
		return <ErrorAlert error="Invalid usage data" />;
	}

	if (included === undefined || included < 0) {
		return <ErrorAlert error="Invalid license usage limits" />;
	}

	if (!startDate || !endDate) {
		return <ErrorAlert error="Missing license usage period" />;
	}

	const start = dayjs(startDate);
	const end = dayjs(endDate);
	if (!start.isValid() || !end.isValid() || !start.isBefore(end)) {
		return <ErrorAlert error="Invalid license usage period" />;
	}

	const usagePercentage = Math.min((usage / included) * 100, 100);

	return (
		<section className="border border-solid rounded">
			<div className="p-4">
				<Collapsible>
					<header className="flex flex-col gap-2 items-start">
						<h3 className="text-md m-0 font-medium">代理工作区构建</h3>

						<CollapsibleTrigger asChild>
							<Button
								className={`
                  h-auto p-0 border-0 bg-transparent font-medium text-content-secondary
                  hover:bg-transparent hover:text-content-primary
                  [&[data-state=open]_svg]:rotate-90
                `}
							>
								<ChevronRightIcon />
								了解更多
							</Button>
						</CollapsibleTrigger>
					</header>

					<CollapsibleContent
						className={`
              pt-2 pl-7 pr-5 space-y-4 font-medium max-w-[720px]
              text-sm text-content-secondary
              [&_p]:m-0 [&_ul]:m-0 [&_ul]:p-0 [&_ul]:list-none
            `}
					>
						<p>
							代理工作区构建会在启动临时工作区纯粹用于运行代理工作负载时计量。请注意，这与即使涉及 AI 工具的日常开发工作区不同。
						</p>
						<p>
							目前，{" "}
							<Link
								href={docs("/ai-coder/tasks")}
								target="_blank"
								rel="noreferrer"
							>
								Coder Tasks（通过 UI、CLI 或 API）
							</Link>{" "}
							是创建代理工作区的唯一方式，但随着标准的发展，可能会支持其他协议和 API。在{" "}
							<Link
								href={docs("/ai-coder/ai-governance")}
								target="_blank"
								rel="noreferrer"
							>
								Coder 文档
							</Link>{" "}
							中了解更多。
						</p>
						<ul>
							<li className="flex items-center gap-2">
								<div className="rounded-[2px] bg-highlight-green size-3 inline-block">
									<span className="sr-only">已启动工作区图例</span>
								</div>
								使用 AI 代理启动的工作区数量。
							</li>
							<li className="flex items-center gap-2">
								<div className="rounded-[2px] bg-highlight-orange size-3 inline-block">
									<span className="sr-only">超出许可配额的使用量图例</span>
								</div>
								使用量已超出当前许可计划中的配额。
							</li>
						</ul>
					</CollapsibleContent>
				</Collapsible>
			</div>

			<div className="p-6 border-0 border-t border-solid">
				<div className="flex justify-between text-sm text-content-secondary mb-4">
					<span>
						{startDate ? dayjs(startDate).format("YYYY年M月D日") : ""}
					</span>
					<span>{endDate ? dayjs(endDate).format("YYYY年M月D日") : ""}</span>
				</div>

				<div className="relative h-6 bg-surface-secondary rounded overflow-hidden">
					<div
						className={cn(
							"absolute top-0 left-0 h-full transition-all duration-300",
							usagePercentage < 100
								? "bg-highlight-green"
								: "bg-highlight-orange",
						)}
						style={{ width: `${usagePercentage}%` }}
					/>
				</div>

				<div className="relative hidden lg:flex justify-between mt-4 text-sm">
					<div className="flex flex-col items-start">
						<span className="text-content-secondary">实际:</span>
						<span className="font-medium">{usage.toLocaleString()}</span>
					</div>

					<div className="flex flex-col items-end">
						<span className="text-content-secondary">已包含:</span>
						<span className="font-medium">{included.toLocaleString()}</span>
					</div>
				</div>

				<div className="flex lg:hidden flex-col gap-3 mt-4 text-sm">
					<div className="flex justify-between">
						<div className="flex flex-col items-start">
							<span className="text-content-secondary">实际:</span>
							<span className="font-medium">{usage.toLocaleString()}</span>
						</div>
						<div className="flex flex-col items-end">
							<span className="text-content-secondary">已包含:</span>
							<span className="font-medium">{included.toLocaleString()}</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
