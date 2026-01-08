import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { LogIn } from 'lucide-react';

const LoginForm = ({ onToggleMode }) => {
    const { signIn } = useAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'E-mail inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            await signIn(formData.email, formData.password);

            toast({
                title: 'Login realizado!',
                description: 'Bem-vindo de volta!',
            });
        } catch (error) {
            console.error('Erro no login:', error);

            let errorMessage = 'Erro ao fazer login. Tente novamente.';

            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'E-mail ou senha incorretos.';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Por favor, confirme seu e-mail antes de fazer login.';
            } else if (error.message.includes('Network')) {
                errorMessage = 'Erro de conexão. Verifique sua internet.';
            }

            toast({
                title: 'Erro no Login',
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
                {errors.password && (
                    <p className="text-red-600 text-sm">{errors.password}</p>
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
                        Entrando...
                    </>
                ) : (
                    <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Entrar
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
                    Não tem uma conta? Criar conta
                </button>
            </div>
        </form>
    );
};

export default LoginForm;
