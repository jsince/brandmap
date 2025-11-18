# BrandMap Architecture

Technical architecture and design documentation for BrandMap.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture Patterns](#architecture-patterns)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Graph Visualization](#graph-visualization)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Performance Considerations](#performance-considerations)

## Overview

BrandMap is a single-page React application that visualizes website sitemaps and paid media connections using an interactive force-directed graph. The application is built with modern web technologies emphasizing performance, maintainability, and user experience.

**Live Application:** https://jsince.github.io/brandmap/

The application features a professional, modern UI design inspired by contemporary B2B SaaS applications, with a focus on readability and usability.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (Client)                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │     App      │  │   Sidebar    │  │    Graph     │ │
│  │  Container   │◄─┤  Management  │  │ Visualization│ │
│  └──────┬───────┘  └──────────────┘  └──────────────┘ │
│         │                                               │
│  ┌──────▼───────────────────────────────────────────┐  │
│  │         State (React Hooks)                      │  │
│  │  - Nodes (Pages)                                 │  │
│  │  - Links (Connections)                           │  │
│  │  - Paid Media Items                              │  │
│  └──────────────────────────────────────────────────┘  │
│         │                                               │
│  ┌──────▼───────────────────────────────────────────┐  │
│  │         Utils & Services                         │  │
│  │  - Sitemap Parser                                │  │
│  │  - Layout Algorithms                             │  │
│  │  - Collision Detection                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│              External Services (Optional)                │
│  - Sitemap XML Endpoints                                │
│  - CORS Proxy (allorigins.win)                          │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.0.8+ | Build tool and dev server |
| vis-network | 10.0.2 | Graph visualization |
| vis-data | 8.0.3 | Data structures for graphs |
| UUID | 9.0.1 | Unique ID generation |

### Development Tools

- **Node.js**: 16+ (runtime)
- **npm**: 7+ (package management)
- **ESLint**: Code linting (optional)
- **Prettier**: Code formatting (optional)

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Architecture Patterns

### 1. Component-Based Architecture

BrandMap follows React's component-based architecture with a clear hierarchy:

```
App (Container)
├── Header
├── Sidebar (Smart Component)
│   ├── PageList
│   ├── PaidMediaList
│   └── Forms
└── GraphVisualization (Smart Component)
    ├── vis-network instance
    └── Controls
```

### 2. Unidirectional Data Flow

Data flows down through props, events flow up through callbacks:

```javascript
// Data flows down
<Sidebar pages={nodes} paidMediaItems={paidMediaItems} />

// Events flow up
<Sidebar onAddPage={addPage} onDeletePage={deletePage} />
```

### 3. Composition Over Inheritance

Components are composed rather than extended:

```javascript
function App() {
  return (
    <div className="app">
      <Sidebar {...sidebarProps} />
      <GraphVisualization {...graphProps} />
    </div>
  );
}
```

### 4. Separation of Concerns

- **Components**: UI rendering and user interaction
- **Utils**: Business logic and data processing
- **State**: Application state management
- **Styles**: Visual presentation

## Component Architecture

### App.jsx (Root Component)

**Responsibilities:**
- Global state management
- Data fetching and initialization
- Coordination between Sidebar and GraphVisualization
- Error handling and loading states

**Key State:**
```javascript
const [nodes, setNodes] = useState([])              // Page nodes
const [links, setLinks] = useState([])              // Internal links
const [paidMediaItems, setPaidMediaItems] = useState([])  // Paid media
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
```

**Key Functions:**
- `addPage()`, `updatePage()`, `deletePage()`
- `addPaidMedia()`, `updatePaidMedia()`, `deletePaidMedia()`
- `addInternalLink()`
- `handleManualImport()`

### Sidebar.jsx (Management UI)

**Responsibilities:**
- Display lists of pages and paid media
- Provide forms for adding/editing items
- Handle user input and validation
- Trigger actions through callbacks
- **NEW:** Sitemap loading and management tab

**Tabs:**
1. **Sitemap Tab** - Load/switch between different sitemaps
2. **Pages Tab** - Manage website pages
3. **Paid Media Tab** - Manage advertising connections

**Props Interface:**
```javascript
interface SidebarProps {
  pages: Array<Page>
  paidMediaItems: Array<PaidMedia>
  onAddPage: (page) => void
  onUpdatePage: (id, updates) => void
  onDeletePage: (id) => void
  onAddPaidMedia: (media) => void
  onUpdatePaidMedia: (id, updates) => void
  onDeletePaidMedia: (id) => void
  onAddInternalLink: (source, target) => void
  onPageClick: (pageId) => void
  onLoadSitemap: (input) => void  // NEW: Load sitemap from URL or XML
}
```

### GraphVisualization.jsx (Graph Display)

**Responsibilities:**
- Render force-directed graph using vis-network
- Handle zoom, pan, and node interactions
- Apply layout algorithms
- Provide graph controls (zoom, fit, etc.)

**Props Interface:**
```javascript
interface GraphVisualizationProps {
  graphData: { nodes: Array, links: Array }
  sidebarVisible: boolean
  onNodeFocus: (focusFunction) => void
  onZoomControlsReady: (controls) => void
}
```

**vis-network Configuration:**
```javascript
const options = {
  nodes: {
    shape: 'dot',
    borderWidth: 2,
    shadow: { enabled: true, size: 4 },
    font: {
      size: 11,  // Base size, overridden per node
      face: 'Arial, sans-serif',
      align: 'center'
    },
    margin: { top: 10, right: 10, bottom: 10, left: 10 }
  },
  edges: {
    arrows: { to: { enabled: false } },
    smooth: {
      enabled: true,
      type: 'cubicBezier',
      forceDirection: 'horizontal',
      roundness: 0.2
    },
    width: 1.5
  },
  physics: {
    enabled: false  // Nodes are pre-positioned with layout algorithm
  },
  interaction: {
    zoomView: true,
    dragView: true,
    dragNodes: true
  }
}

// Per-node configuration
{
  // Page nodes
  font: { size: 60, bold: '600' },  // Large, bold for readability
  color: { background: '#3b82f6', border: '#2563eb' },  // Blue
  size: 16,
  
  // Paid media nodes
  font: { size: 9 },
  color: { background: '#f59e0b', border: '#d97706' },  // Orange
  size: 12
}
```

## Data Flow

### 1. Initial Data Loading

```
User loads app
    ↓
App.useEffect() triggers
    ↓
fetchSitemap() called
    ↓
Parse XML sitemap
    ↓
Generate page nodes
    ↓
Generate paid media items (1-10 per page)
    ↓
Update state (nodes, paidMediaItems)
    ↓
Components re-render
```

### 2. User Interaction Flow

```
User clicks "Add Page"
    ↓
Sidebar form submission
    ↓
onAddPage(pageData) callback
    ↓
App.addPage() updates state
    ↓
React re-renders components
    ↓
GraphVisualization receives new data
    ↓
vis-network updates graph
```

### 3. Graph Data Computation

```javascript
// Computed in App.jsx using useMemo
const graphData = useMemo(() => {
  // Combine page nodes and paid media nodes
  const allNodes = [
    ...nodes.map(node => ({ ...node, nodeType: 'page' })),
    ...paidMediaItems.map(item => ({ ...item, nodeType: 'paid-media' }))
  ];

  // Create links from paid media to pages
  const paidMediaLinks = paidMediaItems.map(item => ({
    source: item.id,
    target: item.targetPageId,
    type: 'paid-media-link'
  }));

  // Combine all links
  const allLinks = [...links, ...paidMediaLinks];

  return { nodes: allNodes, links: allLinks };
}, [nodes, links, paidMediaItems]);
```

## Graph Visualization

### vis-network Integration

vis-network is a JavaScript library for creating interactive network graphs.

**Key Features Used:**
- Force-directed layout (Barnes-Hut algorithm)
- Interactive zoom and pan
- Node selection and hovering
- Edge rendering with arrows
- Physics simulation

### Node Types

**Page Nodes:**
```javascript
{
  id: 'page-1',
  label: 'Home Page',
  url: 'https://example.com',
  type: 'page',
  nodeType: 'page',
  x: 0,
  y: 0
}
```

**Paid Media Nodes:**
```javascript
{
  id: 'media-1',
  label: 'Google Ads - Home Page',
  type: 'paid-media',
  nodeType: 'paid-media',
  targetPageId: 'page-1',
  platform: 'Google Ads',
  campaign: 'Brand Awareness Q1',
  x: 0,
  y: 0
}
```

### Layout Algorithm

The force-directed layout uses physics simulation:

```javascript
physics: {
  barnesHut: {
    gravitationalConstant: -8000,  // Repulsion between nodes
    centralGravity: 0.3,           // Pull toward center
    springLength: 150,             // Desired edge length
    springConstant: 0.04,          // Edge stiffness
    damping: 0.09                  // Movement damping
  }
}
```

### Collision Detection

Custom collision detection prevents node overlap:

```javascript
// In utils/collisionDetection.js
export function detectAndResolveCollisions(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const distance = calculateDistance(nodes[i], nodes[j]);
      if (distance < minDistance) {
        separateNodes(nodes[i], nodes[j]);
      }
    }
  }
}
```

## State Management

### Current Approach: React Hooks

State is managed in App.jsx using React hooks:

```javascript
// State declarations
const [nodes, setNodes] = useState([]);
const [links, setLinks] = useState([]);
const [paidMediaItems, setPaidMediaItems] = useState([]);

// State updates use functional updates
const addPage = useCallback((pageData) => {
  setNodes(prev => [...prev, newPage]);
}, []);

const updatePage = useCallback((pageId, updates) => {
  setNodes(prev => prev.map(node =>
    node.id === pageId ? { ...node, ...updates } : node
  ));
}, []);
```

### Optimization with useMemo and useCallback

```javascript
// Memoize expensive computations
const graphData = useMemo(() => {
  return computeGraphData(nodes, links, paidMediaItems);
}, [nodes, links, paidMediaItems]);

// Memoize callbacks to prevent re-renders
const handleClick = useCallback((id) => {
  // Handle click
}, [dependencies]);
```

### Future Considerations

For scaling to larger applications:
- **React Context**: For avoiding prop drilling
- **Redux/Zustand**: For complex state management
- **React Query**: For server state management

## API Integration

### Sitemap Fetching

```javascript
// utils/sitemapParser.js
export async function fetchSitemap(url) {
  try {
    // Try direct fetch
    const response = await fetch(url);
    const xmlText = await response.text();
    return parseSitemapXML(xmlText);
  } catch (error) {
    // Fallback to CORS proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const xmlText = await response.text();
    return parseSitemapXML(xmlText);
  }
}
```

### XML Parsing

```javascript
export function parseSitemapXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  const urls = Array.from(xmlDoc.getElementsByTagName('url'));
  
  return urls.map((urlNode, index) => {
    const loc = urlNode.getElementsByTagName('loc')[0]?.textContent;
    return {
      id: `page-${index + 1}`,
      label: extractLabelFromUrl(loc),
      url: loc,
      type: 'page'
    };
  });
}
```

### CORS Handling

CORS issues are handled by:
1. **Direct fetch first**: Try fetching directly
2. **CORS proxy fallback**: Use allorigins.win proxy
3. **Manual import**: Allow user to paste XML content

## Performance Considerations

### 1. Large Graph Rendering

**Challenge**: Rendering thousands of nodes is computationally expensive.

**Solutions:**
- Use vis-network's canvas rendering (default)
- Limit initial node count
- Implement pagination or filtering
- Disable physics for large graphs

```javascript
// Conditional physics
const options = {
  physics: {
    enabled: nodes.length < 500,  // Disable for large graphs
  }
};
```

### 2. React Re-renders

**Challenge**: Unnecessary re-renders slow down the app.

**Solutions:**
- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers
- Split components to isolate updates
- Use React DevTools Profiler

### 3. Memory Management

**Challenge**: Memory leaks from event listeners and subscriptions.

**Solutions:**
```javascript
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('resize', handler);
  
  // Cleanup
  return () => window.removeEventListener('resize', handler);
}, []);
```

### 4. Bundle Size

**Challenge**: Large bundle impacts load time.

**Solutions:**
- Code splitting with React.lazy()
- Tree shaking (Vite does this automatically)
- Analyze bundle with rollup-plugin-visualizer

```javascript
// Lazy load heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 5. Network Performance

**Challenge**: Slow sitemap fetching.

**Solutions:**
- Implement caching
- Show loading indicators
- Provide offline capability
- Use service workers (future enhancement)

## Security Considerations

### 1. XSS Prevention

React automatically escapes content, but be careful with:
- `dangerouslySetInnerHTML` (avoid if possible)
- User-provided URLs
- Dynamic attributes

### 2. CORS and CSP

- Respect CORS policies
- Use CORS proxy as fallback
- Consider Content Security Policy headers in production

### 3. Data Validation

Validate user inputs:
```javascript
function validatePageData(data) {
  if (!data.label || data.label.trim() === '') {
    throw new Error('Page label is required');
  }
  if (!data.url || !isValidUrl(data.url)) {
    throw new Error('Valid URL is required');
  }
  return true;
}
```

## Design System

### Visual Design

BrandMap features a clean, modern interface inspired by contemporary B2B SaaS applications (specifically Tiller Digital):

**Color Palette:**
- **Primary Black:** `#000000` (navigation header)
- **Page Nodes:** `#3b82f6` (blue) with `#2563eb` border
- **Paid Media Nodes:** `#f59e0b` (orange) with `#d97706` border
- **Text:** `#ffffff` (white on dark), `#1a1a1a` (dark on light)
- **Subtle Gray:** `#a3a3a3` (secondary text)

**Typography:**
- **Page Labels:** 60px, bold (600 weight) - maximum readability
- **Paid Media Labels:** 9px - visual hierarchy
- **Header Title:** 1.5rem, bold (700 weight)
- **Body Text:** 0.875rem
- **Font Stack:** System fonts (San Francisco, Segoe UI, Roboto, etc.)

**Spacing & Layout:**
- Navigation: 1rem vertical, 2rem horizontal padding
- Consistent 0.5rem-1rem gaps between elements
- Card-based layouts with subtle shadows
- Generous whitespace for breathing room

**Interactive Elements:**
- Buttons: 0.625rem padding, 0.375rem border radius
- Smooth hover effects with slight elevation
- Transitions: 0.15s-0.3s ease timing
- Focus states for accessibility

### User Experience

**Navigation Flow:**
1. **Sitemap Tab** → Load data
2. **Pages/Media Tabs** → Manage content
3. **Graph** → Visualize and interact

**Key UX Features:**
- Three-tab sidebar for organized workflows
- Quick-load presets for demos
- Real-time graph updates
- Focus on click for better navigation
- Zoom controls in header for accessibility

## Deployment

### GitHub Pages

BrandMap is deployed to GitHub Pages at: https://jsince.github.io/brandmap/

**Configuration:**
- Base path: `/brandmap/` (vite.config.js)
- Build output: `dist/` directory
- Deploy branch: `gh-pages`
- Deploy command: `npm run deploy`

**Build Process:**
1. Vite builds optimized production bundle
2. gh-pages package pushes dist/ to gh-pages branch
3. GitHub Pages serves from gh-pages branch
4. Updates typically live within 1-2 minutes

### Vite Configuration

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/brandmap/',  // GitHub Pages subdirectory
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false  // Omit sourcemaps for production
  }
})
```

## Future Enhancements

### Potential Features

1. **Data Persistence**
   - LocalStorage for saving state
   - Backend API for multi-user scenarios
   - Export/import to JSON/CSV
   - Multiple sitemap projects

2. **Advanced Filtering**
   - Filter by platform (Google, Facebook, etc.)
   - Search functionality across nodes
   - Date range filtering for campaigns
   - Custom grouping and clustering

3. **Analytics Integration**
   - Connect to Google Analytics API
   - Track performance metrics per page
   - ROI calculations for campaigns
   - Traffic correlation visualization

4. **Enhanced Visualization**
   - Custom color themes
   - Different layout algorithms
   - Timeline view for campaigns
   - Heat maps for performance

5. **Collaboration Features**
   - Real-time multi-user editing
   - Comments and annotations on nodes
   - Version history and rollback
   - Share links with view-only access

6. **Mobile Optimization**
   - Touch gestures for zoom/pan
   - Responsive sidebar design
   - Mobile-optimized controls
   - Progressive Web App (PWA) support

### Technical Improvements

1. **Testing**: Add Jest and React Testing Library
2. **TypeScript**: Migrate to TypeScript for type safety
3. **State Management**: Implement Redux or Zustand
4. **API Layer**: Create abstraction for data fetching
5. **Accessibility**: Improve ARIA labels and keyboard navigation

## References

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [vis-network Documentation](https://visjs.github.io/vis-network/)
- [Force-Directed Graphs](https://en.wikipedia.org/wiki/Force-directed_graph_drawing)
- [Barnes-Hut Algorithm](https://en.wikipedia.org/wiki/Barnes%E2%80%93Hut_simulation)

