import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import useProductStore from '@store/useProductStore';
import styles from './ProductEditor.module.css';
import { 
  CATEGORY_OPTIONS, 
  GLOBAL_SPECS, 
  CATEGORY_SPECS, 
  RECOMMENDATION_TAGS, 
  USE_CASES 
} from './categorySpecsConfig';

export default function ProductEditor({ product, onClose }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'motors',
    price: product?.price || 0,
    brand: product?.brand || '',
    description: product?.description || '',
    stock: product?.stock || 0,
    sku: product?.sku || '',
    useCase: product?.useCase || '',
    smartTag: product?.smartTag || '',
  });

  const [specs, setSpecs] = useState(product?.specs || {});

  const [previews, setPreviews] = useState({
    image: product?.imageId ? `/api/media/${product.imageId}` : null,
    video: product?.videoId ? `/api/media/${product.videoId}` : null
  });

  const [files, setFiles] = useState({ image: null, video: null });
  const [loading, setLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState('overview'); 
  const { addProduct, updateProduct } = useProductStore();

  const imgRef = useRef();
  const vidRef = useRef();

  // Load existing specs cleanly when category matches the product's original category
  useEffect(() => {
    if (product && formData.category === product.category) {
      setSpecs(product.specs || {});
    } else if (!product || formData.category !== product?.category) {
      // Clear specs if switching to a totally new category 
      setSpecs({}); 
    }
  }, [formData.category, product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setSpecs(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
      const url = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [type]: url }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('specs', JSON.stringify(specs));
    
    if (files.image) data.append('image', files.image);
    if (files.video) data.append('video', files.video);

    try {
      if (product) {
        await updateProduct(product._id, data);
      } else {
        await addProduct(data);
      }
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeCategorySpecs = CATEGORY_SPECS[formData.category] || [];

  return (
    <motion.div 
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className={styles.modal}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        {/* Form Section */}
        <section className={styles.formSection}>
          <div className={styles.formHeader}>
            <h2>{product ? 'Edit Product' : 'New Product'}</h2>
            <p>Fill in the explicit technical details and media for the EgireRobatics platform.</p>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.scrollableForm}>
            
            {/* BASIC INFO */}
            <div className={styles.formSectionTitle}>Basic Information</div>
            
            <div className={styles.formGroup}>
              <label>Product Name</label>
              <input 
                type="text" name="name" className={styles.input} 
                value={formData.name} onChange={handleInputChange} required 
                placeholder="e.g. Nazgul Evoque F5 V3"
              />
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select 
                  name="category" className={styles.select}
                  value={formData.category} onChange={handleInputChange}
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Brand</label>
                <input 
                  type="text" name="brand" className={styles.input} 
                  value={formData.brand} onChange={handleInputChange}
                  placeholder="e.g. iFlight"
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Price (₹)</label>
                <input 
                  type="number" name="price" className={styles.input} 
                  value={formData.price} onChange={handleInputChange} required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Stock Quantity</label>
                <input 
                  type="number" name="stock" className={styles.input} 
                  value={formData.stock} onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>SKU / Product ID</label>
                <input 
                  type="text" name="sku" className={styles.input} 
                  value={formData.sku} onChange={handleInputChange}
                  placeholder="e.g. MOT-2207-2300"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea 
                name="description" className={styles.textarea}
                value={formData.description} onChange={handleInputChange}
                placeholder="Full product marketing copy..."
                rows="3"
              />
            </div>

            {/* MARKETING & PRO TAGS */}
            <div className={styles.formSectionTitle}>Pro Tags & Marketing</div>
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Smart Recommendation Tag</label>
                <select 
                  name="smartTag" className={styles.select}
                  value={formData.smartTag} onChange={handleInputChange}
                >
                  <option value="">-- No Tag --</option>
                  {RECOMMENDATION_TAGS.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Use Case Target</label>
                <select 
                  name="useCase" className={styles.select}
                  value={formData.useCase} onChange={handleInputChange}
                >
                  <option value="">-- No Specific Use --</option>
                  {USE_CASES.map(useCase => (
                    <option key={useCase} value={useCase}>{useCase}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* GLOBAL SPECS */}
            <div className={styles.formSectionTitle}>General Specs</div>
            <div className={styles.specsGrid}>
              {GLOBAL_SPECS.map(spec => (
                <div key={spec.name} className={styles.formGroup}>
                  <label>{spec.label}</label>
                  <input 
                    name={spec.name} 
                    value={specs[spec.name] || ''} 
                    onChange={handleSpecChange} 
                    className={styles.input}
                  />
                </div>
              ))}
            </div>

            {/* DYNAMIC CATEGORY SPECS */}
            {activeCategorySpecs.length > 0 && (
              <>
                <div className={styles.formSectionTitle}>
                  {CATEGORY_OPTIONS.find(o => o.value === formData.category)?.label} Specs
                </div>
                <div className={styles.specsGrid}>
                  {activeCategorySpecs.map(spec => (
                    <div key={spec.name} className={styles.formGroup}>
                      <label>{spec.label}</label>
                      <input 
                        name={spec.name} 
                        value={specs[spec.name] || ''} 
                        onChange={handleSpecChange} 
                        className={styles.input}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* MEDIA ASSETS */}
            <div className={styles.formSectionTitle}>Media Assets</div>
            <div className={styles.mediaUploads}>
              <div className={styles.uploadBox} onClick={() => imgRef.current.click()}>
                <span className={styles.uploadIcon}>🖼️</span>
                <span className={styles.uploadText}>Image (10MB)</span>
                <input 
                  type="file" hidden ref={imgRef} accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image')}
                />
              </div>

              <div className={styles.uploadBox} onClick={() => vidRef.current.click()}>
                <span className={styles.uploadIcon}>🎥</span>
                <span className={styles.uploadText}>Video (30MB)</span>
                <input 
                  type="file" hidden ref={vidRef} accept="video/*"
                  onChange={(e) => handleFileChange(e, 'video')}
                />
              </div>
            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.saveBtn} disabled={loading}>
                {loading ? 'Processing...' : 'Save Product Data'}
              </button>
            </div>
          </form>
        </section>

        {/* Preview Section */}
        <section className={styles.previewSection}>
          <div className={styles.previewTabs}>
             <button 
               type="button"
               className={previewTab === 'overview' ? styles.activeTab : ''} 
               onClick={() => setPreviewTab('overview')}
             >
               Overview
             </button>
             <button 
               type="button"
               className={previewTab === 'specs' ? styles.activeTab : ''} 
               onClick={() => setPreviewTab('specs')}
             >
               Full Specs
             </button>
          </div>
          
          <div className={styles.previewContent}>
            {previewTab === 'overview' ? (
              <>
                <div className={styles.previewMedia}>
                  {previews.video ? (
                    <video src={previews.video} controls className={styles.vid} />
                  ) : previews.image ? (
                    <img src={previews.image} alt="Preview" />
                  ) : (
                    <div className={styles.mediaPlaceholder}>Media Placeholder</div>
                  )}
                </div>
                
                <div className={styles.previewInfo}>
                  <div className={styles.previewMeta}>
                    <span className={styles.previewCategory}>
                        {CATEGORY_OPTIONS.find(o => o.value === formData.category)?.label || formData.category}
                    </span>
                    <span className={styles.previewBrand}>{formData.brand}</span>
                  </div>
                  <h2>{formData.name || 'Untitled Product'}</h2>
                  {formData.smartTag && <span className={styles.smartBadge}>{formData.smartTag}</span>}
                  <p className={styles.previewPrice}>₹{Number(formData.price).toLocaleString('en-IN')}</p>
                  <p className={styles.previewDesc}>{formData.description || 'Description will appear here...'}</p>
                  
                  {formData.useCase && (
                      <p style={{fontSize: '0.8rem', color: '#64748b'}}><b>Best for:</b> {formData.useCase}</p>
                  )}
                  
                  <div className={styles.quickSpecs}>
                     {Object.entries(specs).slice(0, 3).map(([k, v]) => (
                         v ? <span key={k}>{k}: {v}</span> : null
                     ))}
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.specsTable}>
                <h3>Technical Specifications</h3>
                {/* Dynamically render all specs that have values */}
                {Object.entries(specs).filter(([_, v]) => v).length > 0 ? (
                    Object.entries(specs).filter(([_, v]) => v).map(([key, value]) => {
                        // find label if possible
                        let label = key;
                        const allSpecs = [...GLOBAL_SPECS, ...(activeCategorySpecs || [])];
                        const matchedSpec = allSpecs.find(s => s.name === key);
                        if (matchedSpec) label = matchedSpec.label;
                        
                        return (
                            <div className={styles.tableRow} key={key}>
                                <span>{label}</span>
                                <span>{value}</span>
                            </div>
                        )
                    })
                ) : (
                    <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>No specs defined yet.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </motion.div>
    </motion.div>
  );
}
