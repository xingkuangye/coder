import { PremiumBadge } from "#/components/Badges/Badges";
import { docs } from "#/utils/docs";
import {
	Paywall,
	PaywallContent,
	PaywallCTA,
	PaywallDescription,
	PaywallDocumentationLink,
	PaywallFeature,
	PaywallFeatures,
	PaywallHeading,
	PaywallSeparator,
	PaywallStack,
	PaywallTitle,
} from "./Paywall";

const PaywallAIGovernance = () => {
	return (
		<Paywall>
			<PaywallContent>
				<PaywallHeading>
					<PaywallTitle>AI 网关</PaywallTitle>
					<PremiumBadge>AI 治理</PremiumBadge>
				</PaywallHeading>
				<PaywallDescription>
					AI 网关提供对来自 Coder 工作空间内开发工具的用户提示和 LLM 工具调用的可审计可见性。AI 网关需要具有 AI 治理附加功能的 Premium 许可证。
				</PaywallDescription>
				<PaywallDocumentationLink href={docs("/ai-coder/ai-governance")}>
					了解 AI 治理
				</PaywallDocumentationLink>
			</PaywallContent>
			<PaywallSeparator />
			<PaywallStack>
				<PaywallFeatures>
					<PaywallFeature>可审计的用户提示历史记录</PaywallFeature>
					<PaywallFeature>已记录的 LLM 工具调用</PaywallFeature>
					<PaywallFeature>
						Token 使用和消耗可见性
					</PaywallFeature>
					<PaywallFeature>集中管理的 MCP 服务器</PaywallFeature>
					<PaywallFeature>
						<span>
							访问{" "}
							<a
								href={docs("/ai-coder/ai-bridge")}
								target="_blank"
								rel="noreferrer"
								className="text-content-link"
							>
								AI 网关文档
							</a>
						</span>
					</PaywallFeature>
				</PaywallFeatures>
				<PaywallCTA href="https://coder.com/contact/sales">
					联系销售
				</PaywallCTA>
			</PaywallStack>
		</Paywall>
	);
};

export { PaywallAIGovernance };
