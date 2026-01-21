import React from 'react';
import NavLink from './NavLink';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between">
                    <p>&copy; 2024 Carrinho de Bolso. Todos os direitos reservados.</p>
                    <ul className="flex space-x-4">
                        <li>
                            <NavLink href="/legal/privacy-policy" className="hover:text-gray-400">
                                Política de Privacidade
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href="/legal/terms-of-service" className="hover:text-gray-400">
                                Termos de Serviço
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
