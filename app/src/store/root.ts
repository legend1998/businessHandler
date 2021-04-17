import { createStore } from 'redux';
import Swal from "sweetalert2";

import { createReducer } from './store';
import auth from './auth';
import accounts from './accounts';

import { logout } from '../helpers/user-service';
import { CurrencyList, ItemObject } from '../types';

interface RootState {
    inactivityTime: NodeJS.Timeout | null,
    currencies: CurrencyList,
    items: ItemObject[]
}

export default createStore(createReducer<RootState>({
    state: {
        inactivityTime: null,
        currencies: {},
        items: []
    },
    modules: {
        auth,
        accounts
    },
    actions: {
        resetTimer(state) {
            if (state.inactivityTime)
                clearTimeout(state.inactivityTime);
            state.inactivityTime = setTimeout(() => {
                // @ts-ignore
                if (state.auth.user) {
                    logout();
                    Swal.fire({
                        title: 'Automatic Logout',
                        text: 'You have been automatically logged out because you were inactive for 10 minutes.',
                        icon: 'warning'
                    });
                }
            }, 600000);
        },
        setCurrencies(state, currencies) {
            state.currencies = currencies;
        },
        setItems(state, items) {
            state.items = items;
        }
    }
}));
