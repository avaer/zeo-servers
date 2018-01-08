const http = require('http');
// const httpServerPlus = require('http-server-plus');

const ws = require('ws');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  autoRewrite: true,
  protocolRewrite: true,
});

const PORTS = [8000, 9000];

const _request = (req, res) => {
  const host = req.headers['host'] || '';
  const match = host.match(/^(.+)\.servers\.zeovr.io$/);
  if (match) {
    const target = match[1];
    proxy.web(req, res, {
      target: 'http://' + target,
    });
  } else {
    res.statusCode = 404;
    res.end(http.STATUS_CODES[404] + '\n');
  }
};
const _upgrade = (req, socket, head) => {
  const host = req.headers['host'] || '';
  const match = host.match(/^(.+)\.servers\.zeovr.io$/);
  if (match) {
    const target = match[1];
    proxy.ws(req, socket, head, {
      target: 'ws://' + target,
    });
  } else {
    socket.closr();
  }
};
const _recurse = (i = PORTS[0]) => {
  console.log(i);
  if (i < PORTS[1]) {
    const server = http.createServer(_request);
    // const server = httpServerPlus.create(_request);
    server.on('upgrade', _upgrade);
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
