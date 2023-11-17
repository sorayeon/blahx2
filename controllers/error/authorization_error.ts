import CustomServerError from './custom_server_error';

export default class AuthorizationError extends CustomServerError {
  constructor(message: string) {
    super({ statusCode: 401, message });
  }
}
