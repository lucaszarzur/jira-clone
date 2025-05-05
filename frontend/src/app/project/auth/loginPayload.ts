export class LoginPayload {
  email: string;
  password: string;
  constructor() {
    this.email = 'lucas@lucaszarzur.dev';
    this.password = `${new Date().getTime()}`;
  }
}
