document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
    });
  });
});
document.addEventListener('DOMContentLoaded', () => {
  // ---------------- Tabs ----------------
  const tabButtons = document.querySelectorAll('#enquiry-feedback .tab-btn');
  const panels = {
    enquiry: document.getElementById('tab-enquiry'),
    feedback: document.getElementById('tab-feedback')
  };
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      Object.values(panels).forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.dataset.tab;
      panels[key].classList.add('active');
    });
  });
  // Make Tab 1 visible by default
  document.querySelector('#enquiry-feedback .tab-btn[data-tab="enquiry"]').click();

  // ---------------- Product Enquiry ----------------
  const enqForm = document.getElementById('enquiryForm');
  const enqSuccess = document.getElementById('enqSuccess');

  const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;
  const emailRegex = /^[\\w.!#$%&'*+/=?^`{|}~-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+$/;

  function setErr(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg || '';
  }

  function validateEnquiry() {
    let ok = true;
    const name = document.getElementById('enqName').value.trim();
    const contact = document.getElementById('enqContact').value.trim();
    const email = document.getElementById('enqEmail').value.trim();
    const message = document.getElementById('enqMessage').value.trim();

    // Name
    if (name.length < 2) { setErr('err-enqName', 'Please enter your name'); ok = false; }
    else setErr('err-enqName', '');

    // Contact
    if (!phoneRegex.test(contact)) { setErr('err-enqContact', 'Enter a valid Indian mobile (e.g., 9876543210 or +91 9876543210)'); ok = false; }
    else setErr('err-enqContact', '');

    // Email
    if (!emailRegex.test(email)) { setErr('err-enqEmail', 'Enter a valid email address'); ok = false; }
    else setErr('err-enqEmail', '');

    // Message
    if (message.length < 2) { setErr('err-enqMessage', 'Please describe your product enquiry'); ok = false; }
    else setErr('err-enqMessage', '');

    return ok ? { name, contact, email, message } : null;
  }

  // 🔔 Email sending setup (OPTIONAL)
  // Use a static-form service like Formspree (free) – create a form and get an endpoint:
  //   https://formspree.io/  (create -> get endpoint like https://formspree.io/f/xxxxxx)
  // Then paste the URL below:
  const FORMSPREE_ENDPOINT = ''; // e.g., 'https://formspree.io/f/abcdwxyz'

  enqForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    enqSuccess.hidden = true;
    const data = validateEnquiry();
    if (!data) return;

    // Build payload
    const payload = {
      Name: data.name,
      Contact: data.contact,
      Email: data.email,
      'Product Enquiry': data.message,
      TargetEmail: 'pearl16750@gmail.com' // for your reference in the inbox
    };

    try {
      if (FORMSPREE_ENDPOINT) {
        // Send to Formspree (no backend needed)
        const resp = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(Object.assign(document.createElement('form'), {
            elements: [
              Object.assign(document.createElement('input'), { name: 'Name', value: payload.Name }),
              Object.assign(document.createElement('input'), { name: 'Contact', value: payload.Contact }),
              Object.assign(document.createElement('input'), { name: 'Email', value: payload.Email }),
              Object.assign(document.createElement('textarea'), { name: 'Product Enquiry', value: payload['Product Enquiry'] })
            ]
          }))
        });
        // ignore actual response body; Formspree emails you
      } else {
        // No endpoint configured. We’ll just log the data.
        console.log('Enquiry (no email endpoint configured):', payload);
      }

      enqForm.reset();
      enqSuccess.hidden = false;
    } catch (err) {
      alert('Sorry, something went wrong. Please try again later.');
      console.error(err);
    }
  });

  // ---------------- Feedback (localStorage) ----------------
  const fbForm = document.getElementById('feedbackForm');
  const fbStars = document.getElementById('fbStars');
  const fbList = document.getElementById('feedbackList');

  let selectedRating = 0;
  function renderStars(upto) {
    fbStars.querySelectorAll('span').forEach((s, i) => {
      s.classList.toggle('active', i < upto);
    });
  }
  fbStars.querySelectorAll('span').forEach(s => {
    s.addEventListener('click', () => {
      selectedRating = Number(s.dataset.rate);
      renderStars(selectedRating);
    });
  });

  function validateFeedback() {
    let ok = true;
    const name = document.getElementById('fbName').value.trim();
    const message = document.getElementById('fbMessage').value.trim();

    if (name.length < 2) { setErr('err-fbName', 'Please enter your name'); ok = false; }
    else setErr('err-fbName', '');

    if (message.length < 2) { setErr('err-fbMessage', 'Please write your feedback'); ok = false; }
    else setErr('err-fbMessage', '');

    return ok ? { name, message, rating: selectedRating || 0 } : null;
  }

  function loadFeedback() {
    try {
      return JSON.parse(localStorage.getItem('momi_feedback') || '[]');
    } catch { return []; }
  }
  function saveFeedback(arr) {
    localStorage.setItem('momi_feedback', JSON.stringify(arr));
  }
  function fmtTime(ts) {
    const d = new Date(ts);
    return d.toLocaleString(); // user locale time
  }
  function renderFeedbackList() {
    const items = loadFeedback();
    if (!items.length) { fbList.innerHTML = ''; return; }
    fbList.innerHTML = items.map(it => {
      const stars = '★'.repeat(it.rating || 0) + '☆'.repeat(5 - (it.rating || 0));
      return `
        <article class="card feedback-card">
          <h4>${it.name}</h4>
          <div class="feedback-meta">${stars} • ${fmtTime(it.ts)}</div>
          <p>${it.message}</p>
        </article>`;
    }).join('');
  }
  renderFeedbackList();

  fbForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = validateFeedback();
    if (!data) return;
    const items = loadFeedback();
    items.unshift({ ...data, ts: new Date().toISOString() });
    saveFeedback(items);
    fbForm.reset();
    selectedRating = 0; renderStars(0);
    renderFeedbackList();
  });
});
