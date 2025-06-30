from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.requests import Request
import asyncio
import os

from .openai_client import OpenAIClient

app = FastAPI()

# Mount static files
app.mount('/static', StaticFiles(directory=os.path.join(os.path.dirname(__file__), 'static')), name='static')

# Templates
templates = Jinja2Templates(directory=os.path.join(os.path.dirname(__file__), 'templates'))

# Load OpenAI client
openai_client = OpenAIClient()

@app.get('/', response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse('index.html', {'request': request})

@app.websocket('/ws/chat')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        async for message in websocket.iter_bytes():
            # forward audio chunk to OpenAI and get response chunk
            async for response_chunk in openai_client.stream_voice(message):
                await websocket.send_bytes(response_chunk)
    except WebSocketDisconnect:
        await openai_client.disconnect()
    except Exception:
        await openai_client.disconnect()
        raise
