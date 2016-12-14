define("app", ["require", "exports", "preact"], function (require, exports, preact_1) {
    "use strict";
    class AppState {
        constructor() {
            // 0 - straight, -1 = left, 1 = right
            this.steeringAngle = 0;
            // 0 - stop, 1 - full
            this.speed = 0;
            // Distance in cm of front radar
            this.frontRadarDistance = 100;
        }
    }
    class AppView extends preact_1.Component {
        constructor() {
            super();
            this.state = new AppState();
        }
        componentDidMount() {
            window.addEventListener("deviceorientation", (ev) => {
                this.state.steeringAngle = (ev.alpha / 180);
                this.setState(null);
            });
        }
        componentWillUnmount() {
        }
        onGasPedalMouseDown(ev) {
            const startY = ev.screenY || ev.targetTouches[0].screenY;
            const maxY = window.innerHeight;
            const onMouseMove = (ev) => {
                const yNow = ev.screenY || ev.targetTouches[0].screenY;
                this.state.speed = (startY - yNow) / maxY;
                this.setState(null);
                ev.preventDefault();
            };
            const onMouseUp = () => {
                this.state.speed = 0;
                this.setState(null);
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("touchmove", onMouseMove);
            };
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("touchmove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
            document.addEventListener("touchend", onMouseUp);
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
                transform: `rotate(${state.steeringAngle * 180}deg)`,
            };
            const gasPedalStyle = Object.assign({}, steeringWheelStyle, {
                right: 50,
                left: null,
                width: 110,
                backgroundImage: `url(${assetsDir}/gasPedal.png)`,
                transform: `translate(0, ${state.speed * -window.innerHeight}px)`,
            });
            return (preact_1.h("div", { class: 'appView', style: appStyle },
                preact_1.h("div", { style: cameraStyle }),
                preact_1.h("div", { style: steeringWheelStyle }),
                preact_1.h("div", { style: gasPedalStyle, ref: el => this.gasPedalElem = el, onTouchStart: this.onGasPedalMouseDown.bind(this), onMouseDown: this.onGasPedalMouseDown.bind(this) })));
        }
    }
    // render an instance of Clock into <body>:
    window.addEventListener("DOMContentLoaded", () => {
        preact_1.render(preact_1.h(AppView, null), document.body);
    });
});
