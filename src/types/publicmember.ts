import { type Member } from '../db/entity/member.js'

export type PublicMember = Omit<Member, 'password' | 'email_address' | 'messages'>
