import { type BaseAction } from '../base.js'
import { ConnectedAction } from './connected.js'
import { RegisterAction } from './register.js'
import { AuthAction } from './auth.js'
import { PingAction } from './ping.js'
import { LoginAction } from './login.js'
import { MessageAction } from './message.js'
import { VoiceConnectAction } from './voiceconnect.js'
import { RTCCreateSendTransportAction } from './rtccreatesendtransport.js'
import { RTCCreateReceiveTransportAction } from './rtccreatereceivetransport.js'
import { RTCTransportConnectAction } from './rtctransportconnect.js'
import { RTCTransportProduceAction } from './rtctransportproduce.js'
import { RTCTransportConsumeAction } from './rtctransportconsume.js'
import { RTCGetProducersAction } from './rtcgetproducers.js'

export const actions = new Map<string, typeof BaseAction>([
    [ConnectedAction.identifier, ConnectedAction],
    [RegisterAction.identifier, RegisterAction],
    [AuthAction.identifier, AuthAction],
    [PingAction.identifier, PingAction],
    [LoginAction.identifier, LoginAction],
    [MessageAction.identifier, MessageAction],
    [VoiceConnectAction.identifier, VoiceConnectAction],
    [RTCCreateSendTransportAction.identifier, RTCCreateSendTransportAction],
    [RTCCreateReceiveTransportAction.identifier, RTCCreateReceiveTransportAction],
    [RTCTransportConnectAction.identifier, RTCTransportConnectAction],
    [RTCTransportProduceAction.identifier, RTCTransportProduceAction],
    [RTCTransportConsumeAction.identifier, RTCTransportConsumeAction],
    [RTCGetProducersAction.identifier, RTCGetProducersAction],
])
