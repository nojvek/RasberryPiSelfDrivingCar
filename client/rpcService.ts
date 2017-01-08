//import {Client} from 'noice-json-rpc'

const ws = new WebSocket(`ws://${location.host}/ws`)
const debounceInterval = 20 //ms
let lastSendTime = 0


const sendMessage = (method:string, params: any, debounce = false) => {
    const msgStr = JSON.stringify({method, params})
    if (!debounce) {
        ws.send(msgStr);
    }
    else {
        const curTime = new Date().getTime();
        if ((curTime - lastSendTime) > debounceInterval) {
            ws.send(msgStr)
            lastSendTime = curTime
        }
    }
}

export interface PiBotClient {
    onRadarDistance(handler: (params: {distance: number}) => void): void;
    setSteeringAngle(params: {angle: number}): void
    setThrottle(params: {throttle: number}): void
    setChillPill(params: {value: boolean}): void
}

export const rpc: PiBotClient = {
    setSteeringAngle(params) {
        sendMessage("setSteeringAngle", params, true)
    },
    setThrottle(params) {
        sendMessage("setThrottle", params, true)
    },
    setChillPill(params) {
        sendMessage("setChillPill", params)
    },
    onRadarDistance(handler) {

    }
}
