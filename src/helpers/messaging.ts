import { type WebSocket } from 'ws'
import { ErrorAction } from '../actions/outgoing/error.js'
import { SuccessAction } from '../actions/outgoing/success.js'

export const sendError = (target: WebSocket, message: string): void => {
    const action = new ErrorAction(target, { data: { message } })
    action.send(target)
}

export const sendSuccess = (target: WebSocket, message: string): void => {
    const action = new SuccessAction(target, { data: { message } })
    action.send(target)
}
