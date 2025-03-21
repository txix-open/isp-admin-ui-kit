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
  application: 'application', //applications_group
  connections: 'connections', //modules
  configurations: 'configurations', //modules
  allVersions: ':configId/all_versions',
  configEditor: 'configEditor', //modules
  variables: '/variables'
}
