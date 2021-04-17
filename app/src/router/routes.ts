import { GuardFunction } from 'react-router-guards';
import { Route } from './Router';

import Dashboard from '../views/Dashboard';
import Login from '../views/Login';
import Register from '../views/Register';
import RecoverPassword from '../views/RecoverPassword';
import ResetPassword from '../views/ResetPassword';

import store from '../store/root';
import Network from '../helpers/network';

const ifAuthenticated: GuardFunction = (from, to, next) => {
    if (!store.getState().auth.user) {
        if (localStorage.getItem('access_token')) {
            Network.get('/users/current-user')
                .then(res => {
                    store.dispatch({ type: 'auth/onLogin', payload: res.data });
                    next();
                })
                .catch(() => next.redirect('/login'));
        } else {
            next.redirect('/login');
        }
    } else {
        next();
    }
};

const ifNotAuthenticated: GuardFunction = (from, to, next) => {
    if (!store.getState().auth.user) {
        if (localStorage.getItem('access_token')) {
            Network.get('/users/current-user')
                .then(res => {
                    store.dispatch({ type: 'auth/onLogin', payload: res.data });
                    next.redirect('/');
                })
                .catch(() => next());
        } else {
            next();
        }
    } else {
        next.redirect('/');
    }
};

const routes: Route[] = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
        beforeEnter: ifAuthenticated,
        exact: true
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        beforeEnter: ifNotAuthenticated
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        beforeEnter: ifNotAuthenticated
    },
    {
        path: '/recover-password',
        name: 'Recover Password',
        component: RecoverPassword,
        beforeEnter: ifNotAuthenticated
    },
    {
        path: '/reset-password/:resetGUID',
        name: 'Reset Password',
        component: ResetPassword,
        beforeEnter: ifNotAuthenticated
    }
];

export default routes;
