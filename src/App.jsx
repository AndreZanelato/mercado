import React from 'react';
import { Helmet } from 'react-helmet';
import ExpenseTracker from '@/components/ExpenseTracker';
import { Toaster } from '@/components/ui/toaster';

function App() {
    return (
        <>
            <Helmet>
                <title>Rastreador de Despesas de Compras - Acompanhe Suas Compras Mensais</title>
                <meta name="description" content="Acompanhe suas despesas de compras, compare gastos mensais e visualize seu histórico de compras com gráficos interativos." />
            </Helmet>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <ExpenseTracker />
                <Toaster />
            </div>
        </>
    );
}

export default App;