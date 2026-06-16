// WHY: Consistent JSON shape across all endpoints.
// Every success response looks the same — easier for frontend to handle.
//Every success response from your API looks identical:
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
      this.statusCode = statusCode;
      //status less than 400 like 200,201  are sucess
      //status greater than 400 like 400 ,401,404[not found ] are failure
      this.success    = statusCode < 400;
      this.message    = message;
      this.data       = data;
    }
  }
  
  module.exports = ApiResponse;