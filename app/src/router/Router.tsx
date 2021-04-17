import React from 'react';
import { GuardProvider, GuardFunction, PageComponent, GuardedRoute } from 'react-router-guards';
import { Router as BrowserRouter } from 'react-router-dom';
import { History } from 'history';

export interface Route {
    component: React.ComponentType<any>,
    path: string,
    name: string,
    beforeEnter?: GuardFunction[] | GuardFunction,
    loading?: PageComponent,
    exact?: boolean
}

export interface RouterProps extends React.ComponentProps<any> {
    routes: Route[],
    history: History<any>
}

export default function Router(props: RouterProps) {
    const { routes, children, history } = props;
    return (
        <BrowserRouter history={history}>
            {children}
            <GuardProvider>
                {routes.map(r => (
                    <GuardedRoute
                        key={r.name}
                        path={r.path}
                        loading={r.loading}
                        exact={!!r.exact}
                        guards={r.beforeEnter ? (Array.isArray(r.beforeEnter) ? r.beforeEnter : [r.beforeEnter]) : []}
                        component={r.component}>
                    </GuardedRoute>
                ))}
            </GuardProvider>
        </BrowserRouter>
    );
}
