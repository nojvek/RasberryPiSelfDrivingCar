"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
window["require"] = function (module) { return window[module]; };
var preact_1 = require('preact');
var AppState = (function () {
    function AppState() {
        // 0 - straight, -1 = left, 1 = right
        this.steeringAngle = 0;
        // 0 - stop, 1 - full
        this.speed = 0;
    }
    return AppState;
}());
var AppView = (function (_super) {
    __extends(AppView, _super);
    function AppView() {
        _super.call(this);
        this.state = new AppState();
    }
    AppView.prototype.componentDidMount = function () {
        var _this = this;
        window.addEventListener("deviceorientation", function (ev) {
            _this.state.steeringAngle = (ev.alpha / 180);
            _this.setState(null);
        });
    };
    AppView.prototype.componentWillUnmount = function () {
    };
    AppView.prototype.onGasPedalMouseDown = function (ev) {
        var _this = this;
        var startY = ev.screenY || event.targetTouches[0].screenY;
        var maxY = window.innerHeight;
        var onMouseMove = function (ev) {
            var yNow = event.targetTouches[0].screenY;
            _this.state.speed = (startY - yNow) / maxY;
            _this.setState(null);
            ev.preventDefault();
        };
        var onMouseUp = function () {
            _this.state.speed = 0;
            _this.setState(null);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("touchmove", onMouseMove);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("touchmove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("touchend", onMouseUp);
    };
    AppView.prototype.render = function (props, state) {
        var _this = this;
        var assetsDir = "assets";
        var appStyle = {
            position: "relative",
            overflow: "hidden",
        };
        var cameraStyle = {
            width: "100vw",
            height: "100vh",
            backgroundColor: "#ccc"
        };
        var steeringWheelStyle = {
            position: "absolute",
            bottom: 50,
            left: 50,
            backgroundImage: "url(" + assetsDir + "/steeringWheel.png)",
            backgroundSize: "cover",
            width: 100,
            height: 100,
            transform: "rotate(" + state.steeringAngle * 180 + "deg)",
        };
        var gasPedalStyle = Object.assign({}, steeringWheelStyle, {
            right: 50,
            left: null,
            width: 110,
            backgroundImage: "url(" + assetsDir + "/gasPedal.png)",
            transform: "translate(0, " + state.speed * -window.innerHeight + "px)",
        });
        return (preact.createElement("div", {class: 'appView', style: appStyle}, 
            preact.createElement("div", {style: cameraStyle}), 
            preact.createElement("div", {style: steeringWheelStyle}), 
            preact.createElement("div", {style: gasPedalStyle, ref: function (el) { return _this.gasPedalElem = el; }, onTouchStart: this.onGasPedalMouseDown.bind(this), onMouseDown: this.onGasPedalMouseDown.bind(this)})));
    };
    return AppView;
}(preact_1.Component));
// render an instance of Clock into <body>:
window.addEventListener("DOMContentLoaded", function () {
    preact_1.render(preact.createElement(AppView, null), document.body);
});
