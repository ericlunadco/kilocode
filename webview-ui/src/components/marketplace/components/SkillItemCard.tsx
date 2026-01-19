// kilocode_change new file

import React, { useState, useEffect } from "react"
import { SkillMarketplaceItem } from "@roo-code/types"
import { vscode } from "@/utils/vscode"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { useExtensionState } from "@/context/ExtensionStateContext"

interface SkillItemCardProps {
	skill: SkillMarketplaceItem
}

export const SkillItemCard: React.FC<SkillItemCardProps> = ({ skill }) => {
	const { t } = useAppTranslation()
	const { cwd } = useExtensionState()
	const hasWorkspace = !!cwd
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [scope, setScope] = useState<"project" | "global">(hasWorkspace ? "project" : "global")
	const [isInstalling, setIsInstalling] = useState(false)
	const [installationComplete, setInstallationComplete] = useState(false)
	const [validationError, setValidationError] = useState<string | null>(null)

	const handleViewOnGitHub = () => {
		vscode.postMessage({ type: "openExternal", url: skill.githubUrl })
	}

	const handleOpenModal = () => {
		setIsModalOpen(true)
		setScope(hasWorkspace ? "project" : "global")
		setInstallationComplete(false)
		setValidationError(null)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setIsInstalling(false)
		setInstallationComplete(false)
		setValidationError(null)
	}

	const handleInstall = () => {
		setIsInstalling(true)
		setValidationError(null)
		vscode.postMessage({
			type: "installMarketplaceItem",
			mpItem: skill,
			mpInstallOptions: { target: scope },
		})
	}

	// Listen for installation result messages
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "marketplaceInstallResult" && message.slug === skill.id) {
				setIsInstalling(false)
				if (message.success) {
					setInstallationComplete(true)
					setValidationError(null)
					// Request fresh marketplace data to update installed status
					vscode.postMessage({
						type: "fetchMarketplaceData",
					})
				} else {
					setValidationError(message.error || t("marketplace:install.failed"))
					setInstallationComplete(false)
				}
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [skill.id, t])

	const { displayName, displayCategory } = skill

	return (
		<>
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
						<Button size="sm" variant="primary" className="text-xs h-5 py-0 px-2" onClick={handleOpenModal}>
							{t("marketplace:skills.install")}
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

			{/* Install Modal */}
			<Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>
							{installationComplete
								? t("marketplace:install.successTitle", { name: displayName })
								: t("marketplace:skills.installTitle", { name: displayName })}
						</DialogTitle>
						<DialogDescription>
							{installationComplete ? t("marketplace:install.successDescription") : null}
						</DialogDescription>
					</DialogHeader>

					{installationComplete ? (
						<div className="space-y-4 py-2">
							<div className="text-center space-y-4">
								<div className="text-green-500 text-lg">✓ {t("marketplace:install.installed")}</div>
							</div>
						</div>
					) : (
						<div className="space-y-4 py-2">
							{/* Installation Scope */}
							<div className="space-y-2">
								<div className="text-base font-semibold">{t("marketplace:install.scope")}</div>
								<div className="space-y-2">
									<label className="flex items-center space-x-2">
										<input
											type="radio"
											name="scope"
											value="project"
											checked={scope === "project"}
											onChange={() => setScope("project")}
											disabled={!hasWorkspace}
											className="rounded-full"
										/>
										<span className={!hasWorkspace ? "opacity-50" : ""}>
											{t("marketplace:install.project")}
										</span>
									</label>
									<label className="flex items-center space-x-2">
										<input
											type="radio"
											name="scope"
											value="global"
											checked={scope === "global"}
											onChange={() => setScope("global")}
											className="rounded-full"
										/>
										<span>{t("marketplace:install.global")}</span>
									</label>
								</div>
							</div>

							{/* Validation Error */}
							{validationError && (
								<div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
									{validationError}
								</div>
							)}
						</div>
					)}

					<DialogFooter>
						{installationComplete ? (
							<Button variant="outline" onClick={handleCloseModal}>
								{t("marketplace:install.done")}
							</Button>
						) : (
							<>
								<Button variant="outline" onClick={handleCloseModal}>
									{t("common:answers.cancel")}
								</Button>
								<Button onClick={handleInstall} disabled={isInstalling}>
									{isInstalling
										? t("marketplace:skills.installing")
										: t("marketplace:install.button")}
								</Button>
							</>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
