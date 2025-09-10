import { setupWorker } from 'msw/browser'
import { authHandlers } from './handlers/auth'

// 设置 MSW worker
export const worker = setupWorker(...authHandlers)
