// lib/auth.ts
import { jwtDecode } from "jwt-decode"

export function getCurrentUser() {
  const token = localStorage.getItem("access_token")
  if (!token) return null

  return jwtDecode<{ sub: string; role: string }>(token)
}