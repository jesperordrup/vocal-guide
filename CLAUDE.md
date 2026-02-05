# Claude Instructions for vocal-guide

## Version & Changelog

When making changes to this project:

1. **Bump the version** in `index.html` at these locations:
   - Line ~172: English header `v3.x.x`
   - Line ~209: Danish header `v3.x.x`
   - Line ~835: Footer changelog link `(v3.x.x)`

2. **Update the changelog** in `index.html` (around line 769):
   - Add a new `<div class="readme-section">` block at the top
   - Move "— Latest" label to the new version
   - Remove "— Latest" from the previous version

## File Structure

- `index.html` - Main application (single page)
- `styles.css` - All styles
- `manifest.json` - PWA manifest
- `sw.js` - Service worker for offline caching
- `icons/` - App icons (192px, 512px PNG + SVG)

## PWA

This is an installable PWA. When updating cached assets, bump the `CACHE_NAME` version in `sw.js`.

## Deployment

Static site deployed to GitHub Pages at: https://jesperordrup.github.io/vocal-guide/

## Branch Preview Links

After pushing a branch, **always** provide the preview link to the user:

```
https://jesperordrup.github.io/vocal-guide/preview/<branch-name>/
```

Where `<branch-name>` is the branch name with `/` replaced by `-`, lowercased, and special characters removed.

When creating a PR, **always** include the preview link in the PR body. Use this format in the PR description:

```
## Preview
https://jesperordrup.github.io/vocal-guide/preview/<branch-name>/
```

## Maintaining This File

When you discover new learnings about this project (patterns, gotchas, important locations, or workflows), update this CLAUDE.md file to capture them. This helps future sessions work more effectively.

Examples of learnings to add:
- New file locations or naming conventions
- Non-obvious dependencies between files
- Common pitfalls or edge cases
- Project-specific patterns or conventions
