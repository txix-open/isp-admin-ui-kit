export interface GitMergeRequestType {
  credentialsName: string
  filePath: string
  hash?: string
  module: string
  tag?: string
  unsafe?: boolean
}

export interface MergeRequestType {
  config: Record<string, unknown>
  module: string
  unsafe?: boolean
}

export interface CredentialsInfoType {
  dirPath: string
  name: string
  repositoryUrl: string
}

export interface CredentialsType {
  dirPath?: string
  name: string
  repositoryUrl: string
  token: string
}

export interface UpdateCredentialsType {
  insertStruct: Partial<CredentialsType>
  name: string
}

export interface CredentialsDeleteRequestType {
  name: string
}

export interface CredentialsTokenRequestType {
  id: number
  token: string
}

export interface GitCommitsRequestType {
  credentialsName: string
}

export interface GitDirRequestType {
  credentialsName: string
}

export interface GitFileRequestType {
  credentialsName: string
  filePath: string
  hash?: string
  tag?: string
}

export interface CommitType {
  authorEmail: string
  authorName: string
  committedDate: string
  hash: string
  shortHash: string
  tags: string[]
  title: string
}
