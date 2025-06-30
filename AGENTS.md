# Prompt for Yappy

Title    -> Yappy is a proof-of-concept web app for seamless, real-time voice conversations with OpenAI’s advanced AI—right from your browser.
Tag line -> Yappy: Real-time, natural voice conversations with AI in your browser


## **Prompt: Build a Voice-Interactive Web App with OpenAI Realtime Voice API**

### **Platform & Stack Requirements**

**Backend:**

* Python 3.10+
* FastAPI (async, WebSocket support)
* Jinja2 (for server-side HTML rendering)
* python-dotenv (for config management and secrets)

**Frontend:**

* Vanilla JS (Web Audio API for mic recording, streaming)
* htmx (optional, for AJAX-style partial updates)
* HTML/CSS from Jinja templates

**Other:**

* openai python SDK (with Realtime API access)
* .env file for API keys/config

---

### **File Structure**

```
voicechat-app/
│
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, WebSocket, API routes
│   ├── openai_client.py     # API interface (OpenAI Realtime API)
│   ├── templates/
│   │   └── index.html       # Main UI (Jinja2)
│   └── static/
│       ├── js/
│       │   └── voice.js     # JS: audio capture, streaming, playback
│       └── css/
│           └── style.css    # Basic styles
│
├── .env                     # API keys, config (not checked into VCS)
├── pyproject.toml           # Project info and Dependencies
├── README.md
├── LICENSE
└── run.py                   # Entrypoint script (if needed)
```

---

### **Implementation Details**

#### 1. **Backend (FastAPI)**

* Serve the main page via a GET `/` endpoint, using Jinja2 template.
* Serve static files (JS, CSS).
* Implement a **WebSocket endpoint** at `/ws/chat`:

  * Accept connections from browser.
  * Receive audio chunks (PCM or WAV, ideally as bytes or base64).
  * Forward them in real-time to OpenAI’s Realtime Voice API (see [OpenAI docs](https://platform.openai.com/docs/guides/realtime)).
  * Receive streamed response audio chunks and forward to client as soon as they arrive (maintain low latency).
  * Handle connection drops, errors gracefully.
* Load OpenAI API key (and any other config) from `.env` using python-dotenv.

**Notes:**

* Keep API credentials out of source code.
* Provide clear error messages for unauthorized or failed API calls.
* Ensure only audio (not arbitrary data) is streamed.

#### 2. **OpenAI API Integration**

* Use [openai-python SDK](https://github.com/openai/openai-python).
* Use GPT‑4o’s “realtime” model (e.g., `"gpt-4o-realtime-preview"`).
* Use a **WebSocket client** (e.g., websockets or httpx+wsproto) for streaming to OpenAI, or use the SDK if/when it supports native streaming.
* Forward user audio input in compatible format.
* Receive and relay the AI’s speech audio output.

#### 3. **Frontend (index.html + JS)**

* **UI:** Simple chat-style console, one large “Hold to talk” or “Start Recording” button, message display area, audio waveform (optional).
* **Audio Capture:** Use the Web Audio API (MediaRecorder) to capture user’s mic audio in small chunks (e.g., 250ms).

  * Stream each chunk immediately over the WebSocket.
* **Audio Playback:** Receive audio chunks from the WebSocket, buffer and play back as soon as enough audio is received for smooth UX.
* **Show Conversation:** Optionally display recognized text (if available) and AI response as text and voice.

#### 4. **htmx Integration (optional)**

* Use for updating message log, error messages, or loading states.
* Not strictly needed for audio stream but can enhance UX for non-audio controls.

#### 5. **Security and Privacy**

* Warn user their audio is processed by OpenAI.
* Restrict audio message length or session timeout.
* \[Optional] Implement basic CORS and authentication if deploying beyond localhost.

#### 6. **Configuration**

* `.env` file must contain at least:

  ```
  OPENAI_API_KEY=sk-xxxxxx
  ```
* Load with python-dotenv in your app’s entrypoint.

---

### **Implementation Checklist**

**1. Scaffold project with directories above.**
**2. Add dependencies to `pyproject.toml`:**

```
fastapi
uvicorn
jinja2
openai
python-dotenv
[websockets]    # if not included by openai-python
```

**3. Implement `main.py`:**

* FastAPI app setup
* Static files
* Jinja2 template rendering
* WebSocket handler

**4. Implement `openai_client.py`:**

* Connect to OpenAI Realtime Voice API
* Manage audio stream in/out

**5. Implement frontend:**

* `voice.js`: record audio, manage socket, playback audio
* `index.html`: simple, accessible layout

**6. Test locally.**
**7. Document how to run locally with `.env` setup.**
**8. Add README usage and security notes.**

---

### **Optional Enhancements**

* Show live transcript of conversation using OpenAI’s Whisper.
* Allow text-based input as fallback.
* Allow interrupting AI with new user speech (barge-in).
* Visualize audio with waveform.
* Add “conversation history” (store in session or backend).

---

## **Summary for AI code generation**

> You are to build a minimal, robust Python FastAPI web app with Jinja2 server-side templates and a modern JavaScript frontend that allows a user to have a natural, streaming voice conversation with OpenAI’s GPT‑4o “realtime” voice API (Advanced Voice Mode). The backend serves the app and relays audio between client and OpenAI’s API via WebSockets. User audio is captured and streamed from the browser using the Web Audio API; AI responses are streamed back and played in-browser. Configuration is via `.env` and python-dotenv. Code structure, file tree, and implementation requirements are specified above.

---
