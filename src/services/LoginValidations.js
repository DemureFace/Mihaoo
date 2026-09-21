import Validations from './Validations'

export default class LoginValidations {
  constructor(
    email,
    password,
  ) {
    this.email = email
    this.password = password
  }

  checkValidations() {
    const errors = {}

    if (
      !Validations.checkEmail(
        this.email,
      )
    ) {
      errors.email =
        'Invalid Email'
    }

    if (!this.password) {
      errors.password =
        'Password is required'
    }

    return errors
  }
}
