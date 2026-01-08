import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const DEFAULT_CATEGORIES = [
    "Bebidas", "Carnes", "Congelados", "Grãos", "Higiene", "Hortifruti",
    "Laticínios", "Limpeza", "Mercearia", "Padaria", "Pet Shop", "Outros"
];

const AddProductDialog = ({ open, onOpenChange, onAdd, editingProduct, isSaving }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        price: '',
        category: 'Outros'
    });
    const [customCategory, setCustomCategory] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [availableCategories, setAvailableCategories] = useState(DEFAULT_CATEGORIES);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                // Buscar categorias únicas do Supabase
                const { data, error } = await supabase
                    .from('products')
                    .select('category');

                if (error) throw error;

                if (data && data.length > 0) {
                    const usedCategories = [...new Set(data.map(p => p.category).filter(Boolean))];
                    setAvailableCategories(prev => [...new Set([...prev, ...usedCategories])].sort());
                }
            } catch (error) {
                console.error("Erro ao carregar categorias:", error);

                // Fallback para localStorage
                const savedData = localStorage.getItem('expenseTrackerData');
                if (savedData) {
                    try {
                        const allData = JSON.parse(savedData);
                        const allProducts = Object.values(allData).flat();
                        const usedCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
                        setAvailableCategories(prev => [...new Set([...prev, ...usedCategories])].sort());
                    } catch (e) {
                        console.error("Erro ao carregar categorias do localStorage:", e);
                    }
                }
            }
        };

        if (open) {
            loadCategories();
        }
    }, [open]);

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                name: editingProduct.name,
                quantity: editingProduct.quantity.toString(),
                price: editingProduct.price.toString(),
                category: editingProduct.category || 'Outros'
            });
        } else {
            setFormData({ name: '', quantity: '', price: '', category: 'Outros' });
        }
        setIsCreatingCategory(false);
        setCustomCategory('');
    }, [editingProduct, open]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast({
                title: "Erro de Validação",
                description: "Por favor, insira o nome do produto.",
                variant: "destructive"
            });
            return;
        }

        let quantity = formData.quantity === '' ? 0 : parseInt(formData.quantity);
        let price = formData.price === '' ? 0 : parseFloat(formData.price.replace(',', '.'));

        if (isNaN(quantity)) quantity = 0;
        if (isNaN(price)) price = 0;

        const finalCategory = isCreatingCategory && customCategory.trim()
            ? customCategory.trim()
            : formData.category;

        const productData = {
            name: formData.name.trim(),
            quantity,
            price,
            category: finalCategory
        };

        if (editingProduct) {
            onAdd({ ...editingProduct, ...productData });
        } else {
            onAdd(productData);
        }

        if (!editingProduct) {
            setFormData({ name: '', quantity: '', price: '', category: 'Outros' });
        }

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
                    <DialogDescription>
                        {editingProduct
                            ? 'Atualize os detalhes do produto.'
                            : 'Insira o nome do produto. Quantidade e preço podem ser preenchidos depois.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Category Selection */}
                        <div className="grid gap-2">
                            <Label htmlFor="category">Categoria</Label>
                            {!isCreatingCategory ? (
                                <div className="flex gap-2">
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {availableCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setIsCreatingCategory(true)}
                                        title="Criar nova categoria"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        placeholder="Nome da nova categoria"
                                        className="flex-1"
                                        autoFocus
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsCreatingCategory(false)}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome do Produto</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="ex: Leite, Pão, Ovos"
                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Quantidade (Opcional)</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    placeholder="0"
                                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">Preço Unit. (Opcional)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0,00"
                                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                            className="transition-all duration-200"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                        >
                            {isSaving ? 'Salvando...' : (editingProduct ? 'Salvar Alterações' : 'Adicionar')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddProductDialog;