(() => {
  'use strict';
  const form = document.querySelector('[data-st-contact-form]');
  if (!form) return;
  const config = window.shutterTrendConfig?.contact || {};
  const fields = form.querySelector('fieldset');
  const submit = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[role="status"]');
  let endpoint = null, sending = false, sent = false;
  try {
    const url = new URL(config.formEndpoint);
    if (url.protocol === 'https:' && url.hostname === 'formspree.io' && /^\/f\/[a-zA-Z0-9]+$/.test(url.pathname) && !url.username && !url.password && !url.search) endpoint = url.href;
  } catch {}
  if (!endpoint) {
    status.textContent = 'Online inquiries are currently unavailable. Please try again later.';
    return;
  }
  form.action = endpoint;
  fields.disabled = false; submit.disabled = false;
  status.textContent = '';
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || sent) return;
    ['name','email','message'].forEach(name => { form.elements[name].value = form.elements[name].value.trim(); });
    if (!form.reportValidity()) return;
    if (form.elements._gotcha.value) { status.textContent = 'Unable to send this inquiry. Please try again.'; return; }
    const data = new FormData(form);
    sending = true; fields.disabled = true; submit.disabled = true;
    form.setAttribute('aria-busy','true'); status.dataset.state='pending'; status.textContent = 'Sending your inquiry…';
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(),20000);
    try {
      const response = await fetch(endpoint,{method:'POST',body:data,headers:{Accept:'application/json'},signal:controller.signal});
      const payload = await response.json().catch(()=>null);
      if (!response.ok || !payload || payload.ok === false || payload.errors) throw new Error('Submission rejected');
      sent = true; form.reset(); status.dataset.state='success';
      status.textContent = "Thanks for reaching out! Your inquiry has been sent. I'll be in touch soon.";
    } catch {
      status.dataset.state='error';
      status.textContent = 'Your inquiry could not be sent. Your message is still here. Please try again. If the request timed out, check before resending.';
    } finally {
      clearTimeout(timeout); sending = false; fields.disabled = sent;
      submit.disabled = sent; submit.textContent = sent ? 'Inquiry sent' : 'Send inquiry';
      form.setAttribute('aria-busy','false');
    }
  });
})();
