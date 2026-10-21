const registrationDeadline = new Date('2026-10-21T23:00:00+05:30');
const interviewScheduleRelease = new Date('2026-10-21T16:00:00+05:30');

window.registrationOpen = () => Date.now() < registrationDeadline.getTime();

window.updateRegistrationStatus = () => {
  const open = window.registrationOpen();
  const banner = document.getElementById('registrationBanner');
  const bannerText = document.getElementById('registrationBannerText');
  const bannerCta = document.getElementById('registrationBannerCta');
  const interviewAnnouncement = document.getElementById('interviewAnnouncement');
  const interviewAnnouncementText = document.getElementById('interviewAnnouncementText');
  const interviewAnnouncementCta = document.getElementById('interviewAnnouncementCta');
  const registrationBadge = document.getElementById('registrationBadge');
  const registrationBadgeText = document.getElementById('registrationBadgeText');
  const recruitmentBadge = document.getElementById('recruitmentBadge');
  const recruitmentBadgeText = document.getElementById('recruitmentBadgeText');
  const status = document.getElementById('registrationStatus');
  const form = document.getElementById('regForm');

  if (banner && bannerText && bannerCta) {
    banner.classList.toggle('closed', !open);
    banner.setAttribute('aria-label', open
      ? 'Registration open until 11 PM today'
      : 'Registration closed');
    bannerText.innerHTML = open
      ? 'Core Team Registration is&nbsp;<strong>OPEN until 11 PM today</strong>'
      : 'Core Team Registration is&nbsp;<strong>CLOSED</strong>';
    bannerCta.textContent = open ? 'Apply →' : 'View details →';
  }

  if (registrationBadge && registrationBadgeText) {
    registrationBadgeText.textContent = open ? 'Registration Open' : 'Registration Closed';
    registrationBadge.querySelector('.pulse-dot').hidden = !open;
  }

  if (recruitmentBadge && recruitmentBadgeText) {
    recruitmentBadgeText.textContent = open ? 'Recruitment Open' : 'Recruitment Closed';
    recruitmentBadge.querySelector('.pulse-dot').hidden = !open;
  }

  if (interviewAnnouncement && interviewAnnouncementText && interviewAnnouncementCta) {
    const scheduleAvailable = Date.now() >= interviewScheduleRelease.getTime();
    interviewAnnouncement.setAttribute('aria-label', scheduleAvailable
      ? 'Interview schedule is available'
      : 'Interview schedule will be shared at 4 PM today');
    interviewAnnouncementText.innerHTML = scheduleAvailable
      ? 'Interview Schedule is <strong>available now</strong>'
      : 'Interview Schedule will be shared at <strong>4 PM today</strong>';
    interviewAnnouncementCta.hidden = !scheduleAvailable;
  }

  if (status && form) {
    status.hidden = open;
    status.textContent = open
      ? ''
      : 'Registration is closed. The deadline was 11:00 PM IST today.';
    form.querySelectorAll('input, select, textarea, button')
      .forEach(control => { control.disabled = !open; });
  }
};

window.updateRegistrationStatus();
window.setInterval(window.updateRegistrationStatus, 30_000);
