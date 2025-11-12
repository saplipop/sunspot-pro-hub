import api from "./interceptor";
import { LoginRequest, SignupRequest } from "@/interfaces/authentication";


const login = async (credentials: LoginRequest): Promise<any> => {
  const response = await api.post<string>(`/login`, credentials);

  if (response.data) {
    localStorage.setItem("token", response.data);
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

const logout = (): void => {
  localStorage.removeItem("token");
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
};
