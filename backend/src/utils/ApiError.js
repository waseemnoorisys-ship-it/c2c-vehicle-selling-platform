// WHY custom error class: lets us attach statusCode to any thrown error
// so the global error handler can respond with the right HTTP status.

class ApiError extends Error {
    constructor(statusCode, message, errors = []) {
      super(message);
      this.statusCode = statusCode;
      this.errors     = errors;
      //expected error[app ko crash nahi karta bas humein output error show karta hai] not a programing error
      //EXPECTED ERROR: email is invalid , password is incorrect 
      //UNEXPECTED ERROR:import is not defined , server is down , database is down ,var not defined etc
      this.isOperational = true; // distinguish from unexpected crashes
      //matlab isOperational true bole to expected error.
    }
  }
  
  module.exports = ApiError;