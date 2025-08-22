import React, { useRef, useState } from "react";
import img from "../../../images/dummy-img.jpeg";
import styles from "./HomePage.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaStar, FaEye, FaShoppingCart } from "react-icons/fa";

function Productbox({ products }) {
  const scrollRef = useRef(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  // Mock data for demonstration - replace with actual data
  const mockProducts = (products || [
    { name: 'Fresh Curd', sales: 12500, rating: 4.8, views: 1250, image: null },
    { name: 'Premium Butter', sales: 18900, rating: 4.9, views: 2100, image: null },
    { name: 'Organic Milk', sales: 9800, rating: 4.7, views: 890, image: null },
    { name: 'Pure Ghee', sales: 15600, rating: 4.6, views: 1450, image: null },
    { name: 'Butter Milk', sales: 11200, rating: 4.5, views: 980, image: null }
  ]).slice(0, 4); // Limit to 4 products

  return (
    <>
      {mockProducts && mockProducts.length !== 0 && (
        <div className={styles.enhancedProductCard}>
          <div className={styles.productHeader}>
            <h4>Top Selling Products</h4>
            <div className={styles.productStats}>
              <span className={styles.totalSales}>
                Total Sales: ₹{mockProducts.reduce((sum, p) => sum + p.sales, 0).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className={styles.scrollContainer}>
            {mockProducts.length > 4 && (
              <button className={styles.scrollArrow} onClick={() => scroll("left")}>
                <FaChevronLeft/>
              </button>
            )}
            
            <div className={styles.productGrid} ref={scrollRef}>
              {mockProducts.map((product, index) => (
                <div 
                  key={index} 
                  className={styles.productItem}
                  onMouseEnter={() => setHoveredProduct(index)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className={styles.productImage}>
                    <img 
                      src={product.image ? `${import.meta.env.VITE_API_URL}/${product.image}` : img} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = img;
                      }}
                    />
                    <div className={styles.productOverlay}>
                      <div className={styles.productActions}>
                        <button className={styles.actionBtn}>
                          <FaEye />
                        </button>
                        <button className={styles.actionBtn}>
                          <FaShoppingCart />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.productInfo}>
                    <h6 className={styles.productName}>{product.name}</h6>
                    
                    <div className={styles.productMetrics}>
                      <div className={styles.salesInfo}>
                        <span className={styles.salesLabel}>Sales</span>
                        <span className={styles.salesValue}>₹{product.sales.toLocaleString()}</span>
                      </div>
                      
                      <div className={styles.ratingInfo}>
                        <FaStar className={styles.starIcon} />
                        <span className={styles.ratingValue}>{product.rating}</span>
                      </div>
                    </div>
                    
                    <div className={styles.productViews}>
                      <span className={styles.viewsCount}>{product.views} views</span>
                    </div>
                  </div>
                  
                  {hoveredProduct === index && (
                    <div className={styles.productTooltip}>
                      <div className={styles.tooltipContent}>
                        <h6>{product.name}</h6>
                        <p>Monthly sales: ₹{product.sales.toLocaleString()}</p>
                        <p>Rating: {product.rating}/5</p>
                        <p>Views: {product.views}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {mockProducts.length > 4 && (
              <button className={styles.scrollArrow} onClick={() => scroll("right")}>
                <FaChevronRight/>
              </button>
            )}
          </div>
          
          <div className={styles.productFooter}>
            <div className={styles.categoryTags}>
              <span className={styles.categoryTag}>Dairy</span>
              <span className={styles.categoryTag}>Organic</span>
              <span className={styles.categoryTag}>Premium</span>
            </div>
            <div className={styles.viewAllBtn}>
              View All Products →
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Productbox;
