import { supabase } from '@/lib/supabase';

/**
 * Migra dados do localStorage para o Supabase
 * Esta função deve ser executada uma única vez por usuário
 */
export const migrateLocalStorageToSupabase = async () => {
    const MIGRATION_KEY = 'hasMigratedToSupabase';

    // Verificar se já foi migrado
    if (localStorage.getItem(MIGRATION_KEY) === 'true') {
        console.log('Migração já foi realizada anteriormente.');
        return { success: true, message: 'Migração já realizada', alreadyMigrated: true };
    }

    try {
        const savedData = localStorage.getItem('expenseTrackerData');

        if (!savedData) {
            console.log('Nenhum dado encontrado no localStorage para migrar.');
            localStorage.setItem(MIGRATION_KEY, 'true');
            return { success: true, message: 'Nenhum dado para migrar', count: 0 };
        }

        const allData = JSON.parse(savedData);
        const productsToMigrate = [];

        // Converter dados do formato localStorage para formato Supabase
        Object.entries(allData).forEach(([monthKey, products]) => {
            products.forEach(product => {
                productsToMigrate.push({
                    name: product.name,
                    quantity: product.quantity || 0,
                    price: product.price || 0,
                    category: product.category || 'Outros',
                    month_key: monthKey,
                    created_at: product.createdAt || product.created_at || new Date().toISOString(),
                    updated_at: product.updatedAt || product.updated_at || null
                });
            });
        });

        if (productsToMigrate.length === 0) {
            console.log('Nenhum produto encontrado para migrar.');
            localStorage.setItem(MIGRATION_KEY, 'true');
            return { success: true, message: 'Nenhum produto para migrar', count: 0 };
        }

        console.log(`Iniciando migração de ${productsToMigrate.length} produtos...`);

        // Inserir em lotes de 100 produtos por vez
        const batchSize = 100;
        let migratedCount = 0;

        for (let i = 0; i < productsToMigrate.length; i += batchSize) {
            const batch = productsToMigrate.slice(i, i + batchSize);

            const { data, error } = await supabase
                .from('products')
                .insert(batch);

            if (error) {
                console.error('Erro ao migrar lote:', error);
                throw error;
            }

            migratedCount += batch.length;
            console.log(`Migrados ${migratedCount}/${productsToMigrate.length} produtos`);
        }

        // Marcar migração como concluída
        localStorage.setItem(MIGRATION_KEY, 'true');

        console.log(`Migração concluída! ${migratedCount} produtos migrados com sucesso.`);

        return {
            success: true,
            message: `${migratedCount} produtos migrados com sucesso`,
            count: migratedCount
        };

    } catch (error) {
        console.error('Erro durante migração:', error);
        return {
            success: false,
            message: error.message || 'Erro ao migrar dados',
            error
        };
    }
};

/**
 * Reseta o flag de migração (usar apenas para testes)
 */
export const resetMigrationFlag = () => {
    localStorage.removeItem('hasMigratedToSupabase');
    console.log('Flag de migração resetado.');
};

/**
 * Verifica se a migração já foi realizada
 */
export const hasMigrated = () => {
    return localStorage.getItem('hasMigratedToSupabase') === 'true';
};

/**
 * Cria backup do localStorage antes da migração
 */
export const backupLocalStorage = () => {
    const savedData = localStorage.getItem('expenseTrackerData');
    if (savedData) {
        const backup = {
            data: savedData,
            timestamp: new Date().toISOString()
        };

        // Criar um blob e fazer download
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-mercado-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    }
    return false;
};
