import React, { ChangeEvent, forwardRef, useImperativeHandle, useState } from 'react';

import TextField, { BaseTextFieldProps } from '@material-ui/core/TextField';
import { InputBaseComponentProps } from '@material-ui/core/InputBase/InputBase';
import { InputProps as StandardInputProps } from '@material-ui/core/Input/Input';

interface TextInputProps extends BaseTextFieldProps {
    validationRules?: ((value: string) => string | boolean | undefined)[],
    onChange?: (value: string) => void,
    InputProps?: Partial<StandardInputProps>,
    inputProps?: InputBaseComponentProps
}

const TextInput = forwardRef((props: TextInputProps, ref) => {
    const {
        validationRules,
        onChange,
        ...otherProps
    } = props;

    // State
    const [inputState, setInputState] = useState<string | undefined>(undefined);
    const [inputValue, setInputValue] = useState('');

    // Functions
    function updateInput(event: ChangeEvent<any>) {
        setInputValue(event.target.value);
        validateInput(event.target.value);
        if (onChange)
            onChange(event.target.value);
    }

    function validateInput(value: string | undefined = undefined) {
        if (!validationRules)
            return true;
        for (const rule of validationRules) {
            const ruleEvaluation = rule(value ? value : inputValue);
            if (typeof ruleEvaluation === 'string') {
                setInputState(ruleEvaluation);
                return false;
            }
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
        <TextField error={inputState !== undefined}
                   helperText={inputState}
                   onChange={updateInput}
                   value={inputValue}
                   {...otherProps} />
    );
});

export default TextInput;
