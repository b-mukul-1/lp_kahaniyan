/**
 * RAAZ LATE NIGHT OTT - AUTHENTIC AUDIO TEASER ENGINE
 * Plays the official teaser audio 'ऐसी-ऐसी कहानियाँ.mp3',
 * with dual-bound floating hero play button, teaser widget play button,
 * reactive waveform visualizer, synchronized Hinglish dialogue subtitles,
 * and seamless audio context integration.
 */

class AudioTeaserPlayer {
  constructor() {
    this.audio = null;
    this.audioCtx = null;
    this.sourceNode = null;
    this.analyser = null;
    this.isPlaying = false;
    this.isLocked = false;
    this.lockAt = 16.0; // Preview locks strictly at 16 seconds
    this.currentTime = 0;
    this.duration = 18.84; // Official audio duration
    this.animFrameId = null;

    // Subtitle script for dramatic Hindi romantic suspense teaser (locked at 16s)
    this.subtitles = [
      { start: 0, end: 4, text: "🌙 'Aadhi raat ke 1:30 baje... jab poori building so chuki thi...'" },
      { start: 4, end: 8, text: "🚪 'Darwaze par achanak 3 dheemi dastak hui... maine pucha kaun hai?'" },
      { start: 8, end: 12.5, text: "🥀 'Samne Bhabhi khadi thi... bheegi palkein aur haath mein ek purani diary...'" },
      { start: 12.5, end: 16, text: "✨ 'Unhone dheere se kaha: Kisi ko mat batana ki main yahan aayi thi...'" }
    ];

    this.initAudioElement();
    this.initElements();
    this.bindEvents();
    this.drawIdleWaveform();
  }

  initAudioElement() {
    // Primary path with encoded Hindi characters, and ASCII fallback
    const primarySrc = encodeURI('assets/audio/ऐसी-ऐसी कहानियाँ.mp3');
    const fallbackSrc = 'assets/audio/aisi-aisi-kahaniyan.mp3';

    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.src = primarySrc;

    // Fallback if primary fails
    this.audio.addEventListener('error', () => {
      if (this.audio.src !== fallbackSrc) {
        console.warn('Primary audio failed to load, falling back to ASCII path:', fallbackSrc);
        this.audio.src = fallbackSrc;
        this.audio.load();
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio.duration && !isNaN(this.audio.duration)) {
        this.duration = this.audio.duration;
        if (this.timeTotalEl) {
          const m = Math.floor(this.duration / 60);
          const s = Math.floor(this.duration % 60);
          this.timeTotalEl.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
        }
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime;
      if (this.currentTime >= this.lockAt) {
        this.handlePreviewLock();
        return;
      }
      this.updateTimeAndProgress();
      this.updateSubtitle(this.currentTime);
    });

    this.audio.addEventListener('ended', () => {
      this.handlePlaybackEnded();
    });
  }

  initElements() {
    // Teaser Widget Elements
    this.playBtnTeaser = document.getElementById('btnPlayTeaser');
    this.canvas = document.getElementById('waveformCanvas');
    this.canvasCtx = this.canvas ? this.canvas.getContext('2d') : null;
    this.timeCurrentEl = document.getElementById('teaserTimeCurrent');
    this.timeTotalEl = document.getElementById('teaserTimeTotal');
    this.captionEl = document.getElementById('teaserCaptionText');
    this.progressOverlay = document.getElementById('progressSeekOverlay');
    this.teaserCoverArt = document.getElementById('teaserCoverArt');

    // Floating Hero Image Play Pill Elements
    this.heroPlayPill = document.getElementById('heroImagePlayPill');
    this.heroPlayThumbImg = document.getElementById('heroPlayThumbImg');
    this.heroPlayIcon = document.getElementById('heroPlayIcon');
    this.heroPlayActionText = document.getElementById('heroPlayActionText');
    this.pillSoundwaveBars = document.getElementById('pillSoundwaveBars');

    if (this.canvas) {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = (rect.width || 280) * 2;
      this.canvas.height = (rect.height || 28) * 2;
    }
  }

  bindEvents() {
    // Teaser Widget Button
    if (this.playBtnTeaser) {
      this.playBtnTeaser.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePlay();
      });
    }

    // Hero Floating Play Pill
    if (this.heroPlayPill) {
      this.heroPlayPill.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePlay();
      });

      this.heroPlayPill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.togglePlay();
        }
      });
    }

    // Canvas resize
    window.addEventListener('resize', () => {
      if (this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = (rect.width || 280) * 2;
        this.canvas.height = (rect.height || 28) * 2;
        if (!this.isPlaying) {
          this.drawIdleWaveform();
        }
      }
    });

    // Seeker progress click to jump
    const canvasContainer = document.querySelector('.waveform-canvas-container');
    if (canvasContainer) {
      canvasContainer.addEventListener('click', (e) => {
        const rect = canvasContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        if (this.audio) {
          this.audio.currentTime = pct * this.duration;
        }
      });
    }
  }

  async setupWebAudioAnalyser() {
    if (this.sourceNode || !this.audio) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    } catch (e) {
      // Browsers may restrict createMediaElementSource if CORS or already connected; fallback handles visuals
      console.log('Web Audio analyser setup notice:', e.message);
    }
  }

  async togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      await this.play();
    }
  }

  async play() {
    if (!this.audio) return;

    if (this.isLocked) {
      this.autoDirectToCheckout();
      return;
    }

    const teaserWidget = document.getElementById('audioTeaserWidget');
    if (teaserWidget) {
      teaserWidget.classList.remove('teaser-attention-pulse');
    }

    try {
      await this.setupWebAudioAnalyser();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      await this.audio.play();
      this.isPlaying = true;
      this.updatePlayingUI(true);
      this.renderWaveform();
    } catch (err) {
      console.warn('Playback initiation note:', err);
      // Attempt play directly
      this.audio.play().then(() => {
        this.isPlaying = true;
        this.updatePlayingUI(true);
        this.renderWaveform();
      }).catch(e => console.error('Audio play error:', e));
    }
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.updatePlayingUI(false);
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.drawIdleWaveform();
  }

  updatePlayingUI(isPlaying) {
    // 1. Teaser widget button
    if (this.playBtnTeaser) {
      if (isPlaying) {
        this.playBtnTeaser.classList.add('playing');
        this.playBtnTeaser.setAttribute('aria-label', 'Pause Teaser');
        this.playBtnTeaser.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        `;
      } else {
        this.playBtnTeaser.classList.remove('playing');
        this.playBtnTeaser.setAttribute('aria-label', 'Play Teaser');
        this.playBtnTeaser.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;
      }
    }

    // 2. Floating Hero Play Pill
    if (this.heroPlayPill) {
      if (isPlaying) {
        this.heroPlayPill.classList.add('playing');
        this.heroPlayPill.setAttribute('aria-label', 'Pause ऐसी-ऐसी कहानियाँ Teaser');
        if (this.heroPlayIcon) this.heroPlayIcon.textContent = '❚❚';
        if (this.heroPlayActionText) this.heroPlayActionText.textContent = 'Listening now • ऐसी-ऐसी कहानियाँ';
      } else {
        this.heroPlayPill.classList.remove('playing');
        this.heroPlayPill.setAttribute('aria-label', 'Play ऐसी-ऐसी कहानियाँ Audio Teaser');
        if (this.heroPlayIcon) this.heroPlayIcon.textContent = '▶';
        if (this.heroPlayActionText) this.heroPlayActionText.textContent = 'Tap karke suniye • 18s Preview';
      }
    }
  }

  updateTimeAndProgress() {
    const mins = Math.floor(this.currentTime / 60);
    const secs = Math.floor(this.currentTime % 60);
    if (this.timeCurrentEl) {
      this.timeCurrentEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    const pct = Math.min((this.currentTime / this.duration) * 100, 100);
    if (this.progressOverlay) {
      this.progressOverlay.style.width = `${pct}%`;
    }
  }

  updateSubtitle(time) {
    if (!this.captionEl) return;
    const match = this.subtitles.find(s => time >= s.start && time < s.end);
    if (match && this.captionEl.textContent !== match.text) {
      this.captionEl.style.opacity = '0';
      setTimeout(() => {
        this.captionEl.textContent = match.text;
        this.captionEl.style.opacity = '1';
      }, 150);
    }
  }

  handlePreviewLock() {
    if (this.isLocked) return;
    this.isLocked = true;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = this.lockAt;
    }
    this.currentTime = this.lockAt;
    this.isPlaying = false;
    this.updatePlayingUI(false);
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.drawIdleWaveform();

    // Lock indicator in UI
    if (this.timeCurrentEl) {
      this.timeCurrentEl.textContent = '0:16';
    }
    if (this.progressOverlay) {
      this.progressOverlay.style.width = `${(this.lockAt / this.duration) * 100}%`;
    }
    if (this.heroPlayActionText) {
      this.heroPlayActionText.textContent = '🔒 Preview Locked @ 0:16 • Free Trial ₹0';
    }
    if (this.captionEl) {
      this.captionEl.innerHTML = `<span style="color:#ef4444; font-weight:800;">🔒 PREVIEW LOCKED @ 0:16:</span> <em>Aage ka poora sach janne ke liye ₹0 mein Free Trial shuru karein.</em>`;
    }

    // Single biggest moment of intent: Auto-scroll to sticky footer & auto-open checkout if phone entered!
    this.autoDirectToCheckout();
  }

  handlePlaybackEnded() {
    this.handlePreviewLock();
  }

  autoDirectToCheckout() {
    const stickyBar = document.getElementById('stickyMobileBar');
    const phoneInput = document.getElementById('mobileNumberInput');
    const phoneGroup = document.getElementById('phoneInputGroup');

    // 1. Auto-scroll to sticky conversion footer
    if (stickyBar) {
      stickyBar.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    // 2. Check if phone number is already entered (10 digits)
    const cleanDigits = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';
    if (cleanDigits.length === 10) {
      setTimeout(() => {
        if (window.checkoutController) {
          window.checkoutController.open('1 Day FREE VIP Pass (Bhabhi Ne Aakhir Aisa Kya Kiya?)', cleanDigits);
        }
      }, 450);
    } else {
      // Prompt user to enter phone number
      if (phoneGroup) {
        phoneGroup.classList.remove('shake-error');
        void phoneGroup.offsetWidth;
        phoneGroup.classList.add('shake-error');
      }
      setTimeout(() => {
        if (phoneInput) phoneInput.focus();
      }, 550);
    }
  }

  drawIdleWaveform() {
    if (!this.canvasCtx || !this.canvas) return;
    const ctx = this.canvasCtx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    const barCount = 38;
    const barWidth = width / barCount - 3;
    const midY = height / 2;

    for (let i = 0; i < barCount; i++) {
      const amp = Math.sin((i / barCount) * Math.PI) * 0.75 + 0.15;
      const barHeight = Math.max(height * 0.15, height * amp * 0.7);

      const x = i * (barWidth + 3);
      const y = midY - barHeight / 2;

      ctx.fillStyle = i < 14 ? 'rgba(225, 29, 72, 0.45)' : 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 3);
      ctx.fill();
    }
  }

  renderWaveform() {
    if (!this.isPlaying || !this.canvasCtx || !this.canvas) return;

    const ctx = this.canvasCtx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const midY = height / 2;

    let dataArray = null;
    if (this.analyser) {
      const bufferLength = this.analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteFrequencyData(dataArray);
    }

    ctx.clearRect(0, 0, width, height);

    const barCount = 38;
    const barWidth = width / barCount - 3;

    for (let i = 0; i < barCount; i++) {
      let val = 40;
      if (dataArray && dataArray.length > 0) {
        const dataIndex = Math.floor((i / barCount) * dataArray.length);
        val = dataArray[dataIndex] || 40;
      } else {
        val = (Math.sin(Date.now() * 0.008 + i * 0.4) * 0.5 + 0.5) * 160 + 30;
      }

      const normalized = Math.min(Math.max(val / 255, 0.15), 0.95);
      const barHeight = height * normalized;
      const x = i * (barWidth + 3);
      const y = midY - barHeight / 2;

      const isPast = (i / barCount) <= (this.currentTime / this.duration);
      if (isPast) {
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#ff4d6d');
        grad.addColorStop(1, '#fbbf24');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 3);
      ctx.fill();
    }

    this.animFrameId = requestAnimationFrame(() => this.renderWaveform());
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.audioTeaser = new AudioTeaserPlayer();
});
