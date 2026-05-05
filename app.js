(() => {
  'use strict';

  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const A4 = 440;

  const $ = (id) => document.getElementById(id);
  const noteEl = $('note');
  const octaveEl = $('octave');
  const prevNoteEl = $('prevNote');
  const nextNoteEl = $('nextNote');
  const freqEl = $('freq');
  const targetFreqEl = $('targetFreq');
  const needleEl = $('needle');
  const centsEl = $('cents');
  const statusEl = $('status');
  const startBtn = $('startBtn');
  const stopBtn = $('stopBtn');
  const errorEl = $('error');
  const noteMain = document.querySelector('.note-main');
  const canvas = $('scope');
  const ctx = canvas.getContext('2d');
  const stringBtns = document.querySelectorAll('.string-btn');

  let audioCtx = null;
  let analyser = null;
  let mediaStream = null;
  let source = null;
  let highpass = null;
  let lowpass = null;
  let rafId = null;
  let buffer = null;
  let timeBuffer = null;
  let lockedNote = null;
  let smoothedCents = 0;
  let smoothedFreq = 0;

  // Resize canvas for crisp rendering on hi-dpi
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);

  function freqToNote(freq) {
    const semitones = 12 * Math.log2(freq / A4);
    const midi = Math.round(semitones) + 69;
    const noteIndex = ((midi % 12) + 12) % 12;
    const octave = Math.floor(midi / 12) - 1;
    const targetFreq = A4 * Math.pow(2, (midi - 69) / 12);
    const cents = 1200 * Math.log2(freq / targetFreq);
    return {
      name: NOTE_NAMES[noteIndex],
      octave,
      midi,
      targetFreq,
      cents,
    };
  }

  function midiToName(midi) {
    const noteIndex = ((midi % 12) + 12) % 12;
    const octave = Math.floor(midi / 12) - 1;
    return NOTE_NAMES[noteIndex] + octave;
  }

  // Pitch detection via autocorrelation with parabolic interpolation.
  // Returns frequency in Hz, or -1 if no clear pitch found.
  function detectPitch(buf, sampleRate) {
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1; // too quiet

    // Trim leading/trailing silence
    const threshold = 0.2;
    let r1 = 0, r2 = SIZE - 1;
    for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buf[i]) < threshold) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buf[SIZE - i]) < threshold) { r2 = SIZE - i; break; }

    const trimmed = buf.slice(r1, r2);
    const n = trimmed.length;
    if (n < 2) return -1;

    // Autocorrelation
    const c = new Float32Array(n);
    for (let lag = 0; lag < n; lag++) {
      let sum = 0;
      for (let i = 0; i < n - lag; i++) {
        sum += trimmed[i] * trimmed[i + lag];
      }
      c[lag] = sum;
    }

    // Find first dip after which we look for the peak
    let d = 0;
    while (d < n - 1 && c[d] > c[d + 1]) d++;

    let maxVal = -1;
    let maxIdx = -1;
    for (let i = d; i < n; i++) {
      if (c[i] > maxVal) {
        maxVal = c[i];
        maxIdx = i;
      }
    }
    if (maxIdx <= 0) return -1;

    // Parabolic interpolation around the peak
    let T0 = maxIdx;
    if (maxIdx > 0 && maxIdx < n - 1) {
      const x1 = c[maxIdx - 1];
      const x2 = c[maxIdx];
      const x3 = c[maxIdx + 1];
      const a = (x1 + x3 - 2 * x2) / 2;
      const b = (x3 - x1) / 2;
      if (a !== 0) T0 = maxIdx - b / (2 * a);
    }

    const freq = sampleRate / T0;
    if (freq < 60 || freq > 1500) return -1; // outside reasonable guitar range
    return freq;
  }

  function statusFromCents(cents) {
    const a = Math.abs(cents);
    if (a < 5) return 'in-tune';
    if (a < 15) return 'close';
    return 'off';
  }

  function statusText(cents) {
    const a = Math.abs(cents);
    if (a < 5) return 'afinada';
    if (a < 15) return cents > 0 ? 'casi · baja un poco' : 'casi · sube un poco';
    return cents > 0 ? 'demasiado alto' : 'demasiado bajo';
  }

  function updateUI(freq, info) {
    const cls = statusFromCents(info.cents);
    smoothedCents = smoothedCents * 0.7 + info.cents * 0.3;
    smoothedFreq = smoothedFreq * 0.7 + freq * 0.3;

    noteEl.textContent = info.name;
    octaveEl.textContent = info.octave;
    prevNoteEl.textContent = midiToName(info.midi - 1);
    nextNoteEl.textContent = midiToName(info.midi + 1);
    freqEl.textContent = smoothedFreq.toFixed(1);
    targetFreqEl.textContent = `objetivo · ${info.targetFreq.toFixed(2)} Hz`;

    // Needle: -50 to +50 cents → 0% to 100%
    const clamped = Math.max(-50, Math.min(50, smoothedCents));
    const pct = ((clamped + 50) / 100) * 100;
    needleEl.style.left = pct + '%';
    needleEl.classList.remove('in-tune', 'close', 'off');
    needleEl.classList.add(cls);

    centsEl.textContent = (smoothedCents >= 0 ? '+' : '') + smoothedCents.toFixed(1) + '¢';

    noteMain.classList.remove('in-tune', 'close', 'off');
    noteMain.classList.add(cls);

    statusEl.textContent = statusText(smoothedCents);
    statusEl.classList.remove('in-tune', 'close', 'off');
    statusEl.classList.add(cls);
  }

  function clearUI() {
    noteEl.textContent = '—';
    octaveEl.textContent = '';
    prevNoteEl.textContent = '';
    nextNoteEl.textContent = '';
    freqEl.textContent = '0.0';
    targetFreqEl.textContent = '';
    needleEl.style.left = '50%';
    needleEl.classList.remove('in-tune', 'close', 'off');
    centsEl.textContent = '0¢';
    noteMain.classList.remove('in-tune', 'close', 'off');
    statusEl.textContent = 'esperando señal…';
    statusEl.classList.remove('in-tune', 'close', 'off');
  }

  function drawScope(freqHz, cents) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // background
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0d1018');
    grad.addColorStop(1, '#0a0c12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      const y = (h / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    // center line
    ctx.strokeStyle = 'rgba(94, 226, 160, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    if (!analyser || !timeBuffer) return;

    analyser.getFloatTimeDomainData(timeBuffer);

    // pick color based on tuning
    let color = 'rgba(255,255,255,0.7)';
    let glow = 'rgba(255,255,255,0.4)';
    if (freqHz > 0) {
      const cls = statusFromCents(cents);
      if (cls === 'in-tune') {
        color = 'rgba(94, 226, 160, 1)';
        glow = 'rgba(94, 226, 160, 0.6)';
      } else if (cls === 'close') {
        color = 'rgba(56, 193, 255, 1)';
        glow = 'rgba(56, 193, 255, 0.5)';
      } else {
        color = 'rgba(255, 181, 71, 1)';
        glow = 'rgba(255, 181, 71, 0.5)';
      }
    }

    // draw waveform
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = glow;
    ctx.beginPath();

    const len = timeBuffer.length;
    // show roughly 4 cycles when locked, else show full buffer
    let displayLen = len;
    if (freqHz > 0) {
      const cyclesToShow = 4;
      const samplesPerCycle = audioCtx.sampleRate / freqHz;
      displayLen = Math.min(len, Math.floor(samplesPerCycle * cyclesToShow));
      if (displayLen < 256) displayLen = 256;
    }

    // find a zero crossing for stable phase
    let start = 0;
    if (freqHz > 0) {
      for (let i = 1; i < len - displayLen - 1; i++) {
        if (timeBuffer[i - 1] <= 0 && timeBuffer[i] > 0) {
          start = i;
          break;
        }
      }
    }

    const slice = displayLen / w;
    for (let x = 0; x < w; x++) {
      const idx = start + Math.floor(x * slice);
      if (idx >= len) break;
      const v = timeBuffer[idx];
      const y = h / 2 - v * (h / 2) * 1.6;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // freq tag in corner
    if (freqHz > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '11px -apple-system, system-ui, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(freqHz.toFixed(1) + ' Hz', 10, 10);
    }
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    if (!analyser) return;

    analyser.getFloatTimeDomainData(buffer);
    const freq = detectPitch(buffer, audioCtx.sampleRate);

    let info = null;
    let lastCents = smoothedCents;
    if (freq > 0) {
      info = freqToNote(freq);
      updateUI(freq, info);
      lastCents = info.cents;
      // highlight the matching string button if any
      stringBtns.forEach((btn) => {
        const target = parseFloat(btn.dataset.freq);
        const diff = 1200 * Math.log2(freq / target);
        btn.classList.toggle('active', Math.abs(diff) < 50);
      });
    } else {
      // fade-out: keep last note dim
      stringBtns.forEach((btn) => btn.classList.remove('active'));
      statusEl.textContent = 'esperando señal…';
      statusEl.classList.remove('in-tune', 'close', 'off');
    }

    drawScope(freq, lastCents);
  }

  async function start() {
    errorEl.hidden = true;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    } catch (err) {
      errorEl.hidden = false;
      errorEl.textContent =
        'No se pudo acceder al micrófono: ' + (err.message || err.name) +
        '. En iOS/Android la página debe estar en HTTPS.';
      return;
    }

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    source = audioCtx.createMediaStreamSource(mediaStream);

    // Filters to clean up the signal (guitar fundamentals 60-1500 Hz)
    highpass = audioCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 50;

    lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 2000;

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(analyser);

    buffer = new Float32Array(analyser.fftSize);
    timeBuffer = new Float32Array(analyser.fftSize);

    resizeCanvas();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusEl.textContent = 'escuchando…';
    loop();
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    if (source) try { source.disconnect(); } catch (_) {}
    if (highpass) try { highpass.disconnect(); } catch (_) {}
    if (lowpass) try { lowpass.disconnect(); } catch (_) {}
    if (analyser) try { analyser.disconnect(); } catch (_) {}
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
    analyser = null;
    source = null;
    buffer = null;
    timeBuffer = null;
    smoothedCents = 0;
    smoothedFreq = 0;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    clearUI();
    // clear canvas
    resizeCanvas();
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    drawScope(-1, 0);
  }

  startBtn.addEventListener('click', start);
  stopBtn.addEventListener('click', stop);

  // String reference button: short beep at target frequency
  stringBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const freq = parseFloat(btn.dataset.freq);
      playReferenceTone(freq);
    });
  });

  function playReferenceTone(freq) {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ac.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ac.currentTime + 1.4);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 1.5);
    osc.onended = () => ac.close();
  }

  // Initial paint
  resizeCanvas();
  clearUI();
  drawScope(-1, 0);
})();
