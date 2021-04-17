import React from 'react';

interface TabPanelProps {
    children: React.ReactNode;
    value: number;
    index: number;
}

export default function TabPanel(props: TabPanelProps) {
    const { children, value, index } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'auto' }}>
            {value === index && children}
        </div>
    );
}
