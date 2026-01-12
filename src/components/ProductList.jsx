import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Package, Layers, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { parsePrice } from '@/lib/utils';

const ProductList = ({ products, onEdit, onDelete, onQuickUpdate }) => {
    const [editingValues, setEditingValues] = useState({});

    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Group products by category
    const groupedProducts = useMemo(() => {
        const groups = {};
        products.forEach(product => {
            const category = product.category || 'Outros';
            if (!groups[category]) {
                groups[category] = {
                    items: [],
                    total: 0
                };
            }
            groups[category].items.push(product);
            // Cálculo condicional baseado em is_per_kg
            const itemTotal = product.is_per_kg
                ? (product.weight_kg * product.price_per_kg)
                : (product.price * product.quantity);
            groups[category].total += itemTotal;
        });

        // Sort categories alphabetically, put 'Outros' last if exists
        return Object.entries(groups).sort((a, b) => {
            if (a[0] === 'Outros') return 1;
            if (b[0] === 'Outros') return -1;
            return a[0].localeCompare(b[0]);
        });
    }, [products]);

    const handleInputFocus = (id, field, currentValue) => {
        const key = `${id}-${field}`;
        setEditingValues(prev => ({
            ...prev,
            [key]: currentValue.toString()
        }));
    };

    const handleInputChange = (id, field, value) => {
        const key = `${id}-${field}`;
        setEditingValues(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleInputBlur = (id, field) => {
        const key = `${id}-${field}`;
        const value = editingValues[key];

        if (value === undefined) return;

        let parsedValue;
        if (field === 'quantity') {
            parsedValue = parseInt(value) || 0;
        } else if (field === 'price') {
            parsedValue = parsePrice(value);
        }

        onQuickUpdate(id, field, parsedValue);

        setEditingValues(prev => {
            const newValues = { ...prev };
            delete newValues[key];
            return newValues;
        });
    };

    const getInputValue = (id, field, productValue) => {
        const key = `${id}-${field}`;
        return editingValues[key] !== undefined
            ? editingValues[key]
            : (productValue === 0 ? '' : productValue);
    };

    if (products.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhum produto ainda</h3>
                <p className="text-slate-500">Adicione itens para começar sua lista de compras</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Lista de Produtos</h2>
                <span className="text-sm text-slate-500 hidden sm:inline-block">Agrupado por categoria</span>
            </div>

            <div className="space-y-8">
                {groupedProducts.map(([category, { items, total }]) => (
                    <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-blue-500" />
                                <h3 className="text-lg font-bold text-slate-700">{category}</h3>
                                <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600">
                                    {items.length} {items.length === 1 ? 'item' : 'itens'}
                                </Badge>
                            </div>
                            <div className="text-sm font-medium text-slate-600">
                                Subtotal: <span className="text-blue-600 font-bold ml-1">{formatCurrency(total)}</span>
                            </div>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {items.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all duration-200"
                                >
                                    {/* Product Name Area */}
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-slate-800 text-lg leading-tight">{product.name}</h3>

                                            {/* Badge "Por Kg" */}
                                            {product.is_per_kg && (
                                                <Badge className="bg-green-100 text-green-700 border-green-300">
                                                    <Weight className="w-3 h-3 mr-1" />
                                                    Por Kg
                                                </Badge>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEdit(product)}
                                                className="h-6 w-6 p-0 hover:bg-slate-200 text-slate-400 hover:text-blue-600"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        {/* Informação detalhada para produtos por kg */}
                                        {product.is_per_kg ? (
                                            <div className="text-xs text-slate-500 mt-1">
                                                {product.weight_kg}kg × {formatCurrency(product.price_per_kg)}/kg = {' '}
                                                <span className="font-bold text-blue-600">
                                                    {formatCurrency(product.weight_kg * product.price_per_kg)}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-slate-500 mt-1 sm:hidden">
                                                Total: <span className="font-bold text-blue-600">{formatCurrency(product.price * product.quantity)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Edit Inputs - DESABILITADO para produtos por kg */}
                                    <div className="flex gap-3 items-center flex-1 sm:flex-none">
                                        <div className="flex flex-col w-20">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                                                {product.is_per_kg ? 'Peso' : 'Qtd'}
                                            </span>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={product.is_per_kg ? product.weight_kg : getInputValue(product.id, 'quantity', product.quantity)}
                                                onFocus={() => !product.is_per_kg && handleInputFocus(product.id, 'quantity', product.quantity)}
                                                onChange={(e) => !product.is_per_kg && handleInputChange(product.id, 'quantity', e.target.value)}
                                                onBlur={() => !product.is_per_kg && handleInputBlur(product.id, 'quantity')}
                                                placeholder="0"
                                                className="h-9 bg-white text-center font-medium"
                                                disabled={product.is_per_kg}
                                            />
                                        </div>

                                        <div className="flex flex-col w-28">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                                                {product.is_per_kg ? 'R$/kg' : 'Preço (R$)'}
                                            </span>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={product.is_per_kg ? product.price_per_kg : getInputValue(product.id, 'price', product.price)}
                                                onFocus={() => !product.is_per_kg && handleInputFocus(product.id, 'price', product.price)}
                                                onChange={(e) => !product.is_per_kg && handleInputChange(product.id, 'price', e.target.value)}
                                                onBlur={() => !product.is_per_kg && handleInputBlur(product.id, 'price')}
                                                placeholder="0.00"
                                                className="h-9 bg-white text-right font-medium"
                                                disabled={product.is_per_kg}
                                            />
                                        </div>

                                        <div className="hidden sm:flex flex-col w-28 text-right px-2">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total</span>
                                            <span className="font-bold text-blue-600 text-lg leading-8">
                                                {product.is_per_kg
                                                    ? formatCurrency(product.weight_kg * product.price_per_kg)
                                                    : formatCurrency(product.price * product.quantity)
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 sm:border-l sm:pl-4">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Tem certeza que deseja excluir "{product.name}"?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => onDelete(product.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Excluir
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;