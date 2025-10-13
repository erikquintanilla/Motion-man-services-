/**
 * Motion Man Services - Booking Email Handler
 * 
 * This Google Apps Script receives booking requests from your website
 * and sends email notifications to you and the client.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Paste this entire code
 * 4. Click "Deploy" > "New deployment"
 * 5. Choose "Web app" as deployment type
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Anyone"
 * 8. Click "Deploy"
 * 9. Copy the web app URL
 * 10. Paste the URL into BOOKING_ENDPOINT in script.js
 */

function doPost(e) {
  try {
    var params = e.parameter || {};
    if (!params.data) {
      return ContentService.createTextOutput('Missing data').setMimeType(ContentService.MimeType.TEXT);
    }

    var payload = JSON.parse(params.data);

    // Email settings
    var ownerEmail = 'Erikquintanilla990@gmail.com'; // your email
    var subject = 'New booking request - Motion Man';
    
    // Build email body with contact method
    var contactMethodText = payload.contactMethod || 'email';
    var contactMethodEmoji = contactMethodText === 'phone' ? '📞' : contactMethodText === 'text' ? '💬' : '📧';
    
    var body =
      '🎉 NEW BOOKING REQUEST\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '📋 SERVICE DETAILS:\n' +
      'Service: ' + payload.service + '\n' +
      'Duration: ' + payload.hours + ' hours\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '👤 CLIENT INFORMATION:\n' +
      'Name: ' + payload.name + '\n' +
      'Phone: ' + payload.phone + '\n' +
      'Email: ' + payload.email + '\n' +
      contactMethodEmoji + ' PREFERRED CONTACT: ' + contactMethodText.toUpperCase() + '\n' +
      '📍 Address: ' + (payload.address || 'Not provided') + '\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '📅 SCHEDULE:\n' +
      'Date: ' + payload.date + '\n' +
      'Time: ' + payload.time + '\n\n';

    // Add referral code if present
    if (payload.referral) {
      body += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
              '🎁 REFERRAL CODE: ' + payload.referral + '\n' +
              '(Remember to apply $10 discount!)\n\n';
    }

    // Add special requests if present
    if (payload.specialRequests) {
      body += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
              '📝 SPECIAL REQUESTS:\n' +
              payload.specialRequests + '\n\n';
    }

    body += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            '⚡ ACTION REQUIRED:\n' +
            'Contact client via ' + contactMethodText + ' within 24 hours to confirm.\n';

    // Send email to owner
    GmailApp.sendEmail(ownerEmail, subject, body);

    // Auto-reply to client if email present
    if (payload.email) {
      var clientSubject = 'We received your booking request - Motion Man Services';
      var clientBody =
        'Hi ' + payload.name + ',\n\n' +
        'Thanks for your booking request! 🎉\n\n' +
        'I received your request for:\n' +
        '• Service: ' + payload.service + '\n' +
        '• Date: ' + payload.date + ' at ' + payload.time + '\n' +
        '• Duration: ' + payload.hours + ' hours\n\n';
      
      if (contactMethodText === 'phone') {
        clientBody += 'I\'ll give you a call at ' + payload.phone + ' within 24 hours to confirm the details.\n\n';
      } else if (contactMethodText === 'text') {
        clientBody += 'I\'ll send you a text at ' + payload.phone + ' within 24 hours to confirm the details.\n\n';
      } else {
        clientBody += 'I\'ll email you back within 24 hours to confirm the details.\n\n';
      }
      
      clientBody +=
        'Looking forward to helping you out!\n\n' +
        'Best,\n' +
        'Erik Quintanilla\n' +
        'Motion Man Services\n' +
        '(510) 978-0413\n' +
        'Erikquintanilla990@gmail.com';

      GmailApp.sendEmail(
        payload.email,
        clientSubject,
        clientBody
      );
    }

    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput('ERR: ' + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}
