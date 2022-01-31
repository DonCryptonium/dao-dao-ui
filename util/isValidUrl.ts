export function isValidUrl(url: string): boolean {
  if (url === '') {
    return true
  } else {
    const regex = /(https:)([/|.|\w|\s])*\.(?:jpg|gif|png|jpeg|svg)/
    return regex.test(url)
  }
}
