export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_HTML_PATTERN = "(?=.*[A-Za-z])(?=.*\\d).{8,}";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const getNameValidationError = (value: string) => {
  if (!value.trim()) {
    return "Full name is required.";
  }

  if (value.trim().length < 2) {
    return "Enter a valid full name.";
  }

  return null;
};

export const getEmailValidationError = (value: string) => {
  const normalizedEmail = normalizeEmail(value);

  if (!normalizedEmail) {
    return "Email is required.";
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return "Enter a valid email address.";
  }

  return null;
};

export const getBirthDateValidationError = (value: string) => {
  if (!value.trim()) {
    return "Birth date is required.";
  }

  const birthDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return "Enter a valid birth date.";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (birthDate > today) {
    return "Birth date cannot be in the future.";
  }

  return null;
};

export const getOptionalBirthDateValidationError = (value: string) => {
  if (!value.trim()) {
    return null;
  }

  return getBirthDateValidationError(value);
};

export const getPasswordValidationError = (value: string) => {
  if (!value) {
    return "Password is required.";
  }

  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "Use both letters and numbers.";
  }

  return null;
};

export const getOptionalPasswordValidationError = (value: string) => {
  if (!value) {
    return null;
  }

  return getPasswordValidationError(value);
};
