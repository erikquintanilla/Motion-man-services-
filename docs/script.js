// Booking form handler: validate weekend date, generate .ics file, and save booking locally
// Optional: set BOOKING_ENDPOINT to a webhook URL (Formspree, Zapier, Google Apps Script, Netlify, etc.)
// to receive booking POSTs and notify you (server must accept CORS if called from the browser).
const BOOKING_ENDPOINT = ''; // <-- set this to your webhook URL to receive bookings automatically

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

function downloadTXT(filename, content){
    const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function copyToClipboard(text){
    if (navigator.clipboard && navigator.clipboard.writeText){
        return navigator.clipboard.writeText(text);
    }
    return new Promise((res, rej) => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed'; ta.style.left='-9999px';
        document.body.appendChild(ta);
        ta.select();
        try{ document.execCommand('copy'); res(); }catch(e){ rej(e); }
        ta.remove();
    });
}

async function handleBooking(e){
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
    // Also offer a plain-text fallback (some devices don't accept .ics)
    const txtFilename = `motionman-${service.replace(/\s+/g,'-').toLowerCase()}-${date}.txt`;
    const txtContent = `Booking request\nService: ${service}\nClient: ${name}\nPhone: ${phone}\nEmail: ${email}\nDate: ${date} ${time}\nDuration(hrs): ${hours}\nNotes:\n${details}`;
    downloadTXT(txtFilename, txtContent);

    // Try to notify owner via webhook if configured
    let notifyStatus = 'no-endpoint';
    if (BOOKING_ENDPOINT){
        try{
            const resp = await fetch(BOOKING_ENDPOINT, {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({name,email,phone,service,date,time,hours,details,created:Date.now()})
            });
            if (resp.ok) notifyStatus = 'notified';
            else notifyStatus = 'failed';
        }catch(err){
            notifyStatus = 'failed';
        }
    }
    const result = document.getElementById('bookingResult');
    let notifyMsg = '';
    if (notifyStatus === 'notified') notifyMsg = '<div class="small-muted">Owner notified via webhook.</div>';
    else if (notifyStatus === 'failed') notifyMsg = '<div class="small-muted">Automatic notification failed (webhook). You will still see the booking saved locally.</div>';
    else notifyMsg = '<div class="small-muted">No server notification configured. See options below to receive bookings by email or webhook.</div>';

    // Create a mailto fallback link (opens user's mail client with prefilled message) so owner can be emailed manually
    const mailtoBody = encodeURIComponent(`Booking request\n\nService: ${service}\nClient: ${name}\nPhone: ${phone}\nEmail: ${email}\nDate: ${date} ${time}\nDuration(hrs): ${hours}\nNotes:\n${details}`);
    const mailtoHref = `mailto:Erikquintanilla990@gmail.com?subject=${encodeURIComponent('New booking request - Motion Man')}&body=${mailtoBody}`;

    result.innerHTML = `
        <div class="success">Thanks, <strong>${name}</strong> — your request for <strong>${service}</strong> on <strong>${date}</strong> at <strong>${time}</strong> is recorded. An .ics file and a plain text file were downloaded for your calendar. ${notifyMsg} I will follow up at <a href=\"mailto:${email}\">${email}</a>.</div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
            <button id="copyDetails" class="btn">Copy booking details</button>
            <a class="btn ghost" href="${mailtoHref}">Email owner (open mail client)</a>
        </div>
    `;

    // Wire copy button
    const copyBtn = document.getElementById('copyDetails');
    if (copyBtn){
        copyBtn.addEventListener('click', () => {
            copyToClipboard(txtContent).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(()=> copyBtn.textContent = 'Copy booking details', 2500);
            }).catch(()=>{
                copyBtn.textContent = 'Copy failed';
                setTimeout(()=> copyBtn.textContent = 'Copy booking details', 2500);
            });
        });
    }
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
