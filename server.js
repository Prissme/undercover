const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number.parseInt(process.env.PORT, 10) || 3000;
const root = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function sendFile(filePath, res) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Erreur serveur');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[extension] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const cleanPath = (req.url || '/').split('?')[0];
  const requestedPath = cleanPath === '/' ? '/index.html' : cleanPath;
  const normalizedPath = path.normalize(requestedPath).replace(/^\.\.(\/|\\|$)/, '');
  const filePath = path.join(root, normalizedPath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Accès refusé');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Fichier introuvable');
      return;
    }

    sendFile(filePath, res);
  });
});

server.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
