const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('in-view'));
}

const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('[type="submit"]');
    const formMessage = document.getElementById('form-message');
    const originalButtonText = submitButton.textContent;

    formMessage.textContent = '';
    formMessage.className = 'form-message';
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
      const formData = new FormData(contactForm);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to send message.');
      }

      formMessage.textContent = "Message sent ✓ I'll be in touch shortly.";
      formMessage.classList.add('success');
      contactForm.reset();

      if (window.turnstile) {
        window.turnstile.reset();
      }

      submitButton.textContent = 'Message sent ✓';

      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }, 3000);
    } catch (error) {
      formMessage.textContent = error.message || 'Unable to send message. Please try again.';
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}

// Portfolio live preview selector
const portfolioCards = document.querySelectorAll('.portfolio-project-card');
const portfolioFrame = document.getElementById('portfolio-preview-frame');
const portfolioTitle = document.getElementById('portfolio-title');
const portfolioCategory = document.getElementById('portfolio-category');
const portfolioDescription = document.getElementById('portfolio-description');
const portfolioUrl = document.getElementById('portfolio-url');
const portfolioOpen = document.getElementById('portfolio-open');

if (portfolioCards.length) {
  portfolioCards.forEach((card) => {
    card.addEventListener('click', () => {
      const url = card.dataset.url;
      const displayUrl = card.dataset.displayUrl || url;
      const title = card.dataset.title;
      const category = card.dataset.category;
      const description = card.dataset.description;

      const isMobilePortfolio = window.matchMedia('(max-width: 720px)').matches;

      if (isMobilePortfolio && url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }

      portfolioCards.forEach((item) => item.classList.remove('active'));
      card.classList.add('active');

      if (portfolioFrame && url) {
        portfolioFrame.src = url;
      }

      if (portfolioOpen && url) {
        portfolioOpen.href = url;
      }

      if (portfolioUrl) {
        portfolioUrl.textContent = displayUrl;
      }

      if (portfolioTitle) {
        portfolioTitle.textContent = title;
      }

      if (portfolioCategory) {
        portfolioCategory.textContent = category;
      }

      if (portfolioDescription) {
        portfolioDescription.textContent = description;
      }
    });
  });
}
