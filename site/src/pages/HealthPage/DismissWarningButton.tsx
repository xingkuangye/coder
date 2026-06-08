import { BellIcon, BellOffIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { healthSettings, updateHealthSettings } from "#/api/queries/debug";
import type { HealthSection } from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import { Skeleton } from "#/components/Skeleton/Skeleton";
import { Spinner } from "#/components/Spinner/Spinner";

export const DismissWarningButton = (props: { healthcheck: HealthSection }) => {
	const queryClient = useQueryClient();
	const healthSettingsQuery = useQuery(healthSettings());
	// They call the same mutation but are used in diff contexts so we don't want
	// to merge their states. Eg. You dismiss a warning and when it is done it
	// will show the enable button but since the mutation is still invalidating
	// other queries it will be in the loading state when it should be idle.
	const enableMutation = useMutation(updateHealthSettings(queryClient));
	const dismissMutation = useMutation(updateHealthSettings(queryClient));

	if (!healthSettingsQuery.data) {
		return <Skeleton height={36} width={170} className="rounded-lg" />;
	}

	const { dismissed_healthchecks } = healthSettingsQuery.data;
	const isDismissed = dismissed_healthchecks.includes(props.healthcheck);

	if (isDismissed) {
		return (
			<Button
				disabled={healthSettingsQuery.isLoading || enableMutation.isPending}
				variant="outline"
				onClick={async () => {
					const updatedSettings = dismissed_healthchecks.filter(
						(dismissedHealthcheck) =>
							dismissedHealthcheck !== props.healthcheck,
					);
					await enableMutation.mutateAsync({
						dismissed_healthchecks: updatedSettings,
					});
					toast.success("警告已成功启用。");
				}}
			>
				<Spinner loading={enableMutation.isPending}>
					<BellOffIcon />
				</Spinner>
				启用警告
			</Button>
		);
	}

	return (
		<Button
			disabled={healthSettingsQuery.isLoading || dismissMutation.isPending}
			variant="outline"
			onClick={async () => {
				const updatedSettings = [...dismissed_healthchecks, props.healthcheck];
				await dismissMutation.mutateAsync({
					dismissed_healthchecks: updatedSettings,
				});
				toast.success("警告已成功忽略。");
			}}
		>
			<Spinner loading={dismissMutation.isPending}>
				<BellIcon />
			</Spinner>
			忽略警告
		</Button>
	);
};
