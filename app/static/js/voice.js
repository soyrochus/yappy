let mediaRecorder;
let chunks = [];

const recordButton = document.getElementById('record');

let userBlobCanvas = document.getElementById('user-blob');
let aiBlobCanvas = document.getElementById('ai-blob');
let userCtx = userBlobCanvas.getContext('2d');
let aiCtx = aiBlobCanvas.getContext('2d');

function drawBlob(ctx, amplitude, color) {
    ctx.clearRect(0, 0, 120, 120);
    ctx.beginPath();
    ctx.arc(60, 60, 30 + amplitude * 25, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1.0;
}

// --- User mic visualization ---
let userAnalyser, userDataArray, userSource;
async function setupUserVisualizer(stream) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    userAnalyser = audioCtx.createAnalyser();
    userSource = audioCtx.createMediaStreamSource(stream);
    userSource.connect(userAnalyser);
    userAnalyser.fftSize = 64;
    userDataArray = new Uint8Array(userAnalyser.frequencyBinCount);
    function animate() {
        userAnalyser.getByteTimeDomainData(userDataArray);
        let amp = (Math.max(...userDataArray) - Math.min(...userDataArray)) / 255;
        drawBlob(userCtx, amp, '#4fc3f7'); // blue for user
        requestAnimationFrame(animate);
    }
    animate();
}

// --- AI audio visualization ---
let aiAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
let aiAnalyser = aiAudioCtx.createAnalyser();
aiAnalyser.fftSize = 64;
let aiDataArray = new Uint8Array(aiAnalyser.frequencyBinCount);
let aiGain = aiAudioCtx.createGain();
aiGain.connect(aiAnalyser);
aiAnalyser.connect(aiAudioCtx.destination);
function animateAI() {
    aiAnalyser.getByteTimeDomainData(aiDataArray);
    let amp = (Math.max(...aiDataArray) - Math.min(...aiDataArray)) / 255;
    drawBlob(aiCtx, amp, '#ff7043'); // orange for AI
    requestAnimationFrame(animateAI);
}
animateAI();

// --- WebSocket and recording logic ---
let stream = null;
let isRecording = false;
let isResponding = false;
let currentRecorder = null;

function setButtonState(state) {
    if (state === 'idle') {
        recordButton.disabled = false;
        recordButton.style.background = '';
        recordButton.textContent = 'Press to Talk';
    } else if (state === 'recording') {
        recordButton.disabled = false;
        recordButton.style.background = '#4fc3f7';
        recordButton.textContent = 'Press Again to Send';
    } else if (state === 'responding') {
        recordButton.disabled = true;
        recordButton.style.background = '#bdbdbd';
        recordButton.textContent = 'AI Responding...';
    }
}
setButtonState('idle');

let ws = null;
let wsReady = false;
let wsQueue = [];

function ensureWebSocket(onAIResponse) {
    return new Promise((resolve) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            resolve();
            return;
        }
        ws = new WebSocket(`ws://${window.location.host}/ws/chat`);
        ws.binaryType = 'arraybuffer';
        ws.onopen = () => {
            wsReady = true;
            resolve();
        };
        ws.onmessage = (event) => {
            setButtonState('idle');
            isResponding = false;
            onAIResponse(event.data);
        };
        ws.onerror = () => {
            setButtonState('idle');
            isResponding = false;
        };
        ws.onclose = () => {
            wsReady = false;
        };
    });
}

async function getStream() {
    if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setupUserVisualizer(stream);
    }
    return stream;
}

recordButton.addEventListener('click', async () => {
    if (isResponding) return;
    if (!isRecording) {
        // Start recording
        setButtonState('recording');
        isRecording = true;
        chunks = [];
        const micStream = await getStream();
        currentRecorder = new MediaRecorder(micStream);
        currentRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };
        currentRecorder.start();
    } else {
        // Stop recording and send
        setButtonState('responding');
        isRecording = false;
        isResponding = true;
        currentRecorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            await ensureWebSocket((data) => {
                aiAudioCtx.decodeAudioData(data.slice(0), (buffer) => {
                    const source = aiAudioCtx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(aiGain);
                    source.start(0);
                });
            });
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(blob);
            } else {
                setButtonState('idle');
                isResponding = false;
            }
            currentRecorder = null;
        };
        currentRecorder.stop();
    }
});
