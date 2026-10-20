/**
 * RAAZ LATE NIGHT OTT - CORE APP CONTROLLER
 * Handles interactive story cards, discreet browsing mode, and UI enhancements.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Discreet Mode Toggle (for late-night privacy)
  const discreetToggle = document.getElementById('btnDiscreetMode');
  let isDiscreet = false;

  if (discreetToggle) {
    discreetToggle.addEventListener('click', () => {
      isDiscreet = !isDiscreet;
      if (isDiscreet) {
        document.title = 'Audio Stories - Personal Library';
        discreetToggle.innerHTML = `<span>👁️ Regular Mode</span>`;
        document.querySelectorAll('.badge-mature').forEach(b => b.style.opacity = '0.3');
        document.body.classList.add('discreet-active');
      } else {
        document.title = 'RAAZ - Late Night Audio Stories | 1 Day FREE Trial';
        discreetToggle.innerHTML = `<span>🔒 Discreet Mode</span>`;
        document.querySelectorAll('.badge-mature').forEach(b => b.style.opacity = '1');
        document.body.classList.remove('discreet-active');
      }
    });
  }

  // 2. Story Cards Click Directly Opens Checkout Sheet
  const storyCards = document.querySelectorAll('.story-card-compact');
  storyCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const storyTitle = card.getAttribute('data-story-title') || '1 Day FREE VIP Pass';
      const slideIndex = card.getAttribute('data-slide-index');

      // Switch hero slider so visual context matches
      if (window.heroSlider && slideIndex !== null) {
        window.heroSlider.goToSlide(parseInt(slideIndex, 10));
      }
      
      const digits = getCleanDigits();
      // Direct checkout opening as requested
      if (window.checkoutController) {
        window.checkoutController.open(storyTitle, digits);
      }
    });
  });

  // 3. Real-Time Phone Number Input Auto-Formatter & 10-Digit Micro-Feedback
  const phoneInput = document.getElementById('mobileNumberInput');
  const phoneGroup = document.getElementById('phoneInputGroup');
  const phoneHint = document.getElementById('phoneHintMsg');
  const primaryCta = document.getElementById('primaryCtaBtn');
  const stickyJoinBtn = document.getElementById('stickyJoinBtn');
  const quickJoinCard = document.getElementById('quickJoinCard');

  const formatPhoneNumber = (val) => {
    // Strip non-digits and limit to 10
    const digits = val.replace(/\D/g, '').slice(0, 10);
    if (digits.length > 5) {
      return digits.slice(0, 5) + ' ' + digits.slice(5);
    }
    return digits;
  };

  const getCleanDigits = () => {
    return phoneInput ? phoneInput.value.replace(/\D/g, '') : '';
  };

  const showPhoneError = (message) => {
    if (phoneHint) {
      phoneHint.textContent = message;
      phoneHint.style.display = 'block';
    }
    if (phoneGroup) {
      phoneGroup.classList.remove('shake-error');
      void phoneGroup.offsetWidth;
      phoneGroup.classList.add('shake-error');
    }
    if (phoneInput) {
      phoneInput.focus();
    }
  };

  const hidePhoneError = () => {
    if (phoneHint) {
      phoneHint.style.display = 'none';
      phoneHint.textContent = '';
    }
    if (phoneGroup) {
      phoneGroup.classList.remove('shake-error');
    }
  };

  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      const formatted = formatPhoneNumber(e.target.value);
      e.target.value = formatted;
      hidePhoneError();

      // Check if user reached full 10 digits -> Provide reassuring micro-feedback
      const digits = getCleanDigits();
      if (digits.length === 10) {
        if (phoneGroup) {
          phoneGroup.classList.add('is-valid');
          phoneGroup.style.borderColor = '#4ade80';
          phoneGroup.style.boxShadow = '0 0 24px rgba(74, 222, 128, 0.45)';
        }
        if (primaryCta) {
          primaryCta.classList.add('pulse-cta');
        }
      } else {
        if (phoneGroup) {
          phoneGroup.classList.remove('is-valid');
          phoneGroup.style.borderColor = '';
          phoneGroup.style.boxShadow = '';
        }
        if (primaryCta) {
          primaryCta.classList.remove('pulse-cta');
        }
      }
    });

    phoneInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleProceed();
      }
    });
  }

  // Handle CTA Click
  const handleProceed = () => {
    const digits = getCleanDigits();
    if (digits.length === 10) {
      hidePhoneError();
      if (window.checkoutController) {
        window.checkoutController.open('VIP Pass — First 1 Day @ Rs 1 (Bhabhi Ne Aakhir Aisa Kya Kiya?)', digits);
      }
    } else if (digits.length > 0) {
      showPhoneError('Kripya poora 10-digit mobile number enter karein');
    } else {
      showPhoneError('Pehle apna mobile number dalein');
    }
  };

  if (primaryCta) {
    primaryCta.addEventListener('click', (e) => {
      e.preventDefault();
      handleProceed();
    });
  }

  // Sticky CTA Button: either proceeds or scrolls up to phone input
  if (stickyJoinBtn) {
    stickyJoinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const digits = getCleanDigits();
      if (digits.length === 10) {
        if (window.checkoutController) {
          window.checkoutController.open('VIP Pass — First 1 Day @ Rs 1', digits);
        }
      } else {
        if (quickJoinCard) {
          quickJoinCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            showPhoneError('Apna mobile number enter karein');
          }, 350);
        } else {
          handleProceed();
        }
      }
    });
  }

  // 4. Live Urgency Countdown Timer (To midnight, daily reset)
  const updateUrgencyCountdown = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    let diff = midnight - now;
    if (diff < 0) diff = 0;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const formatted = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.querySelectorAll('.countdown-timer-value').forEach(el => {
      el.textContent = formatted;
    });
  };
  setInterval(updateUrgencyCountdown, 1000);
  updateUrgencyCountdown();

  // 5. Live Incrementing Social Proof Counter (Increments every 8-12 seconds)
  const socialEl = document.getElementById('liveSocialCounter');
  if (socialEl) {
    let socialCount = 50482;
    const tickSocialCount = () => {
      socialCount += 1;
      socialEl.textContent = socialCount.toLocaleString('en-IN');
      socialEl.classList.add('counter-pulse');
      setTimeout(() => socialEl.classList.remove('counter-pulse'), 900);

      const nextDelay = Math.floor(Math.random() * 4000) + 8000;
      setTimeout(tickSocialCount, nextDelay);
    };
    setTimeout(tickSocialCount, 8500);
  }

  // 6. Exit-Intent / Scroll-Up Nudge Toast
  const exitToast = document.getElementById('exitIntentToast');
  const btnExitAction = document.getElementById('btnExitToastAction');
  const btnExitClose = document.getElementById('btnExitToastClose');
  let lastScrollY = window.scrollY;
  let hasShownExitToast = false;

  const showExitToast = () => {
    if (hasShownExitToast || !exitToast) return;
    hasShownExitToast = true;
    exitToast.classList.add('active');
  };

  const hideExitToast = () => {
    if (exitToast) exitToast.classList.remove('active');
  };

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    // When user has scrolled past hero (> 180px) and scrolls back up (> 20px)
    if (currentY > 180 && (lastScrollY - currentY > 20)) {
      showExitToast();
    }
    lastScrollY = currentY;
  }, { passive: true });

  if (btnExitClose) {
    btnExitClose.addEventListener('click', hideExitToast);
  }

  if (btnExitAction) {
    btnExitAction.addEventListener('click', () => {
      hideExitToast();
      const digits = getCleanDigits();
      if (digits.length === 10) {
        if (window.checkoutController) {
          window.checkoutController.open('VIP Pass — First 1 Day @ Rs 1 (Midnight Special)', digits);
        }
      } else {
        const stickyBar = document.getElementById('stickyMobileBar');
        if (stickyBar) {
          stickyBar.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        if (phoneInput) {
          setTimeout(() => phoneInput.focus(), 350);
        }
      }
    });
  }

  // 5. Legal Policies & Disclosures Modal Controller
  const legalModal = document.getElementById('legalModal');
  const legalTabBtns = document.querySelectorAll('.legal-tab-btn');
  const legalPanes = document.querySelectorAll('.legal-pane');

  const switchLegalTab = (targetId) => {
    legalTabBtns.forEach(btn => {
      const isTarget = btn.getAttribute('data-tab-target') === targetId;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    legalPanes.forEach(pane => {
      if (pane.id === targetId) {
        pane.style.display = 'flex';
        pane.classList.add('active');
      } else {
        pane.style.display = 'none';
        pane.classList.remove('active');
      }
    });
  };

  const openLegalModal = (tabName = 'terms') => {
    if (!legalModal) return;
    const targetMap = {
      'terms': 'tab-terms',
      'privacy': 'tab-privacy',
      'mandate': 'tab-mandate',
      'grievance': 'tab-grievance'
    };
    const targetPaneId = targetMap[tabName] || 'tab-terms';
    switchLegalTab(targetPaneId);
    legalModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLegalModal = () => {
    if (!legalModal) return;
    legalModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-open-legal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.getAttribute('data-open-legal') || 'terms';
      openLegalModal(tab);
    });
  });

  document.querySelectorAll('[data-close-legal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeLegalModal();
    });
  });

  if (legalModal) {
    legalModal.addEventListener('click', (e) => {
      if (e.target === legalModal) {
        closeLegalModal();
      }
    });
  }

  legalTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab-target');
      switchLegalTab(targetId);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && legalModal && legalModal.classList.contains('active')) {
      closeLegalModal();
    }
  });

  // 6. Prevent bounce scroll overshooting on modal open
  document.addEventListener('touchmove', (e) => {
    if (document.body.classList.contains('modal-open') || (legalModal && legalModal.classList.contains('active'))) {
      e.preventDefault();
    }
  }, { passive: false });
});
