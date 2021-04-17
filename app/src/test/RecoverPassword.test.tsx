import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecoverPassword from '../views/RecoverPassword';

test('recover password renders properly', async () => {
    const { container } = render(
        <BrowserRouter>
            <RecoverPassword/>
        </BrowserRouter>
    );

    // Header
    const recoverHeader = screen.getByText(/recover password/i);
    expect(recoverHeader).toBeInTheDocument();

    // Explanation paragraph
    const recoverExplanation = container.querySelector('p.MuiTypography-body1');
    expect(recoverExplanation).toBeInTheDocument();

    // Fields
    const recoverEmail = screen.getByText(/Email Address/);
    expect(recoverEmail).toBeInTheDocument();

    // Button
    const recoverButton = container.querySelector('button.MuiButton-root');
    expect(recoverButton).toBeInTheDocument();

    // Links
    const loginLinkPassword = screen.getByText(/login instead\?/i);
    expect(loginLinkPassword).toBeInTheDocument();

});
