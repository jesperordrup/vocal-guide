# Plan: GitHub Action for Branch Test Page Deployment

## Goal

Deploy each branch to a preview URL under GitHub Pages so reviewers can test
changes before merging to `main`. Preview URLs would follow the pattern:

```
https://jesperordrup.github.io/vocal-guide/preview/<branch-name>/
```

Production (`main`) continues to deploy at the existing root:

```
https://jesperordrup.github.io/vocal-guide/
```

---

## Current State

| Item | Value |
|------|-------|
| Site type | Static (no build step) |
| Deployment | GitHub Pages from `main` (manual) |
| Service worker | `sw.js` with hardcoded `/vocal-guide/` paths |
| PWA manifest | `manifest.json` with hardcoded `start_url` and `scope` |
| GitHub Actions | None exist yet |

---

## Challenges

### 1. Hardcoded base path in service worker (`sw.js`)

The `ASSETS` array and offline fallback in `sw.js` use absolute paths like
`/vocal-guide/index.html`. A branch deployed at `/vocal-guide/preview/my-branch/`
would fail to cache assets unless these paths are rewritten.

**Affected lines in `sw.js`:**
- Lines 2-11: `ASSETS` array entries
- Line 72: Offline navigation fallback path

### 2. Hardcoded paths in `manifest.json`

`start_url` and `scope` are set to `/vocal-guide/`. A branch preview would need
these changed to `/vocal-guide/preview/<branch-name>/`.

### 3. GitHub Pages serves a single deployment

GitHub Pages (via `actions/deploy-pages`) deploys a single artifact as the
entire site. Branch previews need to coexist alongside the production site,
which requires a composite deployment strategy.

### 4. Preview cleanup

Stale previews from merged/deleted branches should be cleaned up to avoid
accumulating dead deployments.

---

## Proposed Solution

### Workflow 1: `deploy-preview.yml` (branch preview)

**Trigger:** Push to any branch except `main`

**Steps:**

1. **Checkout** the branch.
2. **Sanitize branch name** for use as a directory name (replace `/` with `-`,
   lowercase, strip special characters).
3. **Rewrite paths** in `sw.js` and `manifest.json`:
   - Replace `/vocal-guide/` with `/vocal-guide/preview/<safe-branch-name>/`
   - Use `sed` or a small script; no build tooling required.
4. **Checkout `gh-pages` branch** into a separate working directory.
5. **Copy files** into `preview/<safe-branch-name>/` under the `gh-pages` tree.
6. **Commit and push** to `gh-pages`.
7. **Post comment** on the associated PR with the preview URL
   (using `gh pr comment` or `actions/github-script`).

**Pseudocode:**

```yaml
name: Deploy Branch Preview

on:
  push:
    branches-ignore:
      - main

permissions:
  contents: write
  pull-requests: write

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout branch
        uses: actions/checkout@v4

      - name: Compute preview path
        id: path
        run: |
          SAFE_BRANCH=$(echo "${{ github.ref_name }}" | tr '/' '-' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g')
          echo "dir=preview/${SAFE_BRANCH}" >> "$GITHUB_OUTPUT"
          echo "base_path=/vocal-guide/preview/${SAFE_BRANCH}/" >> "$GITHUB_OUTPUT"

      - name: Rewrite paths for preview
        run: |
          sed -i "s|/vocal-guide/|${{ steps.path.outputs.base_path }}|g" sw.js
          sed -i "s|/vocal-guide/|${{ steps.path.outputs.base_path }}|g" manifest.json

      - name: Deploy to gh-pages subdirectory
        run: |
          git fetch origin gh-pages || git checkout --orphan gh-pages
          git checkout gh-pages -- . || true
          mkdir -p ${{ steps.path.outputs.dir }}
          # Copy site files into preview subdirectory
          cp index.html styles.css sw.js manifest.json robots.txt sitemap.txt og-image.svg "${{ steps.path.outputs.dir }}/"
          cp -r icons "${{ steps.path.outputs.dir }}/"
          git add ${{ steps.path.outputs.dir }}
          git commit -m "Deploy preview: ${{ github.ref_name }}"
          git push origin gh-pages

      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            // Find open PR for this branch and post preview URL
```

### Workflow 2: `cleanup-preview.yml` (remove stale previews)

**Trigger:** PR closed (merged or abandoned) or branch deleted.

**Steps:**

1. **Compute** the safe branch name (same logic as deploy).
2. **Checkout `gh-pages`**.
3. **Delete** the `preview/<safe-branch-name>/` directory.
4. **Commit and push** to `gh-pages`.

**Pseudocode:**

```yaml
name: Cleanup Branch Preview

on:
  pull_request:
    types: [closed]
  delete:

permissions:
  contents: write

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout gh-pages
        uses: actions/checkout@v4
        with:
          ref: gh-pages

      - name: Remove preview directory
        run: |
          SAFE_BRANCH=$(echo "${{ github.event.pull_request.head.ref || github.event.ref }}" | tr '/' '-' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g')
          rm -rf "preview/${SAFE_BRANCH}"
          git add -A
          git commit -m "Remove preview: ${SAFE_BRANCH}" || echo "Nothing to clean"
          git push origin gh-pages
```

### Workflow 3: `deploy-production.yml` (main branch)

**Trigger:** Push to `main`.

This is optional but recommended to formalize the current manual deployment.

**Steps:**

1. **Checkout `main`**.
2. **Checkout `gh-pages`** into a work tree.
3. **Copy** production files to the root of `gh-pages` (preserving the
   `preview/` directory).
4. **Commit and push** to `gh-pages`.

---

## File Changes Required at Implementation Time

| File | Change |
|------|--------|
| `.github/workflows/deploy-preview.yml` | New file (Workflow 1) |
| `.github/workflows/cleanup-preview.yml` | New file (Workflow 2) |
| `.github/workflows/deploy-production.yml` | New file (Workflow 3, optional) |
| GitHub repo settings | Ensure Pages source is set to `gh-pages` branch, root `/` |

No changes to existing source files (`index.html`, `styles.css`, `sw.js`,
`manifest.json`) are required in `main`. Path rewriting happens only in the
GitHub Action at deploy time.

---

## Alternative Approaches Considered

### A. `actions/deploy-pages` with composite artifact

GitHub's `actions/deploy-pages` replaces the entire site each deploy, so branch
previews can't coexist independently. Would require downloading the current
deployment, merging in the preview, and re-uploading -- fragile and prone to
race conditions when multiple branches push simultaneously.

**Verdict:** Rejected. The `gh-pages` branch approach is simpler and supports
concurrent previews without conflicts (each preview is its own subdirectory).

### B. External preview service (Netlify, Vercel, Cloudflare Pages)

These services offer built-in branch preview deployments out of the box with
zero configuration for static sites.

**Verdict:** Valid option if the project is open to external services. Keeps
GitHub Pages for production only. More robust but adds a dependency. Worth
considering if the `gh-pages` approach becomes too cumbersome.

### C. GitHub Environments with separate deployments

Use GitHub's deployment environments API to create per-branch deployments.

**Verdict:** More complex to set up, but provides better integration with the
GitHub UI (deployment status on PRs). Could be a future enhancement on top of
the `gh-pages` approach.

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Race condition: two branches push to `gh-pages` simultaneously | Use `git pull --rebase` before pushing; add retry logic |
| Stale previews accumulate if cleanup fails | Add a scheduled workflow to prune `preview/` dirs with no matching open branch |
| Service worker caches wrong paths | Path rewriting via `sed` is deterministic; add a smoke test step that greps for the expected base path after rewriting |
| `gh-pages` branch grows large over time | Previews are small (~130KB each); add periodic garbage collection if needed |

---

## Testing the Workflow

Before relying on this in production:

1. Create a test branch, push it, verify the preview URL loads correctly.
2. Verify the service worker installs and caches assets at the preview path.
3. Verify PWA "Add to Home Screen" works from the preview URL.
4. Close/merge the PR and verify the preview directory is cleaned up.
5. Push to `main` and verify production is unaffected and `preview/` is preserved.
