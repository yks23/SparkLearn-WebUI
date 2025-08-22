# SparkLearn-WebUI

一个基于React的Web界面，用于SparkLearn项目的配置和管理。支持知识图谱构建、题目生成、文档处理等功能。

## 🚀 功能特性

- **API配置管理**: 支持配置各种AI服务的API密钥
- **知识图谱预览**: 可视化展示知识图谱
- **文档处理**: 支持PDF、Word、PPT等多种格式文档处理
- **题目生成**: 基于知识图谱生成题目
- **流程管理**: 管理数据处理流程

## 🔧 支持的API服务

- 星火认知大模型 (Spark API)
- SiliconFlow API
- OpenAI API
- ChatGLM API
- 科大讯飞文字识别服务

## 📋 系统要求

- Python 3.11+
- Node.js 18+
- Git

## 🛠️ 第一次使用指南

### 1. 克隆项目

```bash
# 克隆主项目
git clone https://github.com/yks23/SparkLearn-WebUI.git
cd SparkLearn-WebUI

# 初始化并更新submodule（重要！）
git submodule update --init --recursive
```

### 2. 安装Python依赖

```bash
# 创建虚拟环境（推荐）
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装Python依赖
pip install -r requirements.txt
```

### 3. 安装前端依赖

```bash
# 进入web目录
cd web

# 安装Node.js依赖
npm install

# 返回根目录
cd ..
```

### 4. 配置API密钥

在项目根目录创建 `.env` 文件（或通过Web界面配置）：

```env
# 星火认知大模型
spark_api_key=your_spark_api_key

# SiliconFlow API
silicon_api_key=your_silicon_api_key

# OpenAI API
openai_api_key=your_openai_api_key

# ChatGLM API
glm_api_key=your_glm_api_key

# 科大讯飞文字识别服务
APPID=your_xfyun_appid
APISecret=your_xfyun_secret
APIKEY=your_xfyun_key
```

### 5. 启动应用

#### 方法一：使用启动脚本（推荐）

```bash
# 一键启动前端和后端
python start_dev.py
```

#### 方法二：手动启动

```bash
# 终端1：启动后端服务器
python backend_server.py

# 终端2：启动前端开发服务器
cd web
npm run dev
```

### 6. 访问应用

- 前端界面: http://localhost:3000
- 后端API: http://localhost:5001

## 📁 项目结构

```
SparkLearn-WebUI/
├── web/                    # 前端React应用
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── features/       # 功能模块
│   │   ├── pages/          # 页面组件
│   │   ├── stores/         # 状态管理
│   │   └── utils/          # 工具函数
│   └── package.json
├── submodule/              # Git子模块
│   └── SparkLearn/         # SparkLearn核心功能
├── backend_server.py       # 后端服务器
├── requirements.txt        # Python依赖
├── start_dev.py           # 开发环境启动脚本
├── .gitmodules            # Git子模块配置
└── README.md
```

## 🔧 开发说明

### 前端技术栈

- React 19
- Vite
- Tailwind CSS
- React Router
- Zustand (状态管理)

### 后端技术栈

- Flask
- Flask-CORS
- 各种AI API集成

### 常见问题

#### 1. Submodule相关问题

如果遇到submodule相关错误：

```bash
# 重新初始化submodule
git submodule deinit -f .
git submodule update --init --recursive
```

#### 2. 端口占用问题

如果端口被占用，可以修改端口：

- 后端端口：修改 `backend_server.py` 中的端口号
- 前端端口：修改 `web/vite.config.js` 中的端口号

#### 3. 依赖安装失败

```bash
# 清理并重新安装Python依赖
pip uninstall -r requirements.txt -y
pip install -r requirements.txt

# 清理并重新安装Node.js依赖
cd web
rm -rf node_modules package-lock.json
npm install
```

#### 4. 选取输入文件夹
输入文件夹目前的选取方法（macos）是在选择文件时点击cancel，然后选择文件夹

## 📝 使用说明

1. **API配置**: 访问Web界面，点击"API配置"菜单，输入相应的API密钥
2. **文档处理**: 上传PDF、Word、PPT等文档进行文本提取
3. **知识图谱**: 查看和编辑生成的知识图谱
4. **题目生成**: 基于知识图谱生成题目

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 获取帮助

如果遇到问题，请：

1. 检查 [Issues](../../issues) 页面
2. 创建新的 Issue 描述问题
3. 联系项目维护者

---

**注意**: 首次使用请确保正确初始化了submodule，这是项目正常运行的关键步骤！
