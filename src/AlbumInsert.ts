import type { Editor } from 'obsidian';

export interface AlbumInsertOptions {
	title: string;
	folder: string;
}

export class AlbumInsert {
	static insert(editor: Editor, options: AlbumInsertOptions): void {
		const text = `title: "${options.title}"\nfolder: "${options.folder}"`;
		editor.replaceRange(`\`\`\`photoalbum\n${text}\n\`\`\``, editor.getCursor());
	}
}
