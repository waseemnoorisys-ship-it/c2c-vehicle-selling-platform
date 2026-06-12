import api from "./axios";

export const registerApi = (data) => api.post("/auth/register", data);

export const verifyEmailApi = (data) => api.post("/auth/verify-email", data);

export const resendOtpApi = (data) => api.post("/auth/resend-otp", data);

export const loginApi = (data) => api.post("/auth/login", data);

export const refreshTokenApi = (data) =>
  api.post("/auth/refresh-token", data);

export const logoutApi = (data) => api.post("/auth/logout", data);

export const forgotPasswordApi = (data) =>
  api.post("/auth/forgot-password", data);

export const verifyResetOtpApi = (data) =>
  api.post("/auth/verify-reset-otp", data);

export const resetPasswordApi = (data) =>
  api.post("/auth/reset-password", data);