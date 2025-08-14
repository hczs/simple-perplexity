# Simple Perplexity API

[中文](README.md) | [English](README_EN.md)

---

A full-stack intelligent Q&A system built with LangGraph and Next.js, providing real-time streaming responses with tool integration capabilities.

## 🚀 Features

- **Intelligent Question Processing**: Automatically analyzes and optimizes user questions
- **Real-time Streaming**: Server-sent events for live response streaming
- **Tool Integration**: Extensible tool system for enhanced functionality
- **Modern UI**: Clean, responsive interface with dark/light theme support
- **Full-stack Architecture**: FastAPI backend with Next.js frontend

## 📸 Screenshots

### Light Theme

![Light Theme](img/light.png)

### Dark Theme

![Dark Theme](img/dark.png)

## 🏗️ Architecture

```
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api.py           # API routes
│   │   ├── graph.py         # LangGraph workflow
│   │   ├── nodes/           # Graph nodes
│   │   ├── schema.py        # Data models
│   │   └── tools.py         # Tool implementations
│   └── pyproject.toml       # Python dependencies
└── frontend/         # Next.js frontend
    ├── src/
    ├── package.json         # Node.js dependencies
    └── next.config.ts       # Next.js configuration
```

## 🛠️ Tech Stack

**Backend:**

- FastAPI - Modern Python web framework
- LangGraph - Workflow orchestration
- LangChain - LLM integration
- Pydantic - Data validation

**Frontend:**

- Next.js 15 - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- Radix UI - Component library

## 📦 Installation

### Prerequisites

- Python 3.12+
- Node.js 18+
- pnpm (recommended)

### Backend Setup

```bash
cd backend
pip install uv  # or use your preferred Python package manager
uv sync
```

### Frontend Setup

```bash
cd frontend
pnpm install
```

## 🚀 Running the Application

### Start Backend

```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

### Start Frontend

```bash
cd frontend
pnpm dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📡 API Endpoints

- `GET /api/` - Health check
- `POST /api/chat` - Chat endpoint with streaming response

### Chat API Example

**Request:**

```json
{
  "question": "What's the weather like in Beijing tomorrow?"
}
```

**Response:**
Streaming response with the following event types:

- `chat_event` - Chat content
- `tool_event` - Tool execution information

## 🧪 Testing

```bash
# Frontend tests
cd frontend
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests once
pnpm test:run
```

## 🔧 Configuration

1. Copy environment files:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Configure your environment variables in `backend/.env`:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ```

## 📝 Development

### Workflow

The system uses a graph-based workflow with the following nodes:

1. **Supervisor**: Analyzes requests and decides next actions
2. **Question Analysis**: Optimizes and analyzes user questions
3. **Researcher**: Performs research using available tools
4. **Tool Router**: Manages tool execution flow
5. **Answer**: Generates final responses

### Adding New Tools

1. Define new tools in `backend/app/tools.py`
2. Register tools in `backend/app/nodes/tool_node.py`
3. Update tool parsers

### Frontend Development

The frontend uses Next.js 15 with App Router, featuring:

- Server-side rendering
- Real-time streaming data processing
- Responsive design
- Theme switching

## 🐛 Troubleshooting

### Common Issues

1. **Backend startup fails**

   - Check Python version is 3.12+
   - Ensure all dependencies are installed correctly

2. **Frontend build errors**

   - Clear cache: `pnpm clean`
   - Reinstall dependencies: `rm -rf node_modules && pnpm install`

3. **API connection issues**
   - Ensure backend service is running
   - Check CORS configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit Issues and Pull Requests.

### Contributing Guidelines

1. Fork the project
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For questions or suggestions, please contact us through:

- Submit an Issue
- Email: hczshd@gmail.com

---

**Note:** This is a demonstration project. Please configure and deploy according to your actual needs.
