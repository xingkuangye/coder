import { TrashIcon } from "lucide-react";
import { type ComponentProps, type FC, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
	Outlet,
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router";
import { toast } from "sonner";
import { getErrorDetail, getErrorMessage } from "#/api/errors";
import {
	deleteGroup,
	group,
	groupMembers,
	groupPermissions,
} from "#/api/queries/groups";
import type { Group, ReducedUser } from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import { DeleteDialog } from "#/components/Dialogs/DeleteDialog/DeleteDialog";
import { useFilter } from "#/components/Filter/Filter";
import type { UsersFilter } from "#/components/Filter/UsersFilter";
import { Loader } from "#/components/Loader/Loader";
import type { PaginationResult } from "#/components/PaginationWidget/PaginationContainer";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { LinkTabs, LinkTabsList, TabLink } from "#/components/Tabs/Tabs";
import { usePaginatedQuery } from "#/hooks/usePaginatedQuery";
import { pageTitle } from "#/utils/page";

export type GroupPageOutletContext = {
	group: Group;
	members: readonly ReducedUser[];
	permissions: { canUpdateGroup: boolean };
	organization: string;
	groupQuery: ReturnType<typeof useQuery>;
	membersQuery: PaginationResult;
	filterProps: ComponentProps<typeof UsersFilter>;
};

const GroupPage: FC = () => {
	const { organization = "default", groupName } = useParams() as {
		organization?: string;
		groupName: string;
	};
	const location = useLocation();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const groupQuery = useQuery(
		group(organization, groupName, { exclude_members: true }),
	);
	const membersQuery = usePaginatedQuery(
		groupMembers(organization, groupName, searchParams),
	);
	const useFilterResult = useFilter({
		searchParams,
		onSearchParamsChange: setSearchParams,
		onUpdate: membersQuery.goToFirstPage,
	});

	const groupData = groupQuery.data;
	const { data: permissions } = useQuery({
		...groupPermissions(groupData?.id ?? ""),
		enabled: Boolean(groupData),
	});
	const deleteGroupMutation = useMutation(
		deleteGroup(queryClient, organization),
	);
	const [isDeletingGroup, setIsDeletingGroup] = useState(false);
	const isLoading =
		groupQuery.isLoading ||
		!groupData ||
		!permissions ||
		membersQuery.isLoading ||
		!membersQuery.data;
	const canUpdateGroup = permissions ? permissions.canUpdateGroup : false;

	const title = (
		<title>
			{pageTitle((groupData?.display_name || groupData?.name) ?? "加载中...")}
		</title>
	);

	const error = groupQuery.error || membersQuery.error;
	if (error) {
		return <ErrorAlert error={error} />;
	}

	if (isLoading) {
		return (
			<>
				{title}
				<Loader />
			</>
		);
	}

	const groupId = groupData.id;
	const activeTab = location.pathname.endsWith("/settings")
		? "settings"
		: "members";

	return (
		<>
			{title}

			<div className="flex align-baseline justify-between w-full">
				<SettingsHeader>
					<SettingsHeaderTitle>
						{groupData.display_name || groupData.name || "未知组"}
					</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						管理此组的成员。
					</SettingsHeaderDescription>
				</SettingsHeader>

				{canUpdateGroup && (
					<Button
						variant="destructive"
						disabled={groupData.id === groupData.organization_id}
						onClick={() => {
							setIsDeletingGroup(true);
						}}
					>
						<TrashIcon />
						删除&hellip;
					</Button>
				)}
			</div>
			<div className="flex flex-col gap-10 w-full">
				{canUpdateGroup && (
					<LinkTabs active={activeTab}>
						<LinkTabsList className="w-full justify-start">
							<TabLink to="." value="members">
								组成员
							</TabLink>
							<TabLink to="settings" value="settings">
								组设置
							</TabLink>
						</LinkTabsList>
					</LinkTabs>
				)}

				<Outlet
					context={
						{
							group: groupData,
							members: membersQuery.data?.users || [],
							permissions: { canUpdateGroup },
							organization,
							groupQuery,
							membersQuery,
							filterProps: {
								filter: useFilterResult,
							},
						} satisfies GroupPageOutletContext
					}
				/>
			</div>

			{groupQuery.data && (
				<DeleteDialog
					isOpen={isDeletingGroup}
					confirmLoading={deleteGroupMutation.isPending}
					name={groupQuery.data.name}
					entity="组"
					onConfirm={async () => {
						try {
							await deleteGroupMutation.mutateAsync({
								groupId,
								groupName: groupData.name,
							});
							toast.success(
								`组“${groupQuery.data.name}”已成功删除。`,
							);
							navigate("..");
						} catch (error) {
							toast.error(
								getErrorMessage(
									error,
									`删除组“${groupQuery.data.name}”失败。`,
								),
								{
									description: getErrorDetail(error),
								},
							);
						}
					}}
					onCancel={() => {
						setIsDeletingGroup(false);
					}}
				/>
			)}
		</>
	);
};

export default GroupPage;
