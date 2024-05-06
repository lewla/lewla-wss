import { type BaseAction } from './base.js'
import { MemberConnectedAction } from './connect.js'
import { MemberRegisterAction } from './register.js'
import { AuthAction } from './auth.js'
import { PingAction } from './ping.js'
import { MemberLoginAction } from './login.js'

export const actions = new Map<string, typeof BaseAction>([
    [MemberConnectedAction.identifier, MemberConnectedAction],
    [MemberRegisterAction.identifier, MemberRegisterAction],
    [AuthAction.identifier, AuthAction],
    [PingAction.identifier, PingAction],
    [MemberLoginAction.identifier, MemberLoginAction],
])
