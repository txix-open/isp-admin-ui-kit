import { build } from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'

const root = fileURLToPath(new URL('..', import.meta.url))
const output = path.resolve(
  process.argv[2] ?? path.join(tmpdir(), 'isp-layout-test')
)
mkdirSync(output, { recursive: true })
const uiKitSource = process.argv[3] ? path.resolve(process.argv[3]) : undefined

// The real layout and form components run with local fixtures. No service is imported.
const mocks = {
  redoc: `export const RedocStandalone = () => <div style={{ height: 3000 }}>Тестовая документация API</div>;`,
  './useSwaggerSpec': `export const useSwaggerSpec = () => ({ parsedSpec: {}, isLoading: false, ...window.layoutFixtures.queryStates.swagger });`,
  './useRedocEnhancements': `export const useRedocEnhancements = () => {};`,
  '@services/configService': `const mutation = () => [() => { throw new Error('Mutation disabled'); }, { isLoading: false }]; export default { useGetAllVersionQuery: () => ({ data: window.layoutFixtures.versions, ...window.layoutFixtures.queryStates.versions }), useGetConfigByIdQuery: () => ({ data: { name: 'Тестовая конфигурация', version: 1 } }), useDeleteVersionMutation: mutation, useCreateUpdateConfigMutation: mutation };`,
  '@services/accessListService': `const mutation = () => [() => { throw new Error('Mutation disabled'); }]; export default { useGetByIdQuery: () => ({ data: window.layoutFixtures.accessMethods, isSuccess: true }), useSetListMutation: mutation, useDeleteListMutation: mutation };`,
  '@services/routeService': `export default { useGetAllRoutesQuery: () => ({ data: window.layoutFixtures.accessRoutes, isSuccess: true }) };`,
  '@components/FlowDiagram/FlowDiagram': `export const FlowDiagram = () => <div style={{ height: 1600 }}>Тестовая область диаграммы</div>;`,
  '@services/applicationsGroupService': `export { applicationsGroupApi as default } from ${JSON.stringify(path.join(root, 'tests/application-service-fixtures.ts'))};`,
  '@services/applicationsService': `export { applicationsApi as default } from ${JSON.stringify(path.join(root, 'tests/application-service-fixtures.ts'))};`,
  '@services/tokensService': `export { tokensApi as default } from ${JSON.stringify(path.join(root, 'tests/application-service-fixtures.ts'))};`,
  '@hooks/useRole': `export default () => ({ hasPermission: (key) => !window.layoutFixtures.grantedPermissions || window.layoutFixtures.grantedPermissions.includes(key), role: 'test' })`,
  '@hooks/redux': `export const useAppDispatch = () => () => {}; export const useAppSelector = () => ({ status: 'resolved', profile: { firstName: 'Тест' } });`,
  '@stores/redusers/ActionCreators': `export const fetchProfile = () => ({ type: 'TEST' }); export const fetchUI = () => ({ type: 'TEST' });`,
  '@stores/redusers/ProfileSlice': `export const StateProfileStatus = { resolved: 'resolved', pending: 'pending', rejected: 'rejected', notInit: 'notInit' };`,
  '@widgets/Header': `export default () => <div style={{ padding: 12 }}>ISP · Тест</div>`,
  '@routes/ModuleGuard': `export default ({ children }) => children`,
  '@services/userService': `const mutation = () => [() => { throw new Error('Service calls are disabled in layout tests'); }, { isLoading: false }]; export default { useCreateUserMutation: mutation, useUpdateUserMutation: mutation, useBlockUserMutation: mutation, useDeleteUserMutation: mutation, useGetAllUsersQuery: (_, options) => ({ data: options?.skip ? undefined : window.layoutFixtures.users, isLoading: false, ...window.layoutFixtures.queryStates.users, refetch: () => {} }), useGetAllPermissionsQuery: () => ({ data: window.layoutFixtures.permissions, isLoading: false }) };`,
  '@services/roleService': `const mutation = () => [() => { throw new Error('Service calls are disabled in layout tests'); }]; export default { useGetAllRolesQuery: () => ({ data: window.layoutFixtures.roles, isLoading: false }), useCreateRoleMutation: mutation, useUpdateRoleMutation: mutation, useRemoveRoleMutation: mutation };`,
  '@services/modulesService': `export default { useGetModulesQuery: () => ({ data: window.layoutFixtures.modules, isLoading: false }), useGetRequiredModulesQuery: () => ({ data: [], isLoading: false, isFetching: false, isError: false, ...window.layoutFixtures.queryStates.map, refetch: () => ({ unwrap: () => Promise.resolve() }) }), useRemoveModuleMutation: () => [() => { throw new Error('Service calls are disabled in layout tests'); }] };`,
  '@services/variablesService': `const mutation = () => [() => { throw new Error('Service calls are disabled in layout tests'); }, { isLoading: false }]; export default { useGetAllVariablesQuery: (_, options) => { window.layoutFixtures.queryCalls.push({ service: 'variables', skip: options.skip }); return { data: options.skip ? undefined : Object.values(window.layoutFixtures.variables), isLoading: false, isFetching: false, ...window.layoutFixtures.queryStates.variables, refetch: () => { window.layoutFixtures.retried = 'variables'; } }; }, useGetVariableByNameQuery: (name, options) => ({ data: options.skip ? undefined : window.layoutFixtures.variables[name], isLoading: false }), useCreateVariableMutation: mutation, useUpdateVariableMutation: mutation, useDeleteVariableMutation: () => [mutation()[0], { isLoading: Boolean(window.layoutFixtures.removingName), originalArgs: window.layoutFixtures.removingName }] };`
}
for (const [service, hook, fixture] of [
  ['sessionService', 'useGetAllSessionsQuery', 'sessions'],
  ['securityLogService', 'useGetLogsPageQuery', 'logs']
]) {
  mocks[`@services/${service}`] = `
    export default {
      ${hook}: (args, options) => {
        window.layoutFixtures.queryCalls.push({ service: '${fixture}', args, skip: options.skip });
        const state = window.layoutFixtures.queryStates.${fixture} ?? {};
        const data = options.skip ? undefined : window.layoutFixtures.${fixture};
        return { data, currentData: data, isLoading: false, isFetching: false, ...state, refetch: () => { window.layoutFixtures.retried = '${fixture}'; } };
      },
      useRevokeSessionMutation: () => [() => { throw new Error('Mutations are disabled'); }, { isLoading: false }]
    };
  `
}
const result = await build({
  absWorkingDir: root,
  entryPoints: ['tests/layout.browser.tsx'],
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  jsx: 'automatic',
  alias: {
    react: path.join(root, 'node_modules/react'),
    'react-dom': path.join(root, 'node_modules/react-dom'),
    antd: path.join(root, 'node_modules/antd')
  },
  define: {
    'process.env.NODE_ENV': '"development"',
    'import.meta.env': '{"BASE_URL":"/"}'
  },
  loader: {
    '.svg': 'dataurl',
    '.png': 'dataurl',
    '.woff': 'dataurl',
    '.woff2': 'dataurl'
  },
  plugins: [
    {
      name: 'offline-layout-fixtures',
      setup(build) {
        if (uiKitSource) {
          build.onResolve({ filter: /^isp-ui-kit$/ }, () => ({
            path: 'ui-kit-menu-source',
            namespace: 'menu-source'
          }))
          build.onLoad({ filter: /.*/, namespace: 'menu-source' }, () => ({
            contents: `export * from ${JSON.stringify(path.join(root, 'node_modules/isp-ui-kit/dist/index.esm.js'))}; export { default as LayoutMenu } from ${JSON.stringify(path.join(uiKitSource, 'src/Layout/LayoutMenu/LayoutMenu.tsx'))};`,
            resolveDir: root,
            loader: 'js'
          }))
        }
        build.onResolve(
          { filter: /^@|^redoc$|^\.\/use(SwaggerSpec|RedocEnhancements)$/ },
          (args) =>
            mocks[args.path]
              ? { path: args.path, namespace: 'fixture' }
              : undefined
        )
        build.onLoad({ filter: /.*/, namespace: 'fixture' }, (args) => ({
          contents: mocks[args.path],
          resolveDir: root,
          loader: 'tsx'
        }))
        build.onLoad({ filter: /\.(scss|css)$/ }, (args) => {
          const css = args.path.endsWith('.scss')
            ? sass.compile(args.path, {
                loadPaths: [root],
                silenceDeprecations: ['legacy-js-api']
              }).css
            : readFileSync(args.path, 'utf8')
          return {
            contents: `const style = document.createElement('style'); style.textContent = ${JSON.stringify(css)}; document.head.append(style);`,
            loader: 'js'
          }
        })
      }
    }
  ]
})
const script = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script')
const assertions = readFileSync(
  path.join(root, 'tests/layout.assertions.js'),
  'utf8'
)
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'"><title>Тест лейаута · без API</title><style>*{box-sizing:border-box}html,body{margin:0;padding:0}</style></head><body><div id="root"></div><script>${script}\n${assertions}</script></body></html>`
const target = path.join(output, 'layout.html')
writeFileSync(target, html)
console.log(target)
