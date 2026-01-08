import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MonthSelector = ({ selectedMonth, onMonthChange }) => {
    const formatMonthDisplay = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, month - 1);
        // Capitalize first letter of the month in Portuguese
        const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        return monthName.charAt(0).toUpperCase() + monthName.slice(1);
    };

    const navigateMonth = (direction) => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() + direction);
        const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        onMonthChange(newMonth);
    };

    return (
        <div className="flex items-center justify-center gap-4 bg-white rounded-xl shadow-lg p-4">
            <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth(-1)}
                className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
                <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-xl font-bold text-slate-800 min-w-[200px] text-center capitalize">
                {formatMonthDisplay(selectedMonth)}
            </div>
            <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth(1)}
                className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
                <ChevronRight className="w-5 h-5" />
            </Button>
        </div>
    );
};

export default MonthSelector;