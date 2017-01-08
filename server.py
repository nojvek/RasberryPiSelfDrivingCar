import os
import sys
import json
from argparse import ArgumentParser
from tornado import websocket, web, ioloop
from picar import control, vision


root_dir = os.path.dirname(os.path.realpath(__file__))
controlService = control.ControlService()


class WebSocketHandler(websocket.WebSocketHandler):
    # Only allow one websocket at a time
    ws_client = None

    def on_message(self, message):
        msg = json.loads(message)
        controlService.handle_rpc_msg(msg)

    def check_origin(self, origin):
        return WebSocketHandler.ws_client == None

    def open(self):
        if not WebSocketHandler.ws_client:
            WebSocketHandler.ws_client = self

    def on_close(self):
        WebSocketHandler.ws_client = None


def start_server(port, root_dir):
    app = web.Application([
        (r'/ws', WebSocketHandler),
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