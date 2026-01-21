import React from 'react';

const DemoSection = () => {
    return (
        <section className="py-20 bg-gray-100">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                    Como funciona
                </h2>
                <div className="flex flex-wrap -mx-4">
                    <div className="w-full md:w-1/3 px-4 mb-8">
                        <div className="rounded-lg shadow-lg p-8 bg-white">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Adicione seus produtos</h3>
                            <p className="text-gray-600">
                                Cadastre os produtos que você compra com frequência, informando o nome, preço e unidade.
                            </p>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3 px-4 mb-8">
                        <div className="rounded-lg shadow-lg p-8 bg-white">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Acompanhe suas despesas</h3>
                            <p className="text-gray-600">
                                Registre suas compras do dia a dia e veja para onde seu dinheiro está indo.
                            </p>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3 px-4 mb-8">
                        <div className="rounded-lg shadow-lg p-8 bg-white">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Compare e economize</h3>
                            <p className="text-gray-600">
                                Visualize gráficos e relatórios que te ajudam a entender seus gastos e a economizar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DemoSection;
