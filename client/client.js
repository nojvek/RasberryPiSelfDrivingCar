define("appState", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.appState = {
        // 0 - straight, -1 = left, 1 = right
        steeringAngle: 0,
        // 0 - stop, 1 - full
        throttle: 0,
        // Distance in cm of front radar
        frontRadarDistance: 100
    };
});
//import {Client} from 'noice-json-rpc'
define("rpcService", ["require", "exports"], function (require, exports) {
    "use strict";
    const ws = new WebSocket(`ws://${location.host}/ws`);
    const debounceInterval = 20; //ms
    let lastSendTime = 0;
    const sendMessage = (method, params, debounce = false) => {
        const msgStr = JSON.stringify({ method, params });
        if (!debounce) {
            ws.send(msgStr);
        }
        else {
            const curTime = new Date().getTime();
            if ((curTime - lastSendTime) > debounceInterval) {
                ws.send(msgStr);
                lastSendTime = curTime;
            }
        }
    };
    exports.rpc = {
        setSteeringAngle(params) {
            sendMessage("setSteeringAngle", params, true);
        },
        setThrottle(params) {
            sendMessage("setThrottle", params, true);
        },
        setChillPill(params) {
            sendMessage("setChillPill", params);
        },
        onRadarDistance(handler) {
        }
    };
});
define("appView", ["require", "exports", "preact", "appState", "rpcService"], function (require, exports, preact_1, appState_1, rpcService_1) {
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
                angle = angle / 15; // 30 = 1
                if (angle > 1)
                    angle = 1;
                if (angle < -1)
                    angle = -1; // cap between -1 and 1
                appState_1.appState.steeringAngle = angle;
                if (appState_1.appState.throttle !== 0) {
                    rpcService_1.rpc.setSteeringAngle({ angle });
                }
                this.setState(null);
            });
        }
        onGasPedalMouseDown(ev) {
            const startY = ev.screenY || ev.targetTouches[0].screenY;
            const maxY = window.innerHeight * 0.6;
            const onMouseMove = (ev) => {
                const yNow = ev.screenY || ev.targetTouches[0].screenY;
                appState_1.appState.throttle = (startY - yNow) / maxY;
                this.setState(null);
                rpcService_1.rpc.setThrottle({ throttle: appState_1.appState.throttle });
                ev.preventDefault();
            };
            const onMouseUp = () => {
                appState_1.appState.throttle = 0;
                this.setState(null);
                rpcService_1.rpc.setThrottle({ throttle: appState_1.appState.throttle });
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
            const cameraBgStyle = {
                width: "100vw",
                height: "100vh",
                backgroundColor: "#ccc"
            };
            const cameraStyle = {
                width: 640,
                height: 480,
                display: "block",
                margin: "auto"
            };
            const steeringWheelStyle = {
                position: "absolute",
                bottom: 150,
                left: 50,
                backgroundImage: `url(${assetsDir}/steeringWheel.png)`,
                backgroundSize: "cover",
                width: 100,
                height: 100,
                transform: `rotate(${appState_1.appState.steeringAngle * 90}deg)`,
            };
            const gasPedalStyle = Object.assign({}, steeringWheelStyle, {
                right: 50,
                left: null,
                width: 110,
                backgroundImage: `url(${assetsDir}/gasPedal.png)`,
                transform: `translate(0, ${appState_1.appState.throttle * -window.innerHeight}px)`,
            });
            return (preact_1.h("div", { class: 'appView', style: appStyle },
                preact_1.h("div", { style: { position: 'absolute' } },
                    "Steering: ",
                    Math.round(appState_1.appState.steeringAngle * 100),
                    " Speed: ",
                    Math.round(appState_1.appState.throttle * 100),
                    " "),
                preact_1.h("div", { style: cameraBgStyle },
                    preact_1.h("img", { style: cameraStyle, src: "/video" })),
                preact_1.h("div", { style: steeringWheelStyle }),
                preact_1.h("div", { style: gasPedalStyle, ref: el => this.gasPedalElem = el, onTouchStart: this.onGasPedalMouseDown.bind(this), onMouseDown: this.onGasPedalMouseDown.bind(this) })));
        }
    }
    exports.AppView = AppView;
});
define("main", ["require", "exports", "preact", "appView"], function (require, exports, preact_2, appView_1) {
    "use strict";
    const load = () => preact_2.render(preact_2.h(appView_1.AppView, null), document.body);
    // Safari fires DomContentLoaded too early
    if (document.body) {
        load();
    }
    else {
        document.addEventListener("DOMContentLoaded", load);
    }
});
