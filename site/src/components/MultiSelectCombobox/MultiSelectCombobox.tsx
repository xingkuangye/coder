/**
 * 本组件基于 multiple-selector
 * @see {@link https://shadcnui-expansions.typeart.cc/docs/multiple-selector}
 */
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { InfoIcon, XIcon } from "lucide-react";
import {
	type ComponentPropsWithoutRef,
	type KeyboardEvent,
	type ReactNode,
	type Ref,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { ChevronDownIcon } from "#/components/AnimatedIcons/ChevronDown";
import { Avatar } from "#/components/Avatar/Avatar";
import { Badge } from "#/components/Badge/Badge";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "#/components/Command/Command";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { useDebouncedValue } from "#/hooks/debounce";
import { cn } from "#/utils/cn";

export interface Option {
	value: string;
	label: string;
	icon?: string;
	disable?: boolean;
	description?: string;
	/** 固定的选项，不可移除。 */
	fixed?: boolean;
	/** 通过提供的键对选项进行分组。 */
	[key: string]: string | boolean | undefined;
}
interface GroupOption {
	[key: string]: Option[];
}

interface MultiSelectComboboxProps {
	value?: Option[];
	defaultOptions?: Option[];
	/** 手动控制的选项 */
	options?: Option[];
	placeholder?: string;
	/** 加载中组件。 */
	loadingIndicator?: ReactNode;
	/** 空状态组件。 */
	emptyIndicator?: ReactNode;
	/** 异步搜索的防抖时间。仅在提供 `onSearch` 时有效。 */
	delay?: number;
	/**
	 * 仅在提供 `onSearch` 属性时有效。当 `onFocus` 时触发搜索。
	 * 例如，用户点击输入框时，会触发搜索以获取初始选项。
	 **/
	triggerSearchOnFocus?: boolean;
	/** 异步搜索 */
	onSearch?: (value: string) => Promise<Option[]>;
	/**
	 * 同步搜索。此搜索不会显示 loadingIndicator。
	 * 其他属性与异步搜索相同，例如：creatable、groupBy、delay。
	 **/
	onSearchSync?: (value: string) => Option[];
	onChange?: (options: Option[]) => void;
	/** 限制最大可选选项数。 */
	maxSelected?: number;
	/** 当选中的选项数量超出限制时，将调用 onMaxSelected。 */
	onMaxSelected?: (maxLimit: number) => void;
	/** 当有选项被选中时隐藏占位文本。 */
	hidePlaceholderWhenSelected?: boolean;
	disabled?: boolean;
	/** 根据提供的键对选项进行分组。 */
	groupBy?: string;
	className?: string;
	badgeClassName?: string;
	/**
	 * 默认情况下，cmdk 会选中第一个项目，因此默认值为 true。
	 * 这是一个通过添加一个虚拟项目来解决此问题的替代方案。
	 *
	 * @see {@link https://github.com/pacocoursey/cmdk/issues/171}
	 */
	selectFirstItem?: boolean;
	/** 允许在没有匹配选项时创建新选项。 */
	creatable?: boolean;
	/** `Command` 的属性 */
	commandProps?: ComponentPropsWithoutRef<typeof Command>;
	/** `CommandInput` 的属性 */
	inputProps?: Omit<
		ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
		"value" | "placeholder" | "disabled"
	>;
	/** 隐藏或显示清除所有选中选项的按钮。 */
	hideClearAllButton?: boolean;
	/** 用于测试的 Test ID */
	"data-testid"?: string;
	ref?: Ref<MultiSelectComboboxRef>;
}

interface MultiSelectComboboxRef {
	selectedValue: Option[];
	input: HTMLInputElement;
	focus: () => void;
	reset: () => void;
}

function transitionToGroupOption(options: Option[], groupBy?: string) {
	if (options.length === 0) {
		return {};
	}
	if (!groupBy) {
		return {
			"": options,
		};
	}

	const groupOption: GroupOption = {};
	for (const option of options) {
		const key = (option[groupBy] as string) || "";
		if (!groupOption[key]) {
			groupOption[key] = [];
		}
		groupOption[key].push(option);
	}
	return groupOption;
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
	const cloneOption = structuredClone(groupOption);

	for (const [key, value] of Object.entries(cloneOption)) {
		cloneOption[key] = value.filter(
			(val) => !picked.find((p) => p.value === val.value),
		);
	}
	return cloneOption;
}

function isOptionsExist(groupOption: GroupOption, targetOption: Option[]) {
	return Object.values(groupOption).some((value) =>
		value.some((option) => targetOption.some((o) => o.value === option.value)),
	);
}

/**
 * shadcn/ui 的 CommandEmpty 将导致 cmdk-empty 无法正确渲染。
 * 这里使用 cmdk 中的 `Empty` 实现创建了一个新的 CommandEmpty。
 *
 * @reference: https://github.com/hsuanyi-chou/shadcn-ui-expansions/issues/34#issuecomment-1949561607
 **/
const CommandEmpty: React.FC<
	React.ComponentPropsWithRef<typeof CommandPrimitive.Empty>
> = ({ className, ...props }) => {
	const render = useCommandState((state) => state.filtered.count === 0);

	if (!render) return null;

	return (
		<div
			className={cn("py-6 text-center text-sm", className)}
			cmdk-empty=""
			role="presentation"
			{...props}
		/>
	);
};

export const MultiSelectCombobox: React.FC<MultiSelectComboboxProps> = ({
	value,
	onChange,
	placeholder,
	defaultOptions: arrayDefaultOptions = [],
	options: arrayOptions,
	delay,
	onSearch,
	onSearchSync,
	loadingIndicator,
	emptyIndicator,
	maxSelected = Number.MAX_SAFE_INTEGER,
	onMaxSelected,
	hidePlaceholderWhenSelected,
	disabled,
	groupBy,
	className,
	badgeClassName,
	selectFirstItem = true,
	creatable = false,
	triggerSearchOnFocus = false,
	commandProps,
	inputProps,
	hideClearAllButton = false,
	"data-testid": dataTestId,
	ref,
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [open, setOpen] = useState(false);
	const [onScrollbar, setOnScrollbar] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const [selected, setSelected] = useState<Option[]>(arrayDefaultOptions ?? []);
	const [options, setOptions] = useState<GroupOption>(
		transitionToGroupOption(arrayDefaultOptions, groupBy),
	);
	const [inputValue, setInputValue] = useState("");
	const debouncedSearchTerm = useDebouncedValue(inputValue, delay || 500);

	const [previousValue, setPreviousValue] = useState<Option[]>(value || []);
	if (value && value !== previousValue) {
		setPreviousValue(value);
		setSelected(value);
	}

	useImperativeHandle(
		ref,
		() => ({
			selectedValue: [...selected],
			input: inputRef.current as HTMLInputElement,
			focus: () => inputRef?.current?.focus(),
			reset: () => setSelected([]),
		}),
		[selected],
	);

	const handleUnselect = useCallback(
		(option: Option) => {
			const newOptions = selected.filter((s) => s.value !== option.value);
			setSelected(newOptions);
			onChange?.(newOptions);
		},
		[onChange, selected],
	);

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		const input = inputRef.current;
		if (input) {
			if (e.key === "Delete" || e.key === "Backspace") {
				if (input.value === "" && selected.length > 0) {
					const lastSelectOption = selected[selected.length - 1];
					// If last item is fixed, we should not remove it.
					if (!lastSelectOption.fixed) {
						handleUnselect(selected[selected.length - 1]);
					}
				}
			}
			// This is not a default behavior of the <input /> field
			if (e.key === "Escape") {
				input.blur();
			}
		}
	};

	useEffect(() => {
		if (!open) {
			return;
		}

		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setOpen(false);
				inputRef.current.blur();
			}
		};

		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("touchend", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchend", handleClickOutside);
		};
	}, [open]);

	useEffect(() => {
		/** 如果提供了 `onSearch`，则不触发选项更新。 */
		if (!arrayOptions || onSearch) {
			return;
		}
		const newOption = transitionToGroupOption(arrayOptions || [], groupBy);
		if (JSON.stringify(newOption) !== JSON.stringify(options)) {
			setOptions(newOption);
		}
	}, [arrayOptions, groupBy, onSearch, options]);

	useEffect(() => {
		/** 同步搜索 */

		const doSearchSync = () => {
			const res = onSearchSync?.(debouncedSearchTerm);
			setOptions(transitionToGroupOption(res || [], groupBy));
		};

		const exec = () => {
			if (!onSearchSync || !open) return;

			if (triggerSearchOnFocus) {
				doSearchSync();
			}

			if (debouncedSearchTerm) {
				doSearchSync();
			}
		};

		void exec();
	}, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus, onSearchSync]);

	useEffect(() => {
		/** 异步搜索 */

		const doSearch = async () => {
			setIsLoading(true);
			const res = await onSearch?.(debouncedSearchTerm);
			setOptions(transitionToGroupOption(res || [], groupBy));
			setIsLoading(false);
		};

		const exec = async () => {
			if (!onSearch || !open) return;

			if (triggerSearchOnFocus) {
				await doSearch();
			}

			if (debouncedSearchTerm) {
				await doSearch();
			}
		};

		void exec();
	}, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus, onSearch]);

	// Scroll dropdown into view on open
	useEffect(() => {
		if (!open || !listRef.current) {
			return;
		}

		listRef.current.scrollIntoView({ behavior: "smooth" });
	}, [open]);

	const CreatableItem = () => {
		if (!creatable) {
			return undefined;
		}
		if (
			isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
			selected.find((s) => s.value === inputValue)
		) {
			return undefined;
		}

		const Item = (
			<CommandItem
				value={inputValue}
				className="cursor-pointer"
				onMouseDown={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
				onSelect={(value: string) => {
					if (selected.length >= maxSelected) {
						onMaxSelected?.(selected.length);
						return;
					}
					setInputValue("");
					const newOptions = [...selected, { value, label: value }];
					setSelected(newOptions);
					onChange?.(newOptions);
				}}
			>
				创建 "{inputValue}"
			</CommandItem>
		);

		// For normal creatable
		if (!onSearch && inputValue.length > 0) {
			return Item;
		}

		// For async search creatable. avoid showing creatable item before loading at first.
		if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
			return Item;
		}

		return undefined;
	};

	const EmptyItem = useCallback(() => {
		if (!emptyIndicator) return undefined;

		// For async search that showing emptyIndicator
		if (onSearch && !creatable && Object.keys(options).length === 0) {
			return (
				<CommandItem value="-" disabled>
					{emptyIndicator}
				</CommandItem>
			);
		}

		return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
	}, [creatable, emptyIndicator, onSearch, options]);

	const selectables = useMemo<GroupOption>(
		() => removePickedOption(options, selected),
		[options, selected],
	);

	/** 避免在粘贴长字符串时，可创建选择器出现冻结或延迟。 */
	const commandFilter = () => {
		if (commandProps?.filter) {
			return commandProps.filter;
		}

		if (creatable) {
			return (value: string, search: string) => {
				return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
			};
		}
		// Using default filter in `cmdk`. We don't have to provide it.
		return undefined;
	};

	if (inputRef.current && inputProps?.id) {
		inputRef.current.id = inputProps?.id;
	}

	const fixedOptions = selected.filter((s) => s.fixed);
	const showIcons = arrayOptions?.some((it) => it.icon);

	return (
		<Command
			ref={dropdownRef}
			{...commandProps}
			data-testid={dataTestId}
			onKeyDown={(e) => {
				handleKeyDown(e);
				commandProps?.onKeyDown?.(e);
			}}
			className={cn(
				"h-auto overflow-visible bg-transparent",
				commandProps?.className,
			)}
			shouldFilter={
				commandProps?.shouldFilter !== undefined
					? commandProps.shouldFilter
					: !onSearch
			} // When onSearch is provided, we don't want to filter the options. You can still override it.
			filter={commandFilter()}
		>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: onKeyDown is not needed here */}
			<div
				className={cn(
					`min-h-10 rounded-md border border-solid border-border text-sm pr-3
						focus-within:ring-2 focus-within:ring-content-link [&>svg]:p-0.5`,
					{
						"pl-3 py-1": selected.length !== 0,
						"cursor-text": !disabled && selected.length !== 0,
					},
					className,
				)}
				onClick={() => {
					if (disabled) return;
					inputRef?.current?.focus();
				}}
			>
				<div className="flex justify-between items-center">
					<div className="relative flex flex-wrap gap-1">
						{selected.map((option) => {
							return (
								<Badge
									key={option.value}
									className={cn(
										"data-[disabled]:bg-content-disabled data-[disabled]:text-surface-tertiary data-[disabled]:hover:bg-content-disabled",
										"data-[fixed]:bg-content-disabled data-[fixed]:text-surface-tertiary data-[fixed]:hover:bg-surface-secondary",
										badgeClassName,
									)}
									data-fixed={option.fixed}
									data-disabled={disabled || undefined}
								>
									<div className="flex items-center gap-1">
										{option.icon && (
											<Avatar
												size="sm"
												src={option.icon}
												fallback={option.label}
											/>
										)}
										{option.label}
									</div>
									<button
										type="button"
										data-testid="clear-option-button"
										className={cn(
											`ml-1 pr-0 rounded-sm bg-transparent border-none outline-none
												focus-visible:ring-2 focus-visible:ring-content-link focus-visible:ml-2.5 focus-visible:pl-0 cursor-pointer`,
											(disabled || option.fixed) && "hidden",
										)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleUnselect(option);
											}
										}}
										onMouseDown={(e) => {
											e.preventDefault();
											e.stopPropagation();
										}}
										onClick={() => handleUnselect(option)}
									>
										<XIcon className="h-4 w-4 text-content-secondary hover:text-content-primary align-text-bottom" />
									</button>
								</Badge>
							);
						})}
						{/* Avoid having the "Search" Icon */}
						<CommandPrimitive.Input
							{...inputProps}
							ref={inputRef}
							value={inputValue}
							disabled={disabled}
							onValueChange={(value) => {
								setInputValue(value);
								inputProps?.onValueChange?.(value);
							}}
							onBlur={(event) => {
								if (!onScrollbar) {
									setOpen(false);
								}
								inputProps?.onBlur?.(event);
							}}
							onFocus={(event) => {
								setOpen(true);
								triggerSearchOnFocus && onSearch?.(debouncedSearchTerm);
								inputProps?.onFocus?.(event);
							}}
							placeholder={
								hidePlaceholderWhenSelected && selected.length !== 0
									? ""
									: placeholder
							}
							className={cn(
								"flex-1 border-none outline-none bg-transparent placeholder:text-content-secondary",
								{
									"w-full": hidePlaceholderWhenSelected,
									"px-3 py-2.5": selected.length === 0,
									"ml-1": selected.length !== 0,
								},
								inputProps?.className,
							)}
						/>
					</div>
					<div className="flex items-center justify-between">
						<button
							type="button"
							data-testid="clear-all-button"
							onClick={() => {
								setSelected(fixedOptions);
								onChange?.(fixedOptions);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									setSelected(fixedOptions);
									onChange?.(fixedOptions);
								}
							}}
							className={cn(
								"bg-transparent mt-1 border-none rounded-sm",
								"cursor-pointer text-content-secondary hover:text-content-primary",
								"outline-none focus-visible:ring-2 focus-visible:ring-content-link [&>svg]:p-0.5",
								(hideClearAllButton ||
									disabled ||
									selected.length < 1 ||
									fixedOptions.length === selected.length) &&
									"hidden",
							)}
						>
							<XIcon className="h-5 w-5" />
						</button>
						<ChevronDownIcon
							open={open}
							className="size-icon-sm cursor-pointer text-content-secondary hover:text-content-primary"
						/>
					</div>
				</div>
			</div>
			<div className="relative" ref={listRef}>
				{open && (
					<CommandList
						className={`absolute top-1 z-10 w-full rounded-md
								border border-solid border-border
								bg-surface-primary text-content-primary shadow-md outline-none
								animate-in`}
						onPointerLeave={() => {
							setOnScrollbar(false);
						}}
						onPointerEnter={() => {
							setOnScrollbar(true);
						}}
						onMouseUp={() => {
							inputRef?.current?.focus();
						}}
					>
						{isLoading ? (
							loadingIndicator
						) : (
							<>
								{EmptyItem()}
								{CreatableItem()}
								{!selectFirstItem && (
									<CommandItem value="-" className="hidden" />
								)}
								{Object.entries(selectables).map(([key, dropdowns]) => (
									<CommandGroup
										key={key}
										heading={key}
										className="h-full overflow-auto"
									>
										{/* biome-ignore lint/complexity/noUselessFragments: A parent element is
											    needed for multiple dropdown items */}
										<>
											{dropdowns.map((option) => {
												return (
													<CommandItem
														key={option.value}
														value={option.value}
														keywords={[option.label]}
														disabled={option.disable}
														onMouseDown={(e) => {
															e.preventDefault();
															e.stopPropagation();
														}}
														onSelect={() => {
															if (selected.length >= maxSelected) {
																onMaxSelected?.(selected.length);
																return;
															}
															setInputValue("");
															const newOptions = [...selected, option];
															setSelected(newOptions);
															onChange?.(newOptions);
														}}
														className={cn(
															"cursor-pointer",
															option.disable &&
																"cursor-default text-content-disabled",
														)}
													>
														<div className="flex items-center gap-2">
															{showIcons && (
																<Avatar
																	size="sm"
																	src={option.icon}
																	fallback={option.label}
																/>
															)}
															{option.label}
															{option.description && (
																<Tooltip>
																	<TooltipTrigger asChild>
																		<span className="flex items-center pointer-events-auto">
																			<InfoIcon className="!w-3.5 !h-3.5 text-content-secondary" />
																		</span>
																	</TooltipTrigger>
																	<TooltipContent side="right" sideOffset={10}>
																		{option.description}
																	</TooltipContent>
																</Tooltip>
															)}
														</div>
													</CommandItem>
												);
											})}
										</>
									</CommandGroup>
								))}
							</>
						)}
					</CommandList>
				)}
			</div>
		</Command>
	);
};
