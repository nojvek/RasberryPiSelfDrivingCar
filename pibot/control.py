from rrb3 import *

robot = RRB3(battery_voltage=12,motor_voltage=10)
robot.set_led1(1)

class ControlService:
    def __init__(self):
        self.angle = 0
        self.throttle = 0
        self.robot = robot

    def handle_rpc_msg(self, msg):
        method = msg['method']
        params = msg['params']

        if method == 'setThrottle':
            self.throttle = params['throttle']
            self.update_robot()

        if method == 'setSteeringAngle':
            self.angle = params['angle']
            self.update_robot()

    def update_robot(self):
        throttle = self.throttle
        angle = self.angle
        absThrottle = abs(throttle)

        # Get right/left power from throttle and angle
        steerThrottle = (1 - abs(angle)) * absThrottle
        if angle < 0:
            right_power = absThrottle
            left_power = steerThrottle
        else:
            left_power = absThrottle
            right_power = steerThrottle

        # Get direction from throttle sign
        if throttle < 0: direction = 1
        else: direction = 0

        # Clamp the power
        if right_power > 1: right_power = 1
        elif right_power < 0: right_power = 0
        if left_power > 1: left_power = 1
        elif left_power < 0: left_power = 0

        print("set_motors", direction, right_power, left_power)
        self.robot.set_motors(right_power, direction, left_power, direction)
