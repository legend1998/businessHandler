import React from 'react';
import { connect } from 'react-redux';

import { PropTypes, SelectProps } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import { CurrencyList } from '../types.js';

interface FormControlProps {
    children?: React.ReactNode,
    color?: 'primary' | 'secondary',
    disabled?: boolean,
    error?: boolean,
    fullWidth?: boolean,
    focused?: boolean,
    hiddenLabel?: boolean,
    margin?: PropTypes.Margin,
    required?: boolean,
    size?: 'small' | 'medium',
    variant?: 'standard' | 'outlined' | 'filled',
    style?: React.CSSProperties,
    className?: string
}

interface CurrencySelectProps extends SelectProps {
    formControlProps?: FormControlProps,
    currencies: CurrencyList,
    extended?: boolean
}

const mapStateToProps = (state: any) => {
    return {
        currencies: state.currencies
    }
};

function CurrencySelect(props: CurrencySelectProps) {
    const { currencies, formControlProps, extended, ...selectProps } = props;
    return (
        <FormControl {...formControlProps}>
            <InputLabel id="currency-label">Currency</InputLabel>
            <Select labelId="currency-label" {...selectProps}>
                {extended ?
                    Object.keys(currencies).map(symbol => <MenuItem key={symbol} value={symbol}>({symbol}) {currencies[symbol].name_plural}</MenuItem>)
                    :
                    Object.keys(currencies).map(symbol => <MenuItem key={symbol} value={symbol}>{symbol}</MenuItem>)
                }
            </Select>
        </FormControl>
    );
}

export default connect(mapStateToProps)(CurrencySelect);
