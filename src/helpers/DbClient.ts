import sqlite3, { Database } from 'sqlite3';

export class DbHelper {
  constructor(){}
  public getDb(dbFile:string = './urlmap.db') : Database {
    return new sqlite3.Database(dbFile);
  }
  public handleQueryResult(error:Error, row:any) : any {
    if(error) {
      console.error(error);
      throw error;
    } else {
      return row;
    }
  }
}

