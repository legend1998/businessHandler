import React from 'react';

const validationRules = {
    required: (value: string) => !!value || 'Required.',
    validateMinLength: (length: number) => (value: string) => value.length >= length || `Must be at least ${length} characters.`,
    validateMaxLength: (length: number) => (value: string) => value.length <= length || `Must be at most ${length} characters.`,
    validateLowercaseLetters: (value: string) => /[a-z]/.test(value) || `Must contain at least one lowercase letter.`,
    validateUppercaseLetters: (value: string) => /[A-Z]/.test(value) || `Must contain at least one uppercase letter.`,
    validateSpecialCharacters: (value: string) => /[$&+,:;=?@#|'<>.\-^*()%![\]{}]/.test(value) || `Must contain at least one special character.`,
    validateNumbers: (value: string) => /[0-9]/.test(value) || `Must contain at least one number.`,
    validateOnlyNumbers: (value: string) => {
        const numberValue = Number(value)
        if (!isFinite(numberValue) || isNaN(numberValue))
            return `Must be a number.`;
        return true;
    },
    validateOnlyLetters: (value: string) => /^[a-zA-Z ]+$/.test(value) || `Must contain only letters and spaces.`,
    validateEmail: (value: string) => /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value) || 'Invalid email.',
    validateURL: (value: string) => /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]+$/.test(value) || 'Invalid URL'
};

export default validationRules;

export function validateForm(refs: React.MutableRefObject<any>[]) {
    let flag = true;
    for (const ref of refs) {
        // @ts-ignore
        const validField = ref.current && ref.current.validate && ref.current.validate();
        if (!validField)
            flag = false;
    }
    return flag;
}
