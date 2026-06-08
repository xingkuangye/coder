import { humanDuration } from "#/utils/time";

const hours = (h: number) => "小时";

export const DefaultTTLHelperText = (props: { ttl?: number }) => {
	const { ttl = 0 } = props;

	// Error will show once field is considered touched
	if (ttl < 0) {
		return null;
	}

	if (ttl === 0) {
		return <span>工作区将一直运行，直到手动停止。</span>;
	}

	return (
		<span>
			工作区将默认在启动后 {ttl} {hours(ttl)} 自动停止。
		</span>
	);
};

export const ActivityBumpHelperText = (props: {
	bump?: number;
	defaultTTL?: number;
}) => {
	const { bump = 0, defaultTTL = 0 } = props;

	if (!defaultTTL) {
		return (
			<span>
				活动延长时间仅在配置了默认 TTL 时生效。请在上方设置默认 TTL
				以启用活动延长时间。
			</span>
		);
	}

	// Error will show once field is considered touched
	if (bump < 0) {
		return null;
	}

	if (bump === 0) {
		return (
			<span>
				工作区的停止时间不会根据用户活动自动延长。用户仍可手动延迟停止时间。
			</span>
		);
	}

	return (
		<span>
			检测到用户活动时，工作区将自动延长 {bump} {hours(bump)}。
		</span>
	);
};

export const FailureTTLHelperText = (props: { ttl?: number }) => {
	const { ttl = 0 } = props;

	// Error will show once field is considered touched
	if (ttl < 0) {
		return null;
	}

	if (ttl === 0) {
		return <span>Coder 不会自动停止失败的工作区。</span>;
	}

	return (
		<span>
			Coder 将在 {humanDuration(ttl)} 后尝试停止失败的工作区。
		</span>
	);
};

export const DormancyTTLHelperText = (props: { ttl?: number }) => {
	const { ttl = 0 } = props;

	// Error will show once field is considered touched
	if (ttl < 0) {
		return null;
	}

	if (ttl === 0) {
		return <span>Coder 不会将工作区标记为休眠状态。</span>;
	}

	return (
		<span>
			Coder 将在没有用户连接的 {humanDuration(ttl)} 后将工作区标记为休眠状态。
		</span>
	);
};

export const DormancyAutoDeletionTTLHelperText = (props: { ttl?: number }) => {
	const { ttl = 0 } = props;

	// Error will show once field is considered touched
	if (ttl < 0) {
		return null;
	}

	if (ttl === 0) {
		return <span>Coder 不会自动删除休眠的工作区。</span>;
	}

	return (
		<span>
			Coder 将在{" "}
			{humanDuration(ttl)} 后自动删除休眠的工作区。
		</span>
	);
};
