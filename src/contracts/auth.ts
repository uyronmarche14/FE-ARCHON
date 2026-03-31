export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
};

export type AuthSessionResponse = {
  user: AuthUser;
  accessToken: string;
};

export type SignupRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupResponse = AuthSessionResponse;

export type LoginResponse = AuthSessionResponse;

export type AuthMeResponse = {
  user: AuthUser;
};

export type AuthRefreshResponse = {
  accessToken: string;
};

export type LogoutResponse = {
  loggedOut: true;
};
