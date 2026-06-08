import { UsersIcon } from "lucide-react";
import type { FC } from "react";
import type { Group } from "#/api/typesGenerated";
import { Avatar } from "#/components/Avatar/Avatar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/Popover/Popover";
import { TableCell } from "#/components/Table/Table";
import { cn } from "#/utils/cn";

type GroupsCellProps = {
	userGroups: readonly Group[] | undefined;
};

export const UserGroupsCell: FC<GroupsCellProps> = ({ userGroups }) => {
	return (
		<TableCell>
			{userGroups === undefined ? (
				<span>无用户组</span>
			) : (
				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="cursor-pointer bg-transparent border-0 p-0 text-inherit leading-none"
							aria-label={
								userGroups.length === 0
									? "无用户组"
									: `查看 ${userGroups.length} 个用户组`
							}
						>
							<div className="flex flex-row gap-2 items-center">
								<UsersIcon
									className={cn([
										"size-4 opacity-50",
										userGroups.length > 0 && "opacity-80",
									])}
								/>

								<span>
									{userGroups.length} 个用户组
								</span>
							</div>
						</button>
					</PopoverTrigger>

					<PopoverContent
						align="start"
						sideOffset={8}
						className="w-auto min-w-[240px] max-w-sm max-h-[400px] p-0"
					>
						<ul className="m-0 list-none flex flex-col flex-nowrap gap-0 px-0.5 py-1 text-sm">
							{userGroups.map((group) => {
								const groupName = group.display_name || group.name;
								return (
									<li
										key={group.id}
										className="flex gap-x-[10px] items-center px-2 py-1.5"
									>
										<Avatar
											size="sm"
											variant="icon"
											src={group.avatar_url}
											fallback={groupName}
										/>

										<span className="m-0 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap leading-none">
											{groupName || <em>无</em>}
										</span>
									</li>
								);
							})}
						</ul>
					</PopoverContent>
				</Popover>
			)}
		</TableCell>
	);
};
