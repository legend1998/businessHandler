import React, { useState } from 'react';

import Button from '@material-ui/core/Button';

import '../assets/style/buttons.scss';
import IconCached from '@material-ui/icons/Cached';

interface AsyncButtonProps {
    children: React.ReactNode;
    style?: React.CSSProperties,
    className?: string,
    callback?: (callback: () => void) => void,
    variant?: 'text' | 'outlined' | 'contained',
    color?: 'inherit' | 'primary' | 'secondary' | 'default',
    type?: 'submit' | 'reset' | 'button',
    size?: 'small' | 'medium' | 'large',
    fullWidth?: boolean,
    startIcon?: React.ReactNode
}

export default function AsyncButton(props: AsyncButtonProps) {
    const { children, style, className, callback, variant, color, fullWidth, type, size, startIcon } = props;
    const [loading, setLoading] = useState(false);

    function onClick(event: React.MouseEvent<any>) {
        event.preventDefault();
        if (callback) {
            setLoading(true);
            callback(() => {
                setLoading(false);
            });
        }
    }

    return (
        <Button style={style}
                className={className}
                disabled={loading}
                type={type}
                variant={variant}
                color={color}
                size={size}
                fullWidth={fullWidth}
                startIcon={startIcon}
                onClick={onClick}>
            {loading ? <IconCached className="spin-animation" style={{ fontSize: 28 }}/> : children}
        </Button>
    );
}
