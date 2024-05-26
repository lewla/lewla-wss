import { type WebSocket } from 'ws'
import * as memberModel from '../../db/member.js'
import { BaseAction } from '../base.js'
import { verify } from 'argon2'
import jwt from 'jsonwebtoken'
import { TokenAction } from '../outgoing/token.js'
import { sendError, sendSuccess } from '../../helpers/messaging.js'

interface LoginData {
    username: string
    password: string
}

export class LoginAction extends BaseAction {
    public static identifier = 'login'
    public body: { data: LoginData }

    constructor (sender: WebSocket, body: { data: LoginData }) {
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
                            const token = jwt.sign({ member: members[0].id }, process.env.JWT_SECRET ?? '')
                            const tokenAction = new TokenAction(this.sender, { data: { token } })
                            tokenAction.send(this.sender)

                            sendSuccess(this.sender, 'Login successful')
                        } else {
                            sendError(this.sender, 'Invalid username or password')
                        }
                    }).catch((reason) => {
                        sendError(this.sender, 'Error occurred when logging in')
                    })
                } else {
                    sendError(this.sender, 'Invalid username or password')
                }
            })
            .catch((reason) => {
                console.error(reason)
            })
    }
}
