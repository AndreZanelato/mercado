import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

const ExpenseChart = ({ selectedMonth }) => {
    const chartData = useMemo(() => {
        const savedData = localStorage.getItem('expenseTrackerData');
        if (!savedData) return [];

        const allData = JSON.parse(savedData);
        const [currentYear, currentMonth] = selectedMonth.split('-').map(Number);

        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - 1 - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthData = allData[monthKey] || [];
            const total = monthData.reduce((sum, product) => sum + (product.price * product.quantity), 0);

            let monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' });
            // Remove the trailing dot sometimes present in short month names in some browsers/locales
            monthLabel = monthLabel.replace('.', '');

            months.push({
                month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
                total,
                isSelected: monthKey === selectedMonth
            });
        }

        return months;
    }, [selectedMonth]);

    const maxValue = Math.max(...chartData.map(d => d.total), 100);

    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-800">Comparação de 6 Meses</h2>
            </div>
            <div className="space-y-4">
                {chartData.map((data, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${data.isSelected ? 'text-blue-600' : 'text-slate-600'}`}>
                {data.month}
              </span>
                            <span className={`text-sm font-bold ${data.isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                {formatCurrency(data.total)}
              </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    data.isSelected ? 'bg-blue-600' : 'bg-slate-400'
                                }`}
                                style={{ width: `${(data.total / maxValue) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpenseChart;