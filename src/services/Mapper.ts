import { DbHelper } from '../helpers/DbClient.js'
import { Request, Response } from 'express';
import config from '../helpers/Config.js';
import { validateUrl } from '../helpers/UrlHandler.js';
import { generateShortURL } from '../helpers/Shortener.js';

export class MapperService {
  dbHelper = new DbHelper();
  db = this.dbHelper.getDb();

  public getOriginalUrl = async (shortUrl: string): Promise<string[]> => {
    const query = this.db.from('url.map').where('short_url', shortUrl).limit(1);
    const result = await query.pluck('orig_url');
    return result;
  }

  public getShortUrl = async (origUrl: string): any => {
    const result = this.db.get('SELECT short_url FROM urlmap WHERE orig_url = ?',[origUrl],this.dbHelper.handleQueryResult);
    return result[0].short_url;
  }

  /**
   * Creates a mapping row in the database
   * 
   * @param origUrl - original url string
   * @param shortUrl - shortened url key
   * @returns 
   */
  public createUrlMapping = async (origUrl: string, shortUrl: string) : Promise<number[]> => {
    const insertedRecord = await this.dbClient.insert({
      short_url: shortUrl,
      orig_url: origUrl
    }).into('url.map');
    return insertedRecord;
  }

  public expressReadUrl = async (req: Request, res: Response) : Promise<void> => {
    if(!req.body) {
      res.status(400).send({message: "Invalid request"});
    }
    const shortUrl = validateUrl(`${config.app.protocol}://${config.app.host}/${req.params.shortUrl}`);
    console.log(shortUrl);
    try {
      const result = await this.getOriginalUrl(shortUrl.href);
      if (result?.length > 0) {
        res.status(200).send({
          origUrl: result[0]
        });
        res.end();
        return;
      } else {
        const err = {
          message: `Your original URL was not found.`,
        };
        this.handleUserError(err, res);
        return;
      }
    } catch (err) {
      this.handleServiceError(err, res);
      return;
    }
  }
  
  public expressCreateUrl = async (req: Request, res: Response) : Promise<void> => {
    let origUrl: URL
    let body = req.body;
    console.log(`POST - CreateUrl - body:${JSON.stringify(req.body)}`);
    // Check that provided URL is valid
    try {
      origUrl = validateUrl(body.origUrl);
    } catch (err) {
      this.handleUserError(err, res)
      return;
    }

    console.debug(`Original URL validated: ${origUrl.href}`)

    // Check if we already have an entry for the url
    try {
      const result = await this.getShortUrl(origUrl.href);
      if (result?.length > 0) {
        console.log(`Short URL for "${origUrl.href}" already exists: ${result[0]}`)
        res.status(200).send({
          "shortUrl": result[0]
        });
        res.end();
        return;
      }
    } catch (err) {
      this.handleServiceError(err, res);
      return;
    }

    // Generate a short URL since no entries exist for the original, and make sure it's parsable
    let shortUrl: URL
    try {
      shortUrl = generateShortURL(origUrl.href);
    } catch (err) {
      this.handleServiceError(err, res);
      return;
    }

    console.debug(`Short URL generated: ${shortUrl.href}`)

    // Create a mapping entry in the db for the URL
    try {
      await this.createUrlMapping(origUrl.href, shortUrl.href);
      console.log(`Inserted new map to database: ${JSON.stringify({ "origUrl": origUrl.href, "shortUrl": shortUrl.href })}`);
      res.status(200).send({
        "shortUrl": shortUrl.href,
      });
      res.end();
      return;
    } catch (err) {
      this.handleServiceError(err, res);
      return;
    }
  }

  public handleServiceError = (err: any, res: Response) => {
    console.error(err);
    res.status(500).send({
      message: `An unexpected error occurred.`,
    });
    res.end();
  }

  public handleUserError = (err: any, res: Response) => {
    console.error(err);
    res.status(400).send({
      message: err.message,
    });
    res.end();
  }
}