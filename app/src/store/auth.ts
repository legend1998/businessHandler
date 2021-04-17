import { StoreModule } from './store';
import { User, BusinessObject } from '../types';

interface AuthState {
    user: User | null,
    business: BusinessObject | null
}

const auth: StoreModule<AuthState> = {
    state: {
        user: null,
        business: null
    },
    actions: {
        onLogin(state, payload) {
            state.user = payload.user;
            state.business = payload.business;
        },
        onLogout(state) {
            state.user = null;
            state.business = null;
        }
    }
};

export default auth;
