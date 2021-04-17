import React, { forwardRef, useImperativeHandle, useState } from 'react';
// @ts-ignore
import MuiPhoneNumber from 'material-ui-phone-number';
import phone from 'phone';
import { BaseTextFieldProps } from '@material-ui/core/TextField/TextField';

interface PhoneInputProps extends BaseTextFieldProps {
    onChange?: (value: string) => void
}

const PhoneInput = forwardRef((props: PhoneInputProps, ref) => {
    // Props
    const { onChange, ...otherProps } = props;

    // State
    const [inputState, setInputState] = useState<string | undefined>(undefined);
    const [inputValue, setInputValue] = useState('');

    // Functions
    function updateInput(value: string) {
        setInputValue(value);
        validateInput(value);
        if (onChange)
            onChange(value);
    }

    function validateInput(value: string | undefined = undefined) {
        const [formattedPhone] = phone(value ? value : inputValue);
        if (!formattedPhone) {
            setInputState('Must be a valid phone number.');
            return false;
        }
        setInputState(undefined);
        return true;
    }

    function getValue() {
        return inputValue;
    }

    function setValue(value: string) {
        setInputValue(value);
    }

    // Ref properties
    useImperativeHandle(ref, () => ({
        validate: () => validateInput(),
        value: () => getValue(),
        setValue: (value: string) => setValue(value)
    }));

    return (
        <MuiPhoneNumber
            defaultCountry="ca"
            label="Phone Number"
            error={inputState !== undefined}
            helperText={inputState}
            onChange={(value: string) => updateInput(value)}
            value={inputValue}
            {...otherProps} />
    );
});

export default PhoneInput;
