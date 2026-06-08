import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import { type FC, type ReactNode, useId } from "react";
import type { ChatUsageLimitPeriod } from "#/api/typesGenerated";
import { Input } from "#/components/Input/Input";
import { Label } from "#/components/Label/Label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/Select/Select";
import { Switch } from "#/components/Switch/Switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { SectionHeader } from "../SectionHeader";

interface DefaultLimitSectionProps {
	enabled: boolean;
	onEnabledChange: (enabled: boolean) => void;
	period: ChatUsageLimitPeriod;
	onPeriodChange: (period: ChatUsageLimitPeriod) => void;
	amountDollars: string;
	onAmountDollarsChange: (amount: string) => void;
	unpricedModelCount: number;
	adminBadge: ReactNode;
	hideHeader?: boolean;
}

export const DefaultLimitSection: FC<DefaultLimitSectionProps> = ({
	enabled,
	onEnabledChange,
	period,
	onPeriodChange,
	amountDollars,
	onAmountDollarsChange,
	unpricedModelCount,
	adminBadge,
	hideHeader,
}) => {
	const periodId = useId();
	const amountId = useId();

	return (
		<section className="space-y-4">
			{!hideHeader && (
				<SectionHeader
					label="默认消费限额"
					description="设置默认适用于所有用户的部署级消费上限。"
					badge={adminBadge}
				/>
			)}

			<div className="space-y-4">
				<div className="flex items-center justify-between gap-4">
					<div>
						<p className="m-0 text-sm font-medium text-content-primary">
							启用消费限额
						</p>
						<p className="m-0 text-xs text-content-secondary">
							禁用时，用户的消费不受限制。
						</p>
					</div>
					<Switch
						checked={enabled}
						onCheckedChange={onEnabledChange}
						aria-label="启用消费限额"
					/>
				</div>

				{enabled && (
					<div className="flex flex-col gap-3 md:flex-row md:items-end">
						<div className="flex-1 space-y-1">
							<div className="flex items-center gap-1">
								<Label htmlFor={periodId}>周期</Label>
								<TooltipProvider delayDuration={0}>
									<Tooltip>
										<TooltipTrigger asChild>
											<InfoIcon className="size-3.5 shrink-0 cursor-help text-content-secondary" />
										</TooltipTrigger>
										<TooltipContent>
											一次只能启用一个周期。消费从当前周期开始计算。
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<Select
								value={period}
								onValueChange={(value) =>
									onPeriodChange(value as ChatUsageLimitPeriod)
								}
							>
								<SelectTrigger
									id={periodId}
									className="h-9 min-w-0 text-[13px]"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="day">天</SelectItem>
									<SelectItem value="week">周</SelectItem>
									<SelectItem value="month">月</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex-1 space-y-1">
							<Label htmlFor={amountId}>金额 ($)</Label>
							<Input
								id={amountId}
								type="number"
								step="0.01"
								min="0"
								className="h-9 min-w-0 text-[13px]"
								value={amountDollars}
								onChange={(event) => onAmountDollarsChange(event.target.value)}
								placeholder="0.00"
							/>
						</div>
					</div>
				)}
			</div>

			{enabled && unpricedModelCount > 0 && (
				<div className="flex items-start gap-3 rounded-lg border border-border-warning bg-surface-warning p-4 text-sm text-content-primary">
					<TriangleAlertIcon className="size-5 shrink-0 text-content-warning" />
					<div>
						{unpricedModelCount === 1
							? "1 个已启用的模型未配置定价。"
							: `${unpricedModelCount} 个已启用的模型未配置定价。`}{" "}
						未定价模型的使用无法计入消费限额。
					</div>
				</div>
			)}
		</section>
	);
};
