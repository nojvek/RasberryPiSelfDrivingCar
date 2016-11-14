"use strict";
window["require"] = (module) => window[module];
const preact_1 = require('preact');
class AppState {
    constructor() {
        // 0 - straight, -1 = left, 1 = right
        this.steeringAngle = 0;
        // 0 - stop, 1 - full
        this.speed = 0;
    }
}
class AppView extends preact_1.Component {
    constructor() {
        super();
        this.state = new AppState();
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    onGasPedalMouseDown(ev) {
        const startY = ev.screenY;
        const maxY = window.innerHeight;
        const onMouseMove = (ev) => {
            this.state.speed = (startY - ev.screenY) / maxY;
            this.setState(null);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", () => {
            this.state.speed = 0;
            this.setState(null);
            document.removeEventListener("mousemove", onMouseMove);
        });
    }
    render(props, state) {
        const assetsDir = "assets";
        const appStyle = {
            position: "relative",
            overflow: "hidden",
        };
        const cameraStyle = {
            width: "100vw",
            height: "100vh",
            backgroundColor: "#ccc"
        };
        const steeringWheelStyle = {
            position: "absolute",
            bottom: 50,
            left: 50,
            backgroundImage: `url(${assetsDir}/steeringWheel.png)`,
            backgroundSize: "cover",
            width: 100,
            height: 100,
            transform: `rotate(${state.steeringAngle * 90}deg)`,
        };
        const gasPedalStyle = Object.assign({}, steeringWheelStyle, {
            right: 50,
            left: null,
            width: 110,
            backgroundImage: `url(${assetsDir}/gasPedal.png)`,
            transform: `translate(0, ${state.speed * -window.innerHeight}px)`,
        });
        return (preact.createElement("div", {class: 'appView', style: appStyle}, 
            preact.createElement("div", {style: cameraStyle}), 
            preact.createElement("div", {style: steeringWheelStyle}), 
            preact.createElement("div", {style: gasPedalStyle, ref: el => this.gasPedalElem = el, onMouseDown: this.onGasPedalMouseDown.bind(this)})));
    }
}
// render an instance of Clock into <body>:
window.addEventListener("DOMContentLoaded", () => {
    preact_1.render(preact.createElement(AppView, null), document.body);
});
