#!/usr/bin/env python3
"""
SparkLearn-WebUI 开发环境启动脚本
为小白用户提供一键式环境配置和启动
"""

import subprocess
import sys
import time
import os
import signal
import socket
import platform
from pathlib import Path
from typing import Optional, Tuple

# 全局变量存储进程
backend_process: Optional[subprocess.Popen] = None
frontend_process: Optional[subprocess.Popen] = None

def check_port_available(port: int) -> bool:
    """检查端口是否可用"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', port))
            return True
    except OSError:
        return False

def show_welcome():
    """显示欢迎信息"""
    print("🌟 SparkLearn-WebUI 一键启动器")
    print("=" * 50)
    print("这个工具将帮助您：")
    print("1. 检测当前环境状态")
    print("2. 创建或切换Python虚拟环境")
    print("3. 选择是否安装缺失的依赖")
    print("4. 启动前端和后端服务器")
    print("=" * 50)

def detect_python_environment():
    """检测Python环境信息"""
    print("🔍 检测Python环境...")
    
    # 检测Python版本
    python_version = sys.version_info
    print(f"✅ Python版本: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    if python_version < (3, 8):
        print("❌ Python版本过低，需要Python 3.8或更高版本")
        print("请访问 https://python.org 下载最新版本")
        return False
    
    # 检测虚拟环境
    in_venv = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    if in_venv:
        print("✅ 检测到虚拟环境")
        env_name = os.path.basename(sys.prefix)
        print(f"   环境名称: {env_name}")
        print(f"   环境路径: {sys.prefix}")
    else:
        print("⚠️  未检测到虚拟环境")
        print("建议使用虚拟环境以避免依赖冲突")
    
    # 检测conda环境
    conda_env = os.environ.get('CONDA_DEFAULT_ENV')
    if conda_env:
        print(f"✅ 检测到conda环境: {conda_env}")
    
    return True, in_venv

def list_existing_environments():
    """列出现有的虚拟环境"""
    print("🔍 查找现有虚拟环境...")
    
    # 查找常见的虚拟环境位置
    env_locations = []
    
    # 当前目录下的venv文件夹
    current_venv = Path(__file__).parent / "venv"
    if current_venv.exists():
        env_locations.append(("当前目录", current_venv))
    
    # 用户目录下的虚拟环境
    home_dir = Path.home()
    common_env_dirs = [
        home_dir / ".virtualenvs",
        home_dir / "venvs", 
        home_dir / "envs",
        home_dir / ".conda" / "envs"
    ]
    
    for env_dir in common_env_dirs:
        if env_dir.exists():
            for env_path in env_dir.iterdir():
                if env_path.is_dir():
                    # 检查是否是虚拟环境
                    if (env_path / "bin" / "python").exists() or (env_path / "Scripts" / "python.exe").exists():
                        env_locations.append((env_dir.name, env_path))
    
    return env_locations

def create_virtual_environment():
    """创建新的虚拟环境"""
    print("🔧 创建新的虚拟环境...")
    
    # 询问环境名称
    env_name = input("请输入环境名称 (默认: sparklearn-env): ").strip()
    if not env_name:
        env_name = "sparklearn-env"
    
    # 询问环境位置
    print("选择环境位置:")
    print("1. 当前项目目录 (推荐)")
    print("2. 用户目录")
    print("3. 自定义路径")
    
    while True:
        choice = input("请选择 (1-3): ").strip()
        if choice == "1":
            env_path = Path(__file__).parent / env_name
            break
        elif choice == "2":
            env_path = Path.home() / ".virtualenvs" / env_name
            env_path.parent.mkdir(exist_ok=True)
            break
        elif choice == "3":
            custom_path = input("请输入完整路径: ").strip()
            env_path = Path(custom_path) / env_name
            env_path.parent.mkdir(parents=True, exist_ok=True)
            break
        else:
            print("请输入 1、2 或 3")
    
    try:
        print(f"正在创建虚拟环境: {env_path}")
        result = subprocess.run([
            sys.executable, "-m", "venv", str(env_path)
        ], check=True, capture_output=True, text=True)
        
        print("✅ 虚拟环境创建成功！")
        print(f"环境路径: {env_path}")
        
        # 询问是否立即激活
        if ask_user_choice("是否立即激活这个环境？"):
            activate_environment(env_path)
            return True
        else:
            print("请手动激活环境后重新运行此脚本")
            print(f"激活命令:")
            if platform.system() == "Windows":
                print(f"  {env_path}\\Scripts\\activate")
            else:
                print(f"  source {env_path}/bin/activate")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"❌ 创建虚拟环境失败: {e}")
        if e.stderr:
            print(f"错误信息: {e.stderr}")
        return False

def activate_environment(env_path):
    """激活虚拟环境"""
    print(f"🔄 激活虚拟环境: {env_path}")
    
    if platform.system() == "Windows":
        activate_script = env_path / "Scripts" / "activate.bat"
        python_exe = env_path / "Scripts" / "python.exe"
    else:
        activate_script = env_path / "bin" / "activate"
        python_exe = env_path / "bin" / "python"
    
    if not python_exe.exists():
        print(f"❌ 虚拟环境无效: {python_exe} 不存在")
        return False
    
    # 更新当前进程的Python解释器路径
    global sys
    sys.executable = str(python_exe)
    
    # 更新环境变量
    if platform.system() == "Windows":
        os.environ["VIRTUAL_ENV"] = str(env_path)
        os.environ["PATH"] = str(env_path / "Scripts") + os.pathsep + os.environ["PATH"]
    else:
        os.environ["VIRTUAL_ENV"] = str(env_path)
        os.environ["PATH"] = str(env_path / "bin") + os.pathsep + os.environ["PATH"]
    
    print("✅ 虚拟环境已激活")
    return True

def handle_environment_setup():
    """处理环境设置"""
    print("\n" + "=" * 50)
    print("🐍 Python环境设置")
    print("=" * 50)
    
    # 检测当前环境
    env_ok, in_venv = detect_python_environment()
    if not env_ok:
        return False
    
    # 如果已经在虚拟环境中，询问是否继续
    if in_venv:
        print("\n✅ 当前已在虚拟环境中")
        if ask_user_choice("是否继续使用当前环境？"):
            return True
    
    # 提供环境选项
    print("\n请选择操作:")
    print("1. 创建新的虚拟环境")
    print("2. 切换到现有虚拟环境")
    print("3. 继续使用当前环境")
    print("4. 退出")
    
    while True:
        choice = input("请选择 (1-4): ").strip()
        
        if choice == "1":
            # 创建新环境
            if create_virtual_environment():
                return True
            else:
                return False
                
        elif choice == "2":
            # 切换到现有环境
            env_locations = list_existing_environments()
            
            if not env_locations:
                print("❌ 未找到现有虚拟环境")
                if ask_user_choice("是否创建新环境？"):
                    return create_virtual_environment()
                else:
                    return False
            
            print("\n找到以下虚拟环境:")
            for i, (env_type, env_path) in enumerate(env_locations, 1):
                print(f"{i}. {env_path.name} ({env_type})")
            
            while True:
                try:
                    env_choice = int(input(f"请选择环境 (1-{len(env_locations)}): "))
                    if 1 <= env_choice <= len(env_locations):
                        selected_env = env_locations[env_choice - 1][1]
                        if activate_environment(selected_env):
                            return True
                        else:
                            return False
                    else:
                        print(f"请输入 1 到 {len(env_locations)} 之间的数字")
                except ValueError:
                    print("请输入有效的数字")
                    
        elif choice == "3":
            # 继续使用当前环境
            print("✅ 继续使用当前环境")
            return True
            
        elif choice == "4":
            # 退出
            print("👋 再见！")
            sys.exit(0)
            
        else:
            print("请输入 1、2、3 或 4")

def check_python_dependencies():
    """检查Python依赖状态"""
    print("🔍 检查Python依赖...")
    
    # 核心依赖包
    core_packages = ['flask', 'flask_cors', 'requests', 'networkx']
    # 可选依赖包
    optional_packages = [
        'opencv-python', 'PyMuPDF', 'html2text', 'pdf2image', 
        'pillow', 'openai', 'python-pptx', 'PyPDF2',
        'zhipuai', 'chardet', 'matplotlib', 'websocket-client'
    ]
    
    missing_core = []
    missing_optional = []
    
    # 检查核心依赖
    for package in core_packages:
        try:
            if package == 'flask_cors':
                import flask_cors
            else:
                __import__(package)
        except ImportError:
            missing_core.append(package)
    
    # 检查可选依赖
    for package in optional_packages:
        try:
            if package == 'flask_cors':
                import flask_cors
            elif package == 'opencv-python':
                import cv2
            elif package == 'PyMuPDF':
                import fitz
            elif package == 'html2text':
                import html2text
            elif package == 'pdf2image':
                import pdf2image
            elif package == 'pillow':
                import PIL
            elif package == 'python-pptx':
                import pptx
            elif package == 'PyPDF2':
                import PyPDF2
            elif package == 'networkx':
                import networkx
            elif package == 'zhipuai':
                import zhipuai
            elif package == 'chardet':
                import chardet
            elif package == 'matplotlib':
                import matplotlib
            elif package == 'websocket-client':
                import websocket
            else:
                __import__(package)
        except ImportError:
            missing_optional.append(package)
    
    # 显示检查结果
    if missing_core:
        print(f"❌ 缺少核心依赖: {', '.join(missing_core)}")
    else:
        print("✅ 核心依赖已安装")
    
    if missing_optional:
        print(f"⚠️  缺少可选依赖: {', '.join(missing_optional)}")
    else:
        print("✅ 可选依赖已安装")
    
    return missing_core, missing_optional

def check_node_dependencies():
    """检查Node.js依赖状态"""
    print("🔍 检查Node.js环境...")
    
    # 检查Node.js是否安装
    try:
        node_result = subprocess.run(["node", "--version"], capture_output=True, text=True, check=True)
        npm_result = subprocess.run(["npm", "--version"], capture_output=True, text=True, check=True)
        print(f"✅ Node.js版本: {node_result.stdout.strip()}")
        print(f"✅ npm版本: {npm_result.stdout.strip()}")
        node_installed = True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js未安装")
        node_installed = False
    
    # 检查前端依赖
    web_dir = Path(__file__).parent / "web"
    frontend_deps_installed = False
    
    if web_dir.exists():
        if (web_dir / "node_modules").exists():
            print("✅ 前端依赖已安装")
            frontend_deps_installed = True
        else:
            print("❌ 前端依赖未安装")
    else:
        print("❌ web目录不存在")
    
    return node_installed, frontend_deps_installed

def install_python_dependencies():
    """安装Python依赖"""
    print("📦 安装Python依赖包...")
    
    requirements_file = Path(__file__).parent / "requirements.txt"
    if not requirements_file.exists():
        print("❌ requirements.txt文件不存在")
        return False
    
    try:
        print("正在安装依赖，这可能需要几分钟...")
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], cwd=Path(__file__).parent, 
           capture_output=True, 
           text=True, 
           check=True)
        
        print("✅ Python依赖安装完成")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ 依赖安装失败: {e}")
        if e.stderr:
            print(f"错误信息: {e.stderr}")
        
        # 尝试升级pip
        print("尝试升级pip...")
        try:
            subprocess.run([
                sys.executable, "-m", "pip", "install", "--upgrade", "pip"
            ], check=True, capture_output=True, text=True)
            
            # 再次尝试安装依赖
            print("重新尝试安装依赖...")
            result = subprocess.run([
                sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
            ], cwd=Path(__file__).parent, 
               capture_output=True, 
               text=True, 
               check=True)
            
            print("✅ Python依赖安装完成")
            return True
            
        except subprocess.CalledProcessError as e2:
            print(f"❌ 升级pip后仍然失败: {e2}")
            return False

def install_node_dependencies():
    """安装Node.js依赖"""
    print("📦 安装Node.js依赖...")
    
    web_dir = Path(__file__).parent / "web"
    if not web_dir.exists():
        print("❌ web目录不存在")
        return False
    
    package_json = web_dir / "package.json"
    if not package_json.exists():
        print("❌ package.json文件不存在")
        return False
    
    system = platform.system()
    if system == "Windows":
        npm_bin = "npm.cmd"
    else:
        npm_bin = "npm"
    
    try:
        print("正在安装前端依赖，这可能需要几分钟...")
        result = subprocess.run(
            [npm_bin, "install"], 
            cwd=web_dir, 
            check=True,
            capture_output=True,
            text=True
        )
        print("✅ Node.js依赖安装完成")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Node.js依赖安装失败: {e}")
        if e.stderr:
            print(f"错误信息: {e.stderr}")
        return False

def ask_user_choice(prompt, default="n"):
    """询问用户选择"""
    while True:
        response = input(f"{prompt} (y/N): ").lower().strip()
        if response == "":
            response = default
        if response in ['y', 'yes', 'n', 'no']:
            return response in ['y', 'yes']
        print("请输入 y 或 n")

def handle_dependencies():
    """处理依赖安装"""
    print("\n" + "=" * 50)
    print("📋 依赖状态检查结果")
    print("=" * 50)
    
    # 检查Python依赖
    missing_core, missing_optional = check_python_dependencies()
    
    # 检查Node.js依赖
    node_installed, frontend_deps_installed = check_node_dependencies()
    
    # 检查submodule
    submodule_path = Path(__file__).parent / "submodule" / "SparkLearn"
    submodule_exists = submodule_path.exists()
    if not submodule_exists:
        print("⚠️  Submodule不存在")
    else:
        print("✅ Submodule已存在")
    
    print("=" * 50)
    
    # 询问用户是否要安装缺失的依赖
    install_choices = []
    
    if missing_core:
        print(f"\n❌ 缺少核心依赖: {', '.join(missing_core)}")
        if ask_user_choice("是否安装核心依赖？"):
            install_choices.append(("python_core", missing_core))
    
    if missing_optional:
        print(f"\n⚠️  缺少可选依赖: {', '.join(missing_optional)}")
        if ask_user_choice("是否安装可选依赖？"):
            install_choices.append(("python_optional", missing_optional))
    
    if not node_installed:
        print("\n❌ Node.js未安装")
        print("请访问 https://nodejs.org 下载并安装Node.js")
        print("安装完成后重新运行此脚本")
        return False
    
    if not frontend_deps_installed:
        print("\n❌ 前端依赖未安装")
        if ask_user_choice("是否安装前端依赖？"):
            install_choices.append(("node", []))
    
    if not submodule_exists:
        print("\n⚠️  Submodule不存在")
        if ask_user_choice("是否初始化submodule？"):
            install_choices.append(("submodule", []))
    
    # 执行安装
    if install_choices:
        print("\n🚀 开始安装...")
        for install_type, packages in install_choices:
            if install_type == "python_core" or install_type == "python_optional":
                if not install_python_dependencies():
                    return False
            elif install_type == "node":
                if not install_node_dependencies():
                    return False
            elif install_type == "submodule":
                try:
                    result = subprocess.run(
                        ["git", "submodule", "update", "--init", "--recursive"], 
                        check=True, 
                        cwd=Path(__file__).parent,
                        capture_output=True,
                        text=True
                    )
                    print("✅ Submodule初始化完成")
                except (subprocess.CalledProcessError, FileNotFoundError) as e:
                    print("⚠️  Submodule初始化失败，但不影响基本功能")
    else:
        print("\n✅ 所有依赖已就绪，跳过安装")
    
    return True

def start_backend():
    """启动后端服务器"""
    global backend_process
    
    print("🚀 启动后端服务器...")
    
    # 检查端口是否可用
    if not check_port_available(5001):
        print("❌ 端口5001已被占用")
        print("请关闭占用该端口的程序，或修改backend_server.py中的端口配置")
        return None
    
    # 检查后端文件是否存在
    backend_file = Path(__file__).parent / "backend_server.py"
    if not backend_file.exists():
        print("❌ backend_server.py文件不存在")
        return None
    
    try:
        backend_process = subprocess.Popen([
            sys.executable, "backend_server.py"
        ], cwd=Path(__file__).parent, 
           stdout=subprocess.PIPE,
           stderr=subprocess.PIPE,
           text=True)
        
        # 等待后端启动
        print("⏳ 等待后端服务器启动...")
        time.sleep(5)
        
        if backend_process.poll() is None:
            print("✅ 后端服务器已启动 (http://localhost:5001)")
            return backend_process
        else:
            stdout, stderr = backend_process.communicate()
            print(f"❌ 后端服务器启动失败")
            if stderr:
                print(f"错误信息: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ 启动后端服务器时出错: {e}")
        return None

def start_frontend():
    """启动前端开发服务器"""
    global frontend_process
    
    print("🎨 启动前端开发服务器...")

    web_dir = Path(__file__).parent / "web"
    
    if not web_dir.exists():
        print("❌ web目录不存在")
        return None

    # 检查端口是否可用
    if not check_port_available(3000):
        print("❌ 端口3000已被占用")
        print("请关闭占用该端口的程序")
        return None

    system = platform.system()
    if system == "Windows":
        npm_bin = "npm.cmd"
    else:
        npm_bin = "npm"

    try:
        frontend_process = subprocess.Popen(
            [npm_bin, "run", "dev"],
            cwd=web_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        print("⏳ 等待前端服务器启动...")
        time.sleep(8)  # 前端启动需要更长时间

        if frontend_process.poll() is None:
            print("✅ 前端服务器已启动 (http://localhost:3000)")
            return frontend_process
        else:
            stdout, stderr = frontend_process.communicate()
            print("❌ 前端服务器启动失败")
            if stderr:
                print(f"错误信息: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ 启动前端服务器时出错: {e}")
        return None

def cleanup_processes():
    """清理所有进程"""
    global backend_process, frontend_process
    
    print("🛑 正在停止服务...")
    
    if backend_process:
        try:
            backend_process.terminate()
            backend_process.wait(timeout=5)
            print("✅ 后端服务器已停止")
        except subprocess.TimeoutExpired:
            backend_process.kill()
            print("⚠️  强制停止后端服务器")
        except Exception as e:
            print(f"⚠️  停止后端服务器时出错: {e}")
    
    if frontend_process:
        try:
            frontend_process.terminate()
            frontend_process.wait(timeout=5)
            print("✅ 前端服务器已停止")
        except subprocess.TimeoutExpired:
            frontend_process.kill()
            print("⚠️  强制停止前端服务器")
        except Exception as e:
            print(f"⚠️  停止前端服务器时出错: {e}")

def signal_handler(signum, frame):
    """信号处理器"""
    print(f"\n🛑 收到信号 {signum}，正在停止服务...")
    cleanup_processes()
    sys.exit(0)

def main():
    """主函数"""
    global backend_process, frontend_process
    
    # 注册信号处理器
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # 显示欢迎信息
    show_welcome()
    
    # 处理环境设置
    if not handle_environment_setup():
        sys.exit(1)
    
    # 处理依赖
    if not handle_dependencies():
        print("\n❌ 依赖处理失败，请检查错误信息并重试")
        sys.exit(1)
    
    print("\n🎉 环境配置完成！正在启动服务...")
    print("=" * 50)
    
    # 启动后端
    backend_process = start_backend()
    if not backend_process:
        print("\n❌ 后端启动失败")
        sys.exit(1)
    
    # 启动前端
    frontend_process = start_frontend()
    if not frontend_process:
        print("⚠️  前端启动失败，但后端已成功启动")
        frontend_process = None
    
    print("\n🎉 启动完成！")
    print("🔧 后端: http://localhost:5001")
    if frontend_process:
        print("📱 前端: http://localhost:3000")
    print("📖 API文档: http://localhost:5001/api/")
    print("\n💡 提示：")
    print("   - 按 Ctrl+C 停止所有服务")
    print("   - 如果遇到问题，请查看错误信息")
    print("   - 首次使用可能需要一些时间来加载模型")
    print("=" * 50)
    
    try:
        # 等待用户中断
        while True:
            time.sleep(1)
            
            # 检查进程是否还在运行
            if backend_process and backend_process.poll() is not None:
                print("❌ 后端服务器意外停止")
                break
            if frontend_process and frontend_process.poll() is not None:
                print("❌ 前端服务器意外停止")
                break
                
    except KeyboardInterrupt:
        pass
    finally:
        cleanup_processes()
        print("✅ 所有服务已停止")

if __name__ == "__main__":
    main()
