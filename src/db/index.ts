import { drizzle } from 'drizzle-orm/neon-http';
import {config} from "../core/config.js";
import * as schema from "./schema/index.js";

export const db = drizzle(config.databaseUrl, { schema });
