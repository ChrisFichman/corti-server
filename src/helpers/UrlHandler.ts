/**
 * Creates a urlObject and returns it if the url string is parsable
 * 
 * @param urlString  - url string to check
 * @param hostToCheck - Optional - will check that the hostname matches the provided host
 * @returns
 */
export const validateUrl = (urlString : string, hostToCheck? : string) : URL | never => {
  // This will check the url is valid/parsable
  const url = new URL(urlString,hostToCheck);
  // custom checks for URL validity here
  return url;
}
