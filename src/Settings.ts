import { App, PluginSettingTab, Setting } from 'obsidian'

import PhotoAlbumPlugin from 'main';

export interface PhotoAlbumPluginSettings {
	photoAlbumSetting: string;
}

export const DEFAULT_SETTINGS: PhotoAlbumPluginSettings = {
	photoAlbumSetting: 'default'
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
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.photoAlbumSetting)
				.onChange(async (value) => {
					this.plugin.settings.photoAlbumSetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
