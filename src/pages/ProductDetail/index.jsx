import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PageWrapper from '@components/layout/PageWrapper'
import { getProductById } from '@data/products'
import { formatPrice } from '@lib/utils'
import { useCartStore } from '@store/useCartStore'
import styles from './ProductDetail.module.css'

export default function ProductDetail() {
  const { id } = useParams()
  const product = getProductById(id)
  const addItem = useCartStore((state) => state.addItem)

  const [activeImage, setActiveImage] = useState(0)

  if (!product) {
    return (
      <PageWrapper>
        <div className={styles.page}>
           <div className={styles.notFound}>
             <h1>Product Not Found</h1>
             <p>The product you are looking for does not exist.</p>
             <Link to="/shop" className={styles.backBtn}>← Back to Shop</Link>
           </div>
        </div>
      </PageWrapper>
    )
  }

  const { name, category, price, originalPrice, rating, reviews, inStock,
    description, specs, aboutThisItem, reviewsList, thumbnail, images } = product

  const galleryImages = images && images.length > 0 ? images : [thumbnail]

  return (
    <PageWrapper>
      <div className={styles.page}>
        <div className="container">
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link> <span>›</span>
            <Link to="/shop">Shop</Link> <span>›</span>
            <span>{name}</span>
          </nav>

          <div className={styles.topSection}>
            {/* Left: Image Gallery */}
            <div className={styles.imageGallery}>
              <div className={styles.mainImageContainer}>
                <img src={galleryImages[activeImage]} alt={name} className={styles.mainImg} />
              </div>
              <div className={styles.thumbnailRow}>
                {galleryImages.map((img, i) => (
                  <button 
                    key={i} 
                    className={`${styles.thumbBtn} ${activeImage === i ? styles.activeThumb : ''}`}
                    onMouseEnter={() => setActiveImage(i)}
                  >
                    <img src={img} alt={`Thumbnail ${i}`} className={styles.thumbImg} />
                  </button>
                ))}
              </div>
            </div>

            {/* Center: Product Details */}
            <div className={styles.productDetails}>
              <h1 className={styles.title}>{name}</h1>
              <div className={styles.ratingRow}>
                <span className={styles.stars}>{"★".repeat(Math.floor(rating))}</span>
                <span className={styles.ratingVal}>{rating.toFixed(1)}</span>
                <span className={styles.reviewCount}>{reviews} ratings</span>
              </div>
              <hr className={styles.divider} />
              
              <div className={styles.priceRow}>
                <span className={styles.discountPrice}>{formatPrice(price)}</span>
                {originalPrice && <span className={styles.originalPrice}>M.R.P: {formatPrice(originalPrice)}</span>}
              </div>

              <div className={styles.descriptionBlock}>
                <p>{description}</p>
              </div>

              {aboutThisItem && aboutThisItem.length > 0 && (
                <div className={styles.aboutSection}>
                  <h3>About this item</h3>
                  <ul>
                    {aboutThisItem.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Buy Box */}
            <div className={styles.buyBox}>
              <p className={styles.buyPrice}>{formatPrice(price)}</p>
              <p className={styles.deliveryInfo}><strong>FREE Delivery</strong> Thursday, Nov 14</p>
              
              {inStock ? (
                <h4 className={styles.inStock}>In Stock</h4>
              ) : (
                <h4 className={styles.outOfStock}>Currently unavailable.</h4>
              )}

              <div className={styles.quantity}>
                <label>Quantity: </label>
                <select defaultValue="1">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <button 
                className={styles.addCartBtn} 
                onClick={() => addItem(product)}
                disabled={!inStock}
              >
                Add to Cart
              </button>
              <button className={styles.buyNowBtn} disabled={!inStock}>
                Buy Now
              </button>

              <div className={styles.secureBox}>
                <span>🔒 Secure transaction</span>
                <div className={styles.shipsFrom}>Ships from: <span>OpenFPV Pilot</span></div>
                <div className={styles.soldBy}>Sold by: <span>OpenFPV Pilot</span></div>
              </div>
            </div>
          </div>

          <hr className={styles.sectionDivider} />

          {/* Bottom layout: Left specs, Right Reviews */}
          <div className={styles.bottomSection}>
             <div className={styles.specsSection}>
               <h2>Product Specifications</h2>
               <table className={styles.specsTable}>
                 <tbody>
                   {specs && Object.entries(specs).map(([k, v]) => (
                     <tr key={k}>
                       <th>{k}</th>
                       <td>{v}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             <div className={styles.reviewsSection}>
               <h2>Customer Reviews</h2>
               <div className={styles.reviewsSummary}>
                  <div className={styles.starsSummary}>{"★".repeat(Math.floor(rating))} {rating} out of 5</div>
                  <p>{reviews} global ratings</p>
               </div>
               
               <div className={styles.reviewList}>
                 {reviewsList && reviewsList.length > 0 ? (
                   reviewsList.map(review => (
                     <div key={review.id} className={styles.reviewItem}>
                       <div className={styles.reviewerProf}>
                         <div className={styles.avatar}>{review.user.charAt(0)}</div>
                         <span>{review.user}</span>
                       </div>
                       <div className={styles.revTitleRow}>
                          <span className={styles.revStars}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                          <span className={styles.revTitle}>{review.title}</span>
                       </div>
                       <p className={styles.revDate}>Reviewed on {review.date}</p>
                       <p className={styles.revComment}>{review.comment}</p>
                     </div>
                   ))
                 ) : (
                   <p>No reviews yet. Be the first to review!</p>
                 )}
               </div>
             </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
