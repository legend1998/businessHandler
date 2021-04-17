import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider as StoreProvider } from 'react-redux';
import Register from '../views/Register';
import { BrowserRouter } from 'react-router-dom';
import store from '../store/root';

test('register renders properly', async () => {
    const { container } = render(
        <StoreProvider store={store}>
            <BrowserRouter>
                <Register/>
            </BrowserRouter>
        </StoreProvider>
    );

    // Header
    const registerHeader = screen.getByText(/register your company/i);
    expect(registerHeader).toBeInTheDocument();

    // Explanation paragraph
    const registerExplanation = container.querySelector('p.MuiTypography-body1');
    expect(registerExplanation).toBeInTheDocument();

    // Fields
    const registerFirstName = screen.getByText(/first name/i);
    expect(registerFirstName).toBeInTheDocument();
    const registerLastName = screen.getByText(/last name/i);
    expect(registerLastName).toBeInTheDocument();
    const registerEmail = screen.getByText(/Email Address/);
    expect(registerEmail).toBeInTheDocument();
    const registerPassword = screen.getByText(/^Password$/);
    expect(registerPassword).toBeInTheDocument();
    const registerPassword2 = screen.getByText(/Confirm Password/);
    expect(registerPassword2).toBeInTheDocument();
    const registerBusinessName = screen.getByText(/Company Name/);
    expect(registerBusinessName).toBeInTheDocument();
    const registerCurrency = screen.getByText(/Currency/);
    expect(registerCurrency).toBeInTheDocument();

    // Button
    const registerButton = container.querySelector('button.MuiButton-root');
    expect(registerButton).toBeInTheDocument();

    // Links
    const registerLinkLogin = screen.getByText(/already have an account\?/i);
    expect(registerLinkLogin).toBeInTheDocument();

});
