const ID_TOKEN_KEY = 'id_token' as string

export const getToken = (): string | null => {
  return window.localStorage.getItem(ID_TOKEN_KEY)
}

export const saveToken = (token: string): void => {
  window.localStorage.setItem(ID_TOKEN_KEY, token)
}

export const destroyToken = (): void => {
  window.localStorage.removeItem(ID_TOKEN_KEY)
}

export default { getToken, saveToken, destroyToken }
