import api from './api'
import { createDevelopmentClient } from '@/modules/development/development.client.js'
import { createDevelopmentBuilderClient } from '@/modules/development/development.builder.client.js'
import { createDevelopmentImportClient } from '@/modules/development/development.import.client.js'
import { createDevelopmentTemplateClient } from '@/modules/development/development.template.client.js'
import { createLocalDevelopmentClients } from '@/modules/development/development.local.client.js'

export const DEVELOPMENT_BACKEND_READY = import.meta.env.VITE_DEVELOPMENT_API_READY === 'true'
export const DEVELOPMENT_STORAGE_MODE = DEVELOPMENT_BACKEND_READY ? 'backend' : 'local'
export const DEVELOPMENT_IS_LOCAL = DEVELOPMENT_STORAGE_MODE === 'local'

const remoteBuilderReady = import.meta.env.VITE_DEVELOPMENT_BUILDER_API_READY === 'true'
const remoteImportReady = import.meta.env.VITE_DEVELOPMENT_IMPORT_API_READY === 'true'
const remoteTemplatesReady = import.meta.env.VITE_DEVELOPMENT_TEMPLATES_API_READY === 'true'

// Development remains usable before the backend is ready. In local mode the same
// UI contracts are backed by user-scoped browser storage instead of HTTP.
export const DEVELOPMENT_API_READY = DEVELOPMENT_IS_LOCAL || DEVELOPMENT_BACKEND_READY
export const DEVELOPMENT_BUILDER_API_READY =
  DEVELOPMENT_IS_LOCAL || (DEVELOPMENT_BACKEND_READY && remoteBuilderReady)
export const DEVELOPMENT_IMPORT_API_READY =
  DEVELOPMENT_IS_LOCAL || (DEVELOPMENT_BACKEND_READY && remoteImportReady)
export const DEVELOPMENT_TEMPLATES_API_READY =
  DEVELOPMENT_IS_LOCAL || (DEVELOPMENT_BACKEND_READY && remoteTemplatesReady)
export const DEVELOPMENT_SHARING_READY = DEVELOPMENT_BACKEND_READY

const localClients = DEVELOPMENT_IS_LOCAL ? createLocalDevelopmentClients() : null

export const developmentApi = DEVELOPMENT_IS_LOCAL
  ? localClients.developmentApi
  : createDevelopmentClient(api, { enabled: DEVELOPMENT_BACKEND_READY })

export const developmentBuilderApi = DEVELOPMENT_IS_LOCAL
  ? localClients.developmentBuilderApi
  : createDevelopmentBuilderClient(api, { enabled: remoteBuilderReady })

export const developmentImportApi = DEVELOPMENT_IS_LOCAL
  ? localClients.developmentImportApi
  : createDevelopmentImportClient(api, { enabled: remoteImportReady })

export const developmentTemplateApi = DEVELOPMENT_IS_LOCAL
  ? localClients.developmentTemplateApi
  : createDevelopmentTemplateClient(api, { enabled: remoteTemplatesReady })
