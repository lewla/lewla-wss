import { type BaseAction } from '../base.js'
import { ConnectedAction } from './connected.js'
import { RegisterAction } from './register.js'
import { AuthAction } from './auth.js'
import { PingAction } from './ping.js'
import { LoginAction } from './login.js'
import { MessageAction } from './message.js'

export const actions = new Map<string, typeof BaseAction>([
    [ConnectedAction.identifier, ConnectedAction],
    [RegisterAction.identifier, RegisterAction],
    [AuthAction.identifier, AuthAction],
    [PingAction.identifier, PingAction],
    [LoginAction.identifier, LoginAction],
    [MessageAction.identifier, MessageAction],
])
