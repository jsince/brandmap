# BrandMap

A visual sitemap explorer for marketing websites with paid media tracking. Visualize your website structure and see how paid media campaigns connect to specific pages.

## 🚀 Live Demo

**Try it now:** [https://jsince.github.io/brandmap/](https://jsince.github.io/brandmap/)

## ✨ Features

- **🗺️ Sitemap Loading**: Load any sitemap XML from URL or paste directly, with quick-load presets
- **📊 Interactive Graph Visualization**: View your marketing website pages as an interactive force-directed graph
- **🔍 Zoom & Pan**: Navigate the visualization with mouse wheel zoom and drag-to-pan
- **📱 Paid Media Tracking**: Connect Google ads, display ads, and other paid media to specific pages
- **🔗 Visual Connections**: See paid media items visually linked to their target pages
- **✏️ Easy Management**: Add, edit, and delete pages and paid media items through a simple sidebar interface
- **🎨 Modern UI**: Clean, professional design inspired by modern B2B SaaS aesthetics
- **👁️ Enhanced Readability**: Large, bold page labels (60px) for easy viewing at any zoom level

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup and installation guide
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solutions to common issues
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development workflow and best practices
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture and design

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## 💡 Usage

### Loading a Sitemap

1. **Open the Sitemap tab** in the sidebar
2. **Choose an option**:
   - Click "Load Tiller Digital Sitemap" for a quick demo
   - Paste any sitemap URL (e.g., `https://example.com/sitemap.xml`)
   - Or paste XML content directly
3. **Click "Load Sitemap"** to visualize

### Managing Your Data

1. **Pages Tab**: View, add, edit, and delete website pages
   - Click on any page card to focus it in the graph
   - See how many paid media items link to each page
2. **Paid Media Tab**: Manage advertising campaigns and connections
   - Link ads to specific pages
   - Track platforms (Google Ads, Facebook, LinkedIn, etc.)
   - Organize by campaign
3. **Graph Visualization**: 
   - **Blue nodes** = Website pages (large, bold labels)
   - **Orange nodes** = Paid media items
   - Scroll to zoom in/out
   - Click and drag to pan
   - Click on nodes to focus
   - Use control buttons to fit to screen or zoom

## Project Structure

```
brandmap/
├── src/
│   ├── components/
│   │   ├── GraphVisualization.jsx  # Main graph component
│   │   └── Sidebar.jsx              # Management sidebar
│   ├── App.jsx                      # Main app component
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## 🛠️ Technologies

- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool and dev server
- **vis-network** - Interactive network graph visualization
- **vis-data** - Data structures for graphs
- **gh-pages** - GitHub Pages deployment

## 🎨 Design

BrandMap features a clean, modern interface inspired by contemporary B2B SaaS applications:
- Black navigation header for professional appearance
- High-contrast design for better visibility
- Large, readable page labels (60px font)
- Smooth animations and transitions
- Responsive controls and interactions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🔧 Troubleshooting

If you encounter issues:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common solutions
2. Verify Node.js version is 16+ (`node --version`)
3. Try reinstalling dependencies: `rm -rf node_modules && npm install`
4. For WSL issues, check file permissions: `chmod +x node_modules/.bin/*`

## 📞 Support

For questions or issues:
- Review the documentation in the repo
- Check existing GitHub issues
- Open a new issue with details about your problem

