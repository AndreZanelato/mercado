import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Normaliza entrada numérica aceitando vírgula ou ponto como separador decimal
 * @param {string|number} value - Valor digitado pelo usuário
 * @returns {number} - Número parseado ou 0 se inválido
 *
 * @example
 * parsePrice("10,50")   // 10.5
 * parsePrice("10.50")   // 10.5
 * parsePrice("0,75")    // 0.75
 * parsePrice("")        // 0
 * parsePrice("abc")     // 0
 */
export const parsePrice = (value) => {
    if (value === null || value === undefined || value === '') return 0;

    // Converte para string e substitui vírgula por ponto
    const normalized = String(value).replace(',', '.');
    const parsed = parseFloat(normalized);

    return isNaN(parsed) ? 0 : parsed;
};