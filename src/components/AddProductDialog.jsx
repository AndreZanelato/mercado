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
import { Plus, Check, Weight } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { parsePrice } from '@/lib/utils';

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
        category: 'Outros',
        isPerKg: false,
        weightKg: '',
        pricePerKg: ''
    });
    const [customCategory, setCustomCategory] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [availableCategories, setAvailableCategories] = useState(DEFAULT_CATEGORIES);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    // Buscar categorias únicas do Firestore
                    const q = query(collection(db, 'products'), where('userId', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    const usedCategories = [...new Set(querySnapshot.docs.map(doc => doc.data().category).filter(Boolean))];
                    setAvailableCategories(prev => [...new Set([...prev, ...usedCategories])].sort());
                } else {
                    // Fallback para localStorage se não houver usuário
                    throw new Error("Usuário não autenticado");
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
                quantity: editingProduct.quantity?.toString() || '',
                price: editingProduct.price?.toString() || '',
                category: editingProduct.category || 'Outros',
                isPerKg: editingProduct.is_per_kg || false,
                weightKg: editingProduct.weight_kg?.toString() || '',
                pricePerKg: editingProduct.price_per_kg?.toString() || ''
            });
        } else {
            setFormData({
                name: '',
                quantity: '',
                price: '',
                category: 'Outros',
                isPerKg: false,
                weightKg: '',
                pricePerKg: ''
            });
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

        const finalCategory = isCreatingCategory && customCategory.trim()
            ? customCategory.trim()
            : formData.category;

        let productData;

        if (formData.isPerKg) {
            // MODO POR QUILO
            const weightKg = parsePrice(formData.weightKg);
            const pricePerKg = parsePrice(formData.pricePerKg);

            if (weightKg <= 0 || pricePerKg <= 0) {
                toast({
                    title: "Erro de Validação",
                    description: "Por favor, insira peso e preço por kg válidos.",
                    variant: "destructive"
                });
                return;
            }

            // Calcular preço total
            const calculatedPrice = weightKg * pricePerKg;

            productData = {
                name: formData.name.trim(),
                quantity: 1, // Mantém 1 para compatibilidade
                price: calculatedPrice,
                category: finalCategory,
                is_per_kg: true,
                weight_kg: weightKg,
                price_per_kg: pricePerKg
            };
        } else {
            // MODO NORMAL
            let quantity = formData.quantity === '' ? 0 : parseInt(formData.quantity);
            let price = parsePrice(formData.price);

            if (isNaN(quantity)) quantity = 0;
            if (isNaN(price)) price = 0;

            productData = {
                name: formData.name.trim(),
                quantity,
                price,
                category: finalCategory,
                is_per_kg: false,
                weight_kg: null,
                price_per_kg: null
            };
        }

        if (editingProduct) {
            onAdd({ ...editingProduct, ...productData });
        } else {
            onAdd(productData);
        }

        if (!editingProduct) {
            setFormData({
                name: '',
                quantity: '',
                price: '',
                category: 'Outros',
                isPerKg: false,
                weightKg: '',
                pricePerKg: ''
            });
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

                        {/* Checkbox "Por Quilo" */}
                        <div className="grid gap-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isPerKg"
                                    checked={formData.isPerKg}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setFormData({
                                            ...formData,
                                            isPerKg: checked,
                                            // Se marcar "por kg", limpar campos de quantidade/preço
                                            ...(checked ? { quantity: '', price: '' } : { weightKg: '', pricePerKg: '' })
                                        });
                                    }}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="isPerKg" className="flex items-center gap-2 cursor-pointer">
                                    <Weight className="w-4 h-4 text-blue-600" />
                                    Produto vendido por quilo
                                </Label>
                            </div>
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

                        {/* Campos condicionais baseados em isPerKg */}
                        {!formData.isPerKg ? (
                            // CAMPOS NORMAIS (quantidade e preço unitário)
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
                        ) : (
                            // CAMPOS POR QUILO (peso em kg e preço por kg)
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="weightKg">Peso (kg)</Label>
                                        <Input
                                            id="weightKg"
                                            type="number"
                                            min="0"
                                            step="0.001"
                                            value={formData.weightKg}
                                            onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                                            placeholder="0.000"
                                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="pricePerKg">Preço/kg (R$)</Label>
                                        <Input
                                            id="pricePerKg"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.pricePerKg}
                                            onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                                            placeholder="0,00"
                                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Preview do cálculo quando for "por kg" */}
                                {formData.weightKg && formData.pricePerKg && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-slate-600">
                                            Total calculado: {' '}
                                            <span className="font-bold text-blue-600">
                                                {(parsePrice(formData.weightKg) * parsePrice(formData.pricePerKg)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formData.weightKg} kg × R$ {formData.pricePerKg}/kg
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
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