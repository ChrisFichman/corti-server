import {Md5} from 'ts-md5';
import { validateUrl } from './UrlHandler.js';
import config from './Config.js'

export const encode = (str : string) : string => Buffer.from(str, 'binary').toString('base64url').slice(0,8);

export function generateShortURL(origUrl : string) : URL {
  const hashedUrl = Md5.hashStr(origUrl, true).toString();
  const shortUrlPath = encode(hashedUrl);
  return validateUrl(`${config.app.protocol}://${config.app.host}/${shortUrlPath}`);
}