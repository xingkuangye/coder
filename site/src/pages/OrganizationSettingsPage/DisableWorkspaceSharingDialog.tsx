import type { FC } from "react";
import { useQuery } from "react-query";
import { API } from "#/api/api";
import type { ShareableWorkspaceOwners } from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/Dialog/Dialog";
import { Skeleton } from "#/components/Skeleton/Skeleton";
import { Spinner } from "#/components/Spinner/Spinner";

interface DisableWorkspaceSharingDialogProps {
	isOpen: boolean;
	organizationId: string;
	newSetting: ShareableWorkspaceOwners;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
}

export const DisableWorkspaceSharingDialog: FC<
	DisableWorkspaceSharingDialogProps
> = ({
	isOpen,
	organizationId,
	newSetting: targetValue,
	onConfirm,
	onCancel,
	isLoading,
}) => {
	// Fetch the count of shared workspaces in this organization.
	const sharedWorkspacesQuery = useQuery({
		queryKey: ["workspaces", organizationId, "shared", "count"],
		queryFn: async () => {
			const response = await API.getWorkspaces({
				q: `organization:${organizationId} shared:true`,
				limit: 0, // Avoid fetching workspaces as we only need the count.
			});
			return response.count;
		},
		enabled: isOpen,
	});

	const sharedCount = sharedWorkspacesQuery.data ?? 0;
	const isLoadingCount = sharedWorkspacesQuery.isLoading;
	const isRestrictingToServiceAccounts = targetValue === "service_accounts";

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent variant="destructive" className="max-w-xl">
				<DialogHeader>
					<DialogTitle>
						{isRestrictingToServiceAccounts
							? "限制共享至服务账号"
							: "禁用工作空间共享"}
					</DialogTitle>
					<DialogDescription asChild>
						<div className="flex flex-col gap-4">
							<p>
								{isRestrictingToServiceAccounts
									? "将工作空间共享限制为仅服务账号会立即取消当前由非服务账号共享的所有工作空间共享。"
									: "禁用工作空间共享将立即删除此组织中所有用户的全部现有工作空间共享权限。"}
							</p>
							{isLoadingCount ? (
								<Skeleton className="h-6 w-4/5" />
							) : sharedCount > 0 ? (
								<p className="text-content-danger font-medium m-0">
									此操作将影响当前共享的{" "}
									<strong className="text-content-primary">
										{sharedCount} 个工作空间
									</strong>。
								</p>
							) : (
								<p className="text-content-secondary m-0">
									此组织中当前没有共享的工作空间。
								</p>
							)}
							<p>
								重新启用工作空间共享将{" "}
								<strong className="text-content-primary">不会恢复</strong>{" "}
								这些权限。
							</p>
						</div>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={onCancel} disabled={isLoading}>
						取消
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isLoading}
					>
						<Spinner loading={isLoading} />
						{isRestrictingToServiceAccounts ? "限制共享" : "禁用共享"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
