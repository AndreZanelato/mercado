import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleMode = () => {
        setIsLogin(!isLogin);
    };

    return (
        <AuthLayout
            title={isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
            subtitle={isLogin ? 'Faça login para acessar suas compras' : 'Comece a rastrear suas compras hoje'}
        >
            {isLogin ? (
                <LoginForm onToggleMode={toggleMode} />
            ) : (
                <SignUpForm onToggleMode={toggleMode} />
            )}
        </AuthLayout>
    );
};

export default AuthPage;
