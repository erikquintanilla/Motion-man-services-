// Booking form handler: validate weekend date, generate .ics file, and save booking locally
function isWeekend(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00');
    const day = d.getDay(); // 0 Sun, 6 Sat
    return day === 0 || day === 6;
}

function pad(n){return n<10? '0'+n: n}

function toICSDate(dt){
    // Format: YYYYMMDDTHHMM00 (local time, naive)
    return dt.getFullYear().toString() + pad(dt.getMonth()+1) + pad(dt.getDate()) + 'T' + pad(dt.getHours()) + pad(dt.getMinutes()) + '00';
}

function makeICS(summary, description, start, end) {
    const uid = 'mm-' + Date.now() + '@motionman.local';
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MotionMan//Booking//EN',
        'BEGIN:VEVENT',
        'UID:' + uid,
        'DTSTAMP:' + toICSDate(new Date()),
        'DTSTART:' + toICSDate(start),
        'DTEND:' + toICSDate(end),
        'SUMMARY:' + summary,
        'DESCRIPTION:' + description.replace(/\n/g,'\\n'),
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
}

function downloadICS(filename, content) {
    const blob = new Blob([content], {type: 'text/calendar;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function handleBooking(e){
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const service = document.getElementById('service').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const hours = parseFloat(document.getElementById('hours').value) || 1;
    const details = document.getElementById('details').value.trim();

    if (!isWeekend(date)){
        alert('Please select a Saturday or Sunday. I operate on weekends only.');
        return;
    }

    // Build start and end Date objects in local time
    const [y,m,d] = date.split('-').map(Number);
    const [hh,mm] = time.split(':').map(Number);
    const start = new Date(y, m-1, d, hh, mm, 0);
    const end = new Date(start.getTime() + hours*60*60*1000);

    const summary = service + ' — Motion Man Booking';
    const description = `Service: ${service}\nClient: ${name}\nPhone: ${phone}\nEmail: ${email}\nNotes: ${details}`;
    const ics = makeICS(summary, description, start, end);
    const filename = `motionman-${service.replace(/\s+/g,'-').toLowerCase()}-${date}.ics`;

    // Save booking locally
    const stored = JSON.parse(localStorage.getItem('mm_bookings')||'[]');
    stored.push({name,email,phone,service,date,time,hours,details,created:Date.now()});
    localStorage.setItem('mm_bookings', JSON.stringify(stored));

    // Offer ICS download and show confirmation
    downloadICS(filename, ics);
    const result = document.getElementById('bookingResult');
    result.innerHTML = `<div class="success">Thanks, <strong>${name}</strong> — your request for <strong>${service}</strong> on <strong>${date}</strong> at <strong>${time}</strong> is recorded. An .ics file was downloaded for your calendar. I will follow up at <a href=\"mailto:${email}\">${email}</a>.</div>`;
    e.target.reset();
}

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function(){
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    navToggle && navToggle.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !expanded);
        nav.classList.toggle('open');
    });

    // Attach form handler
    const form = document.getElementById('bookingForm');
    form && form.addEventListener('submit', handleBooking);
});
