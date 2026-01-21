import React, { useState, useEffect } from 'react';
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import HeroSection from '../landing/HeroSection';
import DemoSection from '../landing/DemoSection';
import Footer from '../landing/Footer';
import PrivacyPolicy from '../legal/PrivacyPolicy';
import TermsOfService from '../legal/TermsOfService';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [path, setPath] = useState(window.location.pathname);

    useEffect(() => {
        const onLocationChange = () => {
            setPath(window.location.pathname);
        };

        window.addEventListener('popstate', onLocationChange);
        return () => window.removeEventListener('popstate', onLocationChange);
    }, []);


    const toggleMode = () => {
        setIsLogin(!isLogin);
    };

    if (path === '/legal/privacy-policy') {
        return <PrivacyPolicy />;
    }

    if (path === '/legal/terms-of-service') {
        return <TermsOfService />;
    }

    return (
        <>
            <HeroSection />
            <DemoSection />
            <AuthLayout
                id="auth-section"
                title={isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
                subtitle={isLogin ? 'Faça login para acessar suas compras' : 'Comece a rastrear suas compras hoje'}
            >
                {isLogin ? (
                    <LoginForm onToggleMode={toggleMode} />
                ) : (
                    <SignUpForm onToggleMode={toggleMode} />
                )}
            </AuthLayout>
            <Footer />
        </>
    );
};

export default AuthPage;
