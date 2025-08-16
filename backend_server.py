from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import json
from pathlib import Path
import chardet

# 添加submodule路径到Python路径
submodule_path = Path(__file__).parent / "submodule" / "SparkLearn"
sys.path.insert(0, str(submodule_path))

# 导入submodule中的功能
from config import spark_api_key, silicon_api_key, openai_api_key, glm_api_key, APPID, APISecret, APIKEY
from utils.api import single_conversation, multi_conservation, single_embedding, multi_embedding, multiroundConversation
from qg.graph_class import KnowledgeGraph, KnowledgeQuestionGenerator
from sider.annotator_simple import SimplifiedAnnotator
from pre_process.text_recognize.processtext import process_input

app = Flask(__name__)
CORS(app)

# 全局变量存储配置
api_config = {
    'spark_api_key': spark_api_key,
    'silicon_api_key': silicon_api_key,
    'openai_api_key': openai_api_key,
    'glm_api_key': glm_api_key,
    'APPID': APPID,
    'APISecret': APISecret,
    'APIKEY': APIKEY
}

@app.route('/api/getApiConfig', methods=['POST'])
def get_api_config():
    """获取API配置"""
    return jsonify(api_config)

@app.route('/api/saveApiConfig', methods=['POST'])
def save_api_config():
    """保存API配置"""
    global api_config
    config = request.json
    
    # 更新全局配置
    api_config.update(config)
    
    # 更新环境变量
    for key, value in config.items():
        os.environ[key] = value
    
    # 保存到.env文件 - 保存完整的配置
    env_path = Path(__file__).parent / '.env'
    with open(env_path, 'w', encoding='utf-8') as f:
        for key, value in api_config.items():
            if value:  # 只保存非空值
                f.write(f'{key}={value}\n')
    
    print(f"✅ API配置已保存到: {env_path}")
    print(f"📝 保存的配置: {api_config}")
    
    return jsonify({'success': True, 'message': '配置已保存'})

@app.route('/api/sendConfigToBackend', methods=['POST'])
def send_config_to_backend():
    """发送配置到后端（重新加载配置）"""
    global api_config
    config = request.json
    
    # 更新全局配置
    api_config.update(config)
    
    # 更新环境变量
    for key, value in config.items():
        os.environ[key] = value
    
    # 同时保存到.env文件
    env_path = Path(__file__).parent / '.env'
    with open(env_path, 'w', encoding='utf-8') as f:
        for key, value in api_config.items():
            if value:  # 只保存非空值
                f.write(f'{key}={value}\n')
    
    print(f"✅ 配置已更新并保存到: {env_path}")
    
    return jsonify({'success': True, 'message': '配置已更新'})

@app.route('/api/processInput', methods=['POST'])
def api_process_input():
    """处理输入文件"""
    try:
        data = request.json
        input_path = data.get('input_path', '')
        output_path = data.get('output_path', './outputs')
        
        process_input(input_path, output_path)
        
        return jsonify({'success': True, 'message': '文件处理完成'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/augmentFile', methods=['POST'])
def api_augment_file():
    """增强文件"""
    try:
        data = request.json
        input_path = data.get('input_path', '')
        
        annotator = SimplifiedAnnotator()
        
        # 检测文件编码
        with open(input_path, 'rb') as f:
            raw_data = f.read()
            detected_encoding = chardet.detect(raw_data)['encoding']
        
        with open(input_path, 'r', encoding=detected_encoding, errors='ignore') as f:
            content = f.read()
        
        annotator.process(content, input_path)
        
        return jsonify({'success': True, 'message': '文件增强完成'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/generateQA', methods=['POST'])
def api_generate_qa():
    """生成问答对"""
    try:
        data = request.json
        input_path = data.get('input_path', '')
        output_path = data.get('output_path', './outputs')
        
        kg = KnowledgeGraph()
        kg.load_knowledge_graph(input_path)
        
        # 生成可视化
        graph_path = os.path.join(input_path, 'graph.png')
        kg.visualize(graph_path)
        
        generator = KnowledgeQuestionGenerator(
            kg,
            appid=api_config['APPID'],
            api_key=api_config['APIKEY'],
            api_secret=api_config['APISecret']
        )
        
        result = generator.interactive_question_generation()
        
        return jsonify({
            'success': True, 
            'message': '问答对生成完成',
            'graph_path': graph_path,
            'result': result
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/buildKnowledgeGraph', methods=['POST'])
def api_build_knowledge_graph():
    """构建知识图谱"""
    try:
        data = request.json
        input_path = data.get('input_path', '')
        output_path = data.get('output_path', './outputs')
        
        # 设置环境变量
        os.environ['meta_path'] = output_path
        os.environ['raw_path'] = input_path
        
        # 导入并运行知识图谱构建
        from kg_construction.main import main
        main()
        
        return jsonify({'success': True, 'message': '知识图谱构建完成'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/runPipeline', methods=['POST'])
def api_run_pipeline():
    """运行完整的处理流程"""
    try:
        data = request.json
        input_path = data.get('input_path', '')
        output_path = data.get('output_path', './outputs')
        selected_steps = data.get('steps', ['preprocess', 'augment', 'tree'])
        
        # 验证输入路径
        if not input_path or not os.path.exists(input_path):
            return jsonify({'success': False, 'error': '输入路径不存在'}), 400
        
        # 创建输出目录
        os.makedirs(output_path, exist_ok=True)
        
        # 状态文件路径
        state_path = os.path.join(output_path, 'state.json')
        
        # 加载状态
        state = {}
        if os.path.exists(state_path):
            try:
                with open(state_path, 'r', encoding='utf-8') as f:
                    state = json.load(f)
            except Exception as e:
                print(f"⚠️ 状态文件加载失败: {str(e)}")
                state = {}
        
        # 定义步骤
        step_names = {
            'preprocess': "🔧 预处理原始文件",
            'augment': "🧠 增广文本", 
            'tree': "🌳 构建知识树结构"
        }
        
        # 检查输入文件类型（如果只选择后面的步骤）
        if not 'preprocess' in selected_steps and ('augment' in selected_steps or 'tree' in selected_steps):
            # 检查输入是否为md文件
            if os.path.isfile(input_path):
                if not input_path.lower().endswith('.md'):
                    return jsonify({'success': False, 'error': '跳过预处理步骤时，输入必须是.md文件'}), 400
            else:
                # 检查目录中是否有md文件
                has_md_files = False
                for root, dirs, files in os.walk(input_path):
                    for file in files:
                        if file.lower().endswith('.md'):
                            has_md_files = True
                            break
                    if has_md_files:
                        break
                
                if not has_md_files:
                    return jsonify({'success': False, 'error': '跳过预处理步骤时，输入目录必须包含.md文件'}), 400
        
        # 执行选中的步骤
        for step in ['preprocess', 'augment', 'tree']:
            if step in selected_steps:
                # 暂时注释掉状态检查，强制重新执行 —— 懒得找新文件了
                # if state.get(step, False):
                #     print(f"⏭️ 跳过已完成的步骤: {step_names[step]}")
                #     continue
                
                print(f"⏳ 正在执行: {step_names[step]}...")
                
                if step == 'preprocess':
                    from main import process_folder
                    process_folder(input_path, output_path)
                
                elif step == 'augment':
                    from main import augment_folder
                    # 如果跳过了预处理，直接使用输入路径
                    if 'preprocess' in selected_steps:
                        processed_path = os.path.join(output_path, os.path.basename(input_path))
                    else:
                        processed_path = input_path
                    augment_folder(processed_path)
                
                elif step == 'tree':
                    from main import tree_folder
                    # 如果跳过了预处理，直接使用输入路径
                    if 'preprocess' in selected_steps:
                        processed_path = os.path.join(output_path, os.path.basename(input_path))
                    else:
                        processed_path = input_path
                        # 额外检查：确保tree步骤的输入只包含.md文件
                        if os.path.isdir(processed_path):
                            has_md_files = False
                            for root, dirs, files in os.walk(processed_path):
                                for file in files:
                                    if file.lower().endswith('.md'):
                                        has_md_files = True
                                        break
                                if has_md_files:
                                    break
                            if not has_md_files:
                                return jsonify({'success': False, 'error': 'tree步骤需要.md文件作为输入，请先运行预处理步骤'}), 400
                    
                    tree_output = os.path.join(output_path, "tree")
                    # 确保tree_output目录存在
                    os.makedirs(tree_output, exist_ok=True)
                    tree_folder(processed_path, tree_output)
                    
                    # 生成知识图谱可视化
                    graph_dir = os.path.join(tree_output, "graph")
                    if os.path.exists(graph_dir):
                        kg = KnowledgeGraph()
                        kg.load_knowledge_graph(graph_dir)
                        graph_png = os.path.join(graph_dir, "graph.png")
                        kg.visualize(graph_png)
                        print(f"知识图谱已构建并可视化在: {graph_png}")
                
                # 更新状态（注释掉，不再保存状态）
                # state[step] = True
                # with open(state_path, 'w', encoding='utf-8') as f:
                #     json.dump(state, f, indent=2)
                
                print(f"✅ 完成: {step_names[step]}")
        
        print("🎉 全部流程完成！")
        return jsonify({'success': True, 'message': '流程执行完成'})
        
    except Exception as e:
        import traceback
        error_msg = f"运行出错: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return jsonify({'success': False, 'error': error_msg}), 500

@app.route('/api/loadState', methods=['POST'])
def api_load_state():
    """加载状态文件"""
    try:
        data = request.json
        output_path = data.get('output_path', '')
        
        if not output_path:
            return jsonify({'success': False, 'error': '输出路径不能为空'}), 400
        
        state_path = os.path.join(output_path, 'state.json')
        state = {}
        
        if os.path.exists(state_path):
            try:
                with open(state_path, 'r', encoding='utf-8') as f:
                    state = json.load(f)
                return jsonify({'success': True, 'state': state})
            except Exception as e:
                return jsonify({'success': False, 'error': f'状态文件加载失败: {str(e)}'}), 500
        else:
            return jsonify({'success': True, 'state': {}})
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/selectFolder', methods=['POST'])
def api_select_folder():
    """选择文件夹"""
    try:
        # 确保请求有JSON数据
        if not request.is_json:
            return jsonify({'success': False, 'error': '请求必须是JSON格式'}), 400
        
        import platform
        system = platform.system()
        
        if system == 'Darwin':  # macOS
            # 在macOS上使用osascript来打开文件夹选择对话框
            import subprocess
            
            # 使用更简单的方法，直接调用Finder
            script = '''
            tell application "Finder"
                set folderPath to choose folder with prompt "选择输出文件夹"
                return POSIX path of folderPath
            end tell
            '''
            
            try:
                result = subprocess.run(['osascript', '-e', script], 
                                      capture_output=True, text=True, timeout=30)
                if result.returncode == 0:
                    folder_path = result.stdout.strip()
                    if folder_path:
                        return jsonify({'success': True, 'path': folder_path})
            except subprocess.TimeoutExpired:
                pass
            
            return jsonify({'success': False, 'error': '未选择文件夹'}), 400
            
        else:
            # 在其他系统上使用tkinter
            import tkinter as tk
            from tkinter import filedialog
            
            # 创建隐藏的根窗口
            root = tk.Tk()
            root.withdraw()  # 隐藏主窗口
            
            # 打开文件夹选择对话框
            folder_path = filedialog.askdirectory(
                title="选择输出文件夹",
                initialdir=os.getcwd()
            )
            
            root.destroy()  # 销毁窗口
            
            if folder_path:
                return jsonify({'success': True, 'path': folder_path})
            else:
                return jsonify({'success': False, 'error': '未选择文件夹'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/selectInput', methods=['POST'])
def api_select_input():
    """选择输入文件或文件夹"""
    try:
        # 确保请求有JSON数据
        if not request.is_json:
            return jsonify({'success': False, 'error': '请求必须是JSON格式'}), 400
        
        import platform
        system = platform.system()
        
        if system == 'Darwin':  # macOS
            # 在macOS上使用osascript来打开文件选择对话框
            import subprocess
            
            # 使用Finder来选择文件
            script = '''
            tell application "Finder"
                set filePath to choose file with prompt "选择输入文件" of type {"md", "docx", "pdf", "ppt", "pptx", "txt", "html", "htm", "png", "jpg", "jpeg", "gif", "bmp", "svg"}
                return POSIX path of filePath
            end tell
            '''
            
            try:
                result = subprocess.run(['osascript', '-e', script], 
                                      capture_output=True, text=True, timeout=30)
                if result.returncode == 0:
                    file_path = result.stdout.strip()
                    if file_path:
                        return jsonify({'success': True, 'path': file_path})
            except subprocess.TimeoutExpired:
                pass
            
            # 如果文件选择失败或超时，尝试选择文件夹
            script_folder = '''
            tell application "Finder"
                set folderPath to choose folder with prompt "选择输入文件夹"
                return POSIX path of folderPath
            end tell
            '''
            
            try:
                result = subprocess.run(['osascript', '-e', script_folder], 
                                      capture_output=True, text=True, timeout=30)
                if result.returncode == 0:
                    folder_path = result.stdout.strip()
                    if folder_path:
                        return jsonify({'success': True, 'path': folder_path})
            except subprocess.TimeoutExpired:
                pass
            
            return jsonify({'success': False, 'error': '未选择文件或文件夹'}), 400
            
        else:
            # 在其他系统上使用tkinter
            import tkinter as tk
            from tkinter import filedialog
            
            # 创建隐藏的根窗口
            root = tk.Tk()
            root.withdraw()  # 隐藏主窗口
            
            # 打开文件/文件夹选择对话框
            # 先尝试选择文件
            file_path = filedialog.askopenfilename(
                title="选择输入文件",
                initialdir=os.getcwd(),
                filetypes=[
                    ("所有支持的文件", "*.md;*.docx;*.pdf;*.ppt;*.pptx;*.html;*.htm;*.png;*.jpg;*.jpeg;*.gif;*.bmp;*.svg"),
                    ("Markdown文件", "*.md"),
                    ("Word文档", "*.docx"),
                    ("PDF文件", "*.pdf"),
                    ("PowerPoint文件", "*.ppt;*.pptx"),
                    ("HTML文件", "*.html;*.htm"),
                    ("图片文件", "*.png;*.jpg;*.jpeg;*.gif;*.bmp;*.svg"),
                    ("所有文件", "*.*")
                ]
            )
            
            if file_path:
                root.destroy()
                return jsonify({'success': True, 'path': file_path})
            
            # 如果没有选择文件，尝试选择文件夹
            folder_path = filedialog.askdirectory(
                title="选择输入文件夹",
                initialdir=os.getcwd()
            )
            
            root.destroy()  # 销毁窗口
            
            if folder_path:
                return jsonify({'success': True, 'path': folder_path})
            else:
                return jsonify({'success': False, 'error': '未选择文件或文件夹'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/listDirectory', methods=['POST'])
def api_list_directory():
    """列出目录内容"""
    try:
        data = request.json
        path = data.get('path', '.')
        
        if not os.path.exists(path):
            return jsonify({'success': False, 'error': '路径不存在'}), 400
        
        items = []
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            items.append({
                'name': item,
                'path': item_path,
                'is_dir': os.path.isdir(item_path),
                'is_file': os.path.isfile(item_path)
            })
        
        return jsonify({'success': True, 'items': items})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/openFolder', methods=['POST'])
def api_open_folder():
    """打开文件夹"""
    try:
        data = request.json
        path = data.get('path', '')
        
        if not path:
            return jsonify({'success': False, 'error': '路径不能为空'}), 400
        
        if not os.path.exists(path):
            return jsonify({'success': False, 'error': '路径不存在'}), 400
        
        # 根据操作系统使用不同的命令打开文件夹
        import platform
        system = platform.system()
        
        if system == 'Darwin':  # macOS
            import subprocess
            subprocess.run(['open', path])
        elif system == 'Windows':
            import subprocess
            subprocess.run(['explorer', path])
        elif system == 'Linux':
            import subprocess
            subprocess.run(['xdg-open', path])
        else:
            return jsonify({'success': False, 'error': '不支持的操作系统'}), 400
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    # 加载.env文件中的配置
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    api_config[key] = value
                    os.environ[key] = value
    
    print("🚀 启动SparkLearn后端服务器...")
    print(f"📁 Submodule路径: {submodule_path}")
    print(f"🔧 当前API配置: {api_config}")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
