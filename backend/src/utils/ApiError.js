// WHY custom error class: lets us attach statusCode to any thrown error
// so the global error handler can respond with the right HTTP status.
class ApiError extends Error {
    constructor(statusCode, message, errors = []) {
      super(message);
      this.statusCode = statusCode;
      this.errors     = errors;
      this.isOperational = true; // distinguish from unexpected crashes
    }
  }
  
  module.exports = ApiError;