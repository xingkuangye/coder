import { ChevronRightIcon } from "lucide-react";
import type { FC } from "react";
import { Link as RouterLink } from "react-router";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";
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
import { docs } from "#/utils/docs";
import { formatDate } from "#/utils/time";

const chartConfig = {
	users: {
		label: "用户",
		color: "hsl(var(--highlight-purple))",
	},
} satisfies ChartConfig;

type LicenseSeatConsumptionChartProps = {
	limit: number | undefined;
	data:
		| {
				date: string;
				users: number;
		  }[]
		| undefined;
};

export const LicenseSeatConsumptionChart: FC<
	LicenseSeatConsumptionChartProps
> = ({ data, limit }) => {
	return (
		<section className="border border-solid rounded">
			<div className="p-4">
				<Collapsible>
					<header className="flex flex-col gap-2 items-start">
						<h3 className="text-md m-0 font-medium">
							许可证席位消耗
						</h3>

						<CollapsibleTrigger asChild>
							<Button
								className={`
									h-auto p-0 border-0 bg-transparent font-medium text-content-secondary
									hover:bg-transparent hover:text-content-primary
									[&[data-state=open]_svg]:rotate-90
								`}
							>
								<ChevronRightIcon />
								我们如何计算许可证席位消耗
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
							许可证根据用户账户状态消耗。只有活跃用户账户才消耗许可证席位。
						</p>
						<ul>
							<li className="flex items-center gap-2">
								<div className="rounded-[2px] bg-highlight-green size-3 inline-block">
									<span className="sr-only">
										图表中活跃用户的图例
									</span>
								</div>
								用户在过去 90 天内至少活跃过一次。
							</li>
							<li className="flex items-center gap-2">
								<div className="size-3 inline-flex items-center justify-center">
									<span className="sr-only">
										图表中许可证席位限制的图例
									</span>
									<div className="w-full border-b-1 border-t-1 border-dashed border-content-disabled" />
								</div>
								当前许可证席位限制，即允许的最大活跃账户数。
							</li>
						</ul>
						<div>
							您可能还想查看：
							<ul>
								<li>
									<Link asChild>
										<RouterLink to="/audit">活动审计</RouterLink>
									</Link>
								</li>
								<li>
									<Link asChild>
										<RouterLink to="/deployment/overview">
											每日用户活动
										</RouterLink>
									</Link>
								</li>
								<li>
									<Link
										href={docs("/admin/users#user-status")}
										target="_blank"
										rel="noreferrer"
									>
										用户账户状态的更多详情
									</Link>
								</li>
							</ul>
						</div>
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
										top: 5,
										right: 5,
										left: 0,
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
										// Adds space on Y to show always show the reference line without overflowing it.
										domain={[0, limit ? "dataMax + 10" : "auto"]}
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
													return `${item.value} 个席位`;
												}}
												formatter={(_v, _n, item) => {
													const date = new Date(item.payload.date);
													return date.toLocaleString("zh-CN", {
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
										dataKey="users"
										type="linear"
										fill="url(#fillUsers)"
										fillOpacity={0.4}
										stroke="var(--color-users)"
										stackId="a"
									/>
									{limit && (
										<ReferenceLine
											isFront
											ifOverflow="extendDomain"
											y={limit}
											label={{
												value: "许可证席位限制",
												position: "insideBottomRight",
												className:
													"text-2xs text-content-secondary font-regular",
											}}
											stroke="hsl(var(--content-disabled))"
											strokeDasharray="5 5"
										/>
									)}
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
