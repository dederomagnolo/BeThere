const isEmailValid = (email) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(email);
};

const isPasswordValid = (password) => {
    return password !== "" && password && password.length === 10;
};

const isPhoneValid = (phoneNumber) => {
    return phoneNumber.length === 9;
}

const isDDDValid = (ddd) => {
    return ddd.length === 2;
}

const allowOnlyNumbers = (input) => {
    const reg = /^([0-9]{1,100})+$/;
    if(!reg.test(input)) {
        return input.replace(/(\D)/g, '').replace(/^0+/, '');
    }
    return input;
}

const formatPhone = (phoneNumber) => {
    const removeCountryCode = phoneNumber.length === 13 ? phoneNumber.substring(2, phoneNumber.length) : phoneNumber;
    const parenthesis = removeCountryCode.replace(/^(\d{2})(\d)/g,"($1) $2");
    const hyphenated = parenthesis.replace(/(\d)(\d{4})$/,"$1-$2"); 
    return hyphenated; 
}

const excludeMathChars = (e) => {
    const invalidChars = ["-","+","e",];    
    
    if (invalidChars.includes(e.key)) {
        return e.preventDefault();
    }
    return;
}

export {
    isEmailValid,
    isPasswordValid,
    allowOnlyNumbers,
    isPhoneValid,
    isDDDValid,
    formatPhone,
    excludeMathChars
};
