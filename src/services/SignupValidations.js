import Validations from './Validations'

export default class SignupValidations {
  constructor(email, password) {
    this.email = email
    this.password = password
  }

  checkValidations() {
    const errors = {}

    // Email
    if (!Validations.checkEmail(this.email)) {
      errors.email = 'Invalid Email'
    }

    // Password
    if (!this.password || this.password.length < 8) {
      errors.password = 'Password must contain at least 8 characters'
      return errors
    }

    // Hebrew characters
    const hasHebrew = /[\u0590-\u05FF]/u.test(this.password)

    // Special characters
    const hasSpecial =
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(
        this.password,
      )

    // Only Hebrew + special characters
    const onlyAllowedCharacters =
      /^[\u0590-\u05FF!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/u.test(
        this.password,
      )

    if (!hasHebrew) {
      errors.password =
        'Password must contain at least one Hebrew character'
    } else if (!hasSpecial) {
      errors.password =
        'Password must contain at least one special character'
    } else if (!onlyAllowedCharacters) {
      errors.password =
        'Password can contain only Hebrew characters and special characters'
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
