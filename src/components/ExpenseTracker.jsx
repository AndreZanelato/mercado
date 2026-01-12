import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, ShoppingCart, Calendar, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ProductList from '@/components/ProductList';
import AddProductDialog from '@/components/AddProductDialog';
import MonthSelector from '@/components/MonthSelector';
import StatsCard from '@/components/StatsCard';
import ExpenseChart from '@/components/ExpenseChart';
import FloatingAddButton from '@/components/FloatingAddButton';
import ScrollHeader from '@/components/ScrollHeader';
import { supabase } from '@/lib/supabase';

const ExpenseTracker = () => {
    const { toast } = useToast();
    const { user, signOut } = useAuth();
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [products, setProducts] = useState([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [previousMonthTotal, setPreviousMonthTotal] = useState(0);

    // Load data from Supabase
    useEffect(() => {
        const loadProducts = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                // Adotar produtos órfãos (produtos sem user_id) antes de carregar
                const { data: orphanedProducts } = await supabase
                    .from('products')
                    .select('id')
                    .is('user_id', null);

                if (orphanedProducts && orphanedProducts.length > 0) {
                    const { error: adoptError } = await supabase
                        .from('products')
                        .update({ user_id: user.id })
                        .is('user_id', null);

                    if (!adoptError) {
                        toast({
                            title: "Produtos Migrados",
                            description: `${orphanedProducts.length} produtos existentes foram vinculados à sua conta.`,
                        });
                    }
                }

                // Carregar produtos do mês atual filtrados por user_id
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('month_key', selectedMonth)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Ensure existing data has category field if missing
                const migratedData = (data || []).map(p => ({
                    ...p,
                    category: p.category || 'Outros'
                }));

                setProducts(migratedData);

                // Carregar total do mês anterior
                const [year, month] = selectedMonth.split('-').map(Number);
                const prevDate = new Date(year, month - 2, 1);
                const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

                const { data: prevData, error: prevError } = await supabase
                    .from('products')
                    .select('price, quantity')
                    .eq('month_key', prevMonth)
                    .eq('user_id', user.id);

                if (!prevError && prevData) {
                    const prevTotal = prevData.reduce((sum, p) => sum + (p.price * p.quantity), 0);
                    setPreviousMonthTotal(prevTotal);
                } else {
                    setPreviousMonthTotal(0);
                }
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
                toast({
                    title: "Erro ao Carregar",
                    description: "Não foi possível carregar os produtos.",
                    variant: "destructive"
                });
                setProducts([]);
                setPreviousMonthTotal(0);
            } finally {
                setIsLoading(false);
            }
        };

        loadProducts();
    }, [selectedMonth, user, toast]);

    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleAddProduct = async (product) => {
        setIsSaving(true);
        try {
            const newProduct = {
                name: product.name,
                quantity: product.quantity || 0,
                price: product.price || 0,
                category: product.category || 'Outros',
                month_key: selectedMonth,
                user_id: user.id,
                created_at: new Date().toISOString(),
                is_per_kg: product.is_per_kg || false,
                weight_kg: product.weight_kg || null,
                price_per_kg: product.price_per_kg || null
            };

            const { data, error } = await supabase
                .from('products')
                .insert([newProduct])
                .select()
                .single();

            if (error) throw error;

            // Adiciona o produto na lista local
            setProducts(prevProducts => [data, ...prevProducts]);

            // Toast diferenciado para produtos por kg
            if (product.is_per_kg) {
                toast({
                    title: "Produto Adicionado",
                    description: `${product.name} (${product.weight_kg}kg × R$ ${product.price_per_kg}/kg)`,
                });
            } else if (product.quantity > 0 && product.price > 0) {
                toast({
                    title: "Produto Adicionado",
                    description: `${product.name} foi adicionado à categoria ${product.category}.`,
                });
            } else {
                toast({
                    title: "Item Adicionado",
                    description: `${product.name} adicionado em ${product.category}. Preencha os valores na lista.`,
                    variant: "default"
                });
            }
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            toast({
                title: "Erro ao Adicionar",
                description: error.message || "Não foi possível adicionar o produto.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsAddDialogOpen(true);
    };

    const handleUpdateProduct = async (updatedProduct) => {
        setIsSaving(true);
        try {
            const updateData = {
                name: updatedProduct.name,
                quantity: updatedProduct.quantity || 0,
                price: updatedProduct.price || 0,
                category: updatedProduct.category || 'Outros',
                updated_at: new Date().toISOString(),
                is_per_kg: updatedProduct.is_per_kg || false,
                weight_kg: updatedProduct.weight_kg || null,
                price_per_kg: updatedProduct.price_per_kg || null
            };

            const { error } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', updatedProduct.id);

            if (error) throw error;

            // Atualiza na lista local
            setProducts(prevProducts =>
                prevProducts.map(p =>
                    p.id === updatedProduct.id ? { ...p, ...updateData } : p
                )
            );

            setEditingProduct(null);
            toast({
                title: "Produto Atualizado",
                description: `${updatedProduct.name} foi atualizado com sucesso.`,
            });
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            toast({
                title: "Erro ao Atualizar",
                description: error.message || "Não foi possível atualizar o produto.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleQuickUpdate = async (id, field, value) => {
        try {
            const updateData = {
                [field]: value,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            // Atualiza na lista local
            setProducts(prevProducts =>
                prevProducts.map(p =>
                    p.id === id ? { ...p, ...updateData } : p
                )
            );

            // No toast for quick inline updates to avoid spamming the user
        } catch (error) {
            console.error('Erro ao atualizar rapidamente:', error);
            toast({
                title: "Erro na Atualização",
                description: "Não foi possível salvar a alteração.",
                variant: "destructive"
            });
        }
    };

    const handleDeleteProduct = async (productId) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;

            // Remove da lista local
            setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));

            toast({
                title: "Produto Excluído",
                description: "O produto foi removido com sucesso.",
            });
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            toast({
                title: "Erro ao Excluir",
                description: error.message || "Não foi possível excluir o produto.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const calculateTotal = () => {
        return products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    };

    const currentTotal = calculateTotal();
    const difference = currentTotal - previousMonthTotal;
    const percentageChange = previousMonthTotal > 0 ? ((difference / previousMonthTotal) * 100) : 0;

    return (
        <div className="container mx-auto px-4 py-8 pb-24 max-w-7xl">
            <ScrollHeader
                total={currentTotal}
                productCount={products.length}
                formatCurrency={formatCurrency}
            />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
                            <ShoppingCart className="w-10 h-10 text-blue-600" />
                            Ajudante de Compras
                        </h1>
                        <p className="text-slate-600 mt-2">Acompanhe e compare suas despesas mensais de compras</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={async () => {
                                try {
                                    await signOut();
                                    toast({
                                        title: "Logout realizado",
                                        description: "Até logo!",
                                    });
                                } catch (error) {
                                    toast({
                                        title: "Erro ao sair",
                                        description: error.message,
                                        variant: "destructive"
                                    });
                                }
                            }}
                            variant="outline"
                            className="border-slate-300"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sair
                        </Button>
                        <Button
                            onClick={() => {
                                setEditingProduct(null);
                                setIsAddDialogOpen(true);
                            }}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                            size="lg"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            {isSaving ? 'Salvando...' : 'Adicionar Produto'}
                        </Button>
                    </div>
                </div>

                <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <StatsCard
                        title="Total Gasto"
                        value={formatCurrency(currentTotal)}
                        icon={<ShoppingCart className="w-6 h-6" />}
                        color="blue"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <StatsCard
                        title="Produtos"
                        value={products.length.toString()}
                        icon={<Calendar className="w-6 h-6" />}
                        color="green"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <StatsCard
                        title="vs Mês Anterior"
                        value={`${difference >= 0 ? '+' : ''}${formatCurrency(Math.abs(difference))}`}
                        subtitle={`${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%`}
                        icon={difference >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                        color={difference >= 0 ? "red" : "green"}
                    />
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <ExpenseChart selectedMonth={selectedMonth} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                >
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Visão Geral Mensal</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="text-slate-700 font-medium">Mês Atual</span>
                            <span className="text-2xl font-bold text-blue-600">{formatCurrency(currentTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-slate-700 font-medium">Mês Anterior</span>
                            <span className="text-2xl font-bold text-slate-600">{formatCurrency(previousMonthTotal)}</span>
                        </div>
                        <div className={`flex justify-between items-center p-4 rounded-lg border ${difference >= 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            <span className="text-slate-700 font-medium">Diferença</span>
                            <div className="text-right">
                <span className={`text-2xl font-bold ${difference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {difference >= 0 ? '+' : ''}{formatCurrency(difference).replace('-', '')}
                </span>
                                <p className={`text-sm ${difference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                {isLoading ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-600">Carregando produtos...</p>
                    </div>
                ) : (
                    <ProductList
                        products={products}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        onQuickUpdate={handleQuickUpdate}
                    />
                )}
            </motion.div>

            <FloatingAddButton
                onClick={() => {
                    setEditingProduct(null);
                    setIsAddDialogOpen(true);
                }}
            />

            <AddProductDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onAdd={editingProduct ? handleUpdateProduct : handleAddProduct}
                editingProduct={editingProduct}
                isSaving={isSaving}
            />
        </div>
    );
};

export default ExpenseTracker;