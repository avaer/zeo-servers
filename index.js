const http = require('http');
// const httpServerPlus = require('http-server-plus');

const ws = require('ws');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  autoRewrite: true,
  protocolRewrite: true,
});

const PORTS = [1, 1024];

const _recurse = (i = PORTS[0]) => {
  console.log(i);
  if (i < PORTS[1]) {
    const server = http.createServer((req, res) => {
      const host = req.headers['host'] || '';
      console.log('proxy web', host);
      const match = host.match(/^(.+?)\.([0-9]+?)\.servers\.zeovr.io$/);
      if (match) {
        const target = match[1];
        const port = match[2];
        proxy.web(req, res, {
          target: 'http://' + target + ':' + port,
        });
      } else {
        res.statusCode = 404;
        res.end(http.STATUS_CODES[404] + '\n');
      }
    });
    // const server = httpServerPlus.create(_request);
    server.on('upgrade', (req, socket, head) => {
      const host = req.headers['host'] || '';
      console.log('proxy ws', host);
      const match = host.match(/^(.+?)\.([0-9]+?)\.servers\.zeovr.io$/);
      if (match) {
        const target = match[1];
        const port = match[2];
        proxy.ws(req, socket, head, {
          target: 'ws://' + target + ':' + port,
        });
      } else {
        socket.close();
      }
    });
    server.on('error', err => {
      console.warn(err);

      _recurse(i + 1);
    });
    server.listen(i, () => {
      _recurse(i + 1);
    });
  }
};
_recurse();
