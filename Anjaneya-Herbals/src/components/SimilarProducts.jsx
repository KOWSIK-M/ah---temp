import { productsApi } from '../services/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const SimilarProducts = ({ productId, category }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    let active=true;
    productsApi.getById(productId).then(product=>productsApi.getAll({categoryId:product.categoryId,size:8}))
      .then(data=>{if(active)setProducts((data.content||[]).filter(p=>String(p.id)!==String(productId)).map(p=>({...p,image:p.imageUrl,originalPrice:p.oldPrice||p.price,discount:p.oldPrice>p.price?Math.round(100*(1-p.price/p.oldPrice)):0})));})
      .catch(()=>{if(active)setProducts([]);});
    return ()=>{active=false;};
  }, [productId, category]);

  const scrollLeft = () => {
    const container = document.getElementById('similar-products');
    container.scrollLeft -= 300;
    setScrollPosition(container.scrollLeft - 300);
  };

  const scrollRight = () => {
    const container = document.getElementById('similar-products');
    container.scrollLeft += 300;
    setScrollPosition(container.scrollLeft + 300);
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Customers also bought</h2>
          <div className="flex space-x-2">
            <button
              onClick={scrollLeft}
              className="p-2 rounded-full border hover:bg-gray-100"
              disabled={scrollPosition <= 0}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 rounded-full border hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          id="similar-products"
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
          onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -5 }}
              className="flex-shrink-0 w-56 border rounded-lg overflow-hidden hover:shadow-lg cursor-pointer bg-white"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="relative h-40 bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discount && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {product.discount}% OFF
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    <span className="bg-blue-600 text-white text-xs px-1 py-0.5 rounded mr-1">
                      {product.rating}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">
                      ({product.reviewCount})
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="text-lg font-bold">₹{product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ₹{product.originalPrice}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimilarProducts;