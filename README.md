# SparkLearn-WebUI

一个基于React的Web界面，用于SparkLearn项目的配置和管理。

## 功能特性

- **API配置管理**: 支持配置各种AI服务的API密钥
- **知识图谱预览**: 可视化展示知识图谱
- **流程管理**: 管理数据处理流程
- **题目生成**: 基于知识图谱生成题目

## 支持的API服务

- 星火认知大模型 (Spark API)
- SiliconFlow API
- OpenAI API
- ChatGLM API
- 科大讯飞文字识别服务

## 快速开始

### 1. 安装依赖

```bash
cd web
npm install
```

### 2. 启动开发环境

```bash
# 启动前端
cd web
npm run dev
```

### 3. 访问应用

- 前端界面: http://localhost:5173

## API配置

1. 访问 http://localhost:5173
2. 点击"API配置"菜单
3. 输入相应的API密钥
4. 点击"保存配置"

配置将自动保存到：
- 浏览器本地存储（localStorage）
- 后端环境变量文件（.env）

## 项目结构

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
├── backend_server.py       # 后端服务器
├── requirements.txt        # Python依赖
├── start_dev.py           # 开发环境启动脚本
└── README.md
```

## 开发说明

### 前端技术栈

- React 19
- Vite
- Tailwind CSS
- React Router
- Zustand (状态管理)

### 环境变量

后端会自动创建 `.env` 文件来存储API配置：

```env
spark_api_key=your_spark_api_key
silicon_api_key=your_silicon_api_key
openai_api_key=your_openai_api_key
glm_api_key=your_glm_api_key
APPID=your_xfyun_appid
APISecret=your_xfyun_secret
APIKEY=your_xfyun_key
```