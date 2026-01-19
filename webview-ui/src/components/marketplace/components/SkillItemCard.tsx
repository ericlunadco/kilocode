// kilocode_change new file

import React, { useState } from "react"
import { SkillMarketplaceItem } from "@roo-code/types"
import { vscode } from "@/utils/vscode"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { Button } from "@/components/ui/button"

interface SkillItemCardProps {
	skill: SkillMarketplaceItem
}

export const SkillItemCard: React.FC<SkillItemCardProps> = ({ skill }) => {
	const { t } = useAppTranslation()
	const [isInstalling, setIsInstalling] = useState(false)

	const handleViewOnGitHub = () => {
		vscode.postMessage({ type: "openExternal", url: skill.githubUrl })
	}

	const handleInstall = (target: "project" | "global") => {
		setIsInstalling(true)
		vscode.postMessage({
			type: "installMarketplaceItem",
			mpItem: skill,
			mpInstallOptions: { target },
		})
		// Note: The installing state will be reset when the component re-renders
		// after receiving the installation result. For now, we'll reset after a timeout
		// as a fallback.
		setTimeout(() => setIsInstalling(false), 5000)
	}

	const { displayName, displayCategory } = skill

	return (
		<div className="border border-vscode-panel-border rounded-sm p-3 bg-vscode-editor-background">
			<div className="flex gap-2 items-start justify-between">
				<div className="flex gap-2 items-start">
					<div>
						<h3 className="text-lg font-semibold text-vscode-foreground mt-0 mb-1 leading-none">
							<Button
								variant="link"
								className="p-0 h-auto text-lg font-semibold text-vscode-foreground hover:underline"
								onClick={handleViewOnGitHub}>
								{displayName}
							</Button>
						</h3>
					</div>
				</div>
				<div className="flex items-center gap-1">
					<Button
						size="sm"
						variant="primary"
						className="text-xs h-5 py-0 px-2"
						onClick={() => handleInstall("project")}
						disabled={isInstalling}>
						{isInstalling ? t("marketplace:skills.installing") : t("marketplace:skills.install")}
					</Button>
					<Button
						size="sm"
						variant="secondary"
						className="text-xs h-5 py-0 px-2"
						onClick={() => handleInstall("global")}
						disabled={isInstalling}
						title={t("marketplace:skills.installGlobalTooltip")}>
						{t("marketplace:skills.installGlobal")}
					</Button>
				</div>
			</div>

			<p className="my-2 text-vscode-foreground">{skill.description}</p>

			{/* Category badge */}
			<div className="relative flex flex-wrap gap-1 my-2">
				<span className="text-xs px-2 py-0.5 rounded-sm h-5 flex items-center bg-vscode-badge-background text-vscode-badge-foreground">
					{displayCategory}
				</span>
			</div>
		</div>
	)
}
