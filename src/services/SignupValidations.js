// Password
if (!this.password || this.password.length < 8) {
  errors.password = 'Password must contain at least 8 characters'
  return errors
}

const hasUppercase = /[A-Z]/.test(this.password)
const hasLowercase = /[a-z]/.test(this.password)
const hasNumber = /\d/.test(this.password)
const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(this.password)

const onlyAllowedCharacters =
  /^[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/.test(
    this.password,
  )

if (!hasUppercase) {
  errors.password =
    'Password must contain at least one uppercase letter'
} else if (!hasLowercase) {
  errors.password =
    'Password must contain at least one lowercase letter'
} else if (!hasNumber) {
  errors.password =
    'Password must contain at least one number'
} else if (!hasSpecial) {
  errors.password =
    'Password must contain at least one special character'
} else if (!onlyAllowedCharacters) {
  errors.password =
    'Password can contain only Latin letters, numbers and special characters'
}
