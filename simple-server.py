#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = 5175
web_dir = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

os.chdir(web_dir)

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"🚀 LeadFive development server starting...")
    print(f"📍 Serving at http://localhost:{PORT}")
    print(f"📁 Directory: {web_dir}")
    print(f"🌐 Open http://localhost:{PORT} in your browser")
    print(f"⚠️  This is a simple static server - for full functionality, use 'npm run dev'")
    print(f"🛑 Press Ctrl+C to stop")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped")
        sys.exit(0)
