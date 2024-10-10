export function camelCaseToTitleCase (input: string) {
  const result = input ? input.replace(/([A-Z])/g, ' $1') : ''
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1)
  return finalResult
}
