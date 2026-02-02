type RoutePaths =
  | 'home'
  | 'notFound'
  | 'error'
  | 'login'
  | 'profile'
  | 'users'
  | 'sessions'
  | 'securityLog'
  | 'roles'
  | 'appAccess'
  | 'applicationsGroup'
  | 'configuration'
  | 'modules'
  | 'application'
  | 'connections'
  | 'swagger'
  | 'configurations'
  | 'allVersions'
  | 'configEditor'
  | 'variables'

export const routePaths: Record<RoutePaths, string> = {
  home: '/',
  error: '/error',
  notFound: '*',
  login: '/login',
  profile: '/profile',
  users: '/users',
  sessions: '/sessions',
  securityLog: '/security_logs',
  roles: '/roles',
  appAccess: '/app_access',
  applicationsGroup: '/application_groups',
  configuration: '/configuration',
  modules: '/modules',
  application: 'application',
  connections: 'connections',
  swagger: 'swagger',
  configurations: 'configurations',
  allVersions: ':configId/all_versions',
  configEditor: 'configEditor',
  variables: '/variables'
}
