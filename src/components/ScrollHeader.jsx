import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package } from 'lucide-react';

const ScrollHeader = ({ total, productCount, formatCurrency }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed top-0 left-0 right-0 z-40
                     bg-white/90 backdrop-blur-md shadow-lg
                     border-b border-slate-200"
        >
          <div className="container mx-auto px-4 py-3 max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(total)}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-2
                               border-l border-slate-300 pl-4">
                  <Package className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Produtos:
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {productCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollHeader;
