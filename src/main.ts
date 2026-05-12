import { Plugin } from 'obsidian';

import { PhotoAlbumPluginSettings, PhotoAlbumSettingTab, DEFAULT_SETTINGS} from 'Settings';

export default class PhotoAlbumPlugin extends Plugin {
	settings: PhotoAlbumPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new PhotoAlbumSettingTab(this.app, this));

		console.log('Photo Album plugin loaded');
	}

	onunload() {
		console.log('Photo Album plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
