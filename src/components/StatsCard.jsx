import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-600',
        green: 'bg-green-50 border-green-200 text-green-600',
        red: 'bg-red-50 border-red-200 text-red-600',
        purple: 'bg-purple-50 border-purple-200 text-purple-600'
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
                    <motion.p
                        className="text-3xl font-bold text-slate-800"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {value}
                    </motion.p>
                    {subtitle && (
                        <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;