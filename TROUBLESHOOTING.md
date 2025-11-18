# BrandMap Troubleshooting Guide

Solutions to common issues when setting up and running BrandMap.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Development Server Issues](#development-server-issues)
- [Runtime Errors](#runtime-errors)
- [Performance Issues](#performance-issues)
- [WSL-Specific Issues](#wsl-specific-issues)
- [Browser Issues](#browser-issues)

## Installation Issues

### "Permission Denied" on Vite Binary

**Problem**: When running `npm run dev`, you see:

```
sh: 1: vite: Permission denied
```

**Solution**:

```bash
# Fix permissions on all binaries
chmod +x node_modules/.bin/*

# Specifically fix vite
chmod +x node_modules/vite/bin/vite.js

# Run vite directly with node
node node_modules/vite/bin/vite.js
```

**Root Cause**: Files copied from Windows to WSL or extracted from certain archives may lose execute permissions.

### "vite.js: not found"

**Problem**: Error message shows:

```
/home/user/brandmap/node_modules/.bin/vite: 1: ../vite/bin/vite.js: not found
```

**Solution**:

```bash
# Clean install
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Verify vite installation
ls -la node_modules/vite/bin/vite.js
node node_modules/vite/bin/vite.js --version
```

**Root Cause**: Corrupted or incomplete node_modules installation.

### "Cannot Find Module" Errors

**Problem**: Import errors or missing module errors.

**Solution**:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall with legacy peer deps (if needed)
npm install --legacy-peer-deps

# Or use exact versions
npm ci
```

### Slow Installation

**Problem**: `npm install` takes a very long time.

**Solution**:

```bash
# Use alternative registries
npm install --registry=https://registry.npmjs.org/

# Or use yarn instead
yarn install

# Or use pnpm (faster alternative)
pnpm install
```

## Development Server Issues

### Port Already in Use

**Problem**: Error message:

```
Error: Port 5173 is already in use
```

**Solutions**:

**Option 1**: Kill the process using the port

```bash
# Find process using port 5173
lsof -i :5173
# or
netstat -tuln | grep 5173

# Kill the process
kill -9 <PID>
```

**Option 2**: Use a different port

```bash
# Use custom port
npm run dev -- --port 3000

# Or modify vite.config.js
```

**Option 3**: Let Vite choose next available port

Edit `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    strictPort: false  // Will try 5174, 5175, etc.
  }
})
```

### Server Starts But Can't Access

**Problem**: Server runs but browser shows "Cannot connect" or "Site can't be reached".

**Solution**:

```bash
# Check if server is actually listening
curl http://localhost:5173

# Check for firewall issues
sudo ufw status
sudo ufw allow 5173

# Verify server is binding to correct interface
# Edit vite.config.js:
server: {
  host: '0.0.0.0',  // Listen on all interfaces
  port: 5173
}
```

### Server Crashes Immediately

**Problem**: Server starts but crashes right away.

**Solution**:

```bash
# Run with verbose logging
DEBUG=vite:* npm run dev

# Check for syntax errors in config
node vite.config.js

# Verify Node.js version
node --version  # Should be 16+ 

# Update Node.js if needed (using nvm)
nvm install 18
nvm use 18
```

### Hot Module Replacement (HMR) Not Working

**Problem**: Changes don't appear without manual refresh.

**Solution**:

```bash
# Restart dev server
# Press Ctrl+C and run npm run dev again

# Clear browser cache
# Ctrl+Shift+R or Cmd+Shift+R

# Check WSL file watching limits (WSL)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Runtime Errors

### "Failed to Load Sitemap" with CORS Error

**Problem**: Console shows CORS policy error when fetching sitemap.

**Solution**:

This is expected behavior when fetching from external domains. Use the manual import feature:

1. Click "Import Sitemap Manually" button
2. Paste sitemap URL or XML content
3. Click "Import"

**Alternative**: The app will automatically attempt to use a CORS proxy (`allorigins.win`).

### Graph Not Rendering

**Problem**: Blank screen or graph area is empty.

**Checks**:

```javascript
// Open browser console (F12) and check for:
// 1. JavaScript errors
// 2. Network errors
// 3. Check React DevTools for component state

// Verify data is loaded
console.log('Nodes:', nodes.length);
console.log('Links:', links.length);
```

**Solutions**:

- Clear browser cache
- Check browser console for errors
- Verify nodes and links data in React DevTools
- Try adding a manual page through sidebar

### Paid Media Items Not Appearing

**Problem**: Pages load but no paid media items visible.

**Solution**:

```javascript
// Check if paid media generation is working
// In App.jsx, generatePaidMediaForPages should create 1-10 items per page

// Debug in browser console:
console.log('Pages:', nodes);
console.log('Paid Media:', paidMediaItems);

// Manual workaround: Add paid media through sidebar
```

## Performance Issues

### Slow Graph Rendering

**Problem**: Graph is laggy with many nodes.

**Solutions**:

1. **Reduce node count**: Filter pages before visualization
2. **Disable physics**: Modify GraphVisualization.jsx
3. **Simplify labels**: Show shorter labels
4. **Use canvas rendering**: Already used by default

```javascript
// In GraphVisualization.jsx physics options
physics: {
  enabled: true,
  stabilization: {
    iterations: 50  // Reduce for faster initial render
  }
}
```

### High Memory Usage

**Problem**: Browser tab uses excessive memory.

**Solutions**:

- Limit number of paid media items per page
- Clear unused nodes regularly
- Restart browser
- Use browser task manager to identify memory leaks

### Slow Initial Load

**Problem**: App takes long time to load initially.

**Solutions**:

```bash
# Build optimization
npm run build -- --minify terser

# Check bundle size
npm run build
ls -lh dist/assets/

# Analyze bundle
npm install -D rollup-plugin-visualizer
# Add to vite.config.js
```

## WSL-Specific Issues

### Permission Issues in WSL

**Problem**: Various permission denied errors.

**Solution**:

```bash
# Fix ownership
sudo chown -R $USER:$USER /home/jeremy/code/brandmap

# Fix permissions
chmod -R 755 /home/jeremy/code/brandmap

# Specifically fix node_modules
find node_modules -type d -exec chmod 755 {} \;
find node_modules -type f -exec chmod 644 {} \;
chmod +x node_modules/.bin/*
```

### Zone.Identifier Files

**Problem**: Lots of `.Identifier` files in directory.

**Explanation**: These are Windows Security Zone metadata files created when copying from Windows to WSL.

**Solution** (optional cleanup):

```bash
# Remove all Zone.Identifier files
find . -name "*Zone.Identifier" -type f -delete

# Prevent creation (in .gitignore)
echo "*Zone.Identifier" >> .gitignore
```

### File Watching Not Working in WSL

**Problem**: Changes not detected automatically.

**Solution**:

```bash
# Increase file watch limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
echo fs.inotify.max_queued_events=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Verify
cat /proc/sys/fs/inotify/max_user_watches
```

### Slow File Operations in WSL

**Problem**: npm install or file operations are very slow.

**Solution**:

```bash
# Move project to Linux filesystem (not /mnt/c/)
mv /mnt/c/Users/Jeremy/brandmap ~/brandmap
cd ~/brandmap

# Or use WSL 2 with better performance
wsl --set-version Ubuntu 2
```

## Browser Issues

### Browser Won't Load Localhost

**Problem**: `http://localhost:5173` doesn't load.

**Solutions**:

1. **Try 127.0.0.1**: `http://127.0.0.1:5173`
2. **Check browser proxy settings**: Disable if enabled
3. **Try different browser**: Chrome, Firefox, Edge
4. **Clear DNS cache**: 
   - Chrome: `chrome://net-internals/#dns` → Clear cache
   - Windows: `ipconfig /flushdns`

### Graph Controls Not Working

**Problem**: Zoom, pan, or other controls don't respond.

**Solutions**:

- Disable browser extensions (especially ad blockers)
- Try incognito/private mode
- Clear browser cache and cookies
- Check browser console for JavaScript errors
- Update browser to latest version

### Blank Screen After Build

**Problem**: Production build shows blank screen.

**Solution**:

```bash
# Check base path in vite.config.js
export default defineConfig({
  base: '/',  // Or '/brandmap/' for subdirectory
})

# Rebuild
npm run build

# Test with preview
npm run preview
```

## Getting More Help

### Collect Debug Information

When seeking help, provide:

```bash
# System information
node --version
npm --version
git --version
cat /etc/os-release  # Linux

# Package versions
npm list --depth=0

# Recent errors
npm run dev 2>&1 | tee debug.log

# Browser console errors (copy from F12 console)
```

### Common Debug Commands

```bash
# Verify installation
npm run dev -- --debug

# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Audit for vulnerabilities
npm audit
npm audit fix

# Complete reset
rm -rf node_modules package-lock.json dist
npm install
npm run dev
```

## Quick Fix Checklist

When something goes wrong, try these in order:

1. ✅ Restart dev server (Ctrl+C, then `npm run dev`)
2. ✅ Clear browser cache (Ctrl+Shift+R)
3. ✅ Check console for errors (F12)
4. ✅ Verify node_modules exists and is complete
5. ✅ Check port isn't already in use
6. ✅ Fix file permissions (WSL): `chmod +x node_modules/.bin/*`
7. ✅ Reinstall dependencies: `rm -rf node_modules && npm install`
8. ✅ Update Node.js to v18 or v20
9. ✅ Try different browser
10. ✅ Check network/firewall settings

