// kilocode_change - new file
import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs/promises"
import type { SkillMarketplaceItem } from "@roo-code/types"
import { getGlobalRooDirectory } from "../roo-config"

export interface SkillInstallOptions {
	target: "project" | "global"
}

/**
 * SimpleSkillInstaller handles installation and removal of skills from the marketplace.
 *
 * Skills are installed to:
 * - Global: ~/.kilocode/skills/{skill-id}/SKILL.md
 * - Project: .kilocode/skills/{skill-id}/SKILL.md
 */
export class SimpleSkillInstaller {
	/**
	 * Install a skill from the marketplace by downloading its SKILL.md file
	 * and creating the appropriate directory structure.
	 */
	async installSkill(
		item: SkillMarketplaceItem,
		options: SkillInstallOptions,
	): Promise<{ filePath: string; line?: number }> {
		const { target } = options

		if (!item.rawUrl) {
			throw new Error("Skill item missing rawUrl")
		}

		// Fetch the SKILL.md content from the raw URL
		const response = await fetch(item.rawUrl)
		if (!response.ok) {
			throw new Error(`Failed to fetch skill content: ${response.statusText}`)
		}
		const skillContent = await response.text()

		// Get the skills directory path
		const skillsDir = await this.getSkillsDirectoryPath(target)
		const skillDir = path.join(skillsDir, item.id)
		const skillFilePath = path.join(skillDir, "SKILL.md")

		// Create the skill directory and write the SKILL.md file
		await fs.mkdir(skillDir, { recursive: true })
		await fs.writeFile(skillFilePath, skillContent, "utf-8")

		return { filePath: skillFilePath, line: 1 }
	}

	/**
	 * Remove an installed skill by deleting its directory
	 */
	async removeSkill(item: SkillMarketplaceItem, options: SkillInstallOptions): Promise<void> {
		const { target } = options
		const skillsDir = await this.getSkillsDirectoryPath(target)
		const skillDir = path.join(skillsDir, item.id)

		try {
			// Check if the directory exists before attempting to remove
			const stat = await fs.stat(skillDir)
			if (stat.isDirectory()) {
				// Remove the entire skill directory
				await fs.rm(skillDir, { recursive: true })
			}
		} catch (error: any) {
			if (error.code !== "ENOENT") {
				throw error
			}
			// Directory doesn't exist, nothing to remove
		}
	}

	/**
	 * Get the skills directory path for the given target
	 */
	private async getSkillsDirectoryPath(target: "project" | "global"): Promise<string> {
		if (target === "project") {
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
			if (!workspaceFolder) {
				throw new Error("No workspace folder found")
			}
			return path.join(workspaceFolder.uri.fsPath, ".kilocode", "skills")
		} else {
			const globalDir = getGlobalRooDirectory()
			return path.join(globalDir, "skills")
		}
	}
}
