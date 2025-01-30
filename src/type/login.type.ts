export interface LoginRequest {
  email: string
  password: string
}
export interface LoginResponse {
  expired: string
  headerName: string
  token: string
}
