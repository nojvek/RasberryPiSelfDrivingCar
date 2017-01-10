import {h, Component} from 'preact'
import {appState} from './appState'
import {rpc} from './rpcService'


interface UITouchEvent extends MouseEvent {
    targetTouches: { pageX: number; pageY: number; screenX: number, screenY: number }[];
}

export class AppView extends Component<never, any> {
    private gasPedalElem: Element

    constructor() {
        super()
    }

    componentDidMount() {
        window.addEventListener("deviceorientation", (ev: DeviceOrientationEvent) => {
            let angle = ev.beta // from 0 - 30 = 0 to 1, 330 - 360 = -1 to 0
            if (angle > 180) angle -= 180 // we need from -180 to 180.
            angle = angle / 15 // 30 = 1
            if (angle > 1) angle = 1
            if (angle < -1) angle = -1 // cap between -1 and 1

            appState.steeringAngle = angle

            if (appState.throttle !== 0) {
                rpc.setSteeringAngle({angle})
            }

            this.setState(null)
        })
    }

    onGasPedalMouseDown(ev: UITouchEvent) {
        const startY = ev.screenY || ev.targetTouches[0].screenY
        const maxY = window.innerHeight * 0.6

        const onMouseMove = (ev: UITouchEvent) => {
            const yNow = ev.screenY || ev.targetTouches[0].screenY
            appState.throttle = (startY - yNow)/ maxY
            this.setState(null)
            rpc.setThrottle({throttle: appState.throttle})
            ev.preventDefault()
        }

        const onMouseUp = () => {
            appState.throttle = 0
            this.setState(null)
            rpc.setThrottle({throttle: appState.throttle})
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("touchmove", onMouseMove)
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("touchmove", onMouseMove)

        document.addEventListener("mouseup", onMouseUp)
        document.addEventListener("touchend", onMouseUp)

        ev.preventDefault()
    }

    render() {
        const assetsDir = "assets"
        const appStyle = {
            position: "relative",
            overflow: "hidden",
        }

        const cameraBgStyle = {
            width: "100vw",
            height: "100vh",
            backgroundColor: "#ccc"
        }

        const cameraStyle = {
            width: 640,
            height: 480,
            display: "block",
            margin: "auto"
        }

        const steeringWheelStyle = {
            position: "absolute",
            bottom: 150,
            left: 50,
            backgroundImage: `url(${assetsDir}/steeringWheel.png)`,
            backgroundSize: "cover",
            width: 100,
            height: 100,
            transform: `rotate(${appState.steeringAngle * 90}deg)`,
        }

        const gasPedalStyle = Object.assign({}, steeringWheelStyle, {
            right: 50,
            left: null,
            width: 110,
            backgroundImage: `url(${assetsDir}/gasPedal.png)`,
            transform: `translate(0, ${appState.throttle * -window.innerHeight}px)`,
        })

        return (
            <div class='appView' style={appStyle}>
                <div style={{position: 'absolute'}}>Steering: {Math.round(appState.steeringAngle * 100)} Speed: {Math.round(appState.throttle * 100)} </div>
                <div style={cameraBgStyle}>
                    <img style={cameraStyle} src="/video"></img>
                </div>
                <div style={steeringWheelStyle}></div>
                <div style={gasPedalStyle}
                    ref={el => this.gasPedalElem = el}
                    onTouchStart={this.onGasPedalMouseDown.bind(this)}
                    onMouseDown={this.onGasPedalMouseDown.bind(this)}>
                </div>
            </div>
        )
    }
}