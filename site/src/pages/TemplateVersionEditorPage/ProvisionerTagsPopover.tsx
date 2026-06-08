import Link from "@mui/material/Link";
import useTheme from "@mui/system/useTheme";
import type { FC } from "react";
import type { ProvisionerDaemon } from "#/api/typesGenerated";
import { ChevronDownIcon } from "#/components/AnimatedIcons/ChevronDown";
import { FormSection } from "#/components/Form/Form";
import { TopbarButton } from "#/components/FullPageLayout/Topbar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/Popover/Popover";
import { ProvisionerTagsField } from "#/modules/provisioners/ProvisionerTagsField";
import { docs } from "#/utils/docs";

interface ProvisionerTagsPopoverProps {
	tags: ProvisionerDaemon["tags"];
	onTagsChange: (values: ProvisionerDaemon["tags"]) => void;
}

export const ProvisionerTagsPopover: FC<ProvisionerTagsPopoverProps> = ({
	tags,
	onTagsChange,
}) => {
	const theme = useTheme();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<TopbarButton color="neutral" size="icon">
					<ChevronDownIcon className="size-icon-xs" />
					<span className="sr-only">展开配置器标签</span>
				</TopbarButton>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-[300px] bg-surface-secondary border-surface-quaternary"
			>
				<div
					css={{
						color: theme.palette.text.secondary,
						padding: 20,
						borderBottom: `1px solid ${theme.palette.divider}`,
					}}
				>
					<FormSection
						classes={{
							// Override lg:gap-6 from FormSection defaults. The
							// lg:flex-col counters the default FormContext
							// direction ("horizontal") which adds lg:flex-row.
							root: "flex-col lg:flex-col gap-4 lg:gap-4",
						}}
						title="配置器标签"
						description={
							<>
								标签是一种控制哪个配置器守护进程完成哪个构建作业的方式。&nbsp;
								<Link
									href={docs("/admin/provisioners")}
									target="_blank"
									rel="noreferrer"
								>
									了解更多...
								</Link>
							</>
						}
					>
						<ProvisionerTagsField value={tags} onChange={onTagsChange} />
					</FormSection>
				</div>
			</PopoverContent>
		</Popover>
	);
};
