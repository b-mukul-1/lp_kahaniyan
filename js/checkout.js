/**
 * RAAZ LATE NIGHT OTT - CHECKOUT PLACEHOLDER CONTROLLER
 * Compliant with regulatory guidelines:
 * - Clearly labelled demo checkout placeholder
 * - Full upfront disclosure of recurring subscription price (₹299/3 months) & frequency
 * - Support for UPI AutoPay mandate selection (GPay, PhonePe, Paytm, BHIM)
 */

class CheckoutModalController {
  constructor() {
    this.modal = document.getElementById('checkoutModal');
    this.sheet = document.getElementById('checkoutSheet');
    this.form = document.getElementById('mandateCheckoutForm');
    this.formView = document.getElementById('mandateCheckoutForm') || document.querySelector('.checkout-form-view');
    this.successView = document.getElementById('checkoutSuccessView');
    this.btnAuthorize = document.getElementById('btnAuthorizeMandate');
    this.storyTitleTarget = document.getElementById('checkoutStoryTarget');

    this.bindEvents();
  }

  bindEvents() {
    // Open triggers across page
    document.querySelectorAll('[data-open-checkout]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const customTitle = btn.getAttribute('data-story-title');
        this.open(customTitle);
      });
    });

    // Close triggers
    document.querySelectorAll('[data-close-checkout]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });
    });

    // Backdrop click
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.close();
      }
    });

    // Tap an app below to subscribe instantly (Myuze style 1-tap UX)
    const appTiles = document.querySelectorAll('.myuze-app-tile');
    appTiles.forEach(tile => {
      tile.addEventListener('click', (e) => {
        const radio = tile.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        // 1-tap fast authorization
        setTimeout(() => {
          this.handleSimulatedAuthorization();
        }, 150);
      });
    });

    // Form submission (Subscribe button or Enter key)
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSimulatedAuthorization();
      });
    }
  }

  open(storyTitle = null, mobileNumber = null) {
    if (!this.modal) return;

    // Reset views
    if (this.formView) this.formView.style.display = 'flex';
    if (this.successView) this.successView.style.display = 'none';
    if (this.btnAuthorize) {
      this.btnAuthorize.disabled = false;
      this.btnAuthorize.textContent = 'Subscribe';
    }

    if (storyTitle && this.storyTitleTarget) {
      this.storyTitleTarget.textContent = `Includes: ${storyTitle}`;
    } else if (this.storyTitleTarget) {
      this.storyTitleTarget.textContent = `Includes: "Bhabhi Ne Aakhir Aisa Kya Kiya?" + All 23 VIP Stories`;
    }

    const mobileInput = document.getElementById('mobileNumberInput');
    const userMobileSpan = document.getElementById('checkoutUserMobile');
    const phoneVal = (mobileNumber || (mobileInput ? mobileInput.value : '')).trim();
    if (phoneVal && userMobileSpan) {
      userMobileSpan.textContent = `Linked Mobile: +91 ${phoneVal}`;
      userMobileSpan.style.display = 'block';
    } else if (userMobileSpan) {
      userMobileSpan.style.display = 'none';
    }

    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  handleSimulatedAuthorization() {
    if (!this.btnAuthorize) return;

    // Consent check
    const consentCheck = document.getElementById('mandateConsentCheckbox');
    if (consentCheck && !consentCheck.checked) {
      alert('Kripya UPI mandate terms ko accept karein to proceed.');
      return;
    }

    // Selected UPI method
    const selectedApp = document.querySelector('input[name="selected_upi_app"]:checked')?.value || 'gpay';
    const appNames = {
      'gpay': 'Google Pay',
      'phonepe': 'PhonePe',
      'paytm': 'Paytm UPI',
      'custom': 'UPI App'
    };
    const appLabel = appNames[selectedApp] || 'UPI';

    // Show processing state
    this.btnAuthorize.disabled = true;
    this.btnAuthorize.innerHTML = `
      <svg style="animation: spin 0.8s linear infinite; width:18px; height:18px; margin-right:8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle>
      </svg>
      Connecting to ${appLabel}...
    `;

    // Simulate 1.2s API response
    setTimeout(() => {
      if (this.formView) this.formView.style.display = 'none';
      if (this.successView) {
        this.successView.style.display = 'flex';
        const simulatedAppText = document.getElementById('simulatedAppText');
        if (simulatedAppText) {
          simulatedAppText.textContent = appLabel;
        }
      }
    }, 1200);
  }
}

// Add CSS keyframe for spinner in head if needed
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(styleSheet);

document.addEventListener('DOMContentLoaded', () => {
  window.checkoutController = new CheckoutModalController();
});
