import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import { type FC, useState } from "react";
import type { TemplateVersionVariable } from "#/api/typesGenerated";
export const SensitiveVariableHelperText: FC = () => {
	return (
		<span>
			此变量为敏感变量。如果为空，将使用之前的值。
		</span>
	);
};

interface TemplateVariableFieldProps {
	templateVersionVariable: TemplateVersionVariable;
	initialValue: string;
	disabled: boolean;
	onChange: (value: string) => void;
}

export const TemplateVariableField: FC<TemplateVariableFieldProps> = ({
	templateVersionVariable,
	initialValue,
	disabled,
	onChange,
	...props
}) => {
	const [variableValue, setVariableValue] = useState(initialValue);
	if (isBoolean(templateVersionVariable)) {
		return (
			<RadioGroup
				defaultValue={variableValue}
				onChange={(event) => {
					onChange(event.target.value);
				}}
			>
				<FormControlLabel
					disabled={disabled}
					value="true"
					control={<Radio size="small" />}
					label="是"
				/>
				<FormControlLabel
					disabled={disabled}
					value="false"
					control={<Radio size="small" />}
					label="否"
				/>
			</RadioGroup>
		);
	}

	return (
		<TextField
			{...props}
			type={
				templateVersionVariable.type === "number"
					? "number"
					: templateVersionVariable.sensitive
						? "password"
						: "string"
			}
			disabled={disabled}
			autoFocus
			fullWidth
			label={templateVersionVariable.name}
			value={variableValue}
			placeholder={
				templateVersionVariable.sensitive
					? ""
					: templateVersionVariable.default_value
			}
			onChange={(event) => {
				setVariableValue(event.target.value);
				onChange(event.target.value);
			}}
		/>
	);
};

const isBoolean = (variable: TemplateVersionVariable) => {
	return variable.type === "bool";
};
