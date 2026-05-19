import { App, SuggestModal } from 'obsidian';

import { normalizePath } from 'Album';
import { IMAGE_EXTENSIONS } from 'Constants';

interface AlbumFolder {
	name: string;
	folder: string;
}

export class AlbumListModal extends SuggestModal<AlbumFolder> {
	private albumFolderPath: string;
	private onChoose: (folder: string) => void;

	constructor(app: App, albumFolderPath: string, onChoose: (folder: string) => void) {
		super(app);
		this.albumFolderPath = albumFolderPath;
		this.onChoose = onChoose;
		this.setPlaceholder('Select an album');
		this.setInstructions([
			{
				command: '↵',
				purpose: 'insert',
			},
		]);
	}

	private extractFolderName(albumFolderPath: string, fullPath: string): string {
		const normalizedAlbumFolder = normalizePath(albumFolderPath);
		const normalizedPath = normalizePath(fullPath);
		if (normalizedPath.startsWith(normalizedAlbumFolder + '/')) {
			const relative = normalizedPath.substring(normalizedAlbumFolder.length + 1);
			const parts = relative.split('/');
			if (parts.length > 0) {
				return parts[0];
			}
		}
		return '';
	}

	private async findAlbumFolders(
		app: App,
		albumFolderPath: string
	): Promise<AlbumFolder[]> {
		const folderPath = normalizePath(albumFolderPath);
		const results: AlbumFolder[] = [];

		let listResult;
		try {
			listResult = await app.vault.adapter.list(folderPath);
		} catch {
			return results;
		}

		const folders = listResult.folders || [];

		for (const subFolder of folders) {
			const folderName = this.extractFolderName(albumFolderPath, subFolder);
			if (!folderName) continue;

			const fullPath = normalizePath(subFolder);
			try {
				const { files } = await app.vault.adapter.list(fullPath);
				const hasImages = (files || []).some(f => {
					const ext = f.substring(f.lastIndexOf('.')).toLowerCase();
					return IMAGE_EXTENSIONS.has(ext);
				});
				if (!hasImages) continue;
			} catch {
				continue;
			}

			results.push({ name: folderName, folder: folderName });
		}

		return results;
	}

	async getSuggestions(query: string): Promise<AlbumFolder[]> {
		const albums = await this.findAlbumFolders(this.app, this.albumFolderPath);
		if (!query) return albums;
		return albums.filter(album => album.name.toLowerCase().includes(query.toLowerCase()));
	}

	renderSuggestion(album: AlbumFolder, el: HTMLElement): void {
		el.textContent = album.name;
	}

	onChooseSuggestion(album: AlbumFolder, _evt: MouseEvent | KeyboardEvent): void {
		this.onChoose(album.folder);
	}
}
