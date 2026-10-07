import api from './api'
import { createDevelopmentClient } from '@/modules/development/development.client.js'

// Enable only AFTER the contract and server ACL have passed integration tests.
export const DEVELOPMENT_API_READY = import.meta.env.VITE_DEVELOPMENT_API_READY === 'true'
export const developmentApi = createDevelopmentClient(api, { enabled: DEVELOPMENT_API_READY })
