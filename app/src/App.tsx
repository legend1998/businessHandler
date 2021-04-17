import React, { useEffect } from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { ToastProvider } from 'react-toast-notifications';
import { ThemeProvider } from '@material-ui/core/styles';

import Router from './router/Router';
import routes from './router/routes';
import Navigation from './components/Navigation';
import store from './store/root';
import background from './assets/img/background.jpg';
import theme from './helpers/theme';
import history from './helpers/history';
import { getCurrencyList, getItemList } from './helpers/actions';

function App() {

    useEffect(() => {
        window.onload = () => store.dispatch({ payload: null, type: 'resetTimer' });
        document.onmousemove = () => store.dispatch({ payload: null, type: 'resetTimer' });
        document.onkeypress = () => store.dispatch({ payload: null, type: 'resetTimer' });
        getCurrencyList(true);
        getItemList(true);
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <div id="app" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
                <ToastProvider placement="bottom-right">
                    <StoreProvider store={store}>
                        <Router routes={routes} history={history}>
                            <Navigation/>
                        </Router>
                    </StoreProvider>
                </ToastProvider>
            </div>
        </ThemeProvider>
    );
}

export default App;
