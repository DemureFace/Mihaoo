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

    const hasUppercase = /[A-Z]/.test(this.password)
    const hasLowercase = /[a-z]/.test(this.password)
    const hasNumber = /[0-9]/.test(this.password)

    const specialCharacters = `!@#$%^&*()_+-={}[]|;:'",.<>/?~\`\\`

    const hasSpecial = [...this.password].some((character) => specialCharacters.includes(character))

    const onlyAllowedCharacters = [...this.password].every(
      (character) => /[A-Za-z0-9]/.test(character) || specialCharacters.includes(character),
    )

    if (!hasUppercase) {
      errors.password = 'Password must contain at least one uppercase letter'
    } else if (!hasLowercase) {
      errors.password = 'Password must contain at least one lowercase letter'
    } else if (!hasNumber) {
      errors.password = 'Password must contain at least one number'
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
