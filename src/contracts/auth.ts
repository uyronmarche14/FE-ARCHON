export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  emailVerifiedAt: string | null;
};

export type AuthSessionResponse = {
  user: AuthUser;
  accessToken: string;
};

export type SignupRequest = {
  name: string;
  email: string;
  password: string;
  redirectPath?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupResponse = {
  message: string;
  email: string;
  emailVerificationRequired: true;
};

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

export type VerifyEmailConfirmRequest = {
  token: string;
};

export type VerifyEmailConfirmResponse = {
  verified: true;
  email: string;
  redirectPath: string | null;
};

export type ResendVerificationRequest = {
  email: string;
  redirectPath?: string;
};

export type ResendVerificationResponse = {
  message: string;
};
