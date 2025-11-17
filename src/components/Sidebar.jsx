import React, { useState } from 'react'
import './Sidebar.css'

function Sidebar({ 
  pages, 
  paidMediaItems, 
  onAddPage, 
  onUpdatePage, 
  onDeletePage,
  onAddPaidMedia,
  onUpdatePaidMedia,
  onDeletePaidMedia,
  onAddInternalLink,
  onPageClick
}) {
  const [activeTab, setActiveTab] = useState('pages')
  const [showAddPageForm, setShowAddPageForm] = useState(false)
  const [showAddMediaForm, setShowAddMediaForm] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [editingMedia, setEditingMedia] = useState(null)

  const handleAddPage = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const label = formData.get('label')
    const url = formData.get('url')
    let id = formData.get('id')
    
    // Auto-generate ID from URL if not provided
    if (!id && url) {
      id = url.replace(/^\//, '').replace(/\//g, '-').replace(/^-|-$/g, '') || 'page'
    }
    // Fallback to label-based ID
    if (!id && label) {
      id = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }
    // Final fallback
    if (!id) {
      id = `page-${Date.now()}`
    }
    
    onAddPage({
      id: id,
      label: label,
      url: url
    })
    e.target.reset()
    setShowAddPageForm(false)
  }

  const handleAddMedia = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    onAddPaidMedia({
      id: formData.get('id'),
      label: formData.get('label'),
      targetPageId: formData.get('targetPageId'),
      platform: formData.get('platform'),
      campaign: formData.get('campaign')
    })
    e.target.reset()
    setShowAddMediaForm(false)
  }

  const handleUpdatePage = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    onUpdatePage(editingPage.id, {
      label: formData.get('label'),
      url: formData.get('url')
    })
    setEditingPage(null)
  }

  const handleUpdateMedia = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    onUpdatePaidMedia(editingMedia.id, {
      label: formData.get('label'),
      targetPageId: formData.get('targetPageId'),
      platform: formData.get('platform'),
      campaign: formData.get('campaign')
    })
    setEditingMedia(null)
  }

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <button 
          className={activeTab === 'pages' ? 'active' : ''}
          onClick={() => setActiveTab('pages')}
        >
          Pages ({pages.length})
        </button>
        <button 
          className={activeTab === 'media' ? 'active' : ''}
          onClick={() => setActiveTab('media')}
        >
          Paid Media ({paidMediaItems.length})
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'pages' && (
          <div className="pages-tab">
            <div className="section-header">
              <h2>Website Pages</h2>
              <button 
                className="add-button"
                onClick={() => {
                  setShowAddPageForm(!showAddPageForm)
                  setEditingPage(null) // Close any open edit forms
                }}
              >
                {showAddPageForm ? 'Cancel' : '+ Add Page'}
              </button>
            </div>
            
            {pages.length === 0 && !showAddPageForm && (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                color: '#6b7280',
                fontSize: '0.875rem'
              }}>
                <p style={{ marginBottom: '1rem' }}>No pages added yet.</p>
                <button 
                  className="add-button"
                  onClick={() => setShowAddPageForm(true)}
                  style={{ width: '100%' }}
                >
                  + Add Your First Page
                </button>
              </div>
            )}

            {showAddPageForm && (
              <form className="add-form" onSubmit={handleAddPage}>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                  Page Label *
                </label>
                <input 
                  type="text" 
                  name="label" 
                  placeholder="e.g., Pricing" 
                  required
                  autoFocus
                />
                <label style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', marginTop: '0.75rem', display: 'block' }}>
                  URL Path *
                </label>
                <input 
                  type="text" 
                  name="url" 
                  placeholder="e.g., /pricing" 
                  required
                />
                <label style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', marginTop: '0.75rem', display: 'block' }}>
                  Page ID (optional - auto-generated from URL)
                </label>
                <input 
                  type="text" 
                  name="id" 
                  placeholder="e.g., pricing (auto-generated if empty)" 
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" style={{ flex: 1 }}>Add Page</button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddPageForm(false)}
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
              </form>
            )}

            <div className="items-list">
              {pages.map(page => (
                <div 
                  key={page.id} 
                  className="item-card"
                  style={{ cursor: onPageClick && editingPage?.id !== page.id ? 'pointer' : 'default' }}
                  onClick={(e) => {
                    // Don't trigger if clicking on buttons or if editing
                    if (onPageClick && editingPage?.id !== page.id && 
                        !e.target.closest('.item-actions') && 
                        !e.target.closest('button')) {
                      console.log('Page card clicked:', page.id, page.label)
                      onPageClick(page.id)
                    }
                  }}
                >
                  {editingPage?.id === page.id ? (
                    <form onSubmit={handleUpdatePage} className="edit-form">
                      <input 
                        type="text" 
                        name="label" 
                        defaultValue={page.label}
                        required
                      />
                      <input 
                        type="text" 
                        name="url" 
                        defaultValue={page.url}
                        required
                      />
                      <div className="form-actions">
                        <button type="submit">Save</button>
                        <button type="button" onClick={() => setEditingPage(null)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="item-header">
                        <h3>{page.label}</h3>
                        <div className="item-actions">
                          <button 
                            className="edit-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingPage(page)
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeletePage(page.id)
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="item-url">{page.url}</p>
                      <div className="item-stats">
                        <span>
                          {paidMediaItems.filter(m => m.targetPageId === page.id).length} 
                          {' '}paid media link{paidMediaItems.filter(m => m.targetPageId === page.id).length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="media-tab">
            <div className="section-header">
              <h2>Paid Media</h2>
              <button 
                className="add-button"
                onClick={() => setShowAddMediaForm(!showAddMediaForm)}
              >
                {showAddMediaForm ? 'Cancel' : '+ Add Media'}
              </button>
            </div>

            {showAddMediaForm && (
              <form className="add-form" onSubmit={handleAddMedia}>
                <input 
                  type="text" 
                  name="id" 
                  placeholder="Media ID (e.g., google-ad-1)" 
                  required
                />
                <input 
                  type="text" 
                  name="label" 
                  placeholder="Label (e.g., Google Display Ad)" 
                  required
                />
                <select name="targetPageId" required>
                  <option value="">Select Target Page</option>
                  {pages.map(page => (
                    <option key={page.id} value={page.id}>
                      {page.label}
                    </option>
                  ))}
                </select>
                <input 
                  type="text" 
                  name="platform" 
                  placeholder="Platform (e.g., Google Ads)" 
                  required
                />
                <input 
                  type="text" 
                  name="campaign" 
                  placeholder="Campaign Name (optional)" 
                />
                <button type="submit">Add Media</button>
              </form>
            )}

            <div className="items-list">
              {paidMediaItems.map(media => {
                const targetPage = pages.find(p => p.id === media.targetPageId)
                return (
                  <div key={media.id} className="item-card media-card">
                    {editingMedia?.id === media.id ? (
                      <form onSubmit={handleUpdateMedia} className="edit-form">
                        <input 
                          type="text" 
                          name="label" 
                          defaultValue={media.label}
                          required
                        />
                        <select name="targetPageId" defaultValue={media.targetPageId} required>
                          {pages.map(page => (
                            <option key={page.id} value={page.id}>
                              {page.label}
                            </option>
                          ))}
                        </select>
                        <input 
                          type="text" 
                          name="platform" 
                          defaultValue={media.platform}
                          required
                        />
                        <input 
                          type="text" 
                          name="campaign" 
                          defaultValue={media.campaign || ''}
                        />
                        <div className="form-actions">
                          <button type="submit">Save</button>
                          <button type="button" onClick={() => setEditingMedia(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="item-header">
                          <h3>{media.label}</h3>
                          <div className="item-actions">
                            <button 
                              className="edit-btn"
                              onClick={() => setEditingMedia(media)}
                            >
                              Edit
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => onDeletePaidMedia(media.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="media-details">
                          <p><strong>Platform:</strong> {media.platform}</p>
                          {media.campaign && (
                            <p><strong>Campaign:</strong> {media.campaign}</p>
                          )}
                          <p className="target-link">
                            <strong>→</strong> Links to: {targetPage?.label || 'Unknown Page'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar

