import { CheckIcon, CopyIcon } from "lucide-react";
import type { FC } from "react";
import { Link as RouterLink } from "react-router";
import { Button } from "#/components/Button/Button";
import { SignInLayout } from "#/components/SignInLayout/SignInLayout";
import { Spinner } from "#/components/Spinner/Spinner";
import { Welcome } from "#/components/Welcome/Welcome";
import { useClipboard } from "#/hooks/useClipboard";

interface CliAuthPageViewProps {
	sessionToken?: string;
}

export const CliAuthPageView: FC<CliAuthPageViewProps> = ({ sessionToken }) => {
	const clipboardState = useClipboard();
	return (
		<SignInLayout>
			<Welcome>会话令牌</Welcome>

			<p className="m-0 text-center text-sm text-content-secondary leading-normal">
				复制下方的会话令牌并{" "}
				<strong className="block">将其粘贴到终端中。</strong>
			</p>

			<div className="flex flex-col items-center gap-1 w-full mt-4">
				<Button
					className="w-full"
					size="lg"
					disabled={!sessionToken}
					onClick={() => {
						if (sessionToken) {
							clipboardState.copyToClipboard(sessionToken);
						}
					}}
				>
					{clipboardState.showCopiedSuccess ? (
						<CheckIcon />
					) : (
						<Spinner loading={!sessionToken}>
							<CopyIcon />
						</Spinner>
					)}
					{clipboardState.showCopiedSuccess
						? "会话令牌已复制！"
						: "复制会话令牌"}
				</Button>

				<Button className="w-full" variant="subtle" asChild>
					<RouterLink to="/workspaces">转到工作区</RouterLink>
				</Button>
			</div>
		</SignInLayout>
	);
};
