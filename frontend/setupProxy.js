const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log the request for debugging
        console.log('🔧 Proxying request:', req.method, req.path);
        console.log('🔧 Headers:', req.headers);
        
        // Ensure Authorization header is forwarded
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
          console.log('🔧 Authorization header forwarded');
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log the response for debugging
        console.log('🔧 Proxy response status:', proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error('🔧 Proxy error:', err);
      }
    })
  );
  
  // Also proxy socket.io connections
  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      ws: true
    })
  );
};
