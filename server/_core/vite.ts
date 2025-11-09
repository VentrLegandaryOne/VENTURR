import type { Express } from "express";
import type { Server } from "http";
import express from "express";
import path from "path";

/**
 * Setup Vite dev server for development mode
 */
export async function setupVite(app: Express, server: Server) {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const template = await vite.transformIndexHtml(url, `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Venturr</title>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="/client/src/main.tsx"></script>
          </body>
        </html>
      `);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

/**
 * Serve static files in production mode
 */
export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/client");
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

