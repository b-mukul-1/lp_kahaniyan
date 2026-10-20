/**
 * RAAZ LATE NIGHT OTT - HERO CINEMATIC IMAGE SWITCHER
 * Automatically switches between 9:16 cinematic story images every 3.5 seconds
 * with smooth crossfade, Ken Burns zoom, and Instagram/OTT-style progress indicators.
 */

class HeroImageSlider {
  constructor() {
    this.container = document.getElementById('heroSlidesContainer');
    this.slides = document.querySelectorAll('.hero-slide');
    this.progressBars = document.querySelectorAll('.progress-bar-fill');
    this.statusText = document.getElementById('slideStatusText');
    this.slideTagPill = document.getElementById('slideTagPill');
    
    this.totalSlides = this.slides.length;
    this.currentIndex = 0;
    this.slideDuration = 5000; // 5 seconds for optimal reading & emotional connection
    this.startTime = null;
    this.animFrameId = null;
    this.isPaused = false;

    // Metadata for each slide
    this.slideData = [
      {
        tag: "🌙 Story 1: Bhabhi Ne Aakhir Aisa Kya Kiya?",
        status: "TRENDING #1 TONIGHT",
        badge: "EXCLUSIVE PREMIERE"
      },
      {
        tag: "🔥 Story 2: Padosan Ka Raaz",
        status: "MOST LISTENED THRILLER",
        badge: "EPISODE 2 INCLUDED"
      },
      {
        tag: "⚡ Story 3: Band Kamre Ka Kissa",
        status: "LATE NIGHT SPECIAL",
        badge: "FIRST 1 DAY @ ₹1"
      }
    ];

    if (this.totalSlides > 0) {
      this.init();
    }
  }

  init() {
    this.showSlide(0);
    this.startProgressLoop();
    this.bindEvents();
  }

  bindEvents() {
    // Tap zones: left 35% goes previous, right 65% goes next
    const btnPrev = document.getElementById('slideTapPrev');
    const btnNext = document.getElementById('slideTapNext');

    if (btnPrev) {
      btnPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        this.prevSlide();
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        this.nextSlide();
      });
    }

    // Direct click on progress bar indicators
    const progressTracks = document.querySelectorAll('.progress-bar-track');
    progressTracks.forEach(track => {
      track.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(track.getAttribute('data-slide-index'), 10);
        if (!isNaN(index)) {
          this.goToSlide(index);
        }
      });
    });

    // Pause on touch/mouse hold for mobile UX
    if (this.container) {
      this.container.addEventListener('pointerdown', () => {
        this.isPaused = true;
        const curVid = this.slides[this.currentIndex]?.querySelector('video');
        if (curVid) curVid.pause();
      });
      this.container.addEventListener('pointerup', () => {
        this.isPaused = false;
        this.startTime = performance.now() - (this.lastProgress || 0) * this.slideDuration;
        const curVid = this.slides[this.currentIndex]?.querySelector('video');
        if (curVid) curVid.play().catch(() => {});
      });
      this.container.addEventListener('pointercancel', () => {
        this.isPaused = false;
        const curVid = this.slides[this.currentIndex]?.querySelector('video');
        if (curVid) curVid.play().catch(() => {});
      });
    }
  }

  showSlide(index) {
    this.currentIndex = (index + this.totalSlides) % this.totalSlides;

    // Update slides class and video playback
    this.slides.forEach((slide, idx) => {
      const vid = slide.querySelector('video');
      if (idx === this.currentIndex) {
        slide.classList.add('active');
        if (vid) {
          vid.currentTime = 0;
          vid.play().catch(() => {});
        }
      } else {
        slide.classList.remove('active');
        if (vid) {
          vid.pause();
        }
      }
    });

    // Update pill text & status
    const data = this.slideData[this.currentIndex];
    if (data) {
      if (this.slideTagPill) {
        this.slideTagPill.textContent = data.tag;
      }
      if (this.statusText) {
        this.statusText.textContent = data.status;
      }
    }

    // Reset progress timers
    this.startTime = performance.now();
  }

  nextSlide() {
    this.showSlide(this.currentIndex + 1);
  }

  prevSlide() {
    this.showSlide(this.currentIndex - 1);
  }

  goToSlide(index) {
    this.showSlide(index);
  }

  startProgressLoop() {
    this.startTime = performance.now();

    const update = (now) => {
      if (!this.isPaused) {
        const elapsed = now - this.startTime;
        const progress = Math.min(elapsed / this.slideDuration, 1);
        this.lastProgress = progress;

        // Update indicator fills
        this.progressBars.forEach((bar, idx) => {
          if (idx < this.currentIndex) {
            bar.style.width = '100%';
          } else if (idx === this.currentIndex) {
            bar.style.width = `${progress * 100}%`;
          } else {
            bar.style.width = '0%';
          }
        });

        // Switch to next slide when duration finishes
        if (elapsed >= this.slideDuration) {
          this.nextSlide();
        }
      }

      this.animFrameId = requestAnimationFrame(update);
    };

    this.animFrameId = requestAnimationFrame(update);
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.heroSlider = new HeroImageSlider();
});
