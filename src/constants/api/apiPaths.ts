type PathKeys =
  | 'baseUrl'
  | 'baseSystemUrl'
  | 'baseConfigUrl'
  | 'getAllRoles'
  | 'createRole'
  | 'updateRole'
  | 'deleteRole'
  | 'login'
  | 'logout'
  | 'getProfile'
  | 'getUsers'
  | 'createUser'
  | 'updateUser'
  | 'blockUser'
  | 'deleteUser'
  | 'getRoles'
  | 'getAllPermissions'
  | 'baseUserUrl'
  | 'baseAdminUrl'
  | 'getAllSession'
  | 'revokeSession'
  | 'getAllLogs'
  | 'getLogEvents'
  | 'setLogEvents'
  | 'getSystemTree'
  | 'getById'
  | 'setList'
  | 'setOne'
  | 'getAllRoutes'
  | 'getModules'
  | 'deleteModule'
  | 'createUpdateService'
  | 'deleteService'
  | 'getAllService'
  | 'getServiceById'
  | 'getServicesByDomainId'
  | 'createUpdateApplication'
  | 'deleteApplication'
  | 'getApplicationById'
  | 'getAllApplications'
  | 'getApplicationsByServiceId'
  | 'createToken'
  | 'getTokensByAppId'
  | 'revokeTokens'
  | 'revokeTokensForApp'
  | 'getConfigsByModuleId'
  | 'getConfigById'
  | 'getAllVersions'
  | 'createUpdateConfig'
  | 'deleteVersion'
  | 'deleteConfig'
  | 'markConfigAsActive'
  | 'getUI'
  | 'getByModuleId'
  | 'changePassword'

export const apiPaths: Record<PathKeys, string> = {
  baseUrl: '/api/kkd-configuration-service',
  baseAdminUrl: '/api/admin',
  baseUserUrl: '/api/admin/user',
  baseSystemUrl: '/api/system',
  baseConfigUrl: '/api/config',
  // ======= ROLES ======
  getAllRoles: '/role/all',
  createRole: '/role/create',
  updateRole: '/role/update',
  deleteRole: '/role/delete',
  // ======= AUTH ======
  login: '/api/admin/auth/login',
  logout: '/api/admin/auth/logout',
  // ======= PROFILE ======
  getProfile: '/api/admin/user/get_profile',
  getUI: '/api/admin/user/get_design',
  changePassword: '/api/admin/user/change_password',
  // ======= USERS ======
  getUsers: '/get_users',
  createUser: '/create_user',
  updateUser: '/update_user',
  blockUser: '/block_user',
  deleteUser: '/delete_user',
  getRoles: '/get_roles',
  getAllPermissions: '/get_permissions',
  // ======= SESSIONS ======
  getAllSession: '/session/all',
  revokeSession: '/session/revoke',
  // ======= LOGS ======
  getAllLogs: '/log/all',
  getLogEvents: '/log/events',
  setLogEvents: '/log/set_events',
  // ======= APPLICATIONS ======
  getSystemTree: '/application/get_system_tree',
  getAllApplications: '/application/get_applications',
  createUpdateApplication: '/application/create_update_application',
  getApplicationsByServiceId: '/application/get_applications_by_service_id',
  deleteApplication: '/application/delete_applications',
  getApplicationById: '/application/get_application_by_id',
  // ======= ACCESS_LIST ======
  getById: '/access_list/get_by_id',
  setList: '/access_list/set_list',
  setOne: '/access_list/set_one',
  getAllRoutes: '/routing/get_routes',
  // ======= MODULES ======
  getModules: '/module/get_modules_info',
  deleteModule: '/module/delete_module',
  getByModuleId: '/schema/get_by_module_id',
  // ======= SERVICE ======
  getServiceById: '/service/get_service_by_id',
  getAllService: '/service/get_service',
  deleteService: '/service/delete_service',
  createUpdateService: '/service/create_update_service',
  getServicesByDomainId: '/service/get_services_by_domain_id',
  // ======= TOKENS ======
  createToken: '/token/create_token',
  getTokensByAppId: '/token/get_tokens_by_app_id',
  revokeTokens: '/token/revoke_tokens',
  revokeTokensForApp: '/token/revoke_tokens_for_app',
  // ======= CONFIGS ======
  getConfigsByModuleId: '/config/get_configs_by_module_id',
  getConfigById: '/config/get_config_by_id',
  getAllVersions: '/config/get_all_version',
  createUpdateConfig: '/config/create_update_config',
  deleteVersion: '/config/delete_version',
  deleteConfig: '/config/delete_config',
  markConfigAsActive: '/config/mark_config_as_active'
}
