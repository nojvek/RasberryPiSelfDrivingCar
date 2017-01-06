define("appState", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.appState = {
        // 0 - straight, -1 = left, 1 = right
        steeringAngle: 0,
        // 0 - stop, 1 - full
        speed: 0,
        // Distance in cm of front radar
        frontRadarDistance: 100
    };
});
define("appView", ["require", "exports", "preact", "appState"], function (require, exports, preact_1, appState_1) {
    "use strict";
    class AppView extends preact_1.Component {
        constructor() {
            super();
        }
        componentDidMount() {
            window.addEventListener("deviceorientation", (ev) => {
                let angle = ev.beta; // from 0 - 30 = 0 to 1, 330 - 360 = -1 to 0
                if (angle > 180)
                    angle -= 180; // we need from -180 to 180.
                angle = angle / 30; // 30 = 1
                if (angle > 1)
                    angle = 1;
                if (angle < -1)
                    angle = -1; // cap between -1 and 1
                appState_1.appState.steeringAngle = angle;
                this.setState(null);
            });
        }
        componentWillUnmount() {
        }
        onGasPedalMouseDown(ev) {
            const startY = ev.screenY || ev.targetTouches[0].screenY;
            const maxY = window.innerHeight * 0.8;
            const onMouseMove = (ev) => {
                const yNow = ev.screenY || ev.targetTouches[0].screenY;
                appState_1.appState.speed = (startY - yNow) / maxY;
                this.setState(null);
                ev.preventDefault();
            };
            const onMouseUp = () => {
                appState_1.appState.speed = 0;
                this.setState(null);
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("touchmove", onMouseMove);
            };
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("touchmove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
            document.addEventListener("touchend", onMouseUp);
            ev.preventDefault();
        }
        render() {
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
                transform: `rotate(${appState_1.appState.steeringAngle * 180}deg)`,
            };
            const gasPedalStyle = Object.assign({}, steeringWheelStyle, {
                right: 50,
                left: null,
                width: 110,
                backgroundImage: `url(${assetsDir}/gasPedal.png)`,
                transform: `translate(0, ${appState_1.appState.speed * -window.innerHeight}px)`,
            });
            return (preact_1.h("div", { class: 'appView', style: appStyle },
                preact_1.h("div", null,
                    "Steering: ",
                    Math.round(appState_1.appState.steeringAngle * 100),
                    " Speed: ",
                    Math.round(appState_1.appState.speed * 100),
                    " "),
                preact_1.h("div", { style: cameraStyle }),
                preact_1.h("div", { style: steeringWheelStyle }),
                preact_1.h("div", { style: gasPedalStyle, ref: el => this.gasPedalElem = el, onTouchStart: this.onGasPedalMouseDown.bind(this), onMouseDown: this.onGasPedalMouseDown.bind(this) })));
        }
    }
    exports.AppView = AppView;
});
define("main", ["require", "exports", "preact", "appView"], function (require, exports, preact_2, appView_1) {
    "use strict";
    preact_2.render(preact_2.h(appView_1.AppView, null), document.body);
});
