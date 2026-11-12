const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateNIK = (nik) => {
    return /^\d{16}$/.test(nik);
};

const validatePhone = (phone) => {
    return /^[0-9+\s-]{10,15}$/.test(phone);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

const validateCoordinates = (lat, lng) => {
    if (lat !== undefined && (lat < -90 || lat > 90)) return false;
    if (lng !== undefined && (lng < -180 || lng > 180)) return false;
    return true;
};

module.exports = {
    validateEmail,
    validateNIK,
    validatePhone,
    validatePassword,
    validateCoordinates,
};