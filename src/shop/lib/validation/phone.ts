const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

export const RECEIVER_PHONE_VALIDATION_MESSAGE =
  "Enter a valid mobile number (+91 or 10 digits)";

/** Strip +91 / leading 0 and return up to 10 digit mobile number. */
export function normalizeIndianPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

export function isValidIndianPhone(input: string): boolean {
  return INDIAN_MOBILE_PATTERN.test(normalizeIndianPhone(input));
}
