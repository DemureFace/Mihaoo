import api from './api'
import { createDevelopmentClient } from '@/modules/development/development.client.js'
import { createDevelopmentBuilderClient } from '@/modules/development/development.builder.client.js'
import { createDevelopmentImportClient } from '@/modules/development/development.import.client.js'
import { createDevelopmentTemplateClient } from '@/modules/development/development.template.client.js'

export const DEVELOPMENT_API_READY = import.meta.env.VITE_DEVELOPMENT_API_READY === 'true'
export const DEVELOPMENT_BUILDER_API_READY =
  import.meta.env.VITE_DEVELOPMENT_BUILDER_API_READY === 'true'
export const DEVELOPMENT_IMPORT_API_READY =
  import.meta.env.VITE_DEVELOPMENT_IMPORT_API_READY === 'true'
export const DEVELOPMENT_TEMPLATES_API_READY =
  import.meta.env.VITE_DEVELOPMENT_TEMPLATES_API_READY === 'true'

export const developmentApi = createDevelopmentClient(api, {
  enabled: DEVELOPMENT_API_READY,
})

export const developmentBuilderApi = createDevelopmentBuilderClient(api, {
  enabled: DEVELOPMENT_BUILDER_API_READY,
})

export const developmentImportApi = createDevelopmentImportClient(api, {
  enabled: DEVELOPMENT_IMPORT_API_READY,
})

export const developmentTemplateApi = createDevelopmentTemplateClient(api, {
  enabled: DEVELOPMENT_TEMPLATES_API_READY,
})
