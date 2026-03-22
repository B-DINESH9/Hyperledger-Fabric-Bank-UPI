const winston = require('winston');

// Create a logger instance (mirrors server.js settings)
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'blockchain-upi-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

function sanitizeBody(body = {}) {
  const clone = { ...body };
  const sensitive = ['password', 'newPassword', 'currentPassword', 'token'];
  for (const k of sensitive) {
    if (k in clone) clone[k] = '[REDACTED]';
  }
  return clone;
}

const errorHandler = (err, req, res, next) => {
  const requestId = req.requestId || null;
  const path = req.originalUrl;
  const method = req.method;
  const ip = req.ip || req.connection?.remoteAddress;
  const user = req.user ? { upiID: req.user.upiID, role: req.user.role } : undefined;

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  const details = err.details;

  const msgLower = (err.message || '').toLowerCase();

  // Map known error patterns (case-insensitive)
  if (err.name === 'ValidationError') {
    status = 400; message = 'Validation Error';
  } else if (err.name === 'JsonWebTokenError') {
    status = 401; message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    status = 401; message = 'Token expired';
  } else if (err.code === 'ENOTFOUND') {
    status = 503; message = 'Service unavailable';
  } else if (msgLower.includes('insufficient balance')) {
    status = 400; message = 'Insufficient balance';
  } else if (msgLower.includes('device verification failed')) {
    status = 400; message = 'Device verification failed';
  } else if (msgLower.includes('fraud detected')) {
    status = 400; message = 'Transaction blocked due to fraud detection';
  }

  // Log with context
  logger.error('Request error', {
    requestId,
    status,
    message: err.message,
    stack: err.stack,
    path,
    method,
    ip,
    user,
    params: req.params,
    query: req.query,
    body: sanitizeBody(req.body),
    headers: {
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for']
    }
  });

  // Send error response
  res.status(status).json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      path,
      method,
      requestId,
      ...(details && { details })
    }
  });
};

module.exports = {
  errorHandler
};
