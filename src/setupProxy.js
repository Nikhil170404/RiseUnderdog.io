const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Handle service worker with correct MIME type
  app.get('/serviceWorker.js', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    res.sendFile(process.cwd() + '/public/serviceWorker.js');
  });
};
