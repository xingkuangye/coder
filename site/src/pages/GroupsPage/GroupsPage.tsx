import { PlusIcon } from "lucide-react";
import { type FC, useEffect } from "react";
import { useQuery } from "react-query";
import { Link as RouterLink } from "react-router";
import { toast } from "sonner";
import { getErrorDetail, getErrorMessage } from "#/api/errors";
import { groupsByOrganization } from "#/api/queries/groups";
import { organizationsPermissions } from "#/api/queries/organizations";
import { Button } from "#/components/Button/Button";
import { EmptyState } from "#/components/EmptyState/EmptyState";
import { Loader } from "#/components/Loader/Loader";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { useFeatureVisibility } from "#/modules/dashboard/useFeatureVisibility";
import { RequirePermission } from "#/modules/permissions/RequirePermission";
import { pageTitle } from "#/utils/page";
import { useGroupsSettings } from "./GroupsPageProvider";
import { GroupsPageView } from "./GroupsPageView";

const GroupsPage: FC = () => {
	const { template_rbac: groupsEnabled } = useFeatureVisibility();
	const { organization, showOrganizations } = useGroupsSettings();
	const groupsQuery = useQuery({
		...groupsByOrganization(organization?.name ?? ""),
		enabled: Boolean(organization),
	});
	const permissionsQuery = useQuery({
		...organizationsPermissions([organization?.id ?? ""]),
		enabled: Boolean(organization),
	});

	useEffect(() => {
		if (groupsQuery.error) {
			toast.error(
				getErrorMessage(groupsQuery.error, "无法加载用户组。"),
				{
					description: getErrorDetail(groupsQuery.error),
				},
			);
		}
	}, [groupsQuery.error]);

	useEffect(() => {
		if (permissionsQuery.error) {
			toast.error(
				getErrorMessage(permissionsQuery.error, "无法加载权限。"),
				{
					description: getErrorDetail(permissionsQuery.error),
				},
			);
		}
	}, [permissionsQuery.error]);

	if (!organization) {
		return <EmptyState message="未找到组织" />;
	}

	if (permissionsQuery.isLoading) {
		return <Loader />;
	}

	const title = <title>{pageTitle("组")}</title>;

	const permissions = permissionsQuery.data?.[organization.id];

	if (!permissions?.viewGroups) {
		return (
			<>
				{title}
				<RequirePermission isFeatureVisible={false} />
			</>
		);
	}

	return (
		<div className="w-full max-w-screen-2xl pb-10">
			{title}

			<div className="flex max-w-full flex-row items-baseline justify-between gap-4">
				<SettingsHeader>
					<SettingsHeaderTitle>组</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						管理此{showOrganizations ? "组织" : "部署"}的组。
					</SettingsHeaderDescription>
				</SettingsHeader>

				{groupsEnabled && permissions.createGroup && (
					<Button asChild>
						<RouterLink to="create">
							<PlusIcon className="size-icon-sm" />
							创建组
						</RouterLink>
					</Button>
				)}
			</div>

			<GroupsPageView
				groups={groupsQuery.data}
				canCreateGroup={permissions.createGroup}
				groupsEnabled={groupsEnabled}
			/>
		</div>
	);
};

export default GroupsPage;
