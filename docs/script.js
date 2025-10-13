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
    const contactMethod = document.getElementById('contactMethod')?.value || 'email';
    const service = document.getElementById('service').value;
    const date = document.getElementById('selectedDate').value; // Use hidden field
    const time = document.getElementById('selectedTime').value; // Use hidden field
    const hours = parseFloat(document.getElementById('estimatedHours')?.value) || 1;
    const address = document.getElementById('address')?.value.trim() || '';
    const specialRequests = document.getElementById('specialRequests')?.value.trim() || '';
    const referral = document.getElementById('referral')?.value.trim().toUpperCase() || '';

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
    const specialNote = specialRequests ? `\nSpecial Requests: ${specialRequests}` : '';
    const description = `Service: ${service}\nClient: ${name}\nPhone: ${phone}\nEmail: ${email}\nPreferred Contact: ${contactMethod}\nAddress: ${address}${referralNote}${specialNote}`;
    const ics = makeICS(summary, description, start, end);
    const filename = `motionman-${service.replace(/\s+/g,'-').toLowerCase()}-${date}.ics`;

    // Save booking locally
    const stored = JSON.parse(localStorage.getItem('mm_bookings')||'[]');
    stored.push({name,email,phone,contactMethod,service,date,time,hours,address,specialRequests,referral,created:Date.now()});
    localStorage.setItem('mm_bookings', JSON.stringify(stored));

    // Offer ICS download and show confirmation
    downloadICS(filename, ics);
    // Also offer a plain-text fallback (some devices don't accept .ics)
    const txtFilename = `motionman-${service.replace(/\s+/g,'-').toLowerCase()}-${date}.txt`;
    const txtContent = `Booking request\nService: ${service}\nClient: ${name}\nPhone: ${phone}\nEmail: ${email}\nPreferred Contact: ${contactMethod}\nAddress: ${address}\nDate: ${date} ${time}\nDuration(hrs): ${hours}${referralNote}${specialNote}`;
    downloadTXT(txtFilename, txtContent);

    // Try to notify owner via webhook if configured
    let notifyStatus = 'no-endpoint';
    if (BOOKING_ENDPOINT){
        try{
            // Send as form-encoded to avoid CORS preflight in most cases
            const params = new URLSearchParams();
            params.append('data', JSON.stringify({name,email,phone,contactMethod,service,date,time,hours,address,specialRequests,referral,created:Date.now()}));
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
    const mailtoBody = encodeURIComponent(`Booking request\n\nService: ${service}\nClient: ${name}\nPhone: ${phone}\nEmail: ${email}\nPreferred Contact: ${contactMethod}\nAddress: ${address}\nDate: ${date} ${time}\nDuration(hrs): ${hours}${referralNote}${specialNote}`);
    const mailtoHref = `mailto:Erikquintanilla990@gmail.com?subject=${encodeURIComponent('New booking request - Motion Man')}&body=${mailtoBody}`;
    
    const referralMsg = referral ? `<div style="margin-top:8px;padding:8px;background:#dcfce7;border-radius:8px;"><strong>✅ Referral code applied:</strong> ${referral} — You'll get $10 off!</div>` : '';

    const contactMsg = contactMethod === 'phone' ? 'I will call you' : contactMethod === 'text' ? 'I will text you' : 'I will email you';

    result.innerHTML = `
        <div class="success">Thanks, <strong>${name}</strong> — your request for <strong>${service}</strong> on <strong>${date}</strong> at <strong>${time}</strong> is recorded. An .ics file and a plain text file were downloaded for your calendar. ${notifyMsg} ${contactMsg} at <strong>${contactMethod === 'phone' || contactMethod === 'text' ? phone : email}</strong> within 24 hours.</div>
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
    
    // Refresh availability calendar after booking
    if (typeof renderFormAvailabilityCalendar === 'function') {
        renderFormAvailabilityCalendar();
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
        
        // Show bundle pricing if garage, yard, and patio are selected (Home Refresh Bundle)
        const garageChecked = document.querySelector('[data-service="garage"]')?.checked;
        const yardChecked = document.querySelector('[data-service="yard"]')?.checked;
        const patioChecked = document.querySelector('[data-service="patio"]')?.checked;
        
        if (garageChecked && yardChecked && patioChecked) {
            bundleDisplay.style.display = 'block';
            const regularTotal = 50 + 50 + 30; // min prices: garage + yard + patio
            const regularTotalMax = 70 + 60 + 30; // max prices
            const bundlePrice = 120;
            const savingsMin = regularTotal - bundlePrice;
            const savingsMax = regularTotalMax - bundlePrice;
            document.getElementById('bundleSavings').textContent = `Save $${savingsMin}-${savingsMax}!`;
        } else {
            bundleDisplay.style.display = 'none';
        }
    }
}

// Availability system
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']; // 9am-4pm
const SLOTS_PER_DAY = 8;

function getNextWeekends(count = 2) {
    const weekends = [];
    const today = new Date();
    let currentDate = new Date(today);
    
    while (weekends.length < count) {
        const dayOfWeek = currentDate.getDay();
        
        if (dayOfWeek === 6 || dayOfWeek === 0) { // Saturday or Sunday
            const dateStr = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`;
            weekends.push({
                date: dateStr,
                dayName: dayOfWeek === 6 ? 'Saturday' : 'Sunday',
                fullDate: new Date(currentDate)
            });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Group by weekend
    const grouped = [];
    for (let i = 0; i < weekends.length; i += 2) {
        grouped.push(weekends.slice(i, i + 2));
    }
    
    return grouped;
}

function getBookedSlots() {
    const bookings = JSON.parse(localStorage.getItem('mm_bookings') || '[]');
    return bookings.map(b => `${b.date}_${b.time}`);
}

function getBlockedSlots() {
    return JSON.parse(localStorage.getItem('mm_blocked_slots') || '[]');
}

function isSlotAvailable(date, time) {
    const bookedSlots = getBookedSlots();
    const blockedSlots = getBlockedSlots();
    const slotKey = `${date}_${time}`;
    
    if (bookedSlots.includes(slotKey)) return 'booked';
    if (blockedSlots.some(b => b.date === date && b.time === time)) return 'blocked';
    return 'available';
}

function renderFormAvailabilityCalendar() {
    const calendar = document.getElementById('formAvailabilityCalendar');
    if (!calendar) return;
    
    const weekends = getNextWeekends(2);
    let html = '';
    
    weekends.forEach((weekend, weekendIndex) => {
        const weekendLabel = weekendIndex === 0 ? 'This Weekend' : 'Next Weekend';
        const dateRange = `${weekend[0].fullDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - ${weekend[weekend.length-1].fullDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}`;
        
        html += `<div class="weekend-block">`;
        html += `<div class="weekend-title">${weekendLabel} (${dateRange})</div>`;
        
        weekend.forEach(day => {
            html += `<div class="day-slots">`;
            html += `<span class="day-name">${day.dayName}, ${day.fullDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>`;
            html += `<div class="slots-grid">`;
            
            TIME_SLOTS.forEach(time => {
                const status = isSlotAvailable(day.date, time);
                const timeDisplay = formatTime(time);
                const statusClass = status === 'available' ? 'slot-available' : status === 'booked' ? 'slot-booked' : 'slot-blocked';
                const statusText = status === 'available' ? '✅' : status === 'booked' ? '❌' : '🚫';
                const statusLabel = status === 'available' ? 'Available' : status === 'booked' ? 'Booked' : 'Blocked';
                
                // Make available slots clickable in form
                const clickHandler = status === 'available' ? `onclick="selectFormSlot('${day.date}', '${time}', this)"` : '';
                
                html += `<div class="slot-item ${statusClass}" ${clickHandler}>${statusText} ${timeDisplay}<br><small>${statusLabel}</small></div>`;
            });
            
            html += `</div></div>`;
        });
        
        html += `</div>`;
    });
    
    calendar.innerHTML = html;
}

function selectFormSlot(date, time, el) {
    // Remove previous selection
    document.querySelectorAll('.slot-available').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Add selection to clicked slot
    const slotElement = el || (typeof event !== 'undefined' ? event.target.closest('.slot-item') : null);
    slotElement && slotElement.classList.add('selected');
    
    // Fill hidden form fields
    const dateInput = document.getElementById('selectedDate');
    const timeInput = document.getElementById('selectedTime');
    const display = document.getElementById('selectedSlotDisplay');
    const displayText = document.getElementById('selectedSlotText');
    
    if (dateInput) dateInput.value = date;
    if (timeInput) timeInput.value = time;
    
    // Show selected slot with correct date display
    if (display) {
        display.style.display = 'block';
        const [year, month, day] = date.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, day);
        const dayName = selectedDate.toLocaleDateString('en-US', {weekday: 'short'});
        const monthName = selectedDate.toLocaleDateString('en-US', {month: 'short'});
        const dayNum = selectedDate.getDate();
        displayText.textContent = `Selected: ${formatTime(time)} on ${dayName}, ${monthName} ${dayNum}`;
    }
}

function clearSlotSelection() {
    // Remove selection
    document.querySelectorAll('.slot-available').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Clear hidden fields
    const dateInput = document.getElementById('selectedDate');
    const timeInput = document.getElementById('selectedTime');
    const display = document.getElementById('selectedSlotDisplay');
    
    if (dateInput) dateInput.value = '';
    if (timeInput) timeInput.value = '';
    if (display) display.style.display = 'none';
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
}

function updateAvailabilitySummary() {
    const weekends = getNextWeekends(2);
    
    weekends.forEach((weekend, index) => {
        let availableCount = 0;
        
        weekend.forEach(day => {
            TIME_SLOTS.forEach(time => {
                if (isSlotAvailable(day.date, time) === 'available') {
                    availableCount++;
                }
            });
        });
        
        const countElement = index === 0 ? 
            document.getElementById('thisWeekendCount') : 
            document.getElementById('nextWeekendCount');
        
        if (countElement) {
            const totalSlots = weekend.length * SLOTS_PER_DAY;
            countElement.textContent = `${availableCount} of ${totalSlots} slots available`;
            
            // Update urgency banner
            if (index === 0) {
                const urgencyBanner = document.getElementById('urgencyBanner');
                if (urgencyBanner && availableCount <= 2) {
                    urgencyBanner.innerHTML = `⚠️ <strong>Almost Full!</strong> Only ${availableCount} slot${availableCount !== 1 ? 's' : ''} left this weekend. Book now!`;
                } else if (urgencyBanner && availableCount <= 4) {
                    urgencyBanner.innerHTML = `⏰ <strong>Filling Up Fast!</strong> Only ${availableCount} slots left this weekend. Book by Wednesday to secure your spot.`;
                }
            }
        }
    });
}

function blockSlot() {
    const dateInput = document.getElementById('blockDate');
    const timeInput = document.getElementById('blockTime');
    
    if (!dateInput.value || !timeInput.value) {
        alert('Please select both date and time');
        return;
    }
    
    const date = dateInput.value;
    const time = timeInput.value;
    
    // Check if it's a weekend
    const d = new Date(date + 'T00:00');
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        alert('You can only block weekend dates (Saturday or Sunday)');
        return;
    }
    
    const blockedSlots = getBlockedSlots();
    
    // Check if already blocked
    if (blockedSlots.some(b => b.date === date && b.time === time)) {
        alert('This slot is already blocked');
        return;
    }
    
    blockedSlots.push({ date, time });
    localStorage.setItem('mm_blocked_slots', JSON.stringify(blockedSlots));
    
    renderFormAvailabilityCalendar();
    renderBlockedSlotsList();
    
    dateInput.value = '';
    timeInput.value = '09:00';
}

function unblockSlot(date, time) {
    let blockedSlots = getBlockedSlots();
    blockedSlots = blockedSlots.filter(b => !(b.date === date && b.time === time));
    localStorage.setItem('mm_blocked_slots', JSON.stringify(blockedSlots));
    
    renderFormAvailabilityCalendar();
    renderBlockedSlotsList();
}

function renderBlockedSlotsList() {
    const list = document.getElementById('blockedSlotsList');
    if (!list) return;
    
    const blockedSlots = getBlockedSlots();
    
    if (blockedSlots.length === 0) {
        list.innerHTML = '<p class="small-muted">No blocked slots</p>';
        return;
    }
    
    let html = '';
    blockedSlots.forEach(slot => {
        const d = new Date(slot.date + 'T00:00');
        const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = formatTime(slot.time);
        
        html += `<div class="blocked-slot-item">
            <span>${dateStr} at ${timeStr}</span>
            <button onclick="unblockSlot('${slot.date}', '${slot.time}')">Unblock</button>
        </div>`;
    });
    
    list.innerHTML = html;
}

function clearTestBooking() {
    if (confirm('Clear all test bookings? This will remove all bookings from localStorage.')) {
        localStorage.removeItem('mm_bookings');
        renderFormAvailabilityCalendar();
        renderBookingsList();
        alert('Test bookings cleared!');
    }
}

// Render bookings list in admin panel
function renderBookingsList() {
    const list = document.getElementById('bookingsList');
    if (!list) return;
    
    const bookings = JSON.parse(localStorage.getItem('mm_bookings') || '[]');
    
    if (bookings.length === 0) {
        list.innerHTML = '<p class="small-muted">No bookings yet</p>';
        return;
    }
    
    // Sort by date and time
    bookings.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
    });
    
    let html = '<div class="bookings-table">';
    bookings.forEach((booking, index) => {
        const d = new Date(booking.date + 'T00:00');
        const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = formatTime(booking.time);
        const contactMethodDisplay = booking.contactMethod || 'email';
        const referralDisplay = booking.referral ? `<br><strong>Referral:</strong> ${booking.referral}` : '';
        
        html += `
            <div class="booking-item" style="border:1px solid var(--border);padding:12px;border-radius:8px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:8px;">
                    <div>
                        <strong style="color:var(--accent);font-size:1.1rem;">${booking.service}</strong>
                        <div style="margin-top:4px;">
                            <strong>📅 When:</strong> ${dateStr} at ${timeStr} (${booking.hours}hrs)<br>
                            <strong>👤 Client:</strong> ${booking.name}<br>
                            <strong>📞 Phone:</strong> ${booking.phone}<br>
                            <strong>📧 Email:</strong> ${booking.email}<br>
                            <strong>💬 Contact via:</strong> ${contactMethodDisplay}<br>
                            <strong>📍 Address:</strong> ${booking.address || 'Not provided'}
                            ${referralDisplay}
                        </div>
                        ${booking.specialRequests ? `<div style="margin-top:8px;padding:8px;background:var(--bg);border-radius:4px;"><strong>Notes:</strong> ${booking.specialRequests}</div>` : ''}
                    </div>
                    <button class="btn ghost" onclick="deleteBooking(${index})" style="white-space:nowrap;">Delete</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    list.innerHTML = html;
}

// Delete a specific booking
function deleteBooking(index) {
    if (!confirm('Delete this booking?')) return;
    
    const bookings = JSON.parse(localStorage.getItem('mm_bookings') || '[]');
    bookings.splice(index, 1);
    localStorage.setItem('mm_bookings', JSON.stringify(bookings));
    
    renderBookingsList();
    renderFormAvailabilityCalendar();
}

// Export bookings to CSV
function exportBookings() {
    const bookings = JSON.parse(localStorage.getItem('mm_bookings') || '[]');
    
    if (bookings.length === 0) {
        alert('No bookings to export');
        return;
    }
    
    // Create CSV header
    let csv = 'Service,Name,Phone,Email,Contact Method,Date,Time,Hours,Address,Referral,Special Requests,Created\n';
    
    // Add booking rows
    bookings.forEach(b => {
        const row = [
            b.service,
            b.name,
            b.phone,
            b.email,
            b.contactMethod || 'email',
            b.date,
            b.time,
            b.hours,
            b.address || '',
            b.referral || '',
            (b.specialRequests || '').replace(/\n/g, ' '),
            new Date(b.created).toLocaleString()
        ].map(field => `"${field}"`).join(',');
        
        csv += row + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motionman-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// Keyboard shortcut to toggle admin controls (Ctrl+Shift+A)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        const adminControls = document.getElementById('adminControls');
        if (adminControls) {
            if (adminControls.style.display === 'none') {
                adminControls.style.display = 'block';
                renderBookingsList();
                renderBlockedSlotsList();
                adminControls.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                adminControls.style.display = 'none';
            }
        }
    }
});

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
    
    // Initialize availability calendars
    renderFormAvailabilityCalendar();
    renderBlockedSlotsList();
    
    // Handle navigation links
    handleNavigation();
});

// Show section functionality for collapsible sections
function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // Show the section
        section.style.display = 'block';
        
        // Smooth scroll to section
        section.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        // Add fade-in animation
        setTimeout(() => {
            section.style.opacity = '0';
            section.style.transition = 'opacity 0.5s ease-in';
            section.style.opacity = '1';
        }, 300);
    }
}

// Hybrid Booking Flow - Select Service
function selectService(serviceName, estimatedHours) {
    // Set hidden form fields
    document.getElementById('service').value = serviceName;
    document.getElementById('estimatedHours').value = estimatedHours;
    
    // Update display
    document.getElementById('selectedServiceDisplay').textContent = serviceName;
    
    // Show booking form
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.style.display = 'block';
        
        // Smooth scroll to form
        contactSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        // Update progress indicator
        const steps = document.querySelectorAll('.progress-step');
        if (steps.length >= 2) {
            steps[0].classList.add('completed');
            steps[1].classList.add('active');
        }
    }
}

// Toggle FAQ visibility
function toggleFAQ() {
    const content = document.getElementById('faqContent');
    const faqSection = document.getElementById('faq');
    const button = event.target;

    // Show FAQ section first
    if (faqSection) {
        faqSection.style.display = 'block';
    }

    if (content.style.display === 'none') {
        content.style.display = 'block';
        button.textContent = '❌ Hide FAQs';
        button.classList.remove('primary');
        button.classList.add('ghost');

        // Smooth scroll to content
        setTimeout(() => {
            content.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    } else {
        content.style.display = 'none';
        button.textContent = '❓ View Frequently Asked Questions';
        button.classList.remove('ghost');
        button.classList.add('primary');
    }
}

// Cancel booking and return to services
function cancelBooking() {
    // Clear form
    const form = document.getElementById('bookingForm');
    if (form) {
        form.reset();
    }
    
    // Clear slot selection
    clearSlotSelection();
    
    // Hide contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.style.display = 'none';
    }
    
    // Scroll back to services
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        servicesSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

// Handle navigation clicks to show sections
function handleNavigation() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const targetId = href.substring(1); // Remove the #
            
            // Don't prevent default for home link
            if (targetId === 'home' || targetId === '') {
                return;
            }
            
            e.preventDefault();
            
            // Special handling for FAQ
            if (targetId === 'faq') {
                showSection('faq');
                // Also show FAQ content by default
                const faqContent = document.getElementById('faqContent');
                if (faqContent && faqContent.style.display === 'none') {
                    setTimeout(() => toggleFAQ(), 500);
                }
            } else {
                // Show the section
                showSection(targetId);
            }
        });
    });
}
