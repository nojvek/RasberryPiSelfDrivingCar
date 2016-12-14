window["require"] = (module: string) => window[module]

import {render, Component} from 'preact'

class AppState {
    // 0 - straight, -1 = left, 1 = right
    steeringAngle: number = 0

    // 0 - stop, 1 - full
    speed: number = 0
}


class AppView extends Component<never, AppState> {
    state: AppState

    private gasPedalElem: Element

    constructor() {
        super()
        this.state = new AppState()
    }

    componentDidMount() {
        window.addEventListener("deviceorientation", (ev: DeviceOrientationEvent) => {
            this.state.steeringAngle = (ev.alpha / 180)
            this.setState(null)
        })
    }

    componentWillUnmount() {
    }

    onGasPedalMouseDown(ev: MouseEvent) {
        const startY = ev.screenY || event.targetTouches[0].screenY
        const maxY = window.innerHeight

        const onMouseMove = (ev: MouseEvent) => {
            const yNow = event.targetTouches[0].screenY
            this.state.speed = (startY - yNow)/ maxY
            this.setState(null)
            ev.preventDefault()
        }

        const onMouseUp = () => {
            this.state.speed = 0
            this.setState(null)
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("touchmove", onMouseMove)
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("touchmove", onMouseMove)

        document.addEventListener("mouseup", onMouseUp)
        document.addEventListener("touchend", onMouseUp)
    }

    render(props, state: AppState) {
        const assetsDir = "assets"
        const appStyle = {
            position: "relative",
            overflow: "hidden",
        }

        const cameraStyle = {
            width: "100vw",
            height: "100vh",
            backgroundColor: "#ccc"
        }

        const steeringWheelStyle = {
            position: "absolute",
            bottom: 50,
            left: 50,
            backgroundImage: `url(${assetsDir}/steeringWheel.png)`,
            backgroundSize: "cover",
            width: 100,
            height: 100,
            transform: `rotate(${state.steeringAngle * 180}deg)`,
        }

        const gasPedalStyle = Object.assign({}, steeringWheelStyle, {
            right: 50,
            left: null,
            width: 110,
            backgroundImage: `url(${assetsDir}/gasPedal.png)`,
            transform: `translate(0, ${state.speed * -window.innerHeight}px)`,
        })

        return (
            <div class='appView' style={appStyle}>
                <div style={cameraStyle}></div>
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

// render an instance of Clock into <body>:
window.addEventListener("DOMContentLoaded", () => {
    render(<AppView />, document.body)
})
