import api from "./interceptor";
import { LoginRequest, SignupRequest } from "@/interfaces/authentication";


const login = async (credentials: LoginRequest): Promise<any> => {
  const response = await api.post<any>(`/login`, credentials);

  if (response.data) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("userId", response.data.user.id);
    localStorage.setItem("isAdmin", response.data?.roles?.includes('admin'));
  }
  return response.data;
};

const myRoles = async (): Promise<any> => {
  const response = await api.get<string[]>(`/my-roles`);
  return response.data;
};

const signup = async (userData: SignupRequest): Promise<any> => {
  const response = await api.post<any>(`/signup`, userData);
  return response.data;
};

const registerEmployee = async (userData: SignupRequest): Promise<any> => {
  const response = await api.post<SignupRequest>(`/register-employee`, userData);
  return response.data;
};

const logout = (): void => {
  localStorage.removeItem("token");
    localStorage.removeItem("userId");
  localStorage.removeItem("isAdmin");
};

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export default {
  login,
  signup,
  logout,
  getToken,
  myRoles,
  registerEmployee
};
