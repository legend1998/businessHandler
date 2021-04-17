import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../views/Login';
import store from '../store/root';
import { Provider as StoreProvider } from 'react-redux';

test('login renders properly', async () => {
    const { container } = render(
        <StoreProvider store={store}>
            <BrowserRouter>
                <Login/>
            </BrowserRouter>
        </StoreProvider>
    );

    // Header
    const loginHeader = container.querySelector('h1.MuiTypography-root.MuiTypography-h5');
    expect(loginHeader).toBeInTheDocument();

    // Fields
    const loginEmail = screen.getByText(/Email Address/);
    expect(loginEmail).toBeInTheDocument();
    const loginPassword = screen.getByText(/Password/);
    expect(loginPassword).toBeInTheDocument();

    // Button
    const registerButton = container.querySelector('button.MuiButton-root');
    expect(registerButton).toBeInTheDocument();

    // Links
    const loginLinkPassword = screen.getByText(/forgot password\?/i);
    expect(loginLinkPassword).toBeInTheDocument();
    const loginLinkRegister = screen.getByText(/don't have an account\?/i);
    expect(loginLinkRegister).toBeInTheDocument();

});
