import os
import sys
import json
from argparse import ArgumentParser
from tornado import websocket, web, ioloop, gen
from pibot import control, vision


root_dir = os.path.dirname(os.path.realpath(__file__))
control_service = control.ControlService()
vision_service = vision.VisionService()

class VideoHandler(web.RequestHandler):
    connected = False

    @web.asynchronous
    @gen.coroutine
    def get(self):
        if VideoHandler.connected:
            self.send_status(406, "Not available")
            self.write("Video stream already in use")
            return

        VideoHandler.connected = True
        vision_service.start()
        loop = ioloop.IOLoop.current()
        boundary = "--boundarydonotcross"

        self.set_header('Cache-Control', 'no-cache, must-revalidate, max-age=0')
        self.set_header('Connection', 'close')
        self.set_header('Content-Type', 'multipart/x-mixed-replace;boundary=' + boundary)

        while VideoHandler.connected:
            img = vision_service.get_frame()
            self.write(boundary + '\r\n')
            self.write("Content-type: image/jpeg\r\n")
            self.write("Content-length: %s\r\n\r\n" % len(img))
            self.write(img)
            self.flush()
            yield gen.Task(loop.call_later, 0.01)

    def on_connection_close(self):
        VideoHandler.connected = False
        vision_service.stop()


class WebSocketHandler(websocket.WebSocketHandler):
    # Only allow one websocket at a time
    connected = False

    def on_message(self, message):
        msg = json.loads(message)
        control_service.handle_rpc_msg(msg)

    def check_origin(self, origin):
        return not WebSocketHandler.connected

    def open(self):
        WebSocketHandler.connected = True

    def on_close(self):
        WebSocketHandler.connected = False


def start_server(port, root_dir):
    app = web.Application([
        (r'/ws', WebSocketHandler),
        (r'/video', VideoHandler),
        (r'/(.*)', web.StaticFileHandler, {
            'path': root_dir,
            'default_filename': 'index.html'
        }),
    ], debug=True)
    app.listen(port)
    ioloop.IOLoop.instance().start()


def parse_args(args=None):
    parser = ArgumentParser(description=('Start pibot server'))
    parser.add_argument(
        '-p', '--port', type=int, default=80,
        help='Port on which to run server.')
    return parser.parse_args(args)


def main(root_dir, args=None):
    args = parse_args(args)
    os.chdir(root_dir)
    print('Starting pibot server on port {}'.format(args.port))
    start_server(args.port, root_dir)


if __name__ == '__main__':
    sys.exit(main(root_dir))