import { useTheme } from "@emotion/react";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import { SearchIcon, XIcon } from "lucide-react";
import { type FC, type ReactNode, useMemo, useState } from "react";
import uFuzzy from "ufuzzy";
import { Button } from "#/components/Button/Button";
import { CopyableValue } from "#/components/CopyableValue/CopyableValue";
import { EmptyState } from "#/components/EmptyState/EmptyState";
import { Margins } from "#/components/Margins/Margins";
import {
	PageHeader,
	PageHeaderSubtitle,
	PageHeaderTitle,
} from "#/components/PageHeader/PageHeader";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { DEPRECATED_ICONS } from "#/theme/deprecatedIcons";
import {
	defaultParametersForBuiltinIcons,
	parseImageParameters,
} from "#/theme/externalImages";
import icons from "#/theme/icons.json";
import { pageTitle } from "#/utils/page";

const filteredIcons = icons.filter((icon) => !DEPRECATED_ICONS.includes(icon));
const iconsWithoutSuffix = filteredIcons.map((icon) => {
	const lastDotIndex = icon.lastIndexOf(".");
	return lastDotIndex === -1 ? icon : icon.substring(0, lastDotIndex);
});
const fuzzyFinder = new uFuzzy({
	intraMode: 1,
	intraIns: 1,
	intraSub: 1,
	intraTrn: 1,
	intraDel: 1,
});

const IconsPage: FC = () => {
	const theme = useTheme();
	const [searchInputText, setSearchInputText] = useState("");
	const searchText = searchInputText.trim();

	const searchedIcons = useMemo(() => {
		if (!searchText) {
			return filteredIcons.map((icon) => ({
				url: `/icon/${icon}`,
				description: icon,
			}));
		}

		const [map, info, sorted] = fuzzyFinder.search(
			iconsWithoutSuffix,
			searchText,
		);

		// We hit an invalid state somehow
		if (!map || !info || !sorted) {
			return [];
		}

		return sorted.map((i) => {
			const iconName = filteredIcons[info.idx[i]];
			const ranges = info.ranges[i];

			const nodes: ReactNode[] = [];
			let cursor = 0;
			for (let j = 0; j < ranges.length; j += 2) {
				nodes.push(iconName.slice(cursor, ranges[j]));
				nodes.push(
					<mark key={j + 1}>{iconName.slice(ranges[j], ranges[j + 1])}</mark>,
				);
				cursor = ranges[j + 1];
			}
			nodes.push(iconName.slice(cursor));
			return { url: `/icon/${iconName}`, description: nodes };
		});
	}, [searchText]);

	return (
		<>
			<title>{pageTitle("图标")}</title>
			<Margins>
				<PageHeader
					actions={
						<Tooltip>
							<TooltipTrigger asChild>
								<Link href="https://github.com/coder/coder/tree/main/site/static/icon">
									建议一个图标
								</Link>
							</TooltipTrigger>
							<TooltipContent side="bottom" align="end" className="max-w-xs">
								您可以通过向我们公开的 GitHub 仓库提交 Pull Request 来建议新图标。请记住，该图标应与众多 Coder 用户相关，且可在宽松许可证下重新分发。
							</TooltipContent>
						</Tooltip>
					}
				>
					<PageHeaderTitle>图标</PageHeaderTitle>
					<PageHeaderSubtitle>
						Coder 附带的所有图标
					</PageHeaderSubtitle>
				</PageHeader>
				<TextField
					size="small"
					InputProps={{
						"aria-label": "筛选",
						name: "query",
						placeholder: "搜索…",
						value: searchInputText,
						onChange: (event) => setSearchInputText(event.target.value),
						sx: {
							borderRadius: "6px",
							marginLeft: "-1px",
							"& input::placeholder": {
								color: theme.palette.text.secondary,
							},
							"& .MuiInputAdornment-root": {
								marginLeft: 0,
							},
						},
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon className="size-icon-xs text-content-secondary" />
							</InputAdornment>
						),
						endAdornment: searchInputText && (
							<InputAdornment position="end">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											size="icon"
											variant="subtle"
											onClick={() => setSearchInputText("")}
										>
											<XIcon className="size-icon-xs" />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="bottom">清除筛选</TooltipContent>
								</Tooltip>
							</InputAdornment>
						),
					}}
				/>

				<div className="flex flex-row gap-2 justify-center flex-wrap max-w-full mt-8">
					{searchedIcons.length === 0 && (
						<EmptyState message="没有与您的搜索匹配的结果" />
					)}
					{searchedIcons.map((icon) => (
						<CopyableValue key={icon.url} value={icon.url}>
							<div className="flex flex-col gap-4 items-center max-w-full p-3">
								<img
									alt={icon.url}
									src={icon.url}
									className="size-16 object-contain pointer-events-none p-3"
									style={parseImageParameters(
										theme.externalImages,
										defaultParametersForBuiltinIcons.get(icon.url) ?? "",
									)}
								/>
								<figcaption className="w-[88px] h-12 text-[13px] text-ellipsis text-center overflow-hidden">
									{icon.description}
								</figcaption>
							</div>
						</CopyableValue>
					))}
				</div>
			</Margins>
		</>
	);
};

export default IconsPage;
