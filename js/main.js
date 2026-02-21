/* ===== Momidev Coffee House main.js ===== */

const GAS_FEEDBACK_URL = 'https://script.google.com/macros/s/AKfycby6TWNn-6hSOCBmzHXk-7UjwXxFX_BvHFpTDzbS34wBhH8wV-WRxP86wuqamCMVs6mS/exec'; // e.g., https://script.google.com/macros/s/.../exec
const FORMSPREE_ENDPOINT = ''; // optional: e.g., 'https://formspree.io/f/abcdwxyz'

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Smooth scroll for internal links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* ---------- Tabs (Product Enquiry / Feedback) ---------- */
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
      panels[btn.dataset.tab].classList.add('active');
    });
  });
  // default: show Product Enquiry
  const defaultBtn = document.querySelector('#enquiry-feedback .tab-btn[data-tab="enquiry"]');
  if (defaultBtn) defaultBtn.click();

  /* ---------- Product Enquiry (validations + optional email) ---------- */
  const enqForm = document.getElementById('enquiryForm');
  const enqSuccess = document.getElementById('enqSuccess');

  const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;
  // Simple, robust client-side email check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setErr(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg || '';
  }

  function validateEnquiry() {
    let ok = true;
    const name = (document.getElementById('enqName')?.value || '').trim();
    const contact = (document.getElementById('enqContact')?.value || '').trim();
    const email = (document.getElementById('enqEmail')?.value || '').trim();
    const message = (document.getElementById('enqMessage')?.value || '').trim();

    if (name.length < 2) { setErr('err-enqName', 'Please enter your name'); ok = false; }
    else setErr('err-enqName', '');

    if (!phoneRegex.test(contact)) { setErr('err-enqContact', 'Enter a valid Indian mobile (e.g., 9876543210 or +91 9876543210)'); ok = false; }
    else setErr('err-enqContact', '');

    if (!emailRegex.test(email)) { setErr('err-enqEmail', 'Enter a valid email address'); ok = false; }
    else setErr('err-enqEmail', '');

    if (message.length < 2) { setErr('err-enqMessage', 'Please describe your product enquiry'); ok = false; }
    else setErr('err-enqMessage', '');

    return ok ? { name, contact, email, message } : null;
  }

  if (enqForm) {
    enqForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (enqSuccess) enqSuccess.hidden = true;
      const data = validateEnquiry();
      if (!data) return;

      const payload = {
        Name: data.name,
        Contact: data.contact,
        Email: data.email,
        'Product Enquiry': data.message,
        TargetEmail: 'pearl16750@gmail.com'
      };

      try {
        if (FORMSPREE_ENDPOINT) {
          // Send to Formspree (no backend required)
          const fd = new FormData();
          fd.append('Name', payload.Name);
          fd.append('Contact', payload.Contact);
          fd.append('Email', payload.Email);
          fd.append('Product Enquiry', payload['Product Enquiry']);
          await fetch(FORMSPREE_ENDPOINT, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } });
        } else {
          // No email endpoint configured (only show success)
          console.log('Enquiry (no email endpoint configured). Payload:', payload);
        }
        enqForm.reset();
        if (enqSuccess) enqSuccess.hidden = false;
      } catch (err) {
        alert('Sorry, something went wrong. Please try again later.');
        console.error(err);
      }
    });
  }

  /* ---------- Feedback (Google Sheets via Apps Script) ---------- */
const GAS_FEEDBACK_URL = 'PASTE_YOUR_/exec_URL_HERE';

const fbForm = document.getElementById('feedbackForm');
const fbStars = document.getElementById('fbStars');
const fbList  = document.getElementById('feedbackList');
let selectedRating = 0;

function renderStars(upto) {
  if (!fbStars) return;
  fbStars.querySelectorAll('span').forEach((s, i) => {
    s.classList.toggle('active', i < upto);
  });
}
if (fbStars) {
  fbStars.querySelectorAll('span').forEach(s => {
    s.addEventListener('click', () => {
      selectedRating = Number(s.dataset.rate);
      renderStars(selectedRating);
    });
  });
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;'}[c]));
}
function renderFeedbackListFromData(items) {
  if (!fbList) return;
  if (!Array.isArray(items) || !items.length) { fbList.innerHTML = ''; return; }
  fbList.innerHTML = items
    .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map(it => {
      const rate = Number(it.rating || 0);
      const stars = '★'.repeat(rate) + '☆'.repeat(5 - rate);
      const ts = it.timestamp ? new Date(it.timestamp).toLocaleString() : '';
      return `
        <article class="card feedback-card">
          <h4>${escapeHtml(it.name || 'Guest')}</h4>
          <div class="feedback-meta">${stars} • ${ts}</div>
          <p>${escapeHtml(it.message || '')}</p>
        </article>`;
    }).join('');
}

async function fetchAllFeedback() {
  const res = await fetch(GAS_FEEDBACK_URL, { method: 'GET' });
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    console.error('GET returned non-JSON:', txt);
    throw new Error('Server did not return JSON on GET');
  }
}

async function postFeedback({ name, message, rating }) {
  const res = await fetch(GAS_FEEDBACK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },   // JSON POST
    body: JSON.stringify({ name, message, rating })
  });
  const txt = await res.text();
  let data;
  try {
    data = JSON.parse(txt);
  } catch {
    console.error('POST returned non-JSON:', txt);
    throw new Error('Server did not return JSON on POST');
  }
  if (!data.ok) throw new Error(data.error || 'Failed to submit');
}

(async () => {
  try {
    const items = await fetchAllFeedback();
    renderFeedbackListFromData(items);
  } catch (e) {
    console.error('Failed to load feedback list:', e);
  }
})();

if (fbForm) {
  fbForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = (document.getElementById('fbName')?.value || '').trim();
    const message = (document.getElementById('fbMessage')?.value || '').trim();

    let ok = true;
    const setErr = (id,msg)=>{ const el=document.getElementById(id); if(el) el.textContent=msg||''; };
    if (name.length < 2) { setErr('err-fbName','Please enter your name'); ok = false; } else setErr('err-fbName','');
    if (message.length < 2) { setErr('err-fbMessage','Please write your feedback'); ok = false; } else setErr('err-fbMessage','');

    if (!ok) return;

    try {
      await postFeedback({ name, message, rating: selectedRating || 0 });
      fbForm.reset();
      selectedRating = 0; renderStars(0);
      const items = await fetchAllFeedback();
      renderFeedbackListFromData(items);
    } catch (err) {
      alert('Sorry, could not submit feedback right now.');
      console.error('Submit error:', err);
    }
  });
}
