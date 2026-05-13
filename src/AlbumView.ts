import { App, TFile } from 'obsidian';

export interface AlbumViewOptions {
	title: string;
	files: Array<{ path: string; mtime: number }>;
	columns: number;
	app: App;
}

export function createAlbumView(opts: AlbumViewOptions): HTMLDivElement {
	const { title, files, columns, app } = opts;

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

		// Get the actual TFile to generate an internal URL
		const tfile = app.vault.getAbstractFileByPath(file.path) as TFile | null;
		if (tfile) {
			// Use the vault's internal file URL
			img.src = app.vault.adapter.getResourcePath(file.path);
		} else {
			// Fallback: try to get from cache
			img.src = '';
		}

		// Click to open in obsidian
		item.addEventListener('click', () => {
			openPhotoInNewTab(app, file.path);
		});
	}

	return container;
}

// function openPhotoInObsidian(app: App, filePath: string): void {
// 	const tfile = app.vault.getAbstractFileByPath(filePath);
// 	if (tfile && tfile instanceof TFile) {
// 		app.workspace.activeLeaf?.openFile(tfile);
// 		return;
// 	}
//
// 	app.workspace.openLinkText(filePath, '/');
// }

function openPhotoInNewTab(app: App, filePath: string): void {
	const tfile = app.vault.getAbstractFileByPath(filePath);
	if (tfile instanceof TFile) {
		const leaf = app.workspace.getLeaf(true);
		leaf.openFile(tfile);
		return;
	}
	app.workspace.openLinkText(filePath, '/', true);
}
