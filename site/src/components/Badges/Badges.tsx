import { Badge } from "#/components/Badge/Badge";

export const EnabledBadge: React.FC = () => {
	return (
		<Badge className="option-enabled" variant="green">
			已启用
		</Badge>
	);
};

export const EntitledBadge: React.FC = () => {
	return <Badge variant="green">已授权</Badge>;
};

export const DisabledBadge: React.FC<React.ComponentPropsWithRef<"div">> = ({
	...props
}) => {
	return (
		<Badge {...props} className="option-disabled">
			已禁用
		</Badge>
	);
};

export const EnterpriseBadge: React.FC = () => {
	return <Badge variant="purple">企业版</Badge>;
};

interface PremiumBadgeProps {
	children?: React.ReactNode;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
	children = "高级版",
}) => {
	return <Badge variant="magenta">{children}</Badge>;
};

export const PreviewBadge: React.FC = () => {
	return <Badge variant="purple">预览版</Badge>;
};

export const AlphaBadge: React.FC = () => {
	return <Badge variant="purple">Alpha</Badge>;
};

export const DeprecatedBadge: React.FC = () => {
	return <Badge variant="warning">已弃用</Badge>;
};

export const Badges: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<div className="flex flex-row items-center gap-2 mb-4">{children}</div>
	);
};
