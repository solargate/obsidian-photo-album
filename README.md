# Obsidian Photo Album Plugin

Organize and display photo albums directly in your Obsidian vault.

## Features

- Store photos in folders and display them as a grid gallery in any note
- Automatic thumbnail generation for fast rendering
- Two insertion modes: inline block or collapsible callout
- Click any photo to open it in Obsidian's image viewer
- Configurable grid columns and thumbnail size

## Setup

### 1. Configure the album folder

Go to **Community plugins → Photo Album → Settings** and set the **Albums folder path**. This is the folder relative to your vault root where all album subfolders will live. The default is `Albums`.

### 2. Create an album folder

Inside your albums folder, create a subfolder with your photos. For example:

```
Albums/
  trip-to-bali/
    photo1.jpg
    photo2.png
    photo3.webp
  family-portrait/
    img001.jpg
    img002.jpg
```

Supported image formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`

### 3. Insert an album into a note

Use the command palette (`Ctrl+P` / `Cmd+P`):

- **Photo Album: Insert photo album** — inserts a photo album block at the cursor position
- **Photo Album: Insert photo album in callout** — wraps the album in a collapsible callout

Both commands open a searchable modal listing all album folders. Select one to insert the block.

## Usage

After insertion, your note will contain a code block like this:

````
```photoalbum
title: "Trip to Bali"
folder: "trip-to-bali"
```
````

When the note is in **reading** mode, this block is rendered as a photo grid:

- Photos are sorted by modification time (newest first)
- Each cell is a square thumbnail; hover to see a subtle opacity change
- Click a photo to open it in the full image viewer
- If the folder contains no images, nothing is rendered

You can also edit the `title` and `folder` values manually in source mode.

## Settings

| Setting | Description | Default |
|---|---|---|
| Albums folder path | Root folder containing album subfolders | `Albums` |
| Columns | Number of photos per row (1–12) | `5` |
| Thumbnail size (px) | Size of generated thumbnails (100–800) | `300` |

Changing the thumbnail size regenerates the cache on the next album view.

## How it works

The plugin scans the configured albums folder for subdirectories containing image files. When an album is inserted or previewed, it generates WebP thumbnails at the configured size and caches them in the plugin's data directory. Thumbnails are regenerated only when the original file changes or the cache is invalidated.
