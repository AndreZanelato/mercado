import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const ExpenseChart = ({ selectedMonth }) => {
    const { user } = useAuth();
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadChartData = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                const [currentYear, currentMonth] = selectedMonth.split('-').map(Number);
                const months = [];

                // Gerar últimos 6 meses
                for (let i = 5; i >= 0; i--) {
                    const date = new Date(currentYear, currentMonth - 1 - i, 1);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                    // Buscar produtos do mês filtrados por user_id
                    const { data, error } = await supabase
                        .from('products')
                        .select('price, quantity')
                        .eq('month_key', monthKey)
                        .eq('user_id', user.id);

                    if (error) throw error;

                    const total = (data || []).reduce((sum, p) => sum + (p.price * p.quantity), 0);

                    let monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' });
                    monthLabel = monthLabel.replace('.', '');

                    months.push({
                        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
                        total,
                        isSelected: monthKey === selectedMonth
                    });
                }

                setChartData(months);
            } catch (error) {
                console.error('Erro ao carregar dados do gráfico:', error);
                setChartData([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadChartData();
    }, [selectedMonth, user]);

    const maxValue = Math.max(...chartData.map(d => d.total), 100);

    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-slate-800">Comparação de 6 Meses</h2>
                </div>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            </div>
        );
    }

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
