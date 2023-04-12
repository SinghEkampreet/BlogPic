//Capitalizing first letter of class name by convention
class HttpError extends Error {
  constructor(message, code) {
    super(message); //Passes message to Error class's constructor
    this.code = code; //Initializes the code property on the new object
  }
}

module.exports = HttpError;
