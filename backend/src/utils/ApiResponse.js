// WHY: Consistent JSON shape across all endpoints.
// Every success response looks the same — easier for frontend to handle.
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
      this.statusCode = statusCode;
      this.success    = statusCode < 400;
      this.message    = message;
      this.data       = data;
    }
  }
  
  module.exports = ApiResponse;