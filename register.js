/* ══════════════════════════════════════
   Supabase client
══════════════════════════════════════ */
const { createClient } = supabase;
const sb = createClient(
  'https://uzwklboigiwtmvsqmkwk.supabase.co',
  'sb_publishable_qcS--0Mh7coZQ9v1JO_4ng_INIYZ8Wt'
);

/* ══════════════════════════════════════
   Member count from Supabase
══════════════════════════════════════ */
async function updateCount() {
  const { count } = await sb
    .from('registrations')
    .select('*', { count: 'exact', head: true });
  const el = document.getElementById('count');
  if (el) el.textContent = count ?? 0;
}
updateCount();

/* ══════════════════════════════════════
   Validation rules
══════════════════════════════════════ */
const form = document.getElementById('regForm');
const done = document.getElementById('done');

const rules = {
  name:  v => v.trim().length >= 2                          || 'Enter your full name.',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)         || 'Enter a valid email, like name@college.edu.',
  phone: v => /^\d{10}$/.test(v.replace(/\s|-/g, ''))      || 'Enter a 10-digit phone number.',
  dept:  v => v !== ''                                      || 'Choose your department.',
  year:  v => v !== ''                                      || 'Choose your year of study.',
  msg:   v => v.trim().length >= 5                          || 'Please describe something you want to build (min 5 chars).',
};

function setError(el, msg) {
  el.classList.toggle('invalid', !!msg);
  el.closest('.field').querySelector('.err').textContent = msg || '';
}

function validateField(name) {
  const el  = form.elements[name];
  const res = rules[name](el.value);
  setError(el, res === true ? '' : res);
  return res === true;
}

async function findAvailableRegistrationId(startNumber) {
  let number = startNumber;

  while (true) {
    const id = 'RC-' + String(number).padStart(4, '0');
    const { data, error } = await sb
      .from('registrations')
      .select('reg_id')
      .eq('reg_id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { id, number };
    number++;
  }
}

Object.keys(rules).forEach(n =>
  form.elements[n].addEventListener('blur', () => validateField(n))
);

/* ══════════════════════════════════════
   Submit
══════════════════════════════════════ */
form.addEventListener('submit', async e => {
  e.preventDefault();

  if (!window.registrationOpen()) {
    window.updateRegistrationStatus();
    return;
  }

  let ok = Object.keys(rules).map(validateField).every(Boolean);

  // Interests
  const interests = [...form.querySelectorAll('input[name=interest]:checked')].map(i => i.value);
  const intErr    = form.querySelector('fieldset .err');
  intErr.textContent = interests.length ? '' : 'Pick at least one interest.';
  if (!interests.length) ok = false;

  // Interview slot
  const slot    = form.slot?.value;
  const slotErr = form.querySelector('.interview-field .err');
  slotErr.textContent = slot ? '' : 'Please choose the online interview option.';
  if (!slot) ok = false;

  if (!ok) {
    form.querySelector('.invalid, fieldset .err:not(:empty)')?.scrollIntoView({ block: 'center' });
    return;
  }

  const email = form.email.value.trim().toLowerCase();

  // Disable button to prevent double-submit
  const submitBtn = form.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';

  let id;
  try {
    const { data: existing, error: lookupError } = await sb
      .from('registrations')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (existing) {
      setError(form.email, 'This email is already registered.');
      return;
    }

    const { count, error: countError } = await sb
      .from('registrations')
      .select('*', { count: 'exact', head: true });
    if (countError) throw countError;

    const registration = {
      name:      form.name.value.trim(),
      email:     email,
      phone:     form.phone.value.replace(/\D/g, ''),
      dept:      form.dept.value,
      year:      form.year.value,
      interests: interests,
      level:     form.level.value,
      slot:      slot,
      msg:       form.msg.value.trim(),
    };

    let inserted = false;
    let nextNumber = (count ?? 0) + 1;
    for (let attempt = 0; attempt < 5; attempt++) {
      const available = await findAvailableRegistrationId(nextNumber);
      id = available.id;
      const { error: insertError } = await sb
        .from('registrations')
        .insert({ ...registration, reg_id: id });

      if (!insertError) {
        inserted = true;
        break;
      }

      const isRegIdCollision = insertError.code === '23505'
        && /\(reg_id\)/i.test(`${insertError.details || ''} ${insertError.message || ''}`);
      if (isRegIdCollision) {
        nextNumber = available.number + 1;
        continue;
      }

      if (insertError.code === '23505' && /\(email\)/i.test(`${insertError.details || ''} ${insertError.message || ''}`)) {
        setError(form.email, 'This email is already registered.');
        return;
      }
      throw insertError;
    }

    if (!inserted) {
      throw new Error('Could not reserve a unique registration ID. Please try again.');
    }
  } catch (error) {
    console.error('Registration submission error:', error);
    const message = error?.message || 'Unexpected error while saving your registration.';
    const code = error?.code ? `\nCode: ${error.code}` : '';
    const details = error?.details ? `\nDetails: ${error.details}` : '';
    alert(`Could not submit your registration.\n${message}${code}${details}`);
    return;
  } finally {
    submitBtn.disabled = !window.registrationOpen();
    submitBtn.textContent = 'Submit registration →';
  }

  // Success
  const firstName = form.name.value.trim().split(' ')[0];
  document.getElementById('doneName').textContent  = firstName;
  document.getElementById('doneId').textContent    = id;
  document.getElementById('doneEmail').textContent = email;

  updateCount();
  showSuccessPopup(firstName, id, email);
});

/* ── Register another ── */
document.getElementById('again').addEventListener('click', () => {
  form.reset();
  form.hidden = false;
  done.hidden = true;
});

/* ══════════════════════════════════════
   SUCCESS POPUP + CONFETTI
══════════════════════════════════════ */
function showSuccessPopup(firstName, regId, emailAddr) {
  const overlay = document.getElementById('successOverlay');
  document.getElementById('popupName').textContent  = firstName;
  document.getElementById('popupId').textContent    = regId;
  document.getElementById('popupEmail').textContent = emailAddr;

  overlay.hidden = false;

  const card  = overlay.querySelector('.success-card');
  const fresh = card.cloneNode(true);
  card.replaceWith(fresh);

  spawnConfetti();

  fresh.querySelector('#successClose').addEventListener('click', () => closePopup(fresh));
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closePopup(fresh);
  }, { once: true });
}

function closePopup(card) {
  const overlay = document.getElementById('successOverlay');
  overlay.style.animation = 'fadeIn .2s ease reverse forwards';
  setTimeout(() => {
    overlay.hidden = true;
    overlay.style.animation = '';
    document.getElementById('confettiWrap').innerHTML = '';
    form.hidden = true;
    done.hidden = false;
  }, 200);
}

/* ── Confetti ── */
const COLORS = ['#ffc400','#14213d','#ff6b6b','#2ecc71','#3273dc','#ff9f43','#a29bfe','#fd79a8'];

function spawnConfetti() {
  const wrap = document.getElementById('confettiWrap');
  wrap.innerHTML = '';
  for (let i = 0; i < 90; i++) {
    const el     = document.createElement('div');
    el.className = 'confetti-piece';
    const left   = (Math.random() * 100).toFixed(1);
    const delay  = (Math.random() * 0.9).toFixed(2);
    const dur    = (1.1 + Math.random() * 1.3).toFixed(2);
    const rot    = (Math.random() < .5 ? '' : '-') + (300 + Math.floor(Math.random() * 400)) + 'deg';
    const dist   = (80 + Math.floor(Math.random() * 30)) + 'vh';
    const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.cssText =
      `left:${left}%;background:${color};` +
      `--delay:${delay}s;--dur:${dur}s;--rot:${rot};--dist:${dist}`;
    wrap.appendChild(el);
  }
}
