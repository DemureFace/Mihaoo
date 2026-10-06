function readStoredUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user && typeof user === 'object' && !Array.isArray(user) ? user : null
  } catch {
    return null
  }
}

export default {
  user: readStoredUser(),
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
}
