import { App } from 'obsidian';

const IMAGE_EXTENSIONS = new Set([
	'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp',
]);

export interface AlbumFile {
	path: string;
	mtime: number;
}

export async function loadAlbumFiles(app: App, albumFolderPath: string, folder: string): Promise<AlbumFile[]> {
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

function normalizePath(path: string): string {
	return path.replace(/^\/+|\/+$/g, '');
}
