import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../views/Dashboard';

test('renders nav links', async () => {
    render(<Dashboard/>);
    const dashboardHeader = screen.getByText(/dashboard/i);
    expect(dashboardHeader).toBeInTheDocument();
});
