# 📋 Motion Man Website - Complete Manual Testing Checklist

**Website:** https://erikquintanilla.github.io/Motion-man-services/

---

## 🚀 PRIORITY 1: Core Booking Flow (MUST TEST)

### Test 1: Book a Service from Service Card
**Steps:**
1. Scroll to "Services I Offer" section
2. Click "Book Garage Cleanup" button on the Garage card
3. Verify form scrolls into view
4. Check that service dropdown is prefilled with "Garage Cleanup & Organization"
5. Check that hours field shows "2"
6. Verify name field is focused (cursor blinking)

**Expected Result:** ✅ Form prefills and scrolls smoothly

---

### Test 2: Select a Time Slot
**Steps:**
1. Look at the "Select Available Time Slot" calendar
2. Find a green "✅ Available" slot
3. Click on it
4. Verify the slot turns blue (selected state)
5. If you click another slot, verify previous selection is removed

**Expected Result:** ✅ Slot highlights blue, only one selected at a time

---

### Test 3: Complete a Booking
**Steps:**
1. Fill in all required fields:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "(510) 123-4567"
   - Service: Any service (or leave prefilled)
   - Select a weekend time slot (click a green slot)
   - Details: "Test booking"
2. Click "Confirm Booking"
3. Check that 2 files download:
   - `.ics` file (calendar file)
   - `.txt` file (text backup)
4. Verify success message appears with your name and selected date/time
5. Check that "Copy booking details" button appears
6. Click it and paste somewhere - verify text copied

**Expected Result:** ✅ Files download, success message shows, copy works

---

### Test 4: Weekend-Only Validation
**Steps:**
1. Try to submit the form WITHOUT selecting a slot
2. OR manually change hidden field to a weekday (use browser dev tools)
3. Click "Confirm Booking"

**Expected Result:** ✅ Alert says "Please select a Saturday or Sunday"

---

## 💰 PRIORITY 2: Price Calculator

### Test 5: Price Calculator Updates
**Steps:**
1. Scroll to "Quick Pricing (Oakland)" section
2. Find the "Quick Price Estimate" calculator
3. Check "Garage Cleanup ($50-70)" box
4. Verify "Your Estimated Total" shows "$50-70"
5. Check "Yard Cleanup ($50-60)" box
6. Verify total updates to "$100-130"
7. Uncheck Garage, verify total updates to "$50-60"

**Expected Result:** ✅ Total updates instantly as you check/uncheck boxes

---

### Test 6: Bundle Pricing Display
**Steps:**
1. In the price calculator, check ALL 3 services:
   - Garage Cleanup
   - Yard Cleanup
   - Car Cleaning
2. Look for green "Bundle Price Available" section to appear
3. Verify it shows "$110-130" bundle price
4. Verify it shows savings amount
5. Uncheck one service
6. Verify bundle section disappears

**Expected Result:** ✅ Bundle appears only when all 3 checked, disappears otherwise

---

## 🎨 PRIORITY 3: Visual & UI Elements

### Test 7: Service Card Theming
**Steps:**
1. Scroll to "Services I Offer" section
2. Check each of the 3 service cards:
   - **Garage Cleanup**: Should have blue-ish background & blue price
   - **Yard Cleanup**: Should have green-ish background & green price
   - **Car Interior Cleaning**: Should have teal/cyan background & teal price

**Expected Result:** ✅ Each card has distinct color theme

---

### Test 8: Bundle Badge Placement
**Steps:**
1. Scroll to "Limited Time: Complete Property Bundle" section
2. Verify "🔥 Most Popular" badge is in the TOP-RIGHT corner
3. Verify "25% OFF" ribbon is in the TOP-LEFT corner
4. Check they don't overlap

**Expected Result:** ✅ Both badges visible, no overlap

---

### Test 9: Pricing Cards (Stay Blue)
**Steps:**
1. Scroll to "Quick Pricing (Oakland)" section
2. Look at the 4 clickable pricing cards below the calculator
3. Verify ALL 4 cards have the same blue theme (not colored individually)
4. Hover over each - verify hover effect works

**Expected Result:** ✅ All pricing cards are uniform blue, hover works

---

### Test 10: "Prefer to Talk" Section Position
**Steps:**
1. Scroll to "Book a Weekend Slot" section
2. Scroll past the entire booking form
3. Verify "Prefer to talk instead?" section is BELOW the form
4. Check it has 3 buttons: Call Now, Text Me, Email
5. Click each button to verify links work:
   - Call opens phone dialer
   - Text opens SMS
   - Email opens mail client

**Expected Result:** ✅ Section is below form, all 3 buttons work

---

## 🗓️ PRIORITY 4: Availability Calendar

### Test 11: Calendar Shows Correct Weekends
**Steps:**
1. Look at the booking form calendar
2. Note today's date
3. Verify calendar shows:
   - "This Weekend" (current or upcoming Sat/Sun)
   - "Next Weekend" (the weekend after)
4. Verify each weekend has Saturday AND Sunday
5. Verify each day shows 8 time slots (9 AM through 4 PM)

**Expected Result:** ✅ 2 weekends shown, 8 slots per day

---

### Test 12: Slot Status Display
**Steps:**
1. After making a test booking, refresh the page
2. Look at the calendar again
3. Find the slot you booked
4. Verify it now shows "❌ Booked" in red
5. Verify you CANNOT click it

**Expected Result:** ✅ Booked slots show as unavailable

---

## 🔧 PRIORITY 5: Admin Functions

### Test 13: Admin Panel Toggle
**Steps:**
1. On any page, press **Ctrl + Shift + A** (Windows/Linux) or **Cmd + Shift + A** (Mac)
2. Verify admin controls panel appears/scrolls into view
3. Press the shortcut again
4. Verify panel hides

**Expected Result:** ✅ Panel toggles on/off with keyboard shortcut

---

### Test 14: Block a Time Slot
**Steps:**
1. Open admin panel (Ctrl+Shift+A)
2. In "Block Time Slot" section:
   - Select a weekend date from dropdown
   - Select a time (e.g., 14:00)
3. Click "Block Slot"
4. Verify calendar updates and shows slot as "🚫 Blocked" in yellow
5. Verify slot appears in "Blocked Slots" list below
6. Click "Unblock" button next to it
7. Verify slot returns to "✅ Available"

**Expected Result:** ✅ Slots can be blocked and unblocked, calendar updates

---

### Test 15: Clear Test Bookings
**Steps:**
1. After making test bookings, open admin panel
2. Click "Clear Test Bookings" button
3. Confirm the alert
4. Refresh page
5. Verify all slots show as available again

**Expected Result:** ✅ Bookings clear, calendar resets

---

## 📱 PRIORITY 6: Mobile Responsiveness

### Test 16: Mobile Menu (Narrow Screen)
**Steps:**
1. Resize browser to narrow width (< 768px) OR open on phone
2. Verify navigation collapses to hamburger menu
3. Click hamburger button
4. Verify menu expands/opens
5. Click a menu link
6. Verify it navigates and menu closes

**Expected Result:** ✅ Mobile menu works

---

### Test 17: Mobile Layout (Cards Stack)
**Steps:**
1. Stay in mobile width or on phone
2. Scroll through entire page
3. Check these sections stack vertically (1 column):
   - Services I Offer (3 cards)
   - Quick Pricing cards (4 cards)
   - FAQ items
4. Verify no horizontal overflow/scrolling
5. Verify text is readable (not tiny)

**Expected Result:** ✅ All content stacks nicely, no horizontal scroll

---

### Test 18: Mobile Booking Form
**Steps:**
1. On mobile, scroll to booking form
2. Verify calendar slots are large enough to tap
3. Try booking:
   - Fill form fields
   - Tap a slot
   - Submit
4. Verify files download (or mobile share dialog appears)
5. Verify buttons are thumb-sized (easy to tap)

**Expected Result:** ✅ Form usable on mobile, no tiny tap targets

---

## 🌐 PRIORITY 7: Cross-Browser Testing

### Test 19: Chrome/Edge
**Steps:**
1. Open site in Chrome or Edge
2. Complete Test 3 (full booking flow)
3. Verify .ics and .txt files download
4. Verify no console errors (F12 → Console tab)

**Expected Result:** ✅ Everything works, no errors

---

### Test 20: Firefox
**Steps:**
1. Open site in Firefox
2. Complete Test 3 (full booking flow)
3. Verify downloads work
4. Verify calendar UI looks correct
5. Check console for errors

**Expected Result:** ✅ Everything works, no errors

---

### Test 21: Safari (Mac/iOS)
**Steps:**
1. Open site in Safari
2. Complete booking flow
3. Verify .ics opens in Calendar app
4. Check that date/time formatting looks correct
5. Test on iPhone if available

**Expected Result:** ✅ Works on Safari, calendar integration works

---

## 🎯 PRIORITY 8: Service Card Clicks

### Test 22: All Service Book Buttons Work
**Steps:**
1. Click "Book Garage Cleanup" → verify form prefills "Garage Cleanup & Organization" + 2 hours
2. Click "Book Yard Cleanup" → verify form prefills "Yard Cleanup" + 1.5 hours
3. Click "Book Car Cleaning" → verify form prefills "Car Interior Cleaning" + 1 hour
4. Scroll to "Complete Property Bundle" → click "Book Complete Bundle" → verify prefills + 4 hours

**Expected Result:** ✅ Each button prefills correct service and hours

---

### Test 23: Pricing Card Clicks (Quick Booking)
**Steps:**
1. Scroll to "Quick Pricing (Oakland)" section
2. Click each of the 4 pricing cards:
   - Garage Cleanup card
   - Yard Cleanup card
   - Car Interior card
   - Bundle Deal card
3. Verify each click scrolls to form and prefills service

**Expected Result:** ✅ All 4 cards are clickable and prefill form

---

## 🔗 PRIORITY 9: Links & Navigation

### Test 24: Navigation Menu Links
**Steps:**
1. Click "Services" in nav → verify scrolls to Services section
2. Click "Pricing" → scrolls to Pricing
3. Click "How It Works" → scrolls to How Booking Works
4. Click "FAQ" → scrolls to FAQ
5. Click "Book Now" button → scrolls to booking form
6. Click logo → scrolls to top

**Expected Result:** ✅ All nav links work, smooth scroll

---

### Test 25: Footer Links
**Steps:**
1. Scroll to footer
2. Click email link → verify mail client opens
3. Click phone link → verify dialer opens (or copies number)
4. Verify "Privacy-focused" note is visible

**Expected Result:** ✅ Footer links work

---

## 📧 PRIORITY 10: Webhook Integration (Optional)

### Test 26: Booking Notification to Owner
**Steps:**
1. Complete a booking
2. Check your email (Erikquintanilla990@gmail.com)
3. Verify you receive booking notification
4. Check it includes: name, service, date, time, phone, details

**Expected Result:** ✅ Email notification received with booking details

**Note:** If webhook fails, success message will mention "notification failed" but booking still saves locally.

---

## 🎨 PRIORITY 11: Visual Polish

### Test 27: Hover Effects
**Steps:**
1. Hover over service cards → verify they lift/scale slightly
2. Hover over pricing cards → verify shadow increases
3. Hover over buttons → verify they lift up
4. Hover over available slots → verify scale effect

**Expected Result:** ✅ Smooth hover animations on interactive elements

---

### Test 28: Color Consistency
**Steps:**
1. Verify blue accent color is consistent throughout:
   - Headings
   - Links
   - Primary buttons
   - Pricing cards (except service cards with custom colors)
2. Verify green is used for:
   - Available slots
   - Success messages
   - Bundle offer background

**Expected Result:** ✅ Colors are consistent and professional

---

## 🔍 PRIORITY 12: Edge Cases & Error Handling

### Test 29: Empty Form Submission
**Steps:**
1. Scroll to booking form
2. Click "Confirm Booking" WITHOUT filling anything
3. Verify browser shows required field messages
4. Fill only name and email, leave slot unselected
5. Try submitting
6. Verify weekend validation alert appears

**Expected Result:** ✅ Form validates all required fields

---

### Test 30: Referral Code Input
**Steps:**
1. Fill out booking form
2. In "Referral Code" field, type "FRIEND10"
3. Select a slot and submit
4. Verify success message shows: "✅ Referral code applied: FRIEND10 — You'll get $10 off!"
5. Verify referral code is in downloaded .txt file

**Expected Result:** ✅ Referral code saves and displays in confirmation

---

### Test 31: Long Input Handling
**Steps:**
1. In "Details" textarea, paste a very long text (500+ characters)
2. Submit booking
3. Verify it saves and shows in success message
4. Check downloaded .txt file includes full text

**Expected Result:** ✅ Long text handles gracefully, no truncation

---

### Test 32: Special Characters in Name/Email
**Steps:**
1. Enter name with apostrophe: "O'Brien"
2. Enter name with accent: "José García"
3. Submit and verify success message displays correctly
4. Check .ics and .txt files for correct encoding

**Expected Result:** ✅ Special characters handled correctly

---

## 📊 Testing Summary Template

Copy this table and mark ✅ or ❌ as you test:

| # | Test Name | Status | Notes |
|---|-----------|--------|-------|
| 1 | Book from Service Card | ⬜ | |
| 2 | Select Time Slot | ⬜ | |
| 3 | Complete Booking | ⬜ | |
| 4 | Weekend Validation | ⬜ | |
| 5 | Price Calculator | ⬜ | |
| 6 | Bundle Pricing | ⬜ | |
| 7 | Service Card Colors | ⬜ | |
| 8 | Bundle Badges | ⬜ | |
| 9 | Pricing Cards Blue | ⬜ | |
| 10 | Prefer to Talk Position | ⬜ | |
| 11 | Calendar Weekends | ⬜ | |
| 12 | Slot Status | ⬜ | |
| 13 | Admin Panel Toggle | ⬜ | |
| 14 | Block/Unblock Slot | ⬜ | |
| 15 | Clear Bookings | ⬜ | |
| 16 | Mobile Menu | ⬜ | |
| 17 | Mobile Layout | ⬜ | |
| 18 | Mobile Booking | ⬜ | |
| 19 | Chrome/Edge | ⬜ | |
| 20 | Firefox | ⬜ | |
| 21 | Safari | ⬜ | |
| 22 | Service Buttons | ⬜ | |
| 23 | Pricing Card Clicks | ⬜ | |
| 24 | Nav Links | ⬜ | |
| 25 | Footer Links | ⬜ | |
| 26 | Webhook Email | ⬜ | |
| 27 | Hover Effects | ⬜ | |
| 28 | Color Consistency | ⬜ | |
| 29 | Form Validation | ⬜ | |
| 30 | Referral Code | ⬜ | |
| 31 | Long Input | ⬜ | |
| 32 | Special Characters | ⬜ | |

---

## 🚨 Quick Smoke Test (5 Minutes)

If you're short on time, run these critical tests:

1. ✅ Test 3: Complete a booking
2. ✅ Test 5: Price calculator
3. ✅ Test 7: Service card colors
4. ✅ Test 17: Mobile layout
5. ✅ Test 24: Nav links

---

## 📝 Notes

- **Test on actual devices:** Use real phones (iOS/Android) if possible
- **Clear cache:** Between tests, do Ctrl+Shift+R to hard refresh
- **Use incognito:** Test in private/incognito mode to avoid cached issues
- **Check console:** Always have browser dev tools open (F12) to catch JavaScript errors

---

**Good luck testing! 🎉**
