export interface MSPError {
  details: Array<any>
  errorCode: string
  errorMessage: string
}

export interface LimitOffsetRequestType {
  limit: number
  offset: number
}
