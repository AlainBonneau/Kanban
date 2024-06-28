// Le fichier de configuration qui charge les variables d'environnement directement depuis le fichier `.env.test` (d'autres méthodes sont possibles)

import { resolve } from "node:path";
import { cwd } from "node:process";
import { config } from "dotenv";

// Load env files
config({ path: resolve(cwd(), '.env.test') });

