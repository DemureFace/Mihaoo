export default class Validations {
  static checkEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
  }

  static minLength(value, minLength) {
    return String(value).trim().length >= minLength;
  }
}
