# Course Management System Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER (Client)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  teacher.html                                                │
│  ├─ Add Course Modal                                         │
│  ├─ Course Table                                             │
│  └─ Form Handlers                                            │
│                                                               │
│  courses.js (Async Manager)                                  │
│  ├─ addCourse()          → POST /api/courses                │
│  ├─ getTrackCourses()    → GET /api/courses/track/:name     │
│  ├─ updateCourse()       → PUT /api/courses/:id             │
│  ├─ deleteCourse()       → DELETE /api/courses/:id          │
│  └─ getAllCourses()      → GET /api/courses                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                             ↕
                        JSON over HTTP
                             ↕
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js Express)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  server.js                                                    │
│  ├─ GET /api/courses                                         │
│  ├─ GET /api/courses/track/:trackName                        │
│  ├─ POST /api/courses                                        │
│  ├─ PUT /api/courses/:courseId                               │
│  └─ DELETE /api/courses/:courseId                            │
│                                                               │
│  Helper Functions:                                           │
│  ├─ readCoursesJSON()   ↔ courses.json                      │
│  └─ writeCoursesJSON()  ↔ courses.json                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                             ↕
                         File System
                             ↕
┌─────────────────────────────────────────────────────────────┐
│                   STORAGE (Disk)                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  courses.json                                                 │
│  {                                                           │
│    "courses": [                                              │
│      {                                                       │
│        "id": "FS101-123",                                   │
│        "code": "FS101",                                      │
│        "name": "Frontend Fundamentals",                     │
│        "track": "fullstack",                                │
│        "instructor": "John Doe",                            │
│        "schedule": "MWF 09:00-10:00",                       │
│        "students": 35,                                       │
│        "description": "..."                                 │
│      }                                                       │
│    ],                                                        │
│    "metadata": {...}                                         │
│  }                                                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Adding a Course

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. TEACHER INTERACTS                                            │
└─────────────────────────────────────────────────────────────────┘
              ↓
        Clicks "+ Add Course"
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. MODAL DISPLAYS                                               │
└─────────────────────────────────────────────────────────────────┘
   Form with fields:
   • Track (dropdown)
   • Code
   • Name
   • Description
   • Instructor
   • Schedule
   • Students
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. TEACHER FILLS FORM                                           │
└─────────────────────────────────────────────────────────────────┘
   Enters all required information
              ↓
        Clicks "Add Course"
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. CLIENT VALIDATION                                            │
└─────────────────────────────────────────────────────────────────┘
   teacher.html validates:
   • Track selected
   • Code not empty
   • Name not empty
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. API CALL                                                     │
└─────────────────────────────────────────────────────────────────┘
   courses.js calls:
   await fetch('/api/courses', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({track, code, name, ...})
   })
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. SERVER RECEIVES REQUEST                                      │
└─────────────────────────────────────────────────────────────────┘
   server.js:
   app.post('/api/courses', (req, res) => {
     • Extracts: track, code, name, description, etc.
     • Validates required fields
     • Checks for duplicate code
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. SERVER SAVES TO FILE                                         │
└─────────────────────────────────────────────────────────────────┘
   • Reads current courses.json
   • Adds new course object
   • Updates metadata (total count, tracks list)
   • Writes back to courses.json
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. SERVER RESPONDS                                              │
└─────────────────────────────────────────────────────────────────┘
   Returns JSON:
   {
     "success": true,
     "message": "Course FS101 added successfully",
     "course": { id, code, name, ... }
   }
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. CLIENT PROCESSES RESPONSE                                    │
└─────────────────────────────────────────────────────────────────┘
   • Checks success flag
   • Shows success alert
   • Closes modal
   • Resets form
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. UI UPDATES                                                  │
└─────────────────────────────────────────────────────────────────┘
   • Refreshes course table
   • Fetches updated courses from server
   • Displays new course in table
              ↓
        Teacher sees course!
```

## Request Response Cycle

### Add Course
```
CLIENT                              SERVER
  │                                   │
  ├─ POST /api/courses ──────────────>│
  │  {track, code, name, ...}         │
  │                                   ├─ Validate
  │                                   ├─ Check duplicate
  │                                   ├─ Read courses.json
  │                                   ├─ Add new course
  │                                   ├─ Update metadata
  │                                   ├─ Write courses.json
  │                                   │
  │<─ 201 Created ────────────────────┤
  │  {success, message, course}       │
  │                                   │
  ├─ Display in table
  │
```

### Get Track Courses
```
CLIENT                              SERVER
  │                                   │
  ├─ GET /api/courses/track/fullstack>│
  │                                   ├─ Read courses.json
  │                                   ├─ Filter by track
  │                                   │
  │<─ 200 OK ─────────────────────────┤
  │  {courses: [...]}                 │
  │                                   │
  ├─ Render in table
  │
```

### Delete Course
```
CLIENT                              SERVER
  │                                   │
  ├─ DELETE /api/courses/:id ────────>│
  │                                   ├─ Find course
  │                                   ├─ Read courses.json
  │                                   ├─ Remove course
  │                                   ├─ Update count
  │                                   ├─ Write courses.json
  │                                   │
  │<─ 200 OK ─────────────────────────┤
  │  {success, deletedCourse}         │
  │                                   │
  ├─ Remove from table
  │
```

## File Interactions

```
teacher.html
    │
    ├─→ Form Submission
    │       │
    │       └─→ courses.js (async API calls)
    │           │
    │           ├─ POST /api/courses
    │           ├─ GET /api/courses/track/:name
    │           ├─ PUT /api/courses/:id
    │           └─ DELETE /api/courses/:id
    │                   │
    │                   └─→ server.js (Express endpoints)
    │                       │
    │                       └─→ courses.json (File Storage)
    │
    └─→ Display Results
        │
        └─→ Updates UI (table, alerts, etc.)
```

## Error Handling Flow

```
User Action
    │
    ├─ Invalid Input? → Alert User
    │
    ├─ Network Error? → Catch Error → Alert "Failed to connect"
    │
    ├─ API Error? → Check Response → Alert with error message
    │
    └─ Success → Update UI → Show success message
```

## Multi-User Scenario

```
User A (Browser 1)          User B (Browser 2)
    │                           │
    ├─ Adds Course X            │
    │   │                        │
    │   └─ POST /api/courses     │
    │       │                    │
    │       └─→ server.js ←──────┼─ GET /api/courses
    │           │                │
    │           └─ Write to      │
    │             courses.json   │
    │               │            │
    │               └────────────┼─→ Reads courses.json
    │                            │
    │ Sees Course X              ├─ Refreshes Browser
    │ in table                   │
    │                            └─ See Course X
    │                              (Same data!)
    │
    ✓ Both see the same courses!
```

## Technology Stack

```
┌──────────────────┐
│   Client Layer   │
├──────────────────┤
│ HTML/CSS/JS      │ teacher.html
│ Fetch API        │ courses.js
│ Form Validation  │
└──────────────────┘
        ↕ HTTP(S)
┌──────────────────┐
│  Server Layer    │
├──────────────────┤
│ Node.js          │
│ Express.js       │
│ Middleware       │
│ Route Handlers   │
└──────────────────┘
        ↕ File I/O
┌──────────────────┐
│  Storage Layer   │
├──────────────────┤
│ Filesystem       │
│ courses.json     │
│ JSON format      │
└──────────────────┘
```

## HTTP Status Codes Used

```
200 OK                 - GET, PUT, DELETE successful
201 Created            - POST successful (course created)
400 Bad Request        - Missing/invalid data
404 Not Found          - Course doesn't exist
500 Server Error       - Server-side error
```

This architecture ensures:
✅ Data consistency across users
✅ Server as single source of truth
✅ Easy to expand (database migration)
✅ Proper separation of concerns
✅ Scalable and maintainable
