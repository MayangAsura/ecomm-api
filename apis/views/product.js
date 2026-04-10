import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  // Mock products data
  const mockProducts = [
    {
      id: 1,
      name: 'Premium Laptop',
      description: 'High-performance laptop with latest processor and graphics',
      price: 1299.99,
      originalPrice: 1499.99,
      category: 'electronics',
      rating: 4.5,
      reviewCount: 128,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      tags: ['new', 'bestseller']
    },
    {
      id: 2,
      name: 'Wireless Headphones',
      description: 'Noise-cancelling wireless headphones with premium sound',
      price: 299.99,
      originalPrice: 399.99,
      category: 'electronics',
      rating: 4.7,
      reviewCount: 89,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      tags: ['sale', 'featured']
    },
    {
      id: 3,
      name: 'Running Shoes',
      description: 'Lightweight running shoes with advanced cushioning',
      price: 89.99,
      originalPrice: 119.99,
      category: 'fashion',
      rating: 4.3,
      reviewCount: 256,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      tags: ['bestseller']
    },
    {
      id: 4,
      name: 'Smart Watch',
      description: 'Fitness tracker with heart rate monitor and GPS',
      price: 249.99,
      originalPrice: 299.99,
      category: 'electronics',
      rating: 4.6,
      reviewCount: 167,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: false,
      tags: ['new']
    },
    {
      id: 5,
      name: 'Coffee Maker',
      description: 'Automatic coffee maker with programmable settings',
      price: 149.99,
      originalPrice: 199.99,
      category: 'home',
      rating: 4.4,
      reviewCount: 93,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      tags: ['sale']
    },
    {
      id: 6,
      name: 'Yoga Mat',
      description: 'Non-slip yoga mat with carrying strap',
      price: 34.99,
      originalPrice: 49.99,
      category: 'sports',
      rating: 4.2,
      reviewCount: 78,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      tags: ['featured']
    },
    {
      id: 7,
      name: 'Desk Lamp',
      description: 'LED desk lamp with adjustable brightness',
      price: 49.99,
      originalPrice: 69.99,
      category: 'home',
      rating: 4.1,
      reviewCount: 45,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      tags: []
    },
    {
      id: 8,
      name: 'Backpack',
      description: 'Water-resistant backpack with laptop compartment',
      price: 79.99,
      originalPrice: 99.99,
      category: 'fashion',
      rating: 4.5,
      reviewCount: 112,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      inStock: true,
      tags: ['bestseller']
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      
      // Extract unique categories
      const uniqueCategories = ['all', ...new Set(mockProducts.map(p => p.category))];
      setCategories(uniqueCategories);
      
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let result = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort products
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        // Featured - keep original order
        break;
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, sortBy, searchQuery]);

  const handleAddToCart = (productId) => {
    setCartCount(prev => prev + 1);
    // In real app, update cart in context/state management
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Header */}
      <header className="products-header">
        <div className="container">
          <div className="header-content">
            <h1 className="page-title">Our Products</h1>
            <p className="page-subtitle">Discover amazing products at great prices</p>
            
            <div className="header-actions">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button className="search-button">
                  <svg className="search-icon" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </button>
              </div>
              
              <div className="cart-indicator">
                <button className="cart-button">
                  <svg className="cart-icon" viewBox="0 0 24 24">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  {cartCount > 0 && (
                    <span className="cart-count">{cartCount}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters & Sort */}
      <div className="products-filters">
        <div className="container">
          <div className="filters-content">
            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="sort-container">
              <label htmlFor="sort" className="sort-label">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="products-main">
        <div className="container">
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onClick={handleProductClick}
                />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <svg className="no-products-icon" viewBox="0 0 24 24">
                <path d="M22 13c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2v-2c0-1.11.89-2 2-2h16c1.11 0 2 .89 2 2v2m-8 8c0 1.11-.89 2-2 2h-4c-1.11 0-2-.89-2-2v-1h8v1m-9-5v3H3v-3c0-1.11.89-2 2-2h6c1.11 0 2 .89 2 2v3h-2v-1H5v1H3z"/>
              </svg>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;