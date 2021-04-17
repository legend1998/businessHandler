import Network from "./network";
import store from "../store/root";
import history from './history';

// Log the user in using their email and password
export function login(email: string, password: string) {
    return Network.post('/users/login', {
        email,
        password
    })
    .then(res => {
        Network.setTokens(res.data.user.access_token, res.data.user.refresh_token);
        delete res.data.user.access_token;
        delete res.data.user.refresh_token;
        store.dispatch({ type: 'auth/onLogin', payload: res.data });
        history.push('/');
    });
}

// Logout the user completely by clearing the auth token and revoking the refresh token
export function logout() {
    const refreshToken = Network.getRefreshToken();
    return Network.post('/users/revoke-token', { refresh_token: refreshToken })
        .finally(() => {
            Network.clearTokens();
            store.dispatch({ type: 'auth/onLogout', payload: null });
            history.push('/login');
        });
}

// Register user account and business
export function register(firstName: string, lastName: string, email: string, password: string, businessName: string, currency: string, captcha: string) {
    return Network.post('/users/register-business', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        business_name: businessName,
        currency: currency,
        captcha: captcha
    });
}
