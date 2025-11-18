# BrandMap Setup Guide

Complete setup instructions for the BrandMap visual sitemap explorer.

## 🚀 Live Demo

Before setting up locally, try the live version:

**https://jsince.github.io/brandmap/**

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Running the Development Server](#running-the-development-server)
- [Building for Production](#building-for-production)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Environment Configuration](#environment-configuration)
- [Common Setup Issues](#common-setup-issues)

## Prerequisites

Before setting up BrandMap, ensure you have the following installed:

- **Node.js**: v16.0.0 or higher (recommended: v18.x or v20.x)
- **npm**: v7.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest version)

### Checking Your Environment

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

## Initial Setup

### 1. Clone or Navigate to the Repository

```bash
# If cloning from a repository
git clone <repository-url>
cd brandmap

# Or if you already have the folder
cd /path/to/brandmap
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React 18
- React DOM
- Vite (build tool)
- vis-network (graph visualization)
- vis-data (data structures)
- UUID (unique ID generation)

### 3. Verify Installation

Check that all dependencies were installed correctly:

```bash
# List installed packages
npm list --depth=0

# Verify Vite is installed
npx vite --version
```

Expected output should show vite version 5.x.x or higher.

## Running the Development Server

### Standard Method

```bash
npm run dev
```

The development server will start at `http://localhost:5173`

### Alternative Method (if npm script fails)

If you encounter permission issues or the standard method fails:

```bash
# Fix permissions on Vite binary (WSL/Linux)
chmod +x node_modules/.bin/vite
chmod +x node_modules/vite/bin/vite.js

# Run Vite directly with Node
node node_modules/vite/bin/vite.js
```

### Development Server Features

Once running, the dev server provides:

- **Hot Module Replacement (HMR)**: Changes appear instantly without full page reload
- **Fast Refresh**: React components update while preserving state
- **Auto Port Selection**: If port 5173 is busy, Vite will try 5174, 5175, etc.
- **Network Access**: Server is accessible from other devices on your network

### Accessing the Application

- **Local**: `http://localhost:5173`
- **Network**: Check console output for network URL (e.g., `http://192.168.1.x:5173`)

### Stopping the Server

- Press `Ctrl + C` in the terminal
- Or close the terminal window

## Building for Production

### Create Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:
- Minified JavaScript
- Optimized CSS
- Asset optimization
- Source maps (optional)

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally at `http://localhost:4173` for testing.

### Production Build Output

```
dist/
├── index.html              # Entry HTML file
├── assets/
│   ├── index-[hash].js    # Bundled JavaScript
│   └── index-[hash].css   # Bundled CSS
└── [other assets]
```

## Deploying to GitHub Pages

### Quick Deploy

```bash
npm run deploy
```

This command:
1. Builds the production version (`npm run build`)
2. Deploys to the `gh-pages` branch
3. Updates the live site at https://jsince.github.io/brandmap/

### Manual Deploy (if issues occur)

If you encounter permission issues on WSL:

```bash
# Fix permissions and build
chmod +x node_modules/.bin/*
node node_modules/vite/bin/vite.js build

# Deploy to GitHub Pages
npx gh-pages -d dist
```

### Verify Deployment

After deployment:
1. Wait 1-2 minutes for GitHub Pages to update
2. Visit https://jsince.github.io/brandmap/
3. Hard refresh (Ctrl+Shift+R) to see changes

### GitHub Repository Settings

Ensure GitHub Pages is enabled:
1. Go to repository **Settings**
2. Navigate to **Pages**
3. Verify **Source**: Deploy from branch
4. Verify **Branch**: `gh-pages` / `root`

## Environment Configuration

### Default Configuration

BrandMap comes pre-configured with sensible defaults in `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: false
  }
})
```

### Customizing the Configuration

Create or modify `vite.config.js` to customize:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,           // Custom port
    host: true,           // Listen on all addresses
    open: true,           // Auto-open browser
    strictPort: false     // Try next port if busy
  },
  build: {
    outDir: 'build',      // Custom output directory
    sourcemap: true       // Generate source maps
  }
})
```

### Environment Variables

Create a `.env` file in the project root for environment-specific settings:

```bash
# .env
VITE_APP_TITLE=BrandMap
VITE_API_URL=https://api.example.com
```

Access in your code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

**Note**: Environment variables must be prefixed with `VITE_` to be exposed to the client.

## Common Setup Issues

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions to common problems:

- Permission denied errors
- Port already in use
- Module not found errors
- CORS issues with sitemap fetching
- WSL-specific issues

## Next Steps

After successful setup:

1. Read [DEVELOPMENT.md](./DEVELOPMENT.md) for development workflow
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for technical overview
3. Check [README.md](./README.md) for usage instructions

## Getting Help

If you encounter issues not covered in this guide:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review console output for error messages
3. Verify all prerequisites are met
4. Try reinstalling dependencies: `rm -rf node_modules package-lock.json && npm install`

## Quick Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Reinstall everything
rm -rf node_modules package-lock.json
npm install
```

