import { type BaseAction } from './base.js'
import { MemberConnectedAction } from './connect.js'

export const actions = new Map<string, typeof BaseAction>([
    [MemberConnectedAction.identifier, MemberConnectedAction],
])
