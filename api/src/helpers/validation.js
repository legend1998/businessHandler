const phone = require('phone');

function isValidNumber(value, minValue = 0, maxValue = Infinity) {
    return !!value && Number(value) >= minValue && Number(value) <= maxValue;
}

module.exports = {
    isValidName(value) {
        const regex = /^[A-zÀ-ú-'& ]+$/;
        return regex.test(value) && String(value).length <= 50;
    },
    isValidEmail(value) {
        const regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
        return regex.test(value) && String(value).length <= 250;
    },
    isValidPassword(value) {
        const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/;
        return regex.test(value) && String(value).length >= 8 && String(value).length <= 50;
    },
    isValidString(value, maxSize) {
        return !!value && String(value).length <= maxSize;
    },
    isValidNumber,
    isValidEnum(value, allowedValues) {
        return allowedValues.includes(value);
    },
    isValidURL(value) {
        const regex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
        return regex.test(value) && value.length <= 300;
    },
    isValidPrice(value) {
        return isValidNumber(value);
    },
    isValidQuantity(value) {
        return isValidNumber(value);
    },
    formatPhoneNumber(value) {
        const [formattedPhone] = phone(String(value));
        return formattedPhone;
    }
};
