//import {Client} from 'noice-json-rpc'

export interface PiBotClient {
    onRadarDistance(handler: (params: {distance: number}) => void): void;
    setSteeringAngle(params: {angle: number}): void
    setThrottle(params: {throttle: number}): void
    setChillPill(params: {value: boolean}): void
}

const ws = new WebSocket(`ws://${location.host}`)

export const rpc: PiBotClient = {
    setSteeringAngle(params) {
        ws.send(JSON.stringify({method: "setSteeringAngle", params}))
    },
    setThrottle(params) {
        ws.send(JSON.stringify({method: "setThrottle", params}))
    },
    setChillPill(params) {
        ws.send(JSON.stringify({method: "setChillPill", params}))
    },
    onRadarDistance(handler) {

    }
}

//export const rpc:PiBotClient = new Client(<any>new WebSocket(location.host), {logConsole: true}).api(true)

