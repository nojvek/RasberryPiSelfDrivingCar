import cv2

class VisionService:
    def __init__(self):
        pass

    def start(self):
        self.capture = capture = cv2.VideoCapture(0)
        capture.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
        capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)
        capture.set(cv2.CAP_PROP_SATURATION, 0.2)
        print("video start")

    def stop(self):
        del(self.capture)
        print("video stop")


    def get_frame(self):
        result, camera = self.capture.read()
        if not result:
            result, camera = self.capture.read()

        img = cv2.cvtColor(camera, cv2.COLOR_RGB2GRAY)
        img = cv2.medianBlur(img, 5)
        #_, img = cv2.threshold(img, 110, 255, cv2.THRESH_BINARY)
        #img = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 301, 0)
        img = cv2.Canny(img, 100, 200)
        b,g,r = cv2.split(camera)
        g = cv2.addWeighted(g, 1, img, 1, 0)
        final = cv2.merge((b,g,r))
        _, jpg = cv2.imencode('.jpg', final)
        jpg = jpg.tostring()
        return jpg
