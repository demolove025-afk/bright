# Course Management System - Server-Side Implementation

## Summary

The course management system has been completely refactored to use **server-side storage** instead of localStorage. All courses are now managed through REST API endpoints.

## What Was Changed

### 1. **Server (server.js)**
Added 5 new API endpoints for course management:
- `GET /api/courses` - Fetch all courses (with optional track filter)
- `GET /api/courses/track/:trackName` - Fetch courses for a specific track
- `POST /api/courses` - Add a new course
- `PUT /api/courses/:courseId` - Update a course
- `DELETE /api/courses/:courseId` - Delete a course

### 2. **Storage (courses.json)**
Created a new `courses.json` file to persist courses on the server with:
- Array of course objects organized by track
- Metadata tracking total courses, available tracks, and last updated time
- Pre-populated with 3 Fullstack courses

### 3. **Client Manager (courses.js)**
Completely rewrote to use async API calls instead of localStorage:
- All functions are now async
- Functions return Promises that resolve with API responses
- Automatic error handling and logging
- Seamless integration with the server API

### 4. **Teacher Dashboard (teacher.html)**
Updated the "Add Course" modal to:
- Call the server API when adding courses
- Show loading state while processing
- Display error messages if API call fails
- Async display of courses from server

## How It Works

### Adding a Course (Flow)

1. **Teacher clicks "+ Add Course"** button
2. **Modal appears** with form fields (Track, Code, Name, Description, etc.)
3. **Teacher fills form** and clicks "Add Course"
4. **Form submission** triggers async API call to `POST /api/courses`
5. **Server validates** course data and saves to `courses.json`
6. **Success response** returns the created course object
7. **UI updates** to show the new course in the table
8. **Modal closes** and form resets

### Viewing Courses by Track (Flow)

1. **Page loads** with course management section
2. **JavaScript calls** `GET /api/courses/track/fullstack`
3. **Server reads** `courses.json` and filters by track
4. **Courses display** in the table with Manage and Delete buttons

### Deleting a Course (Flow)

1. **Teacher clicks Delete button**
2. **Confirmation dialog** asks for confirmation
3. **API call** to `DELETE /api/courses/:courseId`
4. **Server removes** course from `courses.json`
5. **UI updates** to remove course from table

## File Structure

```
APKL/
├── server.js                    (Updated with new endpoints)
├── courses.js                   (Rewritten to use API)
├── courses.json                 (New - stores all courses)
├── teacher.html                 (Updated modal logic)
├── COURSE_API.md               (New - API documentation)
└── COURSE_MANAGEMENT_README.md (Updated documentation)
```

## API Endpoints Reference

All endpoints use JSON for request/response bodies.

### GET /api/courses
```bash
curl http://127.0.0.1:5000/api/courses
curl "http://127.0.0.1:5000/api/courses?track=fullstack"
```

### GET /api/courses/track/:trackName
```bash
curl http://127.0.0.1:5000/api/courses/track/fullstack
```

### POST /api/courses
```bash
curl -X POST http://127.0.0.1:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "track": "fullstack",
    "code": "FS104",
    "name": "Advanced React",
    "description": "Build advanced React apps",
    "instructor": "Jane Smith",
    "schedule": "TTh 10:00-11:30",
    "students": 25
  }'
```

### PUT /api/courses/:courseId
```bash
curl -X PUT http://127.0.0.1:5000/api/courses/FS104-1704067200000 \
  -H "Content-Type: application/json" \
  -d '{"students": 30}'
```

### DELETE /api/courses/:courseId
```bash
curl -X DELETE http://127.0.0.1:5000/api/courses/FS104-1704067200000
```

## Using in Code

### From Teacher Dashboard
The form automatically uses the API:
```javascript
// Form submission automatically calls:
await window.coursesManager.addCourse('fullstack', courseData);
```

### From Other Pages
```javascript
// Load courses for a track
const courses = await window.coursesManager.getTrackCourses('fullstack');

// Add a course
const newCourse = await window.coursesManager.addCourse('animation', {
  code: 'ANIM101',
  name: '3D Animation Basics',
  description: 'Learn Blender 3D',
  instructor: 'Mike D.',
  schedule: 'MWF 14:00-15:00',
  students: 20
});

// Update a course
const updated = await window.coursesManager.updateCourse(courseId, {
  students: 30
});

// Delete a course
await window.coursesManager.deleteCourse('fullstack', courseId);

// Get all courses
const allCourses = await window.coursesManager.getAllCourses();
```

## Testing the System

### Start the Server
```bash
node server.js
```

You should see the new course endpoints in the startup log:
```
   GET /api/courses - Get all courses
   GET /api/courses/track/:trackName - Get courses for specific track
   POST /api/courses - Add new course
   PUT /api/courses/:courseId - Update course
   DELETE /api/courses/:courseId - Delete course
```

### Test via Browser Console
```javascript
// Get all courses
const allCourses = await window.coursesManager.getAllCourses();
console.log(allCourses);

// Get fullstack courses
const fullstackCourses = await window.coursesManager.getTrackCourses('fullstack');
console.log(fullstackCourses);

// Add a new course
const newCourse = await window.coursesManager.addCourse('animation', {
  code: 'ANIM101',
  name: '3D Animation',
  instructor: 'John',
  schedule: 'MWF',
  students: 20
});
console.log(newCourse);
```

### Test via cURL
```bash
# Get all courses
curl http://127.0.0.1:5000/api/courses | jq

# Get fullstack courses
curl http://127.0.0.1:5000/api/courses/track/fullstack | jq

# Add a course
curl -X POST http://127.0.0.1:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"track":"animation","code":"ANIM101","name":"3D Animation","instructor":"John","students":20}'
```

## Benefits of This Approach

✅ **Data Persistence** - Courses survive browser close/refresh  
✅ **Multi-User Support** - All users see the same courses  
✅ **Server Authority** - Single source of truth  
✅ **Scalability** - Easy to migrate to database later  
✅ **API Standard** - Can be consumed by mobile apps, other services  
✅ **Audit Trail** - All changes stored on server  
✅ **Validation** - Server-side validation prevents bad data  

## Next Steps (Optional)

1. **Database Migration** - Replace `courses.json` with database (PostgreSQL/Supabase)
2. **Search & Filter** - Add advanced search endpoints
3. **Pagination** - Add limit/offset for large datasets
4. **Course Enrollment** - Track which students are enrolled
5. **Course Materials** - Upload documents, videos, assignments
6. **Instructor Dashboard** - More detailed course analytics
