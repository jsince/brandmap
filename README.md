# BrandMap

A visual sitemap explorer for marketing websites with paid media tracking. Visualize your website structure and see how paid media campaigns connect to specific pages.

## Features

- **Interactive Sitemap Visualization**: View your marketing website pages as an interactive graph
- **Zoom & Pan**: Navigate the visualization with mouse wheel zoom and drag-to-pan
- **Paid Media Tracking**: Connect Google ads, display ads, and other paid media to specific pages
- **Visual Connections**: See paid media items visually linked to their target pages
- **Easy Management**: Add, edit, and delete pages and paid media items through a simple sidebar interface

## Getting Started

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

## Usage

1. **Add Pages**: Use the "Pages" tab to add website pages to your sitemap
2. **Add Paid Media**: Use the "Paid Media" tab to add ads and campaigns, linking them to specific pages
3. **Visualize**: The graph automatically updates to show connections between paid media and pages
4. **Navigate**: 
   - Scroll to zoom in/out
   - Click and drag to pan
   - Click on nodes to center the view
   - Use the control buttons to fit to screen or zoom

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

## Technologies

- React 18
- Vite
- react-force-graph-2d (for graph visualization)

