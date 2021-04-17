import store from '../store/root';
import { Currency } from '../types';

export function formatAmount(currencyName: string, amount: number, short = false) {
    const currency = store.getState().currencies[currencyName] as Currency;
    if (!currency)
        return `$${amount.toFixed(2)}`;
    if (short)
        return currency.is_prefixed ? `${currency.symbol_native}${amount.toFixed(currency.decimal_digits)}` : `${amount.toFixed(currency.decimal_digits)}${currency.symbol_native}`;
    return `${currency.symbol} ${amount.toFixed(currency.decimal_digits)}`;
}

export function convertAmount(currencyName: string, amount: number) {
    const currency = store.getState().currencies[currencyName] as Currency;
    const businessCurrency = store.getState().currencies[store.getState().auth.business.currency] as Currency;
    return amount * currency.conversion_rate / businessCurrency.conversion_rate;
}
