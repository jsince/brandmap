# BrandMap - Current Status & Context

**Date:** November 18, 2025  
**GitHub Repo:** https://github.com/jsince/brandmap  
**Live Site:** https://jsince.github.io/brandmap/  
**Git Account:** jeremy@tillerdigital.ca (Account 1 - jsince)

---

## Current Problem

**The GitHub Pages deployment is NOT working correctly.**

### Issue:
- The live site at https://jsince.github.io/brandmap/ is showing CORS errors
- It's trying to auto-load the Tiller Digital sitemap on page load
- The terminal was hanging during deployment attempts

### What's Wrong:
The production `gh-pages` branch has **OLD CODE** that auto-loads the sitemap. The **NEW CODE** (which removes auto-load and shows a welcome message) is in the `main` branch but hasn't been deployed yet.

---

## What Was Already Completed

### ✅ Code Changes (IN MAIN BRANCH)
1. **Removed auto-load sitemap** - Changed `src/App.jsx` to NOT fetch sitemap on mount
2. **Added welcome message** - Updated `src/components/GraphVisualization.jsx` to show instructions
3. **Created Sitemap tab** - Users manually load sitemaps via sidebar tab
4. **UI Updates** - Black navigation header (Tiller Digital style), 60px page labels
5. **Documentation** - Created SETUP.md, TROUBLESHOOTING.md, DEVELOPMENT.md, ARCHITECTURE.md, CHANGELOG.md

### ✅ Git Status
- **Main branch:** Up to date with latest changes (commit: 1834fb1)
- **gh-pages branch:** Has OLD CODE (commit: 37aa89e) - NEEDS UPDATE
- All changes committed and pushed to `main`

### ✅ Features Working Locally
- Dev server runs at http://localhost:5173
- Sitemap loading via Sitemap tab works
- Graph visualization works
- Manual sitemap import works

---

## What Needs To Happen NOW

### Deploy the New Code to GitHub Pages

Run this single command (simple and safe - no branch switching required):

```bash
cd /home/jeremy/code/brandmap
npm run deploy
```

**That's it!** This command:
- Automatically builds the production version (via `predeploy` hook)
- Uses the `gh-pages` tool to deploy to GitHub
- Creates a temporary folder outside your project
- Copies your built files from `dist/`
- Pushes them to the `gh-pages` branch on GitHub
- Keeps your `main` branch and `node_modules` intact
- No branch switching, no cleanup needed

### After Deployment
1. Wait 1-2 minutes for GitHub Pages to rebuild
2. Visit https://jsince.github.io/brandmap/
3. Hard refresh: **Ctrl + Shift + R** (Windows/Linux) or **Cmd + Shift + R** (Mac)
4. Should see: **"Welcome to BrandMap"** message instead of errors

---

## GitHub Pages Configuration

### Repository Settings
- **Settings** → **Pages**
- **Source:** Deploy from a branch
- **Branch:** `gh-pages`
- **Folder:** `/ (root)`

This should already be configured correctly.

---

## Project Structure

```
brandmap/
├── src/
│   ├── components/
│   │   ├── GraphVisualization.jsx  # Has welcome message
│   │   ├── GraphVisualization.css
│   │   ├── Sidebar.jsx             # Has Sitemap tab
│   │   └── Sidebar.css
│   ├── utils/
│   │   ├── collisionDetection.js
│   │   ├── layout.js
│   │   └── sitemapParser.js
│   ├── App.jsx                     # NO auto-load anymore
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── dist/                           # Build output (needs to go to gh-pages)
├── Documentation files...
├── package.json
└── vite.config.js                  # base: '/brandmap/'
```

---

## Key Code Changes

### src/App.jsx (Lines 60-65)
**OLD CODE (still in gh-pages):**
```javascript
useEffect(() => {
  const loadSitemap = async () => {
    const sitemapUrl = 'https://tillerdigital.com/page-sitemap.xml'
    const pages = await fetchSitemap(sitemapUrl)
    // ... auto-loads on mount
  }
  loadSitemap()
}, [])
```

**NEW CODE (in main, needs deployment):**
```javascript
useEffect(() => {
  // Start with empty state - users load via Sitemap tab
  setLoading(false)
}, [])
```

### src/components/GraphVisualization.jsx (Lines 345-369)
Shows welcome message when no data loaded:
- "Welcome to BrandMap"
- Instructions to use Sitemap tab
- No more auto-loading

---

## Important Notes

### Why It's Not Working
1. GitHub Pages is serving from `gh-pages` branch
2. `gh-pages` branch has old code from earlier deployment
3. New code is in `main` but hasn't been built & pushed to `gh-pages`

### Why Auto-Load Was Removed
- **CORS issues** - Fetching external sitemaps from GitHub Pages domain triggers CORS
- **Better UX** - Users control when/what to load
- **More reliable** - No dependency on external services being available

### Design Changes Made
- Black header (#000000) - matches Tiller Digital website
- Page node labels: 60px, bold
- Paid media labels: 9px
- Modern B2B SaaS aesthetic

---

## Troubleshooting

### If Deployment Fails
Check the error message from `npm run deploy`. Common issues:
- **Git authentication:** Make sure you're logged into GitHub
- **Permissions:** Ensure you have push access to the repository
- **Build errors:** The build happens automatically, check the error output
- **Missing dependencies:** Run `npm install` if you see "command not found" errors

### If You Need Manual Deployment
If the `gh-pages` tool doesn't work, you can deploy manually (but this requires more steps and deletes/reinstalls node_modules):
```bash
cd /home/jeremy/code/brandmap
npm run build
git checkout gh-pages
git rm -rf .
cp -r dist/* .
rm -rf dist
git add -A
git commit -m "Deploy update"
git push origin gh-pages
git checkout main
npm install  # Reinstall dependencies
```

### If Site Shows 404
- Check GitHub repo → Settings → Pages
- Verify branch is `gh-pages`
- Verify folder is `/ (root)`

### If CORS Errors Persist After Deploy
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Check browser console for actual errors

---

## Quick Commands Reference

```bash
# Deploy to GitHub Pages (builds and deploys automatically)
npm run deploy

# Run dev server locally
npm run dev
# Then visit: http://localhost:5173/brandmap/

# Manual build only (without deploying)
npm run build && ls -la dist/

# Check current branch
git branch

# Check what's deployed on gh-pages
git show gh-pages:index.html | head -20

# Check live site status
curl -I https://jsince.github.io/brandmap/
```

---

## Next Steps After Deployment Works

1. Update documentation with deployment workflow
2. Consider GitHub Actions for auto-deploy
3. Add more sitemap quick-load presets
4. Test on mobile devices

---

## Contact Info

- **Git Account:** jeremy@tillerdigital.ca
- **GitHub Username:** jsince
- **Repository:** github.com/jsince/brandmap

---

## Summary for New Chat

**IN ONE SENTENCE:** The app works locally and is deployed to GitHub Pages - to deploy updates, simply run `npm run deploy` which automatically builds and deploys without branch switching or deleting node_modules.

**DEPLOYMENT STATUS:** ✅ Fixed as of Nov 18, 2025 - the live site now shows the welcome message instead of CORS errors.

**KEY COMMANDS:**
- Deploy: `npm run deploy`
- Run locally: `npm run dev` (then visit http://localhost:5173/brandmap/)

