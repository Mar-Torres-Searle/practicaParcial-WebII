import { Router } from "express";
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const router = Router();

// Node.js 20.11+ - forma moderna de obtener __dirname
//const __dirname = import.meta.dirname;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar automáticamente archivos *.routes.js
const routeFiles = readdirSync(__dirname).filter(
  (file) => file.endsWith('.routes.js')
);

for (const file of routeFiles) {
  const routeName = file.replace('.routes.js', '');

  const modulePath = pathToFileURL(join(__dirname, file)).href;
  const routeModule = await import(modulePath);

  router.use(`/${routeName}`, routeModule.default);
  console.log(`📍 Ruta cargada: /api/${routeName}`);
}

export default router;