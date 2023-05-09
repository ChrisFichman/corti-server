import process from "process"
import dotenv from 'dotenv';
dotenv.config();

const APP_CONFIG = {
  host : "localhost:3000",
  port: 3000,
  protocol : "http"
}

const PORTAL_CONFIG = {
  host : "localhost:4200",
  port: 4200,
  protocol: "http"
}

export class GlobalConfig {
  app : AppConfig = APP_CONFIG;
  portal : AppConfig = PORTAL_CONFIG;
  constructor(cfg?:any){
    this.app = cfg.app || this.app;
    this.db = cfg.db || this.db;
    this.portal = cfg.portal || this.portal;
  }
}

export class AppConfig {
  host: string;
  port: number
  protocol : string;
  constructor(json : any = APP_CONFIG) {
    this.host = json.host;
    this.port = json.port
    this.protocol = json.protocol;
  }
}

const env = process.env.NODE_ENV || 'dev';

const dev : GlobalConfig = {
  app : new AppConfig(),
  portal : new AppConfig(PORTAL_CONFIG)
}

const configs : Map<string, GlobalConfig> = new Map(); 
configs.set('dev',dev);


const config : GlobalConfig = configs.get(env) || dev;

export default config;