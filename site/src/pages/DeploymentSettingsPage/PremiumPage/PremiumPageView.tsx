import {
	ActivityIcon,
	CoinsIcon,
	ExpandIcon,
	SquareArrowOutUpRightIcon,
} from "lucide-react";
import type { FC } from "react";
import { Button } from "#/components/Button/Button";
import { Link } from "#/components/Link/Link";
import { docs } from "#/utils/docs";

type PremiumPageViewProps = { isEnterprise: boolean };

export const PremiumPageView: FC<PremiumPageViewProps> = ({ isEnterprise }) => {
	return isEnterprise ? <EnterpriseVersion /> : <OSSVersion />;
};

const EnterpriseVersion: FC = () => {
	return (
		<div className="max-w-4xl">
			<header className="flex flex-row justify-between align-baseline pb-5">
				<div>
					<h1 className="text-3xl m-0 font-semibold">高级版</h1>
					<p className="text-sm max-w-xl mt-2 text-content-secondary font-medium">
						作为企业许可证持有者，您已经在使用 Coder
						的安全、大规模部署功能。升级到 Coder
						高级版可获得增强的多租户控制和灵活性。
					</p>
				</div>
				<Button asChild>
					<a href="https://coder.com/contact/sales" className="no-underline">
						<SquareArrowOutUpRightIcon />
						联系销售
					</a>
				</Button>
			</header>

			<section className="pb-1">
				<h2 className="text-sm font-semibold m-0">
					<Link className="px-0" href={docs("/admin/users/organizations")}>
						多组织访问控制
					</Link>
				</h2>
				<p className="text-sm max-w-xl text-content-secondary mt-0 font-medium">
					在单个部署中管理多个团队和项目，每个都具有隔离的访问权限。
				</p>
			</section>

			<section className="pb-1">
				<h2 className="text-sm font-semibold m-0">
					<Link className="px-0" href={docs("/admin/users/groups-roles")}>
						自定义角色
					</Link>
				</h2>
				<p className="text-sm max-w-xl text-content-secondary mt-0 font-medium">
					通过定制角色为团队或承包商配置特定的权限。
				</p>
			</section>

			<section>
				<h2 className="text-sm font-semibold m-0">
					<Link className="px-0" href={docs("/admin/users/quotas")}>
						组织级配额用于成本核算
					</Link>
				</h2>
				<p className="text-sm max-w-xl text-content-secondary mt-0 font-medium">
					在组织级别设置和监控资源配额，以支持内部成本跟踪。
				</p>
			</section>

			<section className="pt-10">
				<p className="text-sm max-w-xl text-content-secondary mt-0 font-medium">
					这些高级功能使您能够跨多个平台团队管理团队结构和预算分配。
				</p>
			</section>
		</div>
	);
};

const OSSVersion: FC = () => {
	return (
		<div className="max-w-4xl">
			<div className="flex flex-row justify-between align-baseline pb-10">
				<div>
					<h1 className="text-3xl m-0 text-content-primary font-semibold">
						高级版
					</h1>
					<p className="text-sm max-w-xl mt-2 text-content-secondary">
						Coder
						高级版专为需要高效、安全且完全可控地扩展其部署的企业而设计。通过升级，您的团队将获得高级功能，从而在所有环境中实现治理。
					</p>
				</div>
				<Button asChild>
					<a href="https://coder.com/contact/sales" className="no-underline">
						<SquareArrowOutUpRightIcon />
						联系销售
					</a>
				</Button>
			</div>

			<section className="pb-10 max-w-xl text-sm text-content-secondary">
				<h2 className="text-xl text-content-primary m-0">
					<span className="flex flex-row items-center">
						<ExpandIcon className="size-icon-sm text-content-secondary" />
						&nbsp; 大规模部署 Coder
					</span>
				</h2>
				<p>
					让您的企业能够以卓越的性能和可靠性部署和管理数千个工作空间。
				</p>
				<ul className="pl-5">
					<li>
						<span className="text-content-primary font-semibold">
							高可用性
						</span>
						<br />
						<span className="font-medium">
							通过跨多个 Coder 实例的自动故障转移和负载均衡进行扩展。
						</span>
					</li>
					<li>
						<span className="text-content-primary font-semibold">
							多组织访问控制
						</span>
						<br />
						<span className="font-medium">
							在单个 Coder 部署中隔离团队、项目和环境。
						</span>
					</li>
					<li>
						<span className="text-content-primary font-semibold">
							无限外部认证集成
						</span>
						<br />
						<span className="font-medium">
							与 GitHub、JFrog 和 Vault 等外部服务提供商集成。
						</span>
					</li>
				</ul>
			</section>

			<section className="pb-10 max-w-xl text-sm text-content-secondary">
				<h2 className="text-xl text-content-primary m-0">
					<span className="flex flex-row items-center">
						<CoinsIcon className="size-icon-sm text-content-secondary" />
						&nbsp; 控制基础设施成本
					</span>
				</h2>
				<p>
					优化云使用，为您的团队保持经济高效的资源管理。
				</p>
				<ul className="pl-5">
					<li>
						<span className="text-content-primary font-semibold">
							自动停止空闲工作空间
						</span>
						<br />
						<span className="font-medium">
							自动关闭不活跃的工作空间，以避免不必要的成本。
						</span>
					</li>
					<li>
						<span className="text-content-primary font-semibold">
							资源配额
						</span>
						<br />
						<span className="font-medium">
							设置用户和团队特定的限制，以控制支出和资源分配。
						</span>
					</li>
					<li>
						<span className="text-content-primary font-semibold">
							使用情况洞察
						</span>
						<br />
						<span className="font-medium">
							跟踪工作空间使用模式，以便基于数据做出基础设施需求的决策。
						</span>
					</li>
				</ul>
			</section>

			<section className="pb-5 max-w-xl text-sm text-content-secondary">
				<h2 className="text-xl text-content-primary m-0">
					<span className="flex flex-row items-center">
						<ActivityIcon className="size-icon-sm text-content-secondary" />
						&nbsp; 管理工作空间活动
					</span>
				</h2>
				<p>
					通过强大的治理功能，在整个组织内维护安全性和合规性。
				</p>
				<ul className="pl-5">
					<li>
						<span className="text-content-primary font-semibold">
							审计日志
						</span>
						<br />
						<span className="font-medium">
							捕获用户操作和工作空间活动的详细记录，以满足合规性和安全性的要求。
						</span>
					</li>
					<li>
						<span className="text-content-primary font-semibold">
							模板权限
						</span>
						<br />
						<span className="font-medium">
							控制谁可以跨团队创建、修改和访问工作空间模板。
						</span>
					</li>
					<li>
						<span className="text-content-primary font-semibold">
							工作空间命令日志
						</span>
						<br />
						<span className="font-medium">
							监控和记录关键命令，以确保满足安全性和合规性标准。
						</span>
					</li>
				</ul>
			</section>
		</div>
	);
};
