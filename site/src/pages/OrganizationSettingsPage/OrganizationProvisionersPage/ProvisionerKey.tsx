import { InfoIcon } from "lucide-react";
import type { FC, ReactNode } from "react";
import {
	ProvisionerKeyNameBuiltIn,
	ProvisionerKeyNamePSK,
	ProvisionerKeyNameUserAuth,
} from "#/api/typesGenerated";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";

type KeyType = "builtin" | "userAuth" | "psk" | "key";

function getKeyType(name: string) {
	switch (name) {
		case ProvisionerKeyNameBuiltIn:
			return "builtin";
		case ProvisionerKeyNameUserAuth:
			return "userAuth";
		case ProvisionerKeyNamePSK:
			return "psk";
		default:
			return "key";
	}
}

const infoByType: Record<KeyType, ReactNode> = {
	builtin: (
		<>
			这些 provisioner 作为 coderd 实例的一部分运行。内置 provisioner
			仅适用于默认组织。{" "}
		</>
	),
	userAuth: (
		<>
			这些 provisioner 由用户通过 <code>coder</code> CLI
			连接，并通过用户凭据进行授权。可以为其打上标签，使其仅运行该用户的
			provisioner 作业。用户认证的 provisioner 仅适用于默认组织。
		</>
	),
	psk: (
		<>
			这些 provisioner 均使用预共享密钥身份验证。PSK provisioner 仅适用于默认组织。
		</>
	),
	key: null,
};

type ProvisionerKeyProps = {
	name: string;
};

export const ProvisionerKey: FC<ProvisionerKeyProps> = ({ name }) => {
	const type = getKeyType(name);
	const info = infoByType[type];

	return (
		<span className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-content-secondary">
			{name}
			{info && (
				<Tooltip>
					<TooltipTrigger asChild>
						<span className="flex items-center">
							<span className="sr-only">更多信息</span>
							<InfoIcon
								tabIndex={0}
								className="cursor-pointer size-icon-xs p-0.5"
							/>
						</span>
					</TooltipTrigger>
					<TooltipContent className="max-w-xs">
						{infoByType[type]}
					</TooltipContent>
				</Tooltip>
			)}
		</span>
	);
};
