import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useProductStore from '@store/useProductStore';
import { useAuthStore } from '@store/useAuthStore';
import styles from './AdminDashboard.module.css';
import ProductEditor from './ProductEditor';
import PageWrapper from '@components/layout/PageWrapper';

export default function AdminDashboard() {
  const { products, fetchProducts, deleteProduct, getMediaUrl } = useProductStore();
  const { user, getProfile, updateProfile, profileUpdating } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Profile state mapped to the new layout
  const [profileForm, setProfileForm] = useState({
    name: 'Yogesh Joga',
    email: 'jogayogeshedu@gmail.com',
    phone: '+91 9110566354',
    address: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else {
      getProfile();
    }
  }, [activeTab, fetchProducts, getProfile]);

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address
      }));
    }
  }, [user]);

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditorOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setEditorOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const success = await updateProfile({ 
      name: profileForm.name,
      phone: profileForm.phone,
      address: profileForm.address,
    });
    if (success) {
        alert('Profile updated successfully!');
        setIsEditingProfile(false);
    }
  };

  return (
    <PageWrapper>
      <div className={styles.adminLayout}>
        <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            User Profile
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'products' ? styles.active : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {activeTab === 'products' ? (
          <div className={styles.productsContainer}>
            <header className={styles.contentHeader}>
              <h1 className={styles.title}>Products Management</h1>
              <button className={styles.addButton} onClick={handleAddProduct}>
                <span>+</span> Add New Product
              </button>
            </header>
            <div className={styles.productGrid}>
              {products.map((product) => (
                <motion.div 
                  key={product._id} 
                  className={styles.productCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {product.imageId ? (
                    <img 
                      src={getMediaUrl(product.imageId)} 
                      alt={product.name} 
                      className={styles.mediaThumb}
                    />
                  ) : (
                    <div className={styles.placeholderThumb}>No Image</div>
                  )}
                  
                  <div className={styles.productInfo}>
                     <div className={styles.cardHeader}>
                       <span className={styles.category}>{product.category}</span>
                       <span className={styles.brand}>{product.brand}</span>
                     </div>
                    <h3>{product.name}</h3>
                    <p className={styles.price}>₹{product.price?.toLocaleString('en-IN')}</p>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => handleEditProduct(product)}>Edit</button>
                      <button className={styles.deleteBtn} onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            className={styles.profileContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.profileHeader}>
                <div className={styles.profileAvatar}>
                  {profileForm.name ? profileForm.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'YJ'}
                </div>
                <div style={{ flex: 1 }}>
                    <div className={styles.profileTitle}>{profileForm.name}</div>
                    <div style={{color: '#777'}}>Manage your account</div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  style={{ padding: '8px 16px', background: isEditingProfile ? '#f1f5f9' : '#eaf1ff', color: isEditingProfile ? '#64748b' : '#4F8CFF', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            {!isEditingProfile ? (
              <div style={{ padding: '10px 0' }}>
                  <div className={styles.sectionTitle}>Personal Information</div>
                  
                  <div className={styles.formGroup} style={{ marginBottom: 15 }}>
                      <label>Full Name</label>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{profileForm.name}</div>
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: 15 }}>
                      <label>Email (cannot be changed)</label>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{profileForm.email}</div>
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: 15 }}>
                      <label>Phone Number</label>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{profileForm.phone || '—'}</div>
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: 15 }}>
                      <label>Address</label>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{profileForm.address || '—'}</div>
                  </div>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate}>
                  <div className={styles.sectionTitle}>Personal Information</div>

                  <div className={styles.formGroup}>
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        value={profileForm.name} 
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                      />
                  </div>

                  <div className={styles.formGroup}>
                      <label>Email (cannot be changed)</label>
                      <input 
                        type="email" 
                        value={profileForm.email} 
                        disabled
                      />
                  </div>

                  <div className={styles.formGroup}>
                      <label>Phone Number</label>
                      <input 
                        type="text" 
                        value={profileForm.phone} 
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                      />
                  </div>

                  <div className={styles.formGroup}>
                      <label>Address</label>
                      <input 
                        type="text" 
                        placeholder="Enter your address"
                        value={profileForm.address}
                        onChange={e => setProfileForm({...profileForm, address: e.target.value})}
                      />
                  </div>

                  <div className={styles.sectionTitle}>Security</div>

                  <div className={styles.formGroup}>
                      <label>New Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter new password"
                        value={profileForm.newPassword}
                        onChange={e => setProfileForm({...profileForm, newPassword: e.target.value})}
                      />
                  </div>

                  <div className={styles.formGroup}>
                      <label>Confirm Password</label>
                      <input 
                        type="password" 
                        placeholder="Confirm password"
                        value={profileForm.confirmPassword}
                        onChange={e => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                      />
                  </div>

                  <button type="submit" className={styles.saveBtn} disabled={profileUpdating}>
                    {profileUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
              </form>
            )}
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {editorOpen && (
          <ProductEditor 
            product={editingProduct} 
            onClose={() => setEditorOpen(false)} 
          />
        )}
      </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
