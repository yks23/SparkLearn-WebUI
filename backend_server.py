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
from config import spark_api_key, silicon_api_key, openai_api_key, glm_api_key, APPID, APISecret, APIKEY, model_name, model_provider
from qg.graph_class import KnowledgeGraph, KnowledgeQuestionGenerator
from sider.annotator_simple import SimplifiedAnnotator
from pre_process.text_recognize.processtext import process_input

app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/*": {"methods": ["GET", "POST", "OPTIONS"]}})
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

# 全局变量存储模型配置
model_config = {
    'model_provider': model_provider,
    'model_name': model_name
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
    print(f"📝 保存的API配置: {api_config}")
    
    return jsonify({'success': True, 'message': 'API配置已保存'})

@app.route('/api/getModelConfig', methods=['POST'])
def get_model_config():
    """获取模型配置"""
    return jsonify(model_config)

@app.route('/api/saveModelConfig', methods=['POST'])
def save_model_config():
    """保存模型配置"""
    global model_config
    config = request.json
    
    # 更新全局配置
    model_config.update(config)
    
    # 更新环境变量
    for key, value in config.items():
        os.environ[key] = value
    
    # 更新submodule中的config.py文件
    update_submodule_config(config)
    
    print(f"✅ 模型配置已保存")
    print(f"📝 保存的模型配置: {model_config}")
    
    return jsonify({'success': True, 'message': '模型配置已保存'})

def update_submodule_config(config):
    """更新submodule中的config.py文件"""
    try:
        config_file_path = submodule_path / 'config.py'
        
        # 读取当前配置文件
        with open(config_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 更新model_name
        if 'model_name' in config:
            # 查找并替换model_name行
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.strip().startswith('model_name ='):
                    lines[i] = f'model_name = "{config["model_name"]}"'
                    break
            content = '\n'.join(lines)
        
        # 更新model_provider
        if 'model_provider' in config:
            # 查找并替换model_provider行
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.strip().startswith('model_provider ='):
                    lines[i] = f'model_provider = "{config["model_provider"]}"  # \'openai\', \'chatglm\', \'silicon\', \'spark\''
                    break
            content = '\n'.join(lines)
        
        # 写回文件
        with open(config_file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ submodule配置文件已更新: {config_file_path}")
        
    except Exception as e:
        print(f"❌ 更新submodule配置文件失败: {e}")

@app.route('/api/sendConfigToBackend', methods=['POST'])
def send_config_to_backend():
    """发送配置到后端（重新加载配置）"""
    global api_config, model_config
    config = request.json
    
    # 分离API配置和模型配置
    api_keys = ['spark_api_key', 'silicon_api_key', 'openai_api_key', 'glm_api_key', 'APPID', 'APISecret', 'APIKEY']
    model_keys = ['model_provider', 'model_name']
    
    api_updates = {k: v for k, v in config.items() if k in api_keys}
    model_updates = {k: v for k, v in config.items() if k in model_keys}
    
    # 更新API配置
    if api_updates:
        api_config.update(api_updates)
        # 更新环境变量
        for key, value in api_updates.items():
            os.environ[key] = value
        
        # 保存到.env文件
        env_path = Path(__file__).parent / '.env'
        with open(env_path, 'w', encoding='utf-8') as f:
            for key, value in api_config.items():
                if value:  # 只保存非空值
                    f.write(f'{key}={value}\n')
    
    # 更新模型配置
    if model_updates:
        model_config.update(model_updates)
        # 更新环境变量
        for key, value in model_updates.items():
            os.environ[key] = value
        
        # 更新submodule配置文件
        update_submodule_config(model_updates)
    
    print(f"✅ 配置已更新并保存")
    print(f"📝 API配置: {api_config}")
    print(f"📝 模型配置: {model_config}")
    
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
            'preprocess': "预处理原始文件",
            'augment': "增广文本", 
            'tree': "构建知识树结构"
        }
        
        # 步骤说明
        step_descriptions = {
            'preprocess': "将各种格式的文档（PDF、Word、PPT等）转换为Markdown格式，提取文本内容",
            'augment': "使用AI模型对文本进行增广，生成更多相关内容和知识点",
            'tree': "基于增广后的文本构建知识图谱，生成可视化的知识树结构"
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
                # 检查状态，如果已完成则询问是否继续执行
                if state.get(step, False):
                    print(f"⚠️ 步骤 {step_names[step]} 已完成，继续执行将覆盖之前的结果")
                    # 这里可以选择继续执行，因为用户已经明确选择了这个步骤
                
                print(f"⏳ 正在执行: {step_names[step]}...")
                
                if step == 'preprocess':
                    from main import process_folder
                    process_folder(input_path, output_path)
                
                elif step == 'augment': # 隐患：如果选择的输出文件夹不是空的，可能会出现问题
                    from main import augment_folder
                    # 如果跳过了预处理，直接使用输入路径
                    if 'preprocess' in selected_steps:
                        processed_path = output_path
                    else:
                        processed_path = input_path
                    augment_folder(processed_path)
                
                elif step == 'tree':
                    from main import tree_folder
                    # 如果跳过了预处理，直接使用输入路径
                    if 'preprocess' in selected_steps:
                        processed_path = output_path
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
                    
                    # 更新环境变量，确保使用处理后的md文件路径
                    os.environ['raw_path'] = processed_path
                    tree_folder(processed_path, tree_output)
                    
                    # 生成知识图谱可视化
                    graph_dir = os.path.join(tree_output, "graph")
                    if os.path.exists(graph_dir):
                        kg = KnowledgeGraph()
                        kg.load_knowledge_graph(graph_dir)
                        graph_png = os.path.join(graph_dir, "graph.png")
                        kg.visualize(graph_png)
                        print(f"知识图谱已构建并可视化在: {graph_png}")
                
                # 更新状态
                state[step] = True
                with open(state_path, 'w', encoding='utf-8') as f:
                    json.dump(state, f, indent=2)
                
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

@app.route('/api/getStepsInfo', methods=['POST'])
def api_get_steps_info():
    """获取步骤信息"""
    try:
        step_names = {
            'preprocess': "预处理原始文件",
            'augment': "增广文本", 
            'tree': "构建知识树结构"
        }
        
        step_descriptions = {
            'preprocess': "将各种格式的文档（PDF、Word、PPT等）转换为Markdown格式，提取文本内容",
            'augment': "使用AI模型对文本进行增广，生成更多相关内容和知识点",
            'tree': "基于增广后的文本构建知识图谱，生成可视化的知识树结构"
        }
        
        return jsonify({
            'success': True,
            'step_names': step_names,
            'step_descriptions': step_descriptions
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/createOutputFolder', methods=['POST'])
def api_create_output_folder():
    """自动创建输出文件夹"""
    try:
        from datetime import datetime
        
        # 获取项目根目录
        project_root = Path(__file__).parent
        outputs_dir = project_root / "outputs"
        
        # 确保outputs目录存在
        outputs_dir.mkdir(exist_ok=True)
        
        # 创建带时间戳的文件夹名称
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        folder_name = f"笔记_{timestamp}"
        output_path = outputs_dir / folder_name
        
        # 创建文件夹
        output_path.mkdir(exist_ok=True)
        
        return jsonify({
            'success': True, 
            'path': str(output_path),
            'folder_name': folder_name
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/selectFolder', methods=['POST'])
def api_select_folder():
    """选择文件夹"""
    try:
        # 对于该端点，允许无正文或非JSON正文
        # 读取但不强制要求JSON
        if request.is_json:
            _ = request.get_json(silent=True)
        
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
            try:
                # 置顶提升，避免对话框被遮挡
                root.attributes('-topmost', True)
                root.update()
            except Exception:
                pass
            
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
        # 对于该端点，允许无正文或非JSON正文
        if request.is_json:
            _ = request.get_json(silent=True)
        
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
                set folderPath to choose folder with prompt "选择输入文件夹（包含要处理的文档文件）"
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
            try:
                # 置顶提升，避免对话框被遮挡
                root.attributes('-topmost', True)
                root.update()
            except Exception:
                pass
            
            # 打开文件/文件夹选择对话框
            # 先尝试选择文件
            file_path = filedialog.askopenfilename(
                title="选择输入文件",
                initialdir=os.getcwd(),
                filetypes=[
                    ("所有支持的文件", ("*.md", "*.docx", "*.pdf", "*.ppt", "*.pptx", "*.html", "*.htm", "*.png", "*.jpg", "*.jpeg", "*.gif", "*.bmp", "*.svg")),
                    ("Markdown文件", "*.md"),
                    ("Word文档", "*.docx"),
                    ("PDF文件", "*.pdf"),
                    ("PowerPoint文件", ("*.ppt", "*.pptx")),
                    ("HTML文件", ("*.html", "*.htm")),
                    ("图片文件", ("*.png", "*.jpg", "*.jpeg", "*.gif", "*.bmp", "*.svg")),
                    ("所有文件", "*.*")
                ]
            )
            
            if file_path:
                root.destroy()
                return jsonify({'success': True, 'path': file_path})
            
            # 如果没有选择文件，尝试选择文件夹
            folder_path = filedialog.askdirectory(
                title="选择输入文件夹（包含要处理的文档文件）",
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

@app.route('/api/getKnowledgeGraph', methods=['POST'])
def api_get_knowledge_graph():
    """获取知识图谱数据"""
    try:
        data = request.json
        output_path = data.get('output_path', '')
        
        if not output_path:
            return jsonify({'success': False, 'error': '输出路径不能为空'}), 400

        graph_dir = os.path.join(output_path, "tree", "graph")
        
        if not os.path.exists(graph_dir):
            return jsonify({'success': False, 'error': '知识图谱目录不存在'}), 404
        
        kg = KnowledgeGraph()
        kg.load_knowledge_graph(graph_dir)
        
        #转换为前端需要的格式
        nodes = []
        links = []

        # 遍历图的节点
        for node_id in kg.graph.nodes:
            node_data = kg.graph.nodes[node_id]
            nodes.append({
                'id': node_id,
                'name': node_id,  # 或者从 node_data 中提取更友好的名称
                'val': node_data.get('weight', 5)  # 如果节点有 weight 属性
            })

        # 遍历图的边
        for source, target, edge_data in kg.graph.edges(data=True):
            links.append({
                'source': source,
                'target': target,
                'label': edge_data.get('type', '关系')
            })
        
        graph_data = {
            'nodes': nodes,
            'links': links
        }
        
        return jsonify({
            'success': True, 
            'data': graph_data,
            'message': '知识图谱数据加载成功'
        })
        
    except Exception as e:
        import traceback
        error_msg = f"获取知识图谱失败: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return jsonify({'success': False, 'error': error_msg}), 500
    
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
