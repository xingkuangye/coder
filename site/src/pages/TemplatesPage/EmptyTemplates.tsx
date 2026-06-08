import Link from "@mui/material/Link";
import type { FC } from "react";
import { Link as RouterLink } from "react-router";
import type { TemplateExample } from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import { CodeExample } from "#/components/CodeExample/CodeExample";
import { TableEmpty } from "#/components/TableEmpty/TableEmpty";
import { TemplateExampleCard } from "#/modules/templates/TemplateExampleCard/TemplateExampleCard";
import { docs } from "#/utils/docs";

// Those are from https://github.com/coder/coder/tree/main/examples/templates
const featuredExampleIds = [
	"quickstart",
	"docker",
	"kubernetes",
	"aws-linux",
	"gcp-linux",
	"azure-linux",
];

const findFeaturedExamples = (examples: TemplateExample[]) => {
	const featuredExamples: TemplateExample[] = [];

	// We loop the featuredExampleIds first to keep the order
	for (const exampleId of featuredExampleIds) {
		for (const example of examples) {
			if (exampleId === example.id) {
				featuredExamples.push(example);
			}
		}
	}

	return featuredExamples;
};

interface EmptyTemplatesProps {
	canCreateTemplates: boolean;
	examples: TemplateExample[];
	isUsingFilter: boolean;
}

export const EmptyTemplates: FC<EmptyTemplatesProps> = ({
	canCreateTemplates,
	examples,
	isUsingFilter,
}) => {
	if (isUsingFilter) {
		return <TableEmpty message="没有符合您搜索条件的结果" />;
	}

	const featuredExamples = findFeaturedExamples(examples);

	if (canCreateTemplates) {
		return (
			<TableEmpty
				message="创建您的第一个模板"
				description={
					<>
						模板使用 Terraform 编写，描述了工作区的基础设施。您可以从下面的起始模板开始使用，或者{" "}
						<Link
							href={docs("/admin/templates/creating-templates")}
							target="_blank"
							rel="noreferrer"
						>
							创建自己的模板
						</Link>
						。
					</>
				}
				cta={
					<div className="flex flex-col gap-8 items-center">
						<div className="flex flex-wrap justify-center gap-4">
							{featuredExamples.map((example) => (
								<TemplateExampleCard example={example} key={example.id} />
							))}
						</div>
						<Button size="sm" asChild className="rounded-full">
							<RouterLink to="/starter-templates">
								查看所有起始模板
							</RouterLink>
						</Button>
					</div>
				}
			/>
		);
	}

	return (
		<TableEmpty
			message="创建模板"
			description="联系您的 Coder 管理员创建模板。您可以分享下面的代码。"
			cta={<CodeExample secret={false} code="coder templates init" />}
		/>
	);
};
