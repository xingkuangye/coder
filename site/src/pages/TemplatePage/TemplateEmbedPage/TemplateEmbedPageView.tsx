import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
	FriendlyDiagnostic,
	PreviewParameter,
	Template,
} from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import {
	HelpPopover,
	HelpPopoverContent,
	HelpPopoverIconTrigger,
	HelpPopoverLink,
	HelpPopoverLinksGroup,
	HelpPopoverText,
	HelpPopoverTitle,
} from "#/components/HelpPopover/HelpPopover";
import { Label } from "#/components/Label/Label";
import { RadioGroup, RadioGroupItem } from "#/components/RadioGroup/RadioGroup";
import { Separator } from "#/components/Separator/Separator";
import { Skeleton } from "#/components/Skeleton/Skeleton";
import { useClipboard } from "#/hooks/useClipboard";
import {
	Diagnostics,
	DynamicParameter,
} from "#/modules/workspaces/DynamicParameter/DynamicParameter";
import { docs } from "#/utils/docs";

type ButtonValues = Record<string, string>;

type TemplateEmbedPageViewProps = {
	template: Template;
	parameters: PreviewParameter[];
	diagnostics: readonly FriendlyDiagnostic[];
	error: unknown;
	sendMessage: (message: Record<string, string>) => void;
	isLoading: boolean;
};

export const TemplateEmbedPageView: React.FC<TemplateEmbedPageViewProps> = ({
	template,
	parameters,
	diagnostics,
	error,
	sendMessage,
	isLoading,
}) => {
	const [formState, setFormState] = useState<{
		mode: "manual" | "auto";
		paramValues: Record<string, string>;
	}>({
		mode: "manual",
		paramValues: {},
	});

	useEffect(() => {
		if (parameters) {
			const serverParamValues: Record<string, string> = {};
			for (const p of parameters) {
				const initialVal = p.value?.valid ? p.value.value : "";
				serverParamValues[p.name] = initialVal;
			}
			setFormState((prev) => ({ ...prev, paramValues: serverParamValues }));
		}
	}, [parameters]);

	const buttonValues = useMemo(() => {
		const values: ButtonValues = { mode: formState.mode };
		for (const [key, value] of Object.entries(formState.paramValues)) {
			values[`param.${key}`] = value;
		}
		return values;
	}, [formState]);

	const handleChange = (
		changedParamInfo: PreviewParameter,
		newValue: string,
	) => {
		const newParamValues = {
			...formState.paramValues,
			[changedParamInfo.name]: newValue,
		};
		setFormState((prev) => ({ ...prev, paramValues: newParamValues }));

		const formInputsToSend: Record<string, string> = { ...newParamValues };
		for (const p of parameters) {
			if (!(p.name in formInputsToSend)) {
				formInputsToSend[p.name] = p.value?.valid ? p.value.value : "";
			}
		}

		sendMessage(formInputsToSend);
	};

	return (
		<div className="flex flex-col-reverse gap-12 md:flex-row md:items-start md:justify-around">
			<div className="flex flex-col grow gap-5 max-w-screen-sm">
				<div className="flex flex-col gap-9">
					<section className="flex flex-col gap-2">
						<div>
							<h2 className="text-lg font-bold m-0">创建模式</h2>
							<p className="text-sm text-content-secondary m-0">
								当设置为自动模式时，点击按钮将自动创建工作区，而不会向用户显示表单。
							</p>
						</div>
						<RadioGroup
							value={formState.mode}
							onValueChange={(v) => {
								setFormState((prev) => ({
									...prev,
									mode: v as "manual" | "auto",
								}));
							}}
						>
							<div className="flex items-center gap-3">
								<RadioGroupItem value="manual" id="manual" />
								<Label htmlFor="manual" className="cursor-pointer">
									手动
								</Label>
							</div>
							<div className="flex items-center gap-3">
								<RadioGroupItem value="auto" id="automatic" />
								<Label htmlFor="automatic" className="cursor-pointer">
									自动
								</Label>
							</div>
						</RadioGroup>
					</section>

					<Separator />

					{Boolean(error) && <ErrorAlert error={error} />}
					{diagnostics.length > 0 && <Diagnostics diagnostics={diagnostics} />}

					{isLoading ? (
						<ParametersSkeleton />
					) : (
						parameters.length > 0 && (
							<div className="flex flex-col gap-9">
								{parameters.map((parameter) => (
									<DynamicParameter
										key={parameter.name}
										parameter={parameter}
										onChange={(value) => handleChange(parameter, value)}
										disabled={parameter.styling?.disabled}
										value={formState.paramValues[parameter.name] || ""}
									/>
								))}
							</div>
						)
					)}

					<div className="flex flex-row items-center gap-4">
						{isLoading ? (
							<Button disabled={isLoading}>测试</Button>
						) : (
							<Button asChild>
								<a
									target="_blank"
									rel="noreferrer"
									href={getButtonUrl(template, {
										...buttonValues,
										mode: "manual",
									})}
								>
									测试
								</a>
							</Button>
						)}

						<TestHelpPopover />
					</div>
				</div>
			</div>

			<ButtonPreview template={template} buttonValues={buttonValues} />
		</div>
	);
};

const ParametersSkeleton: React.FC = () => {
	return (
		<div role="progressbar" className="flex flex-col gap-9">
			<div className="flex flex-col gap-2">
				<Skeleton className="h-5 w-1/3" />
				<Skeleton className="h-9 w-full" />
			</div>
			<div className="flex flex-col gap-2">
				<Skeleton className="h-5 w-1/3" />
				<Skeleton className="h-9 w-full" />
			</div>
			<div className="flex flex-col gap-2">
				<Skeleton className="h-5 w-1/3" />
				<Skeleton className="h-9 w-full" />
			</div>
		</div>
	);
};

const TestHelpPopover: React.FC = () => {
	return (
		<HelpPopover>
			<HelpPopoverIconTrigger size="small" />
			<HelpPopoverContent>
				<HelpPopoverTitle>测试您的 Open in Coder 设置</HelpPopoverTitle>
				<HelpPopoverText>
					此按钮将在新标签页中打开包含您提供的参数的工作区创建页面。在使用之前，用此来调试您的{" "}
					<strong>Open in Coder</strong> 按钮。
				</HelpPopoverText>
				<HelpPopoverText>
					注意：即使您已将创建模式设置为自动，此按钮也不会自动创建工作区，以便您有机会检查参数并排查错误。
				</HelpPopoverText>
				<HelpPopoverLinksGroup>
					<HelpPopoverLink href={docs("/admin/templates/open-in-coder")}>
						模板 &ndash; Open in Coder
					</HelpPopoverLink>
				</HelpPopoverLinksGroup>
			</HelpPopoverContent>
		</HelpPopover>
	);
};

const deploymentUrl = `${location.protocol}//${location.host}`;

function getClipboardCopyContent(
	template: Template,
	buttonValues: ButtonValues | undefined,
): string {
	const buttonUrl = getButtonUrl(template, buttonValues);
	return `[![Open in Coder](${deploymentUrl}/open-in-coder.svg)](${buttonUrl})`;
}

function getButtonUrl(
	template: Template,
	buttonValues: ButtonValues | undefined,
): string {
	const createWorkspaceUrl = `${deploymentUrl}/templates/${template.organization_name}/${template.name}/workspace`;
	const createWorkspaceParams = new URLSearchParams(buttonValues);
	return `${createWorkspaceUrl}?${createWorkspaceParams.toString()}`;
}

type ButtonPreviewProps = {
	template: Template;
	buttonValues: ButtonValues | undefined;
};

const ButtonPreview: React.FC<ButtonPreviewProps> = ({
	template,
	buttonValues,
}) => {
	const clipboard = useClipboard();
	return (
		<div className="flex gap-8 pt-4 flex-col items-center justify-center">
			<div
				className="
				flex flex-col items-center justify-center p-6
			 	rounded-lg border border-border border-solid bg-surface-secondary"
			>
				<img src="/open-in-coder.svg" alt="Open in Coder 按钮" />
			</div>
			<Button
				variant="default"
				disabled={clipboard.showCopiedSuccess}
				onClick={() => {
					const textToCopy = getClipboardCopyContent(template, buttonValues);
					clipboard.copyToClipboard(textToCopy);
				}}
			>
				{clipboard.showCopiedSuccess ? <CheckIcon /> : <CopyIcon />} 复制按钮 Markdown
			</Button>
		</div>
	);
};
