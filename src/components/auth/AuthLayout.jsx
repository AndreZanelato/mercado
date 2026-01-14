import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import AdSenseBanner from '../AdSenseBanner';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
                            <ShoppingCart className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-slate-600">{subtitle}</p>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {children}
                </div>

                <p className="text-center text-slate-500 text-sm mt-6 mb-4">
                    Ajudante de Compras
                </p>

                <AdSenseBanner dataAdSlot="3978594176" />
            </motion.div>
        </div>
    );
};

export default AuthLayout;
