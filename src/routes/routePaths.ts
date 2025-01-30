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

export const routePaths: Record<RoutePaths, string> = {
  home: '/',
  error: '/error',
  notFound: '*',
  login: '/login',
  profile: '/profile',
  users: '/users',
  sessions: '/sessions',
  securityLog: '/securityLog',
  roles: '/roles',
  appAccess: '/appAccess',
  applicationsGroup: '/applications_group',
  configuration: '/configuration',
  modules: '/modules',
  application: 'application',
  connections: 'connections',
  configurations: 'configurations',
  allVersions: ':configId/all_versions',
  configEditor: 'configEditor'
}
