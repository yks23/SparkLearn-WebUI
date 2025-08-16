#!/usr/bin/env python3
"""
SparkLearn-WebUI 开发环境启动脚本
同时启动前端和后端服务器
"""

import subprocess
import sys
import time
import os
from pathlib import Path

def check_dependencies():
    """检查依赖是否安装"""
    print("🔍 检查Python依赖...")
    
    try:
        import flask
        import flask_cors
        print("✅ Flask依赖已安装")
    except ImportError as e:
        print(f"❌ Flask依赖缺失: {e}")
        print("请运行: pip install -r requirements.txt")
        return False
    
    # 检查submodule是否存在
    submodule_path = Path(__file__).parent / "submodule" / "SparkLearn"
    if not submodule_path.exists():
        print("❌ Submodule不存在，正在初始化...")
        try:
            subprocess.run(["git", "submodule", "update", "--init", "--recursive"], 
                         check=True, cwd=Path(__file__).parent)
            print("✅ Submodule初始化完成")
        except subprocess.CalledProcessError:
            print("❌ Submodule初始化失败")
            return False
    
    return True

def start_backend():
    """启动后端服务器"""
    print("🚀 启动后端服务器...")
    
    backend_process = subprocess.Popen([
        sys.executable, "backend_server.py"
    ], cwd=Path(__file__).parent)
    
    # 等待后端启动
    time.sleep(3)
    
    if backend_process.poll() is None:
        print("✅ 后端服务器已启动 (http://localhost:5001)")
        return backend_process
    else:
        print("❌ 后端服务器启动失败")
        return None

def start_frontend():
    """启动前端开发服务器"""
    print("🎨 启动前端开发服务器...")
    
    web_dir = Path(__file__).parent / "web"
    
    # 检查前端依赖
    if not (web_dir / "node_modules").exists():
        print("📦 安装前端依赖...")
        subprocess.run(["npm", "install"], cwd=web_dir, check=True)
    
    frontend_process = subprocess.Popen([
        "npm", "run", "dev"
    ], cwd=web_dir)
    
    # 等待前端启动
    time.sleep(5)
    
    if frontend_process.poll() is None:
        print("✅ 前端服务器已启动 (http://localhost:3000)")
        return frontend_process
    else:
        print("❌ 前端服务器启动失败")
        return None

def main():
    """主函数"""
    print("🌟 SparkLearn-WebUI 开发环境启动器")
    print("=" * 50)
    
    # 检查依赖
    if not check_dependencies():
        sys.exit(1)
    
    # 启动后端
    backend_process = start_backend()
    if not backend_process:
        sys.exit(1)
    
    # 启动前端
    frontend_process = start_frontend()
    if not frontend_process:
        backend_process.terminate()
        sys.exit(1)
    
    print("\n🎉 开发环境启动完成！")
    print("📱 前端: http://localhost:3000")
    print("🔧 后端: http://localhost:5001")
    print("📖 API文档: http://localhost:5001/api/")
    print("\n按 Ctrl+C 停止所有服务")
    
    try:
        # 等待用户中断
        while True:
            time.sleep(1)
            
            # 检查进程是否还在运行
            if backend_process.poll() is not None:
                print("❌ 后端服务器意外停止")
                break
            if frontend_process.poll() is not None:
                print("❌ 前端服务器意外停止")
                break
                
    except KeyboardInterrupt:
        print("\n🛑 正在停止服务...")
        
        # 停止进程
        if backend_process:
            backend_process.terminate()
            backend_process.wait()
        if frontend_process:
            frontend_process.terminate()
            frontend_process.wait()
        
        print("✅ 所有服务已停止")

if __name__ == "__main__":
    main()
