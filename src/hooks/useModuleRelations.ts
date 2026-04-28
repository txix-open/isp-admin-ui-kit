import { useMemo } from 'react'

import { ModuleType } from '@pages/ModulesPage/module.type'

import { ModuleRelation } from '@type/ModuleRelation.type'

export const useModuleRelations = (modules: ModuleType[]): ModuleRelation[] => {
  return useMemo(() => {
    const moduleMap = new Map(modules.map((m) => [m.name, m]))
    const relationSet = new Set<string>()

    for (const module of modules) {
      for (const req of module.requiredModules ?? []) {
        const target = moduleMap.get(req.name)

        if (!target || target.id === module.id) {
          continue
        }

        relationSet.add(`${module.id}|${target.id}`)
      }
    }

    return Array.from(relationSet).map((key) => {
      const [source, target] = key.split('|')

      return { source, target }
    })
  }, [modules])
}
