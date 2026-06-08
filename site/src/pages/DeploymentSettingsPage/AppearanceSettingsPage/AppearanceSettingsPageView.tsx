import { useFormik } from "formik";
import type { FC } from "react";
import type { UpdateAppearanceConfig } from "#/api/typesGenerated";
import {
	Badges,
	EnterpriseBadge,
	PremiumBadge,
} from "#/components/Badges/Badges";
import { Button } from "#/components/Button/Button";
import { Input } from "#/components/Input/Input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "#/components/InputGroup/InputGroup";
import { PopoverPaywall } from "#/components/Paywall/PopoverPaywall";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { docs } from "#/utils/docs";
import { getFormHelpers } from "#/utils/formUtils";
import { Fieldset } from "../Fieldset";
import { AnnouncementBannerSettings } from "./AnnouncementBannerSettings";

type AppearanceSettingsPageViewProps = {
	appearance: UpdateAppearanceConfig;
	isEntitled: boolean;
	isPremium: boolean;
	onSaveAppearance: (
		newConfig: Partial<UpdateAppearanceConfig>,
	) => Promise<void>;
};

export const AppearanceSettingsPageView: FC<
	AppearanceSettingsPageViewProps
> = ({ appearance, isEntitled, isPremium, onSaveAppearance }) => {
	const applicationNameForm = useFormik<{
		application_name: string;
	}>({
		initialValues: {
			application_name: appearance.application_name,
		},
		onSubmit: (values) => onSaveAppearance(values),
	});
	const applicationNameFieldHelpers = getFormHelpers(applicationNameForm);

	const logoForm = useFormik<{
		logo_url: string;
	}>({
		initialValues: {
			logo_url: appearance.logo_url,
		},
		onSubmit: (values) => onSaveAppearance(values),
	});
	const logoFieldHelpers = getFormHelpers(logoForm);

	return (
		<>
			<SettingsHeader>
				<SettingsHeaderTitle>外观</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					自定义您的 Coder 部署的外观和感觉。
				</SettingsHeaderDescription>
			</SettingsHeader>

			<Badges>
				<Tooltip>
					{isEntitled && !isPremium ? (
						<EnterpriseBadge />
					) : (
						<TooltipTrigger asChild>
							<span>
								<PremiumBadge />
							</span>
						</TooltipTrigger>
					)}

					<TooltipContent
						sideOffset={-28}
						collisionPadding={16}
						className="p-0"
					>
						<PopoverPaywall
							message="外观"
							description="拥有高级许可证，您可以自定义部署的外观和品牌标识。"
							documentationLink={docs("/admin/setup/appearance")}
						/>
					</TooltipContent>
				</Tooltip>
			</Badges>

			<Fieldset
				title="应用程序名称"
				subtitle="指定要在登录页面上显示的自定义应用程序名称。"
				validation={!isEntitled ? "这是仅限企业版的功能。" : ""}
				onSubmit={applicationNameForm.handleSubmit}
				button={!isEntitled && <Button disabled>提交</Button>}
			>
				<Input
					{...applicationNameFieldHelpers("application_name")}
					placeholder='留空以显示“Coder”。'
					disabled={!isEntitled}
					aria-label="应用程序名称"
				/>
			</Fieldset>

			<Fieldset
				title="徽标 URL"
				subtitle="指定要在登录页面和仪表板左上角显示的自定义徽标 URL。"
				validation={
					isEntitled
						? "具有透明度且宽高比不超过 3:1 的图片效果最佳。"
						: "这是仅限企业版的功能。"
				}
				onSubmit={logoForm.handleSubmit}
				button={!isEntitled && <Button disabled>提交</Button>}
			>
				<InputGroup>
					<InputGroupInput
						{...logoFieldHelpers("logo_url")}
						placeholder="留空以显示 Coder 徽标。"
						disabled={!isEntitled}
						aria-label="徽标 URL"
					/>
					<InputGroupAddon align="inline-end">
						<img
							alt=""
							src={logoForm.values.logo_url}
							className="h-6 w-6 max-w-full object-contain"
							// Hide broken image icon while users type incomplete URLs.
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
							onLoad={(e) => {
								e.currentTarget.style.display = "inline";
							}}
						/>
					</InputGroupAddon>
				</InputGroup>
			</Fieldset>

			<AnnouncementBannerSettings
				isEntitled={isEntitled}
				announcementBanners={appearance.announcement_banners || []}
				onSubmit={(announcementBanners) =>
					onSaveAppearance({ announcement_banners: announcementBanners })
				}
			/>
		</>
	);
};
