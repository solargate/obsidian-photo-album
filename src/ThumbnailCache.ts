import { App, Plugin } from 'obsidian';
import { WEBP_QUALITY, CACHE_DIR_NAME } from 'Constants';

export class ThumbnailCache {

	private static getPluginCacheDir(plugin: Plugin): string {
		return plugin.manifest.dir + '/' + CACHE_DIR_NAME;
	}

	private static getAlbumCacheDir(plugin: Plugin, folder: string): string {
		return this.getPluginCacheDir(plugin) + '/' + folder;
	}

	private static getCacheFileName(originalPath: string): string {
		const basename = originalPath.split('/').pop() || originalPath;
		const dotIndex = basename.lastIndexOf('.');
		const name = dotIndex > 0 ? basename.substring(0, dotIndex) : basename;
		return name + '.webp';
	}

	private static getCachePath(plugin: Plugin, folder: string, originalPath: string): string {
		return this.getAlbumCacheDir(plugin, folder) + '/' + this.getCacheFileName(originalPath);
	}

	private static async ensureCacheDir(app: App, cacheDir: string): Promise<boolean> {
		const exists = await app.vault.adapter.exists(cacheDir);
		if (!exists) {
			try {
				await app.vault.adapter.mkdir(cacheDir);
			} catch {
				return false;
			}
		}
		return true;
	}

	private static resizeImage(arrayBuffer: ArrayBuffer, size: number): Promise<Blob> {
		return new Promise((resolve, reject) => {
			const blob = new Blob([arrayBuffer]);
			const url = URL.createObjectURL(blob);
			const img = new Image();

			img.onload = () => {
				URL.revokeObjectURL(url);

				const scale = Math.min(size / img.width, size / img.height);
				const w = img.width * scale;
				const h = img.height * scale;

				const canvas = document.createElement('canvas');
				canvas.width = size;
				canvas.height = size;

				const ctx = canvas.getContext('2d');
				if (!ctx) {
					reject(new Error('Failed to get canvas context'));
					return;
				}
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(0, 0, size, size);
				ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

				canvas.toBlob(
					(b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
					'image/webp',
					WEBP_QUALITY
				);
			};

			img.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error('Image load failed'));
			};

			img.src = url;
		});
	}

	private static async generateThumbnail(app: App, originalPath: string, cachePath: string, size: number): Promise<boolean> {
		try {
			const data = await app.vault.adapter.readBinary(originalPath);
			const blob = await this.resizeImage(data, size);
			const arrayBuffer = await blob.arrayBuffer();
			await app.vault.adapter.writeBinary(cachePath, arrayBuffer);
			return true;
		} catch {
			return false;
		}
	}

	static async getOrGenerateThumbnails(plugin: Plugin, app: App, folder: string, files: Array<{ path: string; mtime: number }>, thumbnailSize: number): Promise<Map<string, string>> {
		const cacheDir = this.getAlbumCacheDir(plugin, folder);
		const success = await this.ensureCacheDir(app, cacheDir);
		if (!success) return new Map();

		const cacheMap = new Map<string, string>();
		const needGenerate: Array<{ originalPath: string; cachePath: string; cacheFileName: string }> = [];

		for (const file of files) {
			const cachePath = this.getCachePath(plugin, folder, file.path);
			const exists = await app.vault.adapter.exists(cachePath);
			if (exists) {
				const cacheUrl = app.vault.adapter.getResourcePath(cachePath);
				cacheMap.set(file.path, cacheUrl);
			} else {
				needGenerate.push({ originalPath: file.path, cachePath, cacheFileName: this.getCacheFileName(file.path) });
			}
		}

		for (const item of needGenerate) {
			const success = await this.generateThumbnail(app, item.originalPath, item.cachePath, thumbnailSize);
			if (success) {
				const cacheUrl = app.vault.adapter.getResourcePath(item.cachePath);
				cacheMap.set(item.originalPath, cacheUrl);
			}
		}

		return cacheMap;
	}

	static async invalidateAllCache(app: App, plugin: Plugin): Promise<void> {
		const cacheDir = this.getPluginCacheDir(plugin);
		const exists = await app.vault.adapter.exists(cacheDir);
		if (exists) {
			await app.vault.adapter.rmdir(cacheDir, true);
		}
	}
}
