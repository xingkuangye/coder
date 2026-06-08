import type { ConnectionType } from "#/api/typesGenerated";

export const connectionTypeToFriendlyName = (type: ConnectionType): string => {
	switch (type) {
		case "jetbrains":
			return "JetBrains";
		case "reconnecting_pty":
			return "Web 终端";
		case "ssh":
			return "SSH";
		case "vscode":
			return "VS Code";
		case "port_forwarding":
			return "端口转发";
		case "workspace_app":
			return "工作区应用";
	}
};

export const connectionTypeIsWeb = (type: ConnectionType): boolean => {
	switch (type) {
		case "port_forwarding":
		case "workspace_app": {
			return true;
		}
		case "reconnecting_pty":
		case "ssh":
		case "jetbrains":
		case "vscode": {
			return false;
		}
	}
};
