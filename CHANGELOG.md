# Changelog

All notable changes to BrandMap will be documented in this file.

## [1.1.0] - 2024-11-18

### Added
- **Sitemap Tab**: New dedicated tab for loading and switching between sitemaps
  - Paste sitemap URL or XML content directly
  - Quick-load presets (Tiller Digital sitemap)
  - Current data statistics display
- **GitHub Pages Deployment**: App is now live at https://jsince.github.io/brandmap/
  - Configured Vite with `/brandmap/` base path
  - Added gh-pages deployment scripts
  - Automated deployment with `npm run deploy`
- **Comprehensive Documentation**:
  - `SETUP.md` - Complete setup and installation guide
  - `TROUBLESHOOTING.md` - Solutions to common issues (including WSL problems)
  - `DEVELOPMENT.md` - Development workflow and best practices
  - `ARCHITECTURE.md` - Technical architecture and design documentation
  - `CHANGELOG.md` - This file

### Changed
- **UI/UX Overhaul**: Modern B2B SaaS design inspired by Tiller Digital
  - Black navigation header (`#000000`) for professional appearance
  - White text on dark background for high contrast
  - Updated color scheme throughout application
- **Enhanced Typography**:
  - Page node labels increased from 12px to **60px** for maximum readability
  - Bold page labels (font-weight: 600)
  - Improved visual hierarchy between page and paid media nodes
- **Improved Controls**:
  - Zoom controls styled to match new design system
  - Hover effects with subtle elevation
  - Smooth transitions and animations
- **Updated README**: Added live demo link, enhanced feature list, and documentation links

### Fixed
- Zone.Identifier files now ignored in `.gitignore`
- WSL permission issues documented with solutions
- Vite binary execution issues on WSL addressed

### Technical
- Updated `vite.config.js` with GitHub Pages base path
- Added `gh-pages` package (v6.1.0)
- Configured deploy scripts in `package.json`
- Git account properly configured for jeremy@tillerdigital.ca

## [1.0.0] - 2024-11-17

### Initial Release
- Interactive force-directed graph visualization
- Sitemap XML parsing and loading
- Paid media tracking and connections
- Page and media management through sidebar
- Zoom, pan, and focus controls
- React 18 + Vite + vis-network stack
- Responsive graph layout with collision detection

---

## Future Roadmap

See [ARCHITECTURE.md](./ARCHITECTURE.md#future-enhancements) for planned features:
- Data persistence (LocalStorage, export/import)
- Advanced filtering and search
- Analytics integration
- Enhanced visualization options
- Collaboration features
- Mobile optimization and PWA support

