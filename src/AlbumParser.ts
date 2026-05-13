export interface AlbumMeta {
	title: string;
	folder: string;
}

const LINE_PATTERN = /^(\w+)\s*:\s*"([^"]*)"$/;
const LINE_PATTERN_UNQUOTED = /^(\w+)\s*:\s*(.+)$/;

export function parseAlbumMeta(text: string): AlbumMeta | null {
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
