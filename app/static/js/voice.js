let ws;
let mediaRecorder;
let chunks = [];

const recordButton = document.getElementById('record');

async function init() {
    ws = new WebSocket(`ws://${window.location.host}/ws/chat`);
    ws.binaryType = 'arraybuffer';
    ws.onmessage = (event) => {
        // received audio chunk -> play
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.decodeAudioData(event.data.slice(0), (buffer) => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
        });
    };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(e.data);
        }
    };
}

recordButton.addEventListener('mousedown', () => {
    mediaRecorder.start(250);
});

recordButton.addEventListener('mouseup', () => {
    mediaRecorder.stop();
});

window.addEventListener('load', init);
