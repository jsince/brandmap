/**
 * Parse XML sitemap and extract page URLs
 */
export function parseSitemapXML(xmlString) {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Failed to parse XML: ' + parserError.textContent)
  }
  
  // Get all loc elements (works with namespaces)
  const locElements = xmlDoc.getElementsByTagName('loc')
  const pages = []
  
  const seenIds = new Set()
  
  Array.from(locElements).forEach((locElement) => {
    try {
      const fullUrl = locElement.textContent.trim()
      if (!fullUrl) return
      
      const url = new URL(fullUrl)
      const path = url.pathname
      
      let id, label, urlPath
      
      // Handle homepage
      if (path === '/' || path === '') {
        id = 'home'
        label = 'Home'
        urlPath = '/'
      } else {
        // Extract a clean ID and label from the path
        const pathParts = path.split('/').filter(p => p)
        const lastPart = pathParts[pathParts.length - 1]
        
        // Convert slug to readable label
        label = lastPart
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        
        // Create ID from path (remove slashes and special chars)
        id = path.replace(/\//g, '-').replace(/^-|-$/g, '') || 'home'
        urlPath = path
      }
      
      // Skip duplicates
      if (seenIds.has(id)) {
        return
      }
      seenIds.add(id)
      
      pages.push({
        id: id,
        label: label,
        url: urlPath,
        type: 'page'
      })
    } catch (err) {
      console.warn('Error parsing URL:', locElement.textContent, err)
    }
  })
  
  return pages
}

/**
 * Fetch sitemap from URL and parse it
 */
export async function fetchSitemap(sitemapUrl) {
  try {
    let response
    try {
      // Try direct fetch first
      response = await fetch(sitemapUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (directErr) {
      // If direct fetch fails (likely CORS), try using a CORS proxy
      console.log('Direct fetch failed, trying CORS proxy...', directErr)
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(sitemapUrl)}`
      response = await fetch(proxyUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch sitemap via proxy: ${response.statusText}`)
      }
    }
    
    const xmlText = await response.text()
    
    // Check if we got HTML instead of XML (common CORS error response)
    if (xmlText.trim().startsWith('<!DOCTYPE') || xmlText.trim().startsWith('<html')) {
      throw new Error('Received HTML instead of XML. This is likely a CORS error. Please use the manual import feature.')
    }
    
    return parseSitemapXML(xmlText)
  } catch (error) {
    console.error('Error fetching sitemap:', error)
    // Re-throw with a more helpful message if it's a CORS issue
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('CORS error: Cannot fetch sitemap directly. Please use the manual import feature.')
    }
    throw error
  }
}

