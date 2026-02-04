# Server-Based Class Management Implementation Guide

## Summary
This guide provides step-by-step instructions to integrate server-side class session management, screen sharing, and video/audio streaming through the Node.js server.

## Step 1: Update server.js with Class Session Management

Add the following code to your `server.js` file after the existing WebSocket setup and before the existing class endpoints (around line 45):

```javascript
// Store active class sessions (Add this with other Map declarations)
const activeClasses = new Map();
```

Then add all the new endpoints from `SERVER_CLASS_ENDPOINTS.js` before the `app.listen()` call (before line 2870).

### Key Endpoints Added:
- `GET /api/classes/active` - Get all active class sessions
- `GET /api/classes/active/:meetingId` - Get specific active class
- `POST /api/classes/start` - Teacher starts a class (creates server session)
- `POST /api/classes/end` - Teacher ends a class (removes server session)
- `POST /api/classes/join` - Student joins class (adds to participants)
- `POST /api/classes/screen-share` - Update screen sharing status

## Step 2: Update teacher.html

Replace the `startCourseClass` function and screen share handlers with the code from `TEACHER_SERVER_INTEGRATION.js`:

1. Find `function startCourseClass(courseCode)` in teacher.html (around line 2420)
2. Replace it with the updated version from TEACHER_SERVER_INTEGRATION.js
3. Replace the screen share event listener (search for `share-screen` button click)
4. Add the new `stopScreenShare()` function
5. Replace `endVideoCall()` with `endVideoCallWithServer()`
6. Update the "End Call" button click handler to call `endVideoCallWithServer()`

### Changes Made:
- ✅ Teacher class start notifies server
- ✅ Screen sharing notifies server (students receive updates)
- ✅ Class end notifies server (students are disconnected)
- ✅ All courses show "Manage" button after class ends

## Step 3: Update student.html

Replace the `joinVideoClass` function and initialization with code from `STUDENT_SERVER_INTEGRATION.js`:

1. Find `async function joinVideoClass` in student.html (around line 868)
2. Replace it with the updated version from STUDENT_SERVER_INTEGRATION.js
3. Replace `initPageWithRestoration()` function
4. Add the new `checkForActiveClasses()` function
5. Update auto-join logic to use `checkForActiveClasses()`

### Changes Made:
- ✅ Student joins class on server
- ✅ Monitor server for screen share updates (polls every 500ms)
- ✅ Auto-detect and auto-join active classes
- ✅ Real-time screen share status updates from server

## Step 4: How It Works

### Teacher Starting a Class:
1. Teacher clicks "Start" button on a course
2. Server creates active class session in `activeClasses` map
3. Server broadcasts to all connected clients
4. Course button changes to "Manage" (but class is still active)
5. Teacher can share screen - server updates session status
6. Students auto-join when they load the page

### Student Joining:
1. Student loads page → checks server for active classes
2. If active class found → automatically joins
3. Student sees "Waiting for teacher..." message
4. Student monitors server every 500ms for screen share status
5. When teacher shares screen → student sees "Teacher is Sharing Screen"
6. Student can leave anytime or class ends when teacher ends it

### When Teacher Ends Class:
1. Teacher clicks "End Call"
2. Server removes class session from activeClasses
3. Students see "Class has ended"
4. All students are disconnected
5. Course button changes back to "Manage" automatically

## Step 5: File Structure

After implementation, you'll have:
- `server.js` - Updated with class session endpoints
- `teacher.html` - Updated with server notifications
- `student.html` - Updated to join and monitor classes via server
- Reference files (don't add to project):
  - `SERVER_CLASS_ENDPOINTS.js` - Endpoints to add to server
  - `TEACHER_SERVER_INTEGRATION.js` - Teacher functions
  - `STUDENT_SERVER_INTEGRATION.js` - Student functions

## Step 6: Testing

### Test Case 1: Teacher Starts Class
1. Teacher logs in
2. Teacher clicks "Start" on a course
3. Check browser console for "✅ Server notified - class started"
4. Check `activeClasses` map has entry

### Test Case 2: Student Auto-joins
1. Start teacher class (Step 1)
2. Open student portal in another window
3. Should auto-join within 1 second
4. Should see "Waiting for teacher..." message

### Test Case 3: Screen Sharing
1. Have teacher and student connected
2. Teacher clicks "Share Screen"
3. Student should see message update to "Teacher is Sharing Screen"
4. Teacher stops screen → Student sees "Waiting..." again

### Test Case 4: Class Ends
1. Have active class running
2. Teacher clicks "End Call"
3. Student is disconnected
4. Course button on teacher side changes to "Manage"
5. Teacher can immediately start another class for same course

## Important Configuration

Make sure these constants are correct:

**In student.html:**
```javascript
// The API_URL for fetch calls should match your server
const API_URL = 'http://localhost:5001'; // Update if server is on different port
```

**In teacher.html:**
```javascript
// Already defined at top of script
const API_URL = window.appConfig?.API_URL || 'http://localhost:5001';
```

## API Response Examples

### Start Class Response:
```json
{
  "success": true,
  "message": "Class session created",
  "session": {
    "meetingId": "APKL-ABC123-XYZ789",
    "courseCode": "FS101",
    "teacherId": "teacher_1",
    "screenSharing": false
  }
}
```

### Check Active Class Response:
```json
{
  "success": true,
  "session": {
    "meetingId": "APKL-ABC123-XYZ789",
    "courseCode": "FS101",
    "teacherId": "teacher_1",
    "startedAt": "2026-01-31T14:00:00Z",
    "screenSharing": true,
    "participantCount": 3
  }
}
```

## Troubleshooting

### Issue: Students don't auto-join
- Check that `checkForActiveClasses()` is called on student page load
- Verify `/api/classes/active` endpoint is returning active sessions
- Check browser console for error messages

### Issue: Screen share not updating
- Verify `POST /api/classes/screen-share` is being called
- Check polling interval (currently 500ms) is not too long
- Ensure broadcast to all users is working

### Issue: Course button not changing
- Verify `endVideoCallWithServer()` is being called (not old `endVideoCall()`)
- Check server is removing session from `activeClasses`
- Verify course table is being updated after response

## Future Enhancements

1. Real-time video/audio streaming via WebRTC
2. Chat messaging between teacher and students
3. Attendance tracking
4. Recording class sessions
5. Participant list with status indicators
6. Hand-raising feature for students
7. Breakout rooms for group activities
8. Live polls and quizzes during class
