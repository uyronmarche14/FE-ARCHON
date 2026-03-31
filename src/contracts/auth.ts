export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
};

export type SignupRequest = {
  name: string;
  email: string;
  password: string;
};

export type SignupResponse = {
  user: AuthUser;
  accessToken: string;
};
