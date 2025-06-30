import os
from dotenv import load_dotenv
import openai

load_dotenv()

class OpenAIClient:
    """Simple wrapper for OpenAI realtime voice API."""
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise RuntimeError('OPENAI_API_KEY not set in environment')
        openai.api_key = self.api_key
        # Placeholder for connection/session setup

    async def stream_voice(self, chunk: bytes):
        """Stream audio chunk to OpenAI and yield response chunks.
        This is a placeholder that simply echoes the audio.
        Replace with actual streaming implementation.
        """
        yield chunk

    async def disconnect(self):
        """Close any connections if needed"""
        pass
