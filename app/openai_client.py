import os
from dotenv import load_dotenv
import openai
import io

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
        """Stream audio chunk to OpenAI and yield response chunks as audio."""
        # 1. Transcribe audio to text
        transcript = None
        try:
            audio_file = io.BytesIO(chunk)
            audio_file.name = "audio.wav"  # Whisper expects a filename
            transcript_resp = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
            transcript = transcript_resp.strip()
        except Exception as e:
            transcript = None
            yield b""  # Optionally send an error audio or empty
            return

        if not transcript:
            yield b""  # No transcript, nothing to respond
            return

        # 2. Generate chat response
        try:
            chat_resp = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": transcript}]
            )
            # Handle both OpenAI v1 and v0.x response formats
            reply_text = None
            # OpenAI v1: choices[0].message.content
            reply_text = getattr(getattr(chat_resp.choices[0], "message", None), "content", None)
            if reply_text:
                reply_text = reply_text.strip()
            else:
                yield b""  # No reply text
                return
        except Exception as e:
            yield b""  # Optionally send an error audio or empty
            return

        # 3. Convert text response to audio (TTS)
        try:
            tts_resp = openai.audio.speech.create(
                model="tts-1",
                voice="alloy",
                input=reply_text,
                response_format="mp3"
            )
            # tts_resp.content is a bytes-like object (audio)
            yield tts_resp.content
        except Exception as e:
            yield b""  # Optionally send an error audio or empty
            return

    async def disconnect(self):
        """Close any connections if needed"""
        pass
