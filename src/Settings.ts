import { App, PluginSettingTab, Setting } from 'obsidian'

import PhotoAlbumPlugin from 'main';

export interface PhotoAlbumPluginSettings {
	albumFolderPath: string;
	columns: number;
}

export const DEFAULT_SETTINGS: PhotoAlbumPluginSettings = {
	albumFolderPath: 'Albums',
	columns: 5,
}

export class PhotoAlbumSettingTab extends PluginSettingTab {
	plugin: PhotoAlbumPlugin;

	constructor(app: App, plugin: PhotoAlbumPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Albums folder path')
			.setDesc('Enter the path to the folder containing photo albums (relative to vault root)')
			.addText(text => text
				.setPlaceholder('Albums')
				.setValue(this.plugin.settings.albumFolderPath)
				.onChange(async (value) => {
					this.plugin.settings.albumFolderPath = value.trim();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Columns')
			.setDesc('Number of photos per row in albums (1–12)')
			.addText(text => text
				.setPlaceholder('4')
				.setValue(String(this.plugin.settings.columns))
				.onChange(async (value) => {
					const n = parseInt(value, 10);
					if (!isNaN(n) && n >= 1 && n <= 12) {
						this.plugin.settings.columns = n;
						await this.plugin.saveSettings();
					}
				}));
	}
}
