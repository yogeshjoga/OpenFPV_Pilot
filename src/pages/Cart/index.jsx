// ================================
// Page — Cart (E-commerce)
// ================================

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageWrapper from '@components/layout/PageWrapper'
import { useCartStore } from '@store/useCartStore'
import styles from './Cart.module.css'

export default function Cart() {
  const { cart, removeItem, updateQuantity, getTotalPrice, getCartCount, clearCart } = useCartStore()

  if (cart.length === 0) {
    return (
      <PageWrapper>
        <div className={styles.emptyCart}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.emptyContent}
            >
              <span className={styles.emptyIcon}>🛒</span>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <Link to="/shop" className={styles.shopNowBtn}>Shop FPV Gear</Link>
            </motion.div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className={styles.cartPage}>
        <div className="container">
          <h1 className={styles.title}>Shopping Cart</h1>
          
          <div className={styles.layout}>
            {/* Cart Items List */}
            <div className={styles.itemList}>
              <div className={styles.listHeader}>
                <span>Product</span>
                <span className={styles.headerQty}>Quantity</span>
                <span className={styles.headerPrice}>Price</span>
              </div>

              {cart.map((item) => (
                <motion.div 
                  key={item.id} 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={styles.itemCard}
                >
                  <div className={styles.productInfo}>
                    <div className={styles.imageBox}>
                      <img src={item.thumbnail} alt={item.name} />
                    </div>
                    <div>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <p className={styles.itemCategory}>{item.category}</p>
                      <button 
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className={styles.quantityControls}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>

                  <div className={styles.itemPrice}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </motion.div>
              ))}

              <div className={styles.actions}>
                <Link to="/shop" className={styles.continueLink}>← Continue Shopping</Link>
                <button onClick={clearCart} className={styles.clearBtn}>Clear Cart</button>
              </div>
            </div>

            {/* Summary Sidebar */}
            <aside className={styles.summary}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>
                
                <div className={styles.summaryRow}>
                  <span>Subtotal ({getCartCount()} items)</span>
                  <span>₹{Number(getTotalPrice()).toLocaleString('en-IN')}</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span className={styles.free}>FREE</span>
                </div>

                <div className={styles.summaryRow}>
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Total</span>
                  <span>₹{Number(getTotalPrice()).toLocaleString('en-IN')}</span>
                </div>

                <button className={styles.checkoutBtn}>Proceed to Checkout</button>
                
                <div className={styles.paymentMethods}>
                  <p>We accept:</p>
                  <div className={styles.icons}>💳 Pay 🅿️</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
