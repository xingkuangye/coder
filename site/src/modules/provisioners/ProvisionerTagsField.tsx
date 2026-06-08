import TextField from "@mui/material/TextField";
import { PlusIcon } from "lucide-react";
import { type FC, useRef, useState } from "react";
import * as Yup from "yup";
import type { ProvisionerDaemon } from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import { ProvisionerTag } from "#/modules/provisioners/ProvisionerTag";

// Users can't delete these tags
const REQUIRED_TAGS = ["scope", "organization", "user"];

// Users can't override these tags
const IMMUTABLE_TAGS = ["owner"];

type ProvisionerTagsFieldProps = {
	value: ProvisionerDaemon["tags"];
	onChange: (value: ProvisionerDaemon["tags"]) => void;
};

export const ProvisionerTagsField: FC<ProvisionerTagsFieldProps> = ({
	value: fieldValue,
	onChange,
}) => {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2 flex-wrap">
				{Object.entries(fieldValue)
					// Filter out since users cannot override it
					.filter(([key]) => !IMMUTABLE_TAGS.includes(key))
					.map(([key, value]) => {
						const onDelete = (key: string) => {
							const { [key]: _, ...newFieldValue } = fieldValue;
							onChange(newFieldValue);
						};

						return (
							<ProvisionerTag
								key={key}
								tagName={key}
								tagValue={value}
								// Required tags can't be deleted
								onDelete={REQUIRED_TAGS.includes(key) ? undefined : onDelete}
							/>
						);
					})}
			</div>

			<NewTagControl
				onAdd={(tag) => {
					onChange({ ...fieldValue, [tag.key]: tag.value });
				}}
			/>
		</div>
	);
};

const newTagSchema = Yup.object({
	key: Yup.string()
		.required("键名必填")
		.notOneOf(["owner"], "无法覆盖 owner 标签"),
	value: Yup.string()
		.required("值必填")
		.when("key", ([key], schema) => {
			if (key === "scope") {
				return schema.oneOf(
					["organization", "scope"],
					"范围值必须为 'organization' 或 'user'",
				);
			}

			return schema;
		}),
});

type Tag = { key: string; value: string };

type NewTagControlProps = {
	onAdd: (tag: Tag) => void;
};

const NewTagControl: FC<NewTagControlProps> = ({ onAdd }) => {
	const keyInputRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string>();
	const [newTag, setNewTag] = useState<Tag>({
		key: "",
		value: "",
	});

	const addNewTag = async () => {
		try {
			await newTagSchema.validate(newTag);
			onAdd(newTag);
			setNewTag({ key: "", value: "" });
			keyInputRef.current?.focus();
		} catch (e) {
			const isValidationError = e instanceof Yup.ValidationError;

			if (!isValidationError) {
				throw e;
			}

			if (e instanceof Yup.ValidationError) {
				setError(e.errors[0]);
			}
		}
	};

	const addNewTagOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			e.stopPropagation();
			addNewTag();
		}
	};

	return (
		<div className="flex flex-col gap-1 max-w-72">
			<div className="flex items-center gap-2">
				<label className="sr-only" htmlFor="tag-key-input">
					标签键
				</label>
				<TextField
					inputRef={keyInputRef}
					size="small"
					id="tag-key-input"
					name="key"
					placeholder="键名"
					value={newTag.key}
					onChange={(e) => setNewTag({ ...newTag, key: e.target.value.trim() })}
					onKeyDown={addNewTagOnEnter}
				/>

				<label className="sr-only" htmlFor="tag-value-input">
					标签值
				</label>
				<TextField
					size="small"
					id="tag-value-input"
					name="value"
					placeholder="值"
					value={newTag.value}
					onChange={(e) =>
						setNewTag({ ...newTag, value: e.target.value.trim() })
					}
					onKeyDown={addNewTagOnEnter}
				/>

				<Button
					className="flex-shrink-0"
					size="icon"
					type="button"
					onClick={addNewTag}
				>
					<PlusIcon />
					<span className="sr-only">添加标签</span>
				</Button>
			</div>
			{error && (
				<span className="text-xs text-content-destructive">{error}</span>
			)}
		</div>
	);
};
