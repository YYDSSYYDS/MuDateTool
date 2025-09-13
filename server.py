#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import http.server
import socketserver
import webbrowser
import os
import sys

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头部以允许跨域请求
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def start_server(port=8000):
    """启动HTTP服务器"""
    try:
        with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
            print(f"🚀 道具查询系统服务器已启动")
            print(f"📍 服务器地址: http://localhost:{port}")
            print(f"📁 服务目录: {os.getcwd()}")
            print(f"🌐 正在自动打开浏览器...")
            print(f"⏹️  按 Ctrl+C 停止服务器")
            print("-" * 50)
            
            # 自动打开浏览器
            webbrowser.open(f'http://localhost:{port}')
            
            # 启动服务器
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n🛑 服务器已停止")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ 端口 {port} 已被占用，尝试使用端口 {port + 1}")
            start_server(port + 1)
        else:
            print(f"❌ 启动服务器失败: {e}")
            sys.exit(1)

if __name__ == "__main__":
    # 检查必要文件是否存在
    required_files = ['index.html', 'script.js', 'ItemList.xml']
    missing_files = [f for f in required_files if not os.path.exists(f)]
    
    if missing_files:
        print("❌ 缺少必要文件:")
        for file in missing_files:
            print(f"   - {file}")
        print("\n请确保所有文件都在当前目录中")
        sys.exit(1)
    
    print("✅ 所有必要文件检查完成")
    start_server()