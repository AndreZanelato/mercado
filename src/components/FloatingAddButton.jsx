import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const FloatingAddButton = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 md:w-20 md:h-20
                 bg-blue-600 hover:bg-blue-700 text-white rounded-full
                 shadow-2xl hover:shadow-3xl transition-all duration-200
                 flex items-center justify-center"
      aria-label="Adicionar novo produto"
    >
      <Plus className="w-8 h-8 md:w-10 md:h-10" />
    </motion.button>
  );
};

export default FloatingAddButton;
