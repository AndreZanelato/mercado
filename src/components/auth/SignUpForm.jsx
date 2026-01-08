import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, Check, X } from 'lucide-react';

const SignUpForm = ({ onToggleMode }) => {
    const { signUp, signOut } = useAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const passwordRequirements = [
        { label: 'Mínimo 8 caracteres', test: (pwd) => pwd.length >= 8 },
        { label: 'Letra maiúscula', test: (pwd) => /[A-Z]/.test(pwd) },
        { label: 'Letra minúscula', test: (pwd) => /[a-z]/.test(pwd) },
        { label: 'Número', test: (pwd) => /\d/.test(pwd) },
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'E-mail inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (!passwordRequirements.every(req => req.test(formData.password))) {
            newErrors.password = 'Senha não atende aos requisitos';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Senhas não coincidem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            await signUp(formData.email, formData.password);

            // Fazer logout para forçar o usuário a fazer login manualmente
            await signOut();

            toast({
                title: 'Conta criada com sucesso!',
                description: 'Faça login para acessar o Ajudante de Compras.',
            });

            // Alternar para o modo de login
            setTimeout(() => {
                onToggleMode();
            }, 500);
        } catch (error) {
            console.error('Erro no registro:', error);

            let errorMessage = 'Erro ao criar conta. Tente novamente.';

            if (error.message.includes('User already registered')) {
                errorMessage = 'Este e-mail já está cadastrado. Faça login.';
            } else if (error.message.includes('Password')) {
                errorMessage = 'Senha inválida. Verifique os requisitos.';
            } else if (error.message.includes('Network')) {
                errorMessage = 'Erro de conexão. Verifique sua internet.';
            }

            toast({
                title: 'Erro no Registro',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    disabled={isLoading}
                    className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                    <p className="text-red-600 text-sm">{errors.email}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className={errors.password ? 'border-red-500' : ''}
                />

                <div className="space-y-1 pt-2">
                    {passwordRequirements.map((req, index) => {
                        const isValid = formData.password && req.test(formData.password);
                        return (
                            <div key={index} className="flex items-center gap-2 text-sm">
                                {isValid ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <X className="w-4 h-4 text-slate-400" />
                                )}
                                <span className={isValid ? 'text-green-600' : 'text-slate-600'}>
                                    {req.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                    <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
                )}
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
            >
                {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Criando conta...
                    </>
                ) : (
                    <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Criar Conta
                    </>
                )}
            </Button>

            <div className="text-center pt-4">
                <button
                    type="button"
                    onClick={onToggleMode}
                    className="text-blue-600 hover:underline text-sm"
                    disabled={isLoading}
                >
                    Já tem uma conta? Fazer login
                </button>
            </div>
        </form>
    );
};

export default SignUpForm;
