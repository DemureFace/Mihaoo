import Validations from './Validations'

export default class SignupValidations {
  constructor(email, password) {
    this.email = email
    this.password = password
  }

  checkValidations() {
    const errors = {}

    if (!Validations.checkEmail(this.email)) {
      errors.email = 'Invalid Email'
    }

    if (!this.password || this.password.length < 8) {
      errors.password = 'Password must contain at least 8 characters'

      return errors
    }

    const hasLatinLetter = /[A-Za-z]/.test(this.password)

    const specialCharacters = `!@#$%^&*()_+-={}[]|;:'",.<>/?~\`\\`

    const hasSpecial = [...this.password].some((character) => specialCharacters.includes(character))

    const onlyAllowedCharacters = [...this.password].every(
      (character) => /[A-Za-z0-9]/.test(character) || specialCharacters.includes(character),
    )

    if (!hasLatinLetter) {
      errors.password = 'Password must contain at least one Latin letter'
    } else if (!hasSpecial) {
      errors.password = 'Password must contain at least one special character'
    } else if (!onlyAllowedCharacters) {
      errors.password = 'Password can contain only Latin letters, numbers and special characters'
    }

    return errors
  }

  static getErrorMessageFromCode(errorCode) {
    switch (errorCode) {
      case 'EMAIL_EXISTS':
        return 'Email already exists'
      case 'EMAIL_NOT_FOUND':
        return 'Email Not Found'
      case 'INVALID_PASSWORD':
        return 'Invalid Password'
      default:
        return 'Unexpected error occurred. Please try again'
    }
  }
}
