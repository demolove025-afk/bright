# Persistent Page State Feature

## Overview
Users can now save their progress on the registration page. If they refresh the page or close the browser, all their data will be automatically saved and restored when they return.

## What Gets Saved
✅ **Form Data**: All text inputs, dropdowns, and textareas
- First Name, Email, Password
- Phone, Address
- Any other form fields

✅ **Track Selection**: The selected tech track/course
- Automatically restored when page loads
- Will re-load track options dynamically

✅ **Duration Selection**: Whether user selected 6-months or 1-year
- Button state is preserved
- Price amounts are recalculated

✅ **Payment Method**: Which payment method was selected
- Credit Card, Bank Transfer, PayPal, or Gift Card
- Form visibility is restored

✅ **Registration Data**: Track and duration information
- Stored in window.registrationData
- Used for payment calculation

✅ **Current Page Step**: Which setup step the user was on (Step 1, 2, 2.5, 3, etc.)
- Automatically returns user to their last step

## How It Works

### Auto-Save
- **On Input/Change**: Every time a user types or selects something, the data is saved
- **Periodic Backup**: Every 10 seconds, the entire page state is saved automatically
- **Location**: localStorage with key `bucodel_page_state`

### Auto-Restore
- When the page loads, the system automatically:
  1. Checks for saved page state in localStorage
  2. Restores all form fields with their saved values
  3. Restores track and duration selections
  4. Restores payment method selection
  5. Returns user to their last step if they were in setup

### Clear State
- After successful registration completion, the saved state is automatically cleared
- User can also manually clear by calling `PageStateManager.clearState()`

## Code Implementation

### Main Functions (in script.js)

```javascript
// Save the current page state
PageStateManager.saveState()

// Restore the saved page state
PageStateManager.restoreState()

// Restore form data from saved state
PageStateManager.restoreFormData(formData)

// Clear saved state after completion
PageStateManager.clearState()
```

### What Triggers Saves
- Any input field change (typing, pasting, clearing)
- Any selection change (dropdowns, radio buttons, checkboxes)
- Any textarea change
- Automatic save every 10 seconds as backup

### What Triggers Restore
- Page load (DOMContentLoaded event)
- Approximately 1.5 seconds after page load (allows DOM to settle)

## Data Storage
- **Storage Type**: Browser localStorage (persists across sessions)
- **Storage Key**: `bucodel_page_state`
- **Storage Limit**: ~5-10MB per domain (more than enough)
- **Duration**: Until user clears browser data or we clear it

## Example Storage Structure
```json
{
  "timestamp": "2025-01-30T10:30:45.123Z",
  "currentStep": "2.5",
  "formData": {
    "fullname": "John Doe",
    "email": "john@example.com",
    "contact-phone": "+234812345678",
    "contact-address": "123 Main St",
    "register-track": "web-dev"
  },
  "selectedTrack": "web-dev",
  "selectedDuration": "1-year",
  "selectedPaymentMethod": "credit-card",
  "registrationData": {
    "track": "Web Development",
    "duration": "1-year",
    "price": 550
  }
}
```

## User Experience Flow
1. **User starts registration** → Form appears empty
2. **User fills form, selects track, chooses duration** → Data is saved automatically
3. **User refreshes page** → Page reloads with all their data restored
4. **User continues registration** → Can pick up where they left off
5. **User completes payment** → Page state is cleared, dashboard loads
6. **If user returns later** → Page state is gone (clean start for next user/session)

## Browser Compatibility
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Opera (all versions)
- Works on mobile browsers too

## Important Notes
- State is saved per browser/device (not synced across devices)
- State is cleared when user completes registration
- State persists if user:
  - Refreshes the page (F5)
  - Closes and reopens browser
  - Goes to other tabs and comes back
  - Loses internet connection (state still there)
  - Device sleeps and wakes up

## Testing
To test the feature:
1. Open the registration page
2. Fill in some form fields (name, email, etc.)
3. Select a track from dropdown
4. Select a duration (6-months or 1-year)
5. Select a payment method
6. Press F5 to refresh
7. All your data should be restored automatically!
8. Check browser console for logs like:
   - "💾 Page state saved"
   - "📂 Page state restored"
   - "✓ Form data restored"

## Troubleshooting
If data isn't being restored:
1. Check if localStorage is enabled in browser
2. Open DevTools (F12) → Application → localStorage
3. Look for key: `bucodel_page_state`
4. Check if it contains your data
5. Check console for any error messages starting with "❌" or "⚠️"

## Disabling Feature
To disable automatic save/restore temporarily:
- Open DevTools console
- Run: `localStorage.removeItem('bucodel_page_state')`
- Refresh page

## Future Enhancements
- [ ] Add UI indicator showing "Auto-saving..."
- [ ] Add manual save button
- [ ] Add restore confirmation dialog
- [ ] Add export/import functionality
- [ ] Add multiple session support (save multiple incomplete registrations)
