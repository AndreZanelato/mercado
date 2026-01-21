import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import ExpenseTracker from '@/components/ExpenseTracker';
import AuthPage from '@/components/auth/AuthPage';
import { Toaster } from '@/components/ui/toaster';

function App() {
    const { user, loading } = useAuth();

    // Mostrar spinner durante verificação de sessão
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Carregando...</p>
                </div>
            </div>
        );
    }

    // Se não autenticado, mostrar tela de login
    if (!user) {
        return (
            <>
                <Helmet>
                    <title>Login - Carrinho de Bolso</title>
                </Helmet>
                <AuthPage />
                <Toaster />
            </>
        );
    }

    // Se autenticado, mostrar app
    return (
        <>
            <Helmet>
                <title>Carrinho de Bolso</title>
                <meta name="description" content="Acompanhe suas despesas de compras, compare gastos mensais e visualize seu histórico de compras." />
            </Helmet>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <ExpenseTracker />
                <Toaster />
            </div>
        </>
    );
}

export default App;