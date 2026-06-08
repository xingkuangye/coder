import CircularProgress from "@mui/material/CircularProgress";
import type { FC } from "react";
import type { GitSSHKey } from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import { CodeExample } from "#/components/CodeExample/CodeExample";

interface SSHKeysPageViewProps {
	isLoading: boolean;
	getSSHKeyError?: unknown;
	sshKey?: GitSSHKey;
	onRegenerateClick: () => void;
}

export const SSHKeysPageView: FC<SSHKeysPageViewProps> = ({
	isLoading,
	getSSHKeyError,
	sshKey,
	onRegenerateClick,
}) => {
	if (isLoading) {
		return (
			<div className="p-8">
				<CircularProgress size={26} />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Regenerating the key is not an option if getSSHKey fails.
        Only one of the error messages will exist at a single time */}
			{Boolean(getSSHKeyError) && <ErrorAlert error={getSSHKeyError} />}

			{sshKey && (
				<>
					<p className="leading-relaxed font-normal text-sm text-content-secondary m-0">
						下面的公钥用于在工作区中进行 Git 身份验证。您可以将其添加到需要从工作区访问的 Git 服务（如 GitHub）中。Coder 通过{" "}
						<code className="bg-surface-quaternary text-xs py-0.5 px-1 text-content-primary rounded-sm">
							$GIT_SSH_COMMAND
						</code>
						配置身份验证。
					</p>
					<CodeExample secret={false} code={sshKey.public_key.trim()} />
					<div>
						<Button
							onClick={onRegenerateClick}
							data-testid="regenerate"
							variant="outline"
						>
							重新生成&hellip;
						</Button>
					</div>
				</>
			)}
		</div>
	);
};
