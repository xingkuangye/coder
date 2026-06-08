import { ChevronRightIcon } from "lucide-react";
import type { FC } from "react";
import { Link as RouterLink } from "react-router";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "#/components/Button/Button";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "#/components/Chart/Chart";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "#/components/Collapsible/Collapsible";
import { Link } from "#/components/Link/Link";
import { Spinner } from "#/components/Spinner/Spinner";
import { formatDate } from "#/utils/time";

const chartConfig = {
	users: {
		label: "用户",
		color: "hsl(var(--highlight-purple))",
	},
} satisfies ChartConfig;

type UserEngagementChartProps = {
	data:
		| {
				date: string;
				users: number;
		  }[]
		| undefined;
};

export const UserEngagementChart: FC<UserEngagementChartProps> = ({ data }) => {
	return (
		<section className="border border-solid rounded">
			<div className="p-4">
				<Collapsible>
					<header className="flex flex-col gap-2 items-start">
						<h3 className="text-md m-0 font-medium">用户活跃度</h3>

						<CollapsibleTrigger asChild>
							<Button
								className={`
									h-auto p-0 border-0 bg-transparent font-medium text-content-secondary
									hover:bg-transparent hover:text-content-primary
									[&[data-state=open]_svg]:rotate-90
								`}
							>
								<ChevronRightIcon />
								我们如何计算活跃用户
							</Button>
						</CollapsibleTrigger>
					</header>

					<CollapsibleContent
						className={`
							pt-2 pl-7 pr-5 space-y-4 font-medium max-w-[720px]
							[&_p]:m-0 [&_p]:text-sm [&_p]:text-content-secondary
						`}
					>
						<p>
							当用户通过应用、Web终端或SSH发起与其工作空间的连接时，即被视为“活跃用户”。图表显示每天至少活跃一次的独立用户数量，更多洞察可通过{" "}
							<Link size="sm" asChild>
								<RouterLink to="/audit">活动审计</RouterLink>
							</Link>{" "}
							和{" "}
							<Link size="sm" asChild>
								<RouterLink to="/deployment/licenses">
									许可证消耗
								</RouterLink>
							</Link>{" "}
							工具获取。
						</p>
					</CollapsibleContent>
				</Collapsible>
			</div>

			<div className="p-6 border-0 border-t border-solid">
				<div className="h-64">
					{data ? (
						data.length > 0 ? (
							<ChartContainer
								config={chartConfig}
								className="aspect-auto h-full"
							>
								<AreaChart
									accessibilityLayer
									data={data}
									margin={{
										top: 10,
										left: 0,
										right: 0,
									}}
								>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey="date"
										tickLine={false}
										tickMargin={12}
										minTickGap={24}
										tickFormatter={(value: string) =>
											formatDate(new Date(value), {
												month: "short",
												day: "numeric",
												year: undefined,
												hour: undefined,
												minute: undefined,
												second: undefined,
											})
										}
									/>
									<YAxis
										dataKey="users"
										tickLine={false}
										axisLine={false}
										tickMargin={12}
										tickFormatter={(value: number) => {
											return value === 0 ? "" : value.toLocaleString();
										}}
									/>
									<ChartTooltip
										cursor={false}
										content={
											<ChartTooltipContent
												className="font-medium text-content-secondary"
												labelClassName="text-content-primary"
												labelFormatter={(_, p) => {
													const item = p[0];
													return `${item.value} 用户`;
												}}
												formatter={(_v, _n, item) => {
													const date = new Date(item.payload.date);
													return date.toLocaleString(undefined, {
														month: "long",
														day: "2-digit",
													});
												}}
											/>
										}
									/>
									<defs>
										<linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
											<stop
												offset="5%"
												stopColor="var(--color-users)"
												stopOpacity={0.8}
											/>
											<stop
												offset="95%"
												stopColor="var(--color-users)"
												stopOpacity={0.1}
											/>
										</linearGradient>
									</defs>

									<Area
										isAnimationActive={false}
										dataKey="users"
										type="linear"
										fill="url(#fillUsers)"
										fillOpacity={0.4}
										stroke="var(--color-users)"
										stackId="a"
									/>
								</AreaChart>
							</ChartContainer>
						) : (
							<div
								className={`
									w-full h-full flex items-center justify-center
									text-content-secondary text-sm font-medium
								`}
							>
								暂无数据
							</div>
						)
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<Spinner loading />
						</div>
					)}
				</div>
			</div>
		</section>
	);
};
