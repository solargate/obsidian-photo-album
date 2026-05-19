import { App, Plugin, TFile } from 'obsidian';

import { ThumbnailCache } from 'ThumbnailCache';

const IMAGE_EXTENSIONS = new Set([
	'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp',
]);

export interface AlbumFile {
	path: string;
	mtime: number;
}

export interface AlbumMeta {
	title: string;
	folder: string;
}

export interface AlbumViewOptions {
	title: string;
	files: Array<{ path: string; mtime: number }>;
	columns: number;
	app: App;
	plugin: Plugin;
	cacheMap: Map<string, string>;
}

const LINE_PATTERN = /^(\w+)\s*:\s*"([^"]*)"$/;
const LINE_PATTERN_UNQUOTED = /^(\w+)\s*:\s*(.+)$/;

export function normalizePath(path: string): string {
	return path.replace(/^\/+|\/+$/g, '');
}

export class Album {
	static parseMeta(text: string): AlbumMeta | null {
		const lines = text.trim().split('\n');
		let title = '';
		let folder = '';

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			const quotedMatch = trimmed.match(LINE_PATTERN);
			if (quotedMatch) {
				const key = quotedMatch[1].toLowerCase();
				const value = quotedMatch[2];
				if (key === 'title') title = value;
				if (key === 'folder') folder = value;
				continue;
			}

			const unquotedMatch = trimmed.match(LINE_PATTERN_UNQUOTED);
			if (unquotedMatch) {
				const key = unquotedMatch[1].toLowerCase();
				const value = unquotedMatch[2].trim();
				if (key === 'title') title = value;
				if (key === 'folder') folder = value;
			}
		}

		if (!folder) return null;

		return {
			title: title || folder,
			folder,
		};
	}

	static async loadFiles(app: App, albumFolderPath: string, folder: string): Promise<AlbumFile[]> {
		const fullPath = normalizePath(albumFolderPath + '/' + folder);

		let filePaths: string[];

		try {
			filePaths = (await app.vault.adapter.list(fullPath)).files || [];
		} catch {
			return [];
		}

		const files: AlbumFile[] = [];

		for (const item of filePaths) {
			const ext = item.substring(item.lastIndexOf('.')).toLowerCase();
			if (!IMAGE_EXTENSIONS.has(ext)) continue;

			let mtime = 0;
			try {
				const stat = await app.vault.adapter.stat(item);
				mtime = stat?.mtime || 0;
			} catch {
				// stat may fail for some files
			}

			files.push({ path: item, mtime });
		}

		// Sort by mtime descending (newest first)
		files.sort((a, b) => b.mtime - a.mtime);

		return files;
	}

	static async render(opts: AlbumViewOptions): Promise<HTMLDivElement> {
		const { title, files, columns, app, plugin, cacheMap } = opts;

		const container = createDiv({
			cls: 'photo-album-container',
			attr: {
				'data-album-folder': '',
			},
		});

		// Title
		if (title) {
			container.createEl('h3', {
				cls: 'photo-album-title',
				text: title,
			});
		}

		// Grid
		const grid = container.createDiv({ cls: 'photo-album-grid' });
		grid.style.setProperty('--album-columns', String(columns));

		if (!files || files.length === 0) {
			grid.createDiv({ text: 'No photos found', cls: 'photo-album-empty' });
			return container;
		}

		for (const file of files) {
			const item = grid.createDiv({ cls: 'photo-album-item' });

			const img = item.createEl('img', {
				cls: 'photo-album-image',
				attr: {
					'data-path': file.path,
					loading: 'lazy',
				},
			});

			const cacheUrl = cacheMap.get(file.path);
			if (cacheUrl) {
				img.src = cacheUrl;
			} else {
				const tfile = app.vault.getAbstractFileByPath(file.path) as TFile | null;
				if (tfile) {
					img.src = app.vault.adapter.getResourcePath(file.path);
				} else {
					img.src = '';
				}
			}

			item.addEventListener('click', () => {
				Album.openPhoto(app, file.path);
			});
		}

		return container;
	}

	static async renderFromText(app: App, text: string, albumFolderPath: string, columns: number, thumbnailSize: number, plugin: Plugin): Promise<HTMLDivElement | null> {
		const meta = Album.parseMeta(text);
		if (!meta) return null;

		const files = await Album.loadFiles(app, albumFolderPath, meta.folder);
		if (files.length === 0) return null;

		const cacheMap = await ThumbnailCache.getOrGenerateThumbnails(plugin, app, meta.folder, files, thumbnailSize);

		return Album.render({
			title: meta.title,
			files,
			columns,
			app,
			plugin,
			cacheMap,
		});
	}

	private static openPhoto(app: App, filePath: string): void {
		const tfile = app.vault.getAbstractFileByPath(filePath);
		if (tfile instanceof TFile) {
			const leaf = app.workspace.getLeaf(true);
			leaf.openFile(tfile);
			return;
		}
		app.workspace.openLinkText(filePath, '/', true);
	}
}
