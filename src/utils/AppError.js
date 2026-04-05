class AppError extends Error {
    constructor(message = 'Internal Server Error', statusCode = 500, details = null) {
      super(message);
      this.statusCode = statusCode;
      this.details = details;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  
      Error.captureStackTrace?.(this, this.constructor);
    }
  
    static badRequest(message = 'Bad Request', details = null) {
      return new AppError(message, 400, details);
    }
  
    static unauthorized(message = 'Unauthorized') {
      return new AppError(message, 401);
    }
  
    static forbidden(message = 'Forbidden') {
      return new AppError(message, 403);
    }
  
    static notFound(message = 'Not Found') {
      return new AppError(message, 404);
    }
  
    static conflict(message = 'Conflict') {
      return new AppError(message, 409);
    }
  
    static tooManyRequests(message = 'Too Many Requests') {
      return new AppError(message, 429);
    }
  }
  
  export default AppError;