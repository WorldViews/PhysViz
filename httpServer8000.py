
import SimpleHTTPServer
import SocketServer

PORT = 8000

bases = {"images", "C:"}
class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    pass

httpd = SocketServer.TCPServer(("", PORT), MyHandler)

print "serving HTTP at port", PORT
httpd.serve_forever()
