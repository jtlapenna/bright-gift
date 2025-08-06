/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Unauthorized access';
  } else if (err.code === 'PGRST116') {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    message = 'Resource not found';
  } else if (err.code === 'PGRST301') {
    statusCode = 409;
    errorCode = 'CONFLICT';
    message = 'Resource already exists';
  } else if (err.message && err.message.includes('rate limit')) {
    statusCode = 429;
    errorCode = 'RATE_LIMITED';
    message = 'Too many requests';
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err.message
      })
    }
  });
};

module.exports = { errorHandler }; 