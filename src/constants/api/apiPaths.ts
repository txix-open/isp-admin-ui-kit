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
  | 'deleteList'
  | 'setOne'
  | 'getAllRoutes'
  | 'getModules'
  | 'deleteModule'
  | 'createUpdateService'
  | 'deleteService'
  | 'getAllService'
  | 'getServiceById'
  | 'getServicesByDomainId'
  | 'createApplication'
  | 'updateApplication'
  | 'deleteApplication'
  | 'getApplicationById'
  | 'getAllApplications'
  | 'getApplicationsByServiceId'
  | 'getApplicationGetApplicationByToken'
  | 'getNextAppId'
  | 'createToken'
  | 'getTokensByAppId'
  | 'revokeTokens'
  | 'revokeTokensForApp'
  | 'getConfigsByModuleId'
  | 'getConfigById'
  | 'getAllVersions'
  | 'createUpdateConfig'
  | 'updateConfigName'
  | 'deleteVersion'
  | 'deleteConfig'
  | 'markConfigAsActive'
  | 'getUI'
  | 'getByModuleId'
  | 'changePassword'
  | 'getAllVariables'
  | 'createVariable'
  | 'deleteVariable'
  | 'getVariableByName'
  | 'updateVariable'
  | 'upsertVariables'
  | 'createApplicationGroup'
  | 'deleteListApplicationGroup'
  | 'getAllApplicationGroup'
  | 'getByIdListApplicationGroup'
  | 'updateApplicationGroup'

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, '') || ''
const API_BASE_URL = `${BASE_URL}/api`
const apiWithBaseURL = (path: `/${string}`) => `${API_BASE_URL}${path}`

export const apiPaths: Record<PathKeys, string> = {
  baseUrl: apiWithBaseURL('/kkd-configuration-service'),
  baseAdminUrl: apiWithBaseURL('/admin'),
  baseUserUrl: apiWithBaseURL('/admin/user'),
  baseSystemUrl: apiWithBaseURL('/system'),
  baseConfigUrl: apiWithBaseURL('/config'),
  // ======= ROLES ======
  getAllRoles: '/role/all',
  createRole: '/role/create',
  updateRole: '/role/update',
  deleteRole: '/role/delete',
  // ======= AUTH ======
  login: apiWithBaseURL('/admin/auth/login'),
  logout: apiWithBaseURL('/admin/auth/logout'),
  // ======= PROFILE ======
  getProfile: apiWithBaseURL('/admin/user/get_profile'),
  getUI: apiWithBaseURL('/admin/user/get_design'),
  changePassword: apiWithBaseURL('/admin/user/change_password'),
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
  getAllApplications: '/application/get_all',
  createApplication: '/application/create_application',
  updateApplication: '/application/update_application',
  getApplicationsByServiceId: '/application/get_applications_by_service_id',
  deleteApplication: '/application/delete_applications',
  getApplicationById: '/application/get_application_by_id',
  getNextAppId: '/application/next_id',
  // ======= APPLICATION GROUP  ======
  createApplicationGroup: '/application_group/create',
  deleteListApplicationGroup: '/application_group/delete_list',
  getAllApplicationGroup: '/application_group/get_all',
  getByIdListApplicationGroup: '/application_group/get_by_id_list',
  updateApplicationGroup: '/application_group/update',
  getApplicationGetApplicationByToken: '/application/get_application_by_token',
  // ======= ACCESS_LIST ======
  getById: '/access_list/get_by_id',
  setList: '/access_list/set_list',
  setOne: '/access_list/set_one',
  getAllRoutes: '/routing/get_routes',
  deleteList: '/access_list/delete_list',
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
  updateConfigName: '/config/update_config_name',
  deleteVersion: '/config/delete_version',
  deleteConfig: '/config/delete_config',
  markConfigAsActive: '/config/mark_config_as_active',
  // ======= VARIABLES ======
  getAllVariables: '/variable/all',
  getVariableByName: '/variable/get_by_name',
  createVariable: '/variable/create',
  deleteVariable: '/variable/delete',
  updateVariable: '/variable/update',
  upsertVariables: '/variable/upsert'
}
