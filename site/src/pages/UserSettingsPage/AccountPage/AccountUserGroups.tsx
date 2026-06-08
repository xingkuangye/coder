import type { FC } from "react";
import { isApiError } from "#/api/errors";
import type { Group } from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { AvatarCard } from "#/components/Avatar/AvatarCard";
import { Loader } from "#/components/Loader/Loader";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { useDashboard } from "#/modules/dashboard/useDashboard";

type AccountGroupsProps = {
	groups: readonly Group[] | undefined;
	error: unknown;
	loading: boolean;
};

export const AccountUserGroups: FC<AccountGroupsProps> = ({
	groups,
	error,
	loading,
}) => {
	const { showOrganizations } = useDashboard();

	return (
		<div>
			<SettingsHeader>
				<SettingsHeaderTitle hierarchy="secondary">
					您的群组
				</SettingsHeaderTitle>
				{groups && (
					<SettingsHeaderDescription>
						您在{" "}
						<em className="not-italic text-content-primary font-semibold">
							{groups.length} 个群组
						</em>
						中
					</SettingsHeaderDescription>
				)}
			</SettingsHeader>

			<div className="flex flex-col gap-6">
				{isApiError(error) && <ErrorAlert error={error} />}

				{groups && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{groups.map((group) => (
							<AvatarCard
								key={group.id}
								imgUrl={group.avatar_url}
								header={group.display_name || group.name}
								subtitle={
									showOrganizations ? (
										group.organization_display_name
									) : (
										<>
											{group.total_member_count} 位成员
										</>
									)
								}
							/>
						))}
					</div>
				)}

				{loading && <Loader />}
			</div>
		</div>
	);
};
