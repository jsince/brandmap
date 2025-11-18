# BrandMap Development Guide

Development workflow, best practices, and contribution guidelines for BrandMap.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Component Development](#component-development)
- [State Management](#state-management)
- [Testing](#testing)
- [Debugging](#debugging)
- [Build and Deployment](#build-and-deployment)

## Getting Started

### Prerequisites for Development

- Node.js 18+ or 20+
- npm 7+
- Code editor (VS Code recommended)
- Git
- Basic knowledge of React, Vite, and graph visualization

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Initial Setup

```bash
# Clone and install
git clone <repository-url>
cd brandmap
npm install

# Start development
npm run dev
```

## Project Structure

```
brandmap/
├── dist/                          # Production build output (generated)
├── node_modules/                  # Dependencies (generated)
├── public/                        # Static assets (if any)
├── src/
│   ├── components/               # React components
│   │   ├── GraphVisualization.jsx   # Main graph component
│   │   ├── GraphVisualization.css   # Graph styles
│   │   ├── Sidebar.jsx              # Sidebar management UI
│   │   └── Sidebar.css              # Sidebar styles
│   ├── utils/                    # Utility functions
│   │   ├── collisionDetection.js    # Node collision handling
│   │   ├── layout.js                # Graph layout algorithms
│   │   └── sitemapParser.js         # Sitemap XML parsing
│   ├── App.jsx                   # Main app component
│   ├── App.css                   # App styles
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── .gitignore                    # Git ignore rules
├── index.html                    # HTML template
├── package.json                  # Dependencies and scripts
├── vite.config.js               # Vite configuration
├── README.md                     # User documentation
├── SETUP.md                      # Setup instructions
├── TROUBLESHOOTING.md           # Troubleshooting guide
├── DEVELOPMENT.md               # This file
└── ARCHITECTURE.md              # Technical architecture

```

## Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Start dev server
npm run dev

# 4. Make changes and test
# Server auto-reloads on file changes

# 5. Commit changes
git add .
git commit -m "feat: add your feature description"

# 6. Push to remote
git push origin feature/your-feature-name

# 7. Create pull request
```

### Hot Module Replacement (HMR)

Vite provides instant updates during development:

- **CSS changes**: Applied instantly without page reload
- **Component changes**: React Fast Refresh updates components
- **State preservation**: Component state maintained across updates
- **Automatic**: No configuration needed

### Making Changes

#### Adding a New Page Feature

```javascript
// In src/components/Sidebar.jsx
const addPage = () => {
  const newPage = {
    id: `page-${Date.now()}`,
    label: 'New Page',
    url: '/new-page',
    type: 'page'
  };
  onAddPage(newPage);
};
```

#### Modifying Graph Behavior

```javascript
// In src/components/GraphVisualization.jsx
const graphOptions = {
  physics: {
    enabled: true,
    stabilization: { iterations: 100 }
  },
  interaction: {
    zoomView: true,
    dragView: true
  }
};
```

#### Adding New Utility Functions

```javascript
// In src/utils/ create new file or add to existing
export const myUtilityFunction = (data) => {
  // Implementation
  return processedData;
};
```

### Branch Strategy

```bash
main           # Production-ready code
├── develop    # Development branch (if using)
├── feature/*  # New features
├── fix/*      # Bug fixes
└── docs/*     # Documentation updates
```

### Commit Message Convention

Follow conventional commits:

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: update dependencies
```

Examples:
```bash
git commit -m "feat: add export to CSV functionality"
git commit -m "fix: resolve graph rendering issue on mobile"
git commit -m "docs: update README with new features"
```

## Code Style Guidelines

### JavaScript/JSX Style

```javascript
// Use functional components with hooks
function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return (
    <div className="my-component">
      {/* JSX content */}
    </div>
  );
}

// Export at bottom
export default MyComponent;
```

### React Best Practices

```javascript
// 1. Use destructuring
const { nodes, links } = graphData;

// 2. Use callback hooks for handlers
const handleClick = useCallback((id) => {
  // Handle click
}, [dependencies]);

// 3. Use memo for expensive computations
const processedData = useMemo(() => {
  return expensiveComputation(data);
}, [data]);

// 4. Keep components small and focused
// 5. Extract reusable logic to custom hooks
```

### CSS Guidelines

```css
/* Use BEM-like naming */
.component-name {
  /* Block */
}

.component-name__element {
  /* Element */
}

.component-name--modifier {
  /* Modifier */
}

/* Use CSS variables for themes */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
}

/* Mobile-first responsive design */
.component {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}
```

### File Organization

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import ExternalLibrary from 'external-library';
import LocalComponent from './LocalComponent';
import { utilityFunction } from '../utils/utilities';
import './Component.css';

// 2. Constants
const CONSTANT_VALUE = 'value';

// 3. Component definition
function Component() {
  // 3a. State
  const [state, setState] = useState();
  
  // 3b. Effects
  useEffect(() => {}, []);
  
  // 3c. Handlers
  const handleEvent = () => {};
  
  // 3d. Render
  return <div>Content</div>;
}

// 4. Export
export default Component;
```

## Component Development

### Creating a New Component

```bash
# Create component file
touch src/components/NewComponent.jsx
touch src/components/NewComponent.css
```

```javascript
// src/components/NewComponent.jsx
import React, { useState } from 'react';
import './NewComponent.css';

function NewComponent({ data, onAction }) {
  const [localState, setLocalState] = useState(null);
  
  const handleAction = () => {
    onAction(localState);
  };
  
  return (
    <div className="new-component">
      <h3>New Component</h3>
      <button onClick={handleAction}>Action</button>
    </div>
  );
}

export default NewComponent;
```

### Component Testing Checklist

- [ ] Renders without errors
- [ ] Props are properly typed/documented
- [ ] Handles edge cases (null, undefined, empty arrays)
- [ ] Event handlers work correctly
- [ ] Responsive on different screen sizes
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] No console errors or warnings

## State Management

### Current Approach

BrandMap uses React hooks for state management:

```javascript
// Global state in App.jsx
const [nodes, setNodes] = useState([]);
const [links, setLinks] = useState([]);
const [paidMediaItems, setPaidMediaItems] = useState([]);

// Pass state and updaters to children
<Sidebar
  pages={nodes}
  onAddPage={addPage}
  onDeletePage={deletePage}
/>
```

### State Update Patterns

```javascript
// Adding item
const addItem = useCallback((newItem) => {
  setItems(prev => [...prev, newItem]);
}, []);

// Updating item
const updateItem = useCallback((id, updates) => {
  setItems(prev => prev.map(item =>
    item.id === id ? { ...item, ...updates } : item
  ));
}, []);

// Deleting item
const deleteItem = useCallback((id) => {
  setItems(prev => prev.filter(item => item.id !== id));
}, []);
```

### Future: Context API

For larger apps, consider React Context:

```javascript
// Create context
const AppContext = createContext();

// Provider
function AppProvider({ children }) {
  const [state, setState] = useState(initialState);
  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  );
}

// Consumer
function Component() {
  const { state, setState } = useContext(AppContext);
}
```

## Testing

### Manual Testing Checklist

- [ ] Load sitemap from URL
- [ ] Import sitemap manually
- [ ] Add/edit/delete pages
- [ ] Add/edit/delete paid media items
- [ ] Create internal links between pages
- [ ] Zoom and pan graph
- [ ] Click nodes to focus
- [ ] Toggle sidebar
- [ ] Test on mobile devices
- [ ] Test in different browsers

### Browser Testing

Test in:
- Chrome (primary)
- Firefox
- Safari
- Edge

### Performance Testing

```javascript
// Use React DevTools Profiler
// Measure component render times

// Log performance
console.time('Operation');
performExpensiveOperation();
console.timeEnd('Operation');
```

## Debugging

### React DevTools

1. Install React DevTools browser extension
2. Open DevTools (F12)
3. Navigate to "Components" or "Profiler" tab
4. Inspect component state and props

### Console Logging

```javascript
// Structured logging
console.log('Component mounted:', {
  nodes: nodes.length,
  links: links.length,
  timestamp: new Date().toISOString()
});

// Conditional logging
if (process.env.NODE_ENV === 'development') {
  console.debug('Debug info:', data);
}
```

### Network Debugging

```javascript
// Monitor fetch requests
fetch(url)
  .then(res => {
    console.log('Response status:', res.status);
    console.log('Response headers:', res.headers);
    return res.text();
  })
  .then(data => console.log('Data:', data))
  .catch(err => console.error('Error:', err));
```

### Vite Debugging

```bash
# Run with debug output
DEBUG=vite:* npm run dev

# Check build analysis
npm run build -- --debug
```

## Build and Deployment

### Production Build

```bash
# Create optimized build
npm run build

# Output in dist/ directory
ls -lh dist/
```

### Build Configuration

```javascript
// vite.config.js
export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,        // Set true for debugging
    minify: 'terser',        // or 'esbuild'
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'graph': ['vis-network', 'vis-data']
        }
      }
    }
  }
});
```

### Deployment Options

#### Static Hosting (Netlify, Vercel, GitHub Pages)

```bash
# Build
npm run build

# Deploy dist/ folder to hosting service
```

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

#### Custom Server

```bash
# Build
npm run build

# Serve with any static file server
npx serve dist
# or
python -m http.server --directory dist 8080
```

## Development Tips

### Productivity Tips

1. **Use Vite's built-in features**: Fast refresh, instant HMR
2. **Keep dev server running**: Auto-reloads on changes
3. **Use browser DevTools**: React profiler, network tab
4. **Component isolation**: Test components in isolation
5. **Hot reload CSS**: Instant visual feedback

### Common Pitfalls

1. **Stale closures**: Use useCallback with correct dependencies
2. **Infinite loops**: Check useEffect dependencies
3. **Memory leaks**: Clean up effects and subscriptions
4. **Key warnings**: Always use unique keys in lists
5. **Props drilling**: Consider context for deeply nested components

### Performance Optimization

```javascript
// Lazy load components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Virtualize long lists
// Use react-window or react-virtualized

// Debounce expensive operations
const debouncedSearch = useMemo(
  () => debounce(searchFunction, 300),
  []
);

// Memoize expensive computations
const expensiveResult = useMemo(() => {
  return expensiveComputation(data);
}, [data]);
```

## Getting Help

- Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Check [React documentation](https://react.dev)
- Check [Vite documentation](https://vitejs.dev)
- Check [vis-network documentation](https://visjs.github.io/vis-network/)

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes following style guide
4. Test thoroughly
5. Update documentation
6. Submit pull request

### Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] No console errors or warnings
- [ ] Documentation updated
- [ ] Tested in multiple browsers
- [ ] Commits follow convention
- [ ] PR description explains changes

