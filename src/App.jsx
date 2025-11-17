import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import GraphVisualization from './components/GraphVisualization'
import Sidebar from './components/Sidebar'
import { fetchSitemap, parseSitemapXML } from './utils/sitemapParser'
import './App.css'

function App() {
  const [nodes, setNodes] = useState([])
  const [links, setLinks] = useState([])
  const [paidMediaItems, setPaidMediaItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showManualImport, setShowManualImport] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const focusNodeRef = useRef(null)

  // Generate paid media items for pages
  const generatePaidMediaForPages = useCallback((pageNodes) => {
    if (!pageNodes || !Array.isArray(pageNodes) || pageNodes.length === 0) {
      return []
    }
    
    const platforms = ['Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'Twitter Ads', 'Microsoft Ads', 'Instagram Ads', 'YouTube Ads', 'TikTok Ads']
    const adTypes = ['Search Ad', 'Display Ad', 'Video Ad', 'Shopping Ad', 'Lead Ad', 'Sponsored Content', 'Promoted Tweet', 'Sponsored Post']
    const campaignTypes = ['Lead Generation', 'Brand Awareness', 'Retargeting', 'Conversion', 'Engagement', 'Traffic', 'Sales', 'App Install']
    
    const generatedMedia = []
    
    pageNodes.forEach(page => {
      if (!page || !page.id) return
      
      // Generate random number between 1-10 paid media items per page
      const numMediaItems = Math.floor(Math.random() * 10) + 1
      
      for (let i = 0; i < numMediaItems; i++) {
        const platform = platforms[Math.floor(Math.random() * platforms.length)]
        const adType = adTypes[Math.floor(Math.random() * adTypes.length)]
        const campaignType = campaignTypes[Math.floor(Math.random() * campaignTypes.length)]
        
        // Create a label based on page name
        const pageLabel = page.label || page.id || 'Page'
        const shortPageLabel = pageLabel.length > 30 ? pageLabel.substring(0, 30) + '...' : pageLabel
        
        generatedMedia.push({
          id: `media-${page.id}-${i + 1}`,
          label: `${platform} - ${adType} - ${shortPageLabel}`,
          type: 'paid-media',
          targetPageId: page.id,
          platform: platform,
          campaign: `${campaignType} Q${Math.floor(Math.random() * 4) + 1}`,
          x: 0,
          y: 0
        })
      }
    })
    
    return generatedMedia
  }, [])

  // Load sitemap on mount
  useEffect(() => {
    const loadSitemap = async () => {
      try {
        setLoading(true)
        setError(null)
        const sitemapUrl = 'https://tillerdigital.com/page-sitemap.xml'
        const pages = await fetchSitemap(sitemapUrl)
        
        // Convert pages to nodes format
        const initialNodes = pages.map(page => ({
          ...page,
          x: 0,
          y: 0
        }))
        
        setNodes(initialNodes)
        
        // Generate paid media items for all pages (1-10 per page)
        const generatedMedia = generatePaidMediaForPages(initialNodes)
        setPaidMediaItems(generatedMedia)
        
        setLoading(false)
      } catch (err) {
        console.error('Failed to load sitemap:', err)
        setError(err.message)
        setLoading(false)
        // Fallback to empty state
        setNodes([])
        // Show manual import option if CORS error or parsing error
        if (err.message.includes('CORS') || err.message.includes('fetch') || err.message.includes('HTML instead of XML')) {
          setShowManualImport(true)
        }
      }
    }
    
    loadSitemap()
  }, [generatePaidMediaForPages])

  const handleManualImport = useCallback(async (input) => {
    try {
      let xmlText = input.trim()
      
      // Check if input is a URL
      if (xmlText.startsWith('http://') || xmlText.startsWith('https://')) {
        setLoading(true)
        try {
          let response
          try {
            // Try direct fetch first
            response = await fetch(xmlText)
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
          } catch (directErr) {
            // If direct fetch fails (likely CORS), try using a CORS proxy
            console.log('Direct fetch failed, trying CORS proxy...', directErr)
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(xmlText)}`
            response = await fetch(proxyUrl)
            if (!response.ok) {
              throw new Error(`Proxy fetch failed: ${response.statusText}. Please paste the XML content directly.`)
            }
          }
          xmlText = await response.text()
          
          // Check if we got HTML instead of XML
          if (xmlText.trim().startsWith('<!DOCTYPE') || xmlText.trim().startsWith('<html')) {
            throw new Error('Received HTML instead of XML. Please copy the XML content directly from the sitemap URL.')
          }
        } catch (fetchErr) {
          setLoading(false)
          setError('Failed to fetch URL: ' + fetchErr.message + '. You can copy the XML content directly from the sitemap URL and paste it here.')
          return
        }
      }
      
      // Parse the XML
      const pages = parseSitemapXML(xmlText)
      const initialNodes = pages.map(page => ({
        ...page,
        x: 0,
        y: 0
      }))
      setNodes(initialNodes)
      
      // Generate paid media items for all pages (1-10 per page)
      const generatedMedia = generatePaidMediaForPages(initialNodes)
      setPaidMediaItems(generatedMedia)
      
      setError(null)
      setShowManualImport(false)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setError('Failed to parse XML: ' + err.message)
    }
  }, [generatePaidMediaForPages])

  const graphData = useMemo(() => {
    // Combine page nodes and paid media items
    const allNodes = [
      ...nodes.map(node => ({ ...node, nodeType: 'page' })),
      ...paidMediaItems.map(item => ({ 
        ...item, 
        nodeType: 'paid-media',
        id: item.id 
      }))
    ]

    // Create links from paid media to pages
    const paidMediaLinks = paidMediaItems.map(item => ({
      id: `paid-${item.id}`,
      source: item.id,
      target: item.targetPageId,
      type: 'paid-media-link'
    }))

    // Combine internal links and paid media links
    const allLinks = [...links, ...paidMediaLinks]

    return { nodes: allNodes, links: allLinks }
  }, [nodes, links, paidMediaItems])

  const addPage = useCallback((pageData) => {
    const newPage = {
      id: pageData.id || `page-${Date.now()}`,
      label: pageData.label,
      url: pageData.url,
      type: 'page',
      x: 0,
      y: 0
    }
    setNodes(prev => [...prev, newPage])
  }, [])

  const updatePage = useCallback((pageId, updates) => {
    setNodes(prev => prev.map(node => 
      node.id === pageId ? { ...node, ...updates } : node
    ))
  }, [])

  const deletePage = useCallback((pageId) => {
    setNodes(prev => prev.filter(node => node.id !== pageId))
    setLinks(prev => prev.filter(link => 
      link.source !== pageId && link.target !== pageId
    ))
    setPaidMediaItems(prev => prev.filter(item => item.targetPageId !== pageId))
  }, [])

  const addPaidMedia = useCallback((mediaData) => {
    const newMedia = {
      id: mediaData.id || `media-${Date.now()}`,
      label: mediaData.label,
      type: 'paid-media',
      targetPageId: mediaData.targetPageId,
      platform: mediaData.platform || 'Unknown',
      campaign: mediaData.campaign || '',
      x: 0,
      y: 0
    }
    setPaidMediaItems(prev => [...prev, newMedia])
  }, [])

  const updatePaidMedia = useCallback((mediaId, updates) => {
    setPaidMediaItems(prev => prev.map(item => 
      item.id === mediaId ? { ...item, ...updates } : item
    ))
  }, [])

  const deletePaidMedia = useCallback((mediaId) => {
    setPaidMediaItems(prev => prev.filter(item => item.id !== mediaId))
  }, [])

  const addInternalLink = useCallback((sourceId, targetId) => {
    const linkId = `link-${sourceId}-${targetId}-${Date.now()}`
    setLinks(prev => {
      // Check if link already exists
      const exists = prev.some(link => 
        link.source === sourceId && link.target === targetId
      )
      if (exists) return prev
      return [...prev, { id: linkId, source: sourceId, target: targetId, type: 'internal' }]
    })
  }, [])

  const handlePageClick = useCallback((pageId) => {
    if (focusNodeRef.current && pageId) {
      console.log('Focusing on node:', pageId)
      focusNodeRef.current(pageId)
    } else {
      console.warn('Focus function not available or no pageId:', { focusNodeRef: focusNodeRef.current, pageId })
    }
  }, [])

  const [zoomControlsRef, setZoomControlsRef] = useState(null)

  return (
    <div className="app">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h1 style={{ margin: 0 }}>BrandMap</h1>
            <p style={{ margin: '0.25rem 0 0 0' }}>Visualize your marketing website sitemap and paid media connections</p>
          </div>
          {zoomControlsRef && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {zoomControlsRef}
            </div>
          )}
        </div>
        {loading && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Loading sitemap...</p>}
        {error && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            <p style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Error: {error}</p>
            {showManualImport && (
              <button 
                onClick={() => setShowManualImport(true)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  background: '#667eea', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Import Sitemap Manually
              </button>
            )}
          </div>
        )}
      </header>
      <div className="app-content">
        {sidebarVisible && (
          <Sidebar
            pages={nodes}
            paidMediaItems={paidMediaItems}
            onAddPage={addPage}
            onUpdatePage={updatePage}
            onDeletePage={deletePage}
            onAddPaidMedia={addPaidMedia}
            onUpdatePaidMedia={updatePaidMedia}
            onDeletePaidMedia={deletePaidMedia}
            onAddInternalLink={addInternalLink}
            onPageClick={handlePageClick}
          />
        )}
        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          style={{
            position: 'absolute',
            left: sidebarVisible ? '350px' : '0',
            top: '80px',
            zIndex: 1000,
            padding: '0.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderTopRightRadius: '0.375rem',
            borderBottomRightRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1.25rem',
            transition: 'left 0.3s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          title={sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          {sidebarVisible ? '◀' : '▶'}
        </button>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Loading sitemap...</p>
          </div>
        ) : error && showManualImport ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ maxWidth: '600px', width: '100%' }}>
              <h3 style={{ marginBottom: '1rem' }}>Manual Sitemap Import</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                Paste the sitemap URL or XML content below:
              </p>
              <textarea
                id="sitemap-xml-input"
                style={{
                  width: '100%',
                  height: '200px',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}
                placeholder="Paste sitemap URL (e.g., https://tillerdigital.com/page-sitemap.xml) or XML content here..."
                defaultValue="https://tillerdigital.com/page-sitemap.xml"
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={async () => {
                    const textarea = document.getElementById('sitemap-xml-input')
                    if (textarea && textarea.value) {
                      await handleManualImport(textarea.value)
                    }
                  }}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    background: loading ? '#9ca3af' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Loading...' : 'Import'}
                </button>
                <button
                  onClick={() => setShowManualImport(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
            {nodes.length > 0 && (
              <GraphVisualization 
                graphData={graphData} 
                onNodeFocus={(fn) => { focusNodeRef.current = fn }}
                onZoomControlsReady={setZoomControlsRef}
              />
            )}
          </div>
        ) : error ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <p style={{ color: '#ef4444', marginBottom: '1rem' }}>Error loading sitemap: {error}</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              You can still add pages manually using the sidebar.
            </p>
            {nodes.length > 0 && (
              <GraphVisualization 
                graphData={graphData} 
                onNodeFocus={(fn) => { focusNodeRef.current = fn }}
                onZoomControlsReady={setZoomControlsRef}
              />
            )}
          </div>
        ) : (
          <GraphVisualization 
            graphData={graphData} 
            sidebarVisible={sidebarVisible}
            onNodeFocus={(fn) => { focusNodeRef.current = fn }}
            onZoomControlsReady={setZoomControlsRef}
          />
        )}
      </div>
    </div>
  )
}

export default App

