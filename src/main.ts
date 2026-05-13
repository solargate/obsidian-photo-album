import { Plugin } from 'obsidian';

import { PhotoAlbumPluginSettings, PhotoAlbumSettingTab, DEFAULT_SETTINGS } from 'Settings';
import { Album } from 'Album';

export default class PhotoAlbumPlugin extends Plugin {
	settings: PhotoAlbumPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new PhotoAlbumSettingTab(this.app, this));

		this.registerMarkdownPostProcessor(async (el, ctx) => {
			const codeEl = el.querySelector('code');
			if (!codeEl) return;

			const className = codeEl.className;
			if (!className || !className.includes('language-photoalbum')) return;

			const parentPre = codeEl.parentElement;
			if (!parentPre || parentPre.tagName !== 'PRE') return;

			const text = codeEl.textContent || '';
			const albumView = await Album.renderFromText(this.app, text, this.settings.albumFolderPath, this.settings.columns);
			if (!albumView) return;

			albumView.addEventListener('click', (ev: MouseEvent) => {
				const target = ev.target as HTMLElement;
				const img = target.closest('.photo-album-item img');
				if (img) {
					ev.stopPropagation();
				}
			});

			parentPre.replaceWith(albumView);
		});

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
