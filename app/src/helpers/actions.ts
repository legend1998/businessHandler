import store from '../store/root';
import Network from './network';

export function getCurrencyList(force = false) {
    if (Object.keys(store.getState().currencies).length === 0 || force)
        return Network.get(`/currencies`)
            .then(res => store.dispatch({ type: 'setCurrencies', payload: res.data }));
    return Promise.resolve();
}

export function getItemList(force = false) {
    if (store.getState().items.length === 0 || force)
        return Network.get('/items')
            .then(res => store.dispatch({ type: 'setItems', payload: res.data }));
    return Promise.resolve();
}
