import { type WebSocket } from 'ws'
import * as memberModel from '../db/member.js'
import { BaseAction } from './base.js'
import { verify } from 'argon2'
import jwt from 'jsonwebtoken'

interface MemberLoginData {
    username: string
    password: string
}

interface TokenData {
    token: string
}

export class MemberLoginAction extends BaseAction {
    public static identifier = 'memberlogin'
    public body: { data: MemberLoginData }

    constructor (sender: WebSocket, body: { data: MemberLoginData }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.username !== 'string' ||
            typeof this.body.data.password !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }

    public async handle (): Promise<void> {
        memberModel.getByUsername(this.body.data.username)
            .then((members) => {
                if (members.length > 0) {
                    verify(members[0].password, this.body.data.password).then((success) => {
                        if (success) {
                            const data: TokenData = {
                                token: jwt.sign({ member: members[0].id }, process.env.JWT_SECRET ?? '')
                            }

                            this.sender.send(JSON.stringify({ action: 'token', data }))
                            this.sender.send(JSON.stringify({ action: 'success', data: { message: 'Login successful' } }))
                        } else {
                            this.sender.send(JSON.stringify({ action: 'error', data: { message: 'Invalid username or password' } }))
                        }
                    }).catch((reason) => {
                        this.sender.send(JSON.stringify({ action: 'error', data: { message: 'Error occurred when logging in' } }))
                    })
                } else {
                    this.sender.send(JSON.stringify({ action: 'error', data: { message: 'Invalid username or password' } }))
                }
            })
            .catch((reason) => {
                console.error(reason)
            })
    }
}
