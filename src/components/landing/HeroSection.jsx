import React from 'react';

const HeroSection = () => {
    const handleScrollToAuth = (e) => {
        e.preventDefault();
        const authSection = document.querySelector('#auth-section');
        if (authSection) {
            authSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="text-center py-20">
            <h1 className="text-5xl font-bold text-gray-800">
                Carrinho de Bolso
            </h1>
            <p className="text-xl text-gray-600 mt-4">
                Inteligência para suas compras, praticidade para o seu dia.
            </p>
            <p className="mt-8">
                <a
                    href="#auth-section"
                    onClick={handleScrollToAuth}
                    className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700"
                >
                    Comece a usar
                </a>
            </p>
        </section>
    );
};

export default HeroSection;
