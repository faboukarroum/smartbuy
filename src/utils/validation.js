export const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const isValidEmail = (email = '') => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
};

export const normalizePhone = (phone = '') => {
  const compactPhone = phone.trim().replace(/[\s().-]/g, '');

  if (!compactPhone) {
    return '';
  }

  if (compactPhone.startsWith('+')) {
    return `+${compactPhone.slice(1).replace(/\D/g, '')}`;
  }

  const digits = compactPhone.replace(/\D/g, '');

  if (/^0\d{7}$/.test(digits)) {
    return `+961${digits.slice(1)}`;
  }

  if (/^[1-9]\d{6,7}$/.test(digits)) {
    return `+961${digits}`;
  }

  return digits;
};

export const isValidPhone = (phone = '') => {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return false;
  }

  if (normalizedPhone.startsWith('+961')) {
    return /^\+961[1-9]\d{6,7}$/.test(normalizedPhone);
  }

  if (normalizedPhone.startsWith('+')) {
    return /^\+[1-9]\d{7,14}$/.test(normalizedPhone);
  }

  return /^\d{8,15}$/.test(normalizedPhone);
};
