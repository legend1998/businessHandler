import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import ResetPassword from '../views/ResetPassword';

test('recover password renders properly', async () => {
    const { container } = render(
        <BrowserRouter>
            <ResetPassword/>
        </BrowserRouter>
    );

    // Header
    const resetHeader = screen.getByText(/reset password/i);
    expect(resetHeader).toBeInTheDocument();

    // Explanation paragraph
    const resetExplanation = container.querySelector('p.MuiTypography-body1');
    expect(resetExplanation).toBeInTheDocument();

    // Fields
    const resetPassword = screen.getByText(/New Password/);
    expect(resetPassword).toBeInTheDocument();
    const resetPassword2 = screen.getByText(/confirm password/i);
    expect(resetPassword2).toBeInTheDocument();

    // Button
    const recoverButton = container.querySelector('button.MuiButton-root');
    expect(recoverButton).toBeInTheDocument();

    // Links
    const loginLinkPassword = screen.getByText(/login instead\?/i);
    expect(loginLinkPassword).toBeInTheDocument();

});
