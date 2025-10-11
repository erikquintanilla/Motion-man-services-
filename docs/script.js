// Booking form handler: validate weekend date, generate .ics file, and save booking locally
// Optional: set BOOKING_ENDPOINT to a webhook URL (Formspree, Zapier, Google Apps Script, Netlify, etc.)
// to receive booking POSTs and notify you. Recommended: Google Apps Script web app (see tools/google_apps_script_booking.gs).
// Important: the client posts as application/x-www-form-urlencoded (no JSON) to avoid CORS preflight issues.
// After you deploy the Apps Script web app, paste its URL here, for example:
// const BOOKING_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx.../exec';
const BOOKING_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyOxq8MhNQVuoTjqBfUYE53DzcErmwArOw3yu6AG-dkDg2wJhCS1J4O5oAZQflUh6tnMQ/exec'; // <-- PASTE your webhook URL here to receive bookings automatically

// Prefill booking form with service and estimated hours, then scroll to it
function prefillBooking(serviceName, estimatedHours) {
    // Scroll to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Wait for scroll, then prefill form
    setTimeout(() => {
        const serviceSelect = document.getElementById('service');
        const hoursInput = document.getElementById('hours');
        const dateInput = document.getElementById('date');
        const nameInput = document.getElementById('name');
        
        // Set service
        if (serviceSelect) {
            serviceSelect.value = serviceName;
        }
        
        // Set estimated hours
        if (hoursInput) {
            hoursInput.value = estimatedHours;
        }
        
        // Set nearest weekend date
        if (dateInput) {
            const today = new Date();
            let daysUntilWeekend = 0;
            const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
            
            if (dayOfWeek === 0) {
                // Today is Sunday, suggest next Saturday
                daysUntilWeekend = 6;
            } else if (dayOfWeek === 6) {
                // Today is Saturday, suggest today
                daysUntilWeekend = 0;
            } else if (dayOfWeek < 6) {
                // Weekday, suggest upcoming Saturday
                daysUntilWeekend = 6 - dayOfWeek;
            }
            
            const nextWeekend = new Date(today);
            nextWeekend.setDate(today.getDate() + daysUntilWeekend);
            
            // Format as YYYY-MM-DD
            const year = nextWeekend.getFullYear();
            const month = String(nextWeekend.getMonth() + 1).padStart(2, '0');
            const day = String(nextWeekend.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
        }
        
        // Focus on name input
        if (nameInput) {
            nameInput.focus();
        }
    }, 800);
}

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
    const referral = document.getElementById('referral').value.trim().toUpperCase();

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
    const referralNote = referral ? `\nReferral Code: ${referral}` : '';
    const description = `Service: ${service}\nClient: ${name}\nPhone: ${phone}\nEmail: ${email}${referralNote}\nNotes: ${details}`;
    const ics = makeICS(summary, description, start, end);
    const filename = `motionman-${service.replace(/\s+/g,'-').toLowerCase()}-${date}.ics`;

    // Save booking locally
    const stored = JSON.parse(localStorage.getItem('mm_bookings')||'[]');
    stored.push({name,email,phone,service,date,time,hours,details,referral,created:Date.now()});
    localStorage.setItem('mm_bookings', JSON.stringify(stored));

    // Offer ICS download and show confirmation
    downloadICS(filename, ics);
    // Also offer a plain-text fallback (some devices don't accept .ics)
    const txtFilename = `motionman-${service.replace(/\s+/g,'-').toLowerCase()}-${date}.txt`;
    const txtContent = `Booking request\nService: ${service}\nClient: ${name}\nPhone: ${phone}\nEmail: ${email}\nDate: ${date} ${time}\nDuration(hrs): ${hours}${referralNote}\nNotes:\n${details}`;
    downloadTXT(txtFilename, txtContent);

    // Try to notify owner via webhook if configured
    let notifyStatus = 'no-endpoint';
    if (BOOKING_ENDPOINT){
        try{
            // Send as form-encoded to avoid CORS preflight in most cases
            const params = new URLSearchParams();
            params.append('data', JSON.stringify({name,email,phone,service,date,time,hours,details,referral,created:Date.now()}));
            const resp = await fetch(BOOKING_ENDPOINT, {
                method: 'POST',
                headers: {'Content-Type':'application/x-www-form-urlencoded'},
                body: params.toString()
            });
            // Some endpoints (or CORS modes) may return opaque responses; treat OK or opaque as success
            if (resp && (resp.ok || resp.type === 'opaque')) notifyStatus = 'notified';
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
    const mailtoBody = encodeURIComponent(`Booking request\n\nService: ${service}\nClient: ${name}\nPhone: ${phone}\nEmail: ${email}\nDate: ${date} ${time}\nDuration(hrs): ${hours}${referralNote}\nNotes:\n${details}`);
    const mailtoHref = `mailto:Erikquintanilla990@gmail.com?subject=${encodeURIComponent('New booking request - Motion Man')}&body=${mailtoBody}`;
    
    const referralMsg = referral ? `<div style="margin-top:8px;padding:8px;background:#dcfce7;border-radius:8px;"><strong>✅ Referral code applied:</strong> ${referral} — You'll get $10 off!</div>` : '';

    result.innerHTML = `
        <div class="success">Thanks, <strong>${name}</strong> — your request for <strong>${service}</strong> on <strong>${date}</strong> at <strong>${time}</strong> is recorded. An .ics file and a plain text file were downloaded for your calendar. ${notifyMsg} I will follow up at <a href=\"mailto:${email}\">${email}</a>.</div>
        ${referralMsg}
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

// Price calculator functionality
function updatePriceCalculator() {
    const checkboxes = document.querySelectorAll('.calc-checkbox');
    let totalMin = 0;
    let totalMax = 0;
    let selectedCount = 0;
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedCount++;
            totalMin += parseInt(checkbox.dataset.min);
            totalMax += parseInt(checkbox.dataset.max);
        }
    });
    
    const totalDisplay = document.getElementById('calcTotal');
    const bundleDisplay = document.getElementById('calcBundle');
    
    if (selectedCount === 0) {
        totalDisplay.textContent = '$0';
        bundleDisplay.style.display = 'none';
    } else {
        totalDisplay.textContent = `$${totalMin}-${totalMax}`;
        
        // Show bundle pricing if all 3 services selected
        if (selectedCount === 3) {
            bundleDisplay.style.display = 'block';
            const savings = `$${totalMin - 130}-$${totalMax - 110}`;
            document.getElementById('bundleSavings').textContent = `Save ${savings}!`;
        } else {
            bundleDisplay.style.display = 'none';
        }
    }
}

// Mobile nav toggle and initialization
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
    
    // Attach calculator listeners
    const calcCheckboxes = document.querySelectorAll('.calc-checkbox');
    calcCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updatePriceCalculator);
    });
});
