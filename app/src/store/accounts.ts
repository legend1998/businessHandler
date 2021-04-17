import { StoreModule } from './store';
import { UserObject } from '../types';

interface AccountsState {
    list: UserObject[]
}

const accounts: StoreModule<AccountsState> = {
    state: {
        list: []
    },
    actions: {
        setAccountList(state, list) {
            state.list = list;
        },
        addAccount(state, account) {
            state.list.push(account);
        }
    }
}

export default accounts;
