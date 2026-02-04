# Testing Persistent Page State Feature

## Quick Test (30 seconds)

### Step 1: Start Registration
1. Open the website in browser (e.g., http://localhost:3000)
2. Fill in registration form:
   - First Name: `John`
   - Email: `john@test.com`
   - Password: `Test123!`

### Step 2: Make Selections
3. Select a track from dropdown: e.g., "Web Development"
4. Scroll down and click a duration button: e.g., "1-year"
5. Scroll down and select a payment method: e.g., "Credit Card"

### Step 3: Verify Auto-Save
6. Open Browser DevTools (Press `F12`)
7. Go to `Console` tab
8. Look for messages like:
   ```
   💾 Page state saved: {...}
   ```

### Step 4: Test Persistence
9. Press `F5` (Refresh the page)
10. All your data should come back:
    - Form fields restored
    - Track selection restored
    - Duration button highlighted
    - Payment method pre-selected

### Step 5: Verify in Storage
11. In DevTools, go to `Application` tab
12. Click `localStorage`
13. Find the site URL
14. Look for key: `bucodel_page_state`
15. You should see your saved data in JSON format

---

## Detailed Test Scenarios

### Test 1: Form Data Persistence
**Objective**: Verify form fields are saved and restored

**Steps**:
1. Go to registration page
2. Fill in:
   - Full Name: `Jane Smith`
   - Email: `jane@example.com`
   - Phone: `+234701234567`
   - Address: `123 Main Street, Lagos`
   - Password: `SecurePass123!`
3. Open DevTools Console
4. Type: `PageStateManager.saveState()`
5. Refresh page (F5)
6. **Expected**: All fields populated with your data

**Success Indicators**:
- ✅ Console shows "💾 Page state saved"
- ✅ Console shows "📂 Page state restored"
- ✅ All form fields have your data
- ✅ localStorage contains `bucodel_page_state` key

---

### Test 2: Track Selection Persistence
**Objective**: Verify track dropdown selection is saved

**Steps**:
1. On registration page, find the track dropdown
2. Select "Mobile Development"
3. Verify dropdown shows "Mobile Development"
4. Open DevTools, go to Application → localStorage
5. Find `bucodel_page_state`
6. Verify it contains: `"selectedTrack":"mobile-dev"`
7. Refresh page
8. **Expected**: Dropdown still shows "Mobile Development"

**Success Indicators**:
- ✅ Dropdown value preserved after refresh
- ✅ console shows "✓ Track restored: mobile-dev"
- ✅ localStorage data matches

---

### Test 3: Duration Selection Persistence
**Objective**: Verify duration button state is saved

**Steps**:
1. Scroll to payment section
2. Click on "6-months" duration button
3. Verify button becomes highlighted/active
4. Note the price displayed
5. Refresh page (F5)
6. **Expected**: "6-months" button still active with same price

**Success Indicators**:
- ✅ Duration button maintains active state
- ✅ Price still showing for selected duration
- ✅ console shows "✓ Duration restored: 6-months"

---

### Test 4: Payment Method Persistence
**Objective**: Verify payment method selection is saved

**Steps**:
1. Scroll to payment methods section
2. Click on "Bank Transfer" card
3. Verify the card becomes selected/highlighted
4. Verify the form section expands
5. Refresh page (F5)
6. **Expected**: "Bank Transfer" still selected with form visible

**Success Indicators**:
- ✅ Payment card remains selected
- ✅ Form details still visible
- ✅ console shows "✓ Payment method restored: bank-transfer"

---

### Test 5: Auto-Save Interval Test
**Objective**: Verify automatic saving every 10 seconds

**Steps**:
1. Open DevTools Console
2. Clear the console (right-click → Clear)
3. Type something in a form field
4. Watch console for "💾 Page state saved" messages
5. Wait 10 seconds without typing
6. **Expected**: Auto-save message appears even without typing

**Success Indicators**:
- ✅ Save message on typing
- ✅ Auto-save message appears every ~10 seconds
- ✅ localStorage is updated each time

---

### Test 6: Multiple Data Types
**Objective**: Verify all data types are saved together

**Steps**:
1. Fill form: Name, Email, Phone, Address
2. Select track: "Fullstack Development"
3. Select duration: "1-year"
4. Select payment: "Credit Card"
5. Refresh page
6. **Expected**: Everything restored together

**Success Indicators**:
- ✅ All form fields populated
- ✅ Track shows "Fullstack Development"
- ✅ Duration button "1-year" is active
- ✅ Payment card "Credit Card" is selected
- ✅ console shows multiple "✓ ... restored" messages

---

### Test 7: Browser Close/Reopen Test
**Objective**: Verify data survives browser close

**Steps**:
1. Fill in form and make selections (as above)
2. Close the entire browser (all windows)
3. Wait 30 seconds
4. Reopen browser
5. Navigate to the website again
6. **Expected**: All your data is still there!

**Success Indicators**:
- ✅ Data persists across browser sessions
- ✅ Works even after full restart
- ✅ Confirms localStorage persistence

---

### Test 8: Clear State After Completion
**Objective**: Verify saved state is cleared after registration

**Steps**:
1. Complete entire registration process:
   - Fill form
   - Select track, duration, courses
   - Select payment method
   - Submit form
2. Wait for "Setup completed successfully!" message
3. After redirect, go back to registration page
4. **Expected**: Page is empty (no previous data)

**Success Indicators**:
- ✅ Page shows clean form
- ✅ No form fields pre-filled
- ✅ No track selected
- ✅ localStorage has no `bucodel_page_state` key
- ✅ console shows "🗑️ Page state cleared"

---

### Test 9: Console Debugging Test
**Objective**: Verify debug messages are helpful

**Steps**:
1. Open DevTools Console
2. Fill some form fields
3. **Expected**: See messages like:
   ```
   💾 Page state saved: {timestamp: "...", formData: {...}, ...}
   ```
4. Refresh page
5. **Expected**: See messages like:
   ```
   📂 Page state restored: {...}
   ✓ Form data restored
   ✓ Track restored: web-dev
   ✅ Page state fully restored
   ```

**Success Indicators**:
- ✅ Clear, informative console messages
- ✅ Easy to track what's happening
- ✅ Good for debugging issues

---

### Test 10: Edge Cases
**Objective**: Test unusual scenarios

#### Test 10a: Rapid Refresh
1. Type in form field
2. Immediately refresh (F5) multiple times
3. **Expected**: Data still restored each time

#### Test 10b: Network Offline
1. Fill form
2. Enable offline mode (DevTools → Network → Offline)
3. Refresh page
4. **Expected**: Data loads from localStorage (no network needed)

#### Test 10c: Partial Data
1. Fill only name and email
2. Refresh
3. **Expected**: Only name and email are filled, other fields empty

#### Test 10d: Clear Browser Data
1. Fill form
2. Clear browser data (DevTools or Settings)
3. Refresh page
4. **Expected**: Form is empty (localStorage cleared)

---

## Automated Testing Script

Run this in DevTools Console to test automatically:

```javascript
// Test 1: Save and check
console.log('🧪 Test 1: Checking if PageStateManager exists...');
console.log(typeof PageStateManager === 'object' ? '✅ PASS' : '❌ FAIL');

// Test 2: Check auto-save is initialized
console.log('🧪 Test 2: Checking if auto-save is enabled...');
// Try to get saved state
const state = PageStateManager.restoreState();
console.log(state ? '✅ PASS - State saved' : '⚠️ No state yet (will save on input)');

// Test 3: Check localStorage
console.log('🧪 Test 3: Checking localStorage...');
const stored = localStorage.getItem('bucodel_page_state');
console.log(stored ? '✅ PASS - Data in localStorage' : '⚠️ No data yet');

// Test 4: Manual save
console.log('🧪 Test 4: Testing manual save...');
PageStateManager.saveState();
const afterSave = localStorage.getItem('bucodel_page_state');
console.log(afterSave ? '✅ PASS - Save works' : '❌ FAIL - Save failed');

// Test 5: Check saved data structure
if (afterSave) {
  const data = JSON.parse(afterSave);
  console.log('🧪 Test 5: Checking data structure...');
  const hasRequired = data.timestamp && data.formData && data.registrationData;
  console.log(hasRequired ? '✅ PASS - Complete structure' : '❌ FAIL - Missing fields');
  console.log('Saved data:', data);
}
```

**How to run**:
1. Open DevTools (F12)
2. Go to Console tab
3. Paste the script above
4. Press Enter
5. See test results

---

## Troubleshooting

### Data Not Saving
**Symptom**: After refresh, form is empty
**Causes**:
- localStorage is disabled in browser
- InPrivate/Incognito mode (clears data on close)
- Browser storage quota exceeded
- JavaScript error preventing save

**Fix**:
1. Check DevTools → Application → localStorage
2. Enable localStorage in browser settings
3. Use regular browsing mode (not InPrivate)
4. Check console for errors (❌ or ⚠️)

### Data Not Restoring
**Symptom**: Page state saved but not restored on refresh
**Causes**:
- 1.5 second delay hasn't passed yet
- Form elements not loaded yet
- Element IDs don't match

**Fix**:
1. Wait 2 seconds after page load
2. Refresh again
3. Check that form elements have correct IDs

### Page Too Slow
**Symptom**: Page loads slowly after adding feature
**Causes**:
- Large amount of stored data
- Many form fields to save

**Fix**:
1. Clear localStorage: DevTools → Storage → Clear all
2. Refresh page
3. Check performance again

### Data Lost After Completion
**Symptom**: After registration, data is gone
**Expected**: This is intentional! After successful registration, the PageStateManager.clearState() function removes the saved data
**Not a bug**: Feature working as designed

---

## Success Checklist

After testing, you should be able to check:

- ✅ Form fields restore after refresh
- ✅ Track selection persists
- ✅ Duration button state persists
- ✅ Payment method selection persists
- ✅ Data shows in localStorage
- ✅ Console shows helpful debug messages
- ✅ Multiple data types save together
- ✅ Works after browser close/reopen
- ✅ Clears after successful registration
- ✅ No performance degradation

If all checks pass, the persistent page state feature is working perfectly! 🎉
