# LangGraph 法律智能体

使用 LangGraph 和 FastAPI 构建的法律助手服务，替代原有的 Coze API。

## 架构

```
用户输入 → 路由节点(意图识别) → 专业节点处理
                                    ├── 法律咨询 (advisor_node)
                                    ├── 合同起草 (generator_node)
                                    ├── 合规审查 (checker_node)
                                    └── 案例检索 (advisor_node)
```

## 快速开始

### 1. 安装依赖
```bash
pip install -r requirements.txt
```

### 2. 配置环境变量
编辑 `.env` 文件，确保 API Key 正确：
```
MODELSCOPE_API_KEY=your-api-key
MODELSCOPE_BASE_URL=https://api-inference.modelscope.cn/v1
MODEL_NAME=Qwen/Qwen3-VL-235B-A22B-Instruct
```

### 3. 启动服务
```bash
python main.py
```
服务将在 `http://localhost:8000` 启动。

### 4. 测试 API
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "帮我起草一份借条"}], "stream": true}'
```

## 与 Java 后端集成

Java 后端的 `CozeService.java` 已配置调用此服务。确保在 `application.yml` 中添加：

```yaml
ai:
  agent:
    url: http://localhost:8000
```

## 文件结构

- `main.py` - 主服务代码，包含 LangGraph 图定义和 FastAPI 端点
- `requirements.txt` - Python 依赖
- `.env` - 环境变量配置
- `start.cmd` - Windows 启动脚本

## LangGraph 节点说明

| 节点 | 功能 | 触发条件 |
|------|------|----------|
| router | 意图识别 | 入口节点 |
| generator | 法律文书生成 | 意图="合同起草" |
| checker | 合同审查 | 意图="合规审查" |
| advisor | 法律咨询 | 其他意图 |