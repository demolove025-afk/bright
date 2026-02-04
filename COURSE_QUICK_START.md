# Course Management - Quick Start

## The System
- **Teacher clicks "Add Course"** → Shows a form
- **Teacher fills in details** (Track, Code, Name, Instructor, Schedule, Students)
- **Form submits to server API** → `/api/courses` (POST)
- **Server saves to `courses.json`** → File persisted on disk
- **All users see the course** → Loaded from same source
- **Teachers can delete/update** → Uses DELETE/PUT endpoints

## Course Data
Each course has:
- **Code**: e.g., "FS101" (unique identifier)
- **Name**: Full course name
- **Track**: Which learning track (fullstack, animation, webdev, etc.)
- **Instructor**: Teacher name
- **Schedule**: Class times (e.g., "MWF 09:00-10:00")
- **Students**: Number enrolled
- **Description**: What the course covers

## Tracks Available
```
fullstack, animation, webdev, mobiledev, datascience, 
cybersecurity, cloud, ai, marketing, uiux
```

## Files Modified/Created

| File | What Changed |
|------|-------------|
| `server.js` | ✅ Added 5 new API endpoints for courses |
| `courses.js` | ✅ Rewritten to use server API (async) |
| `courses.json` | ✨ NEW - Stores all courses on server |
| `teacher.html` | ✅ Updated form to call API |

## API Endpoints

```
GET    /api/courses                      Get all courses
GET    /api/courses?track=fullstack      Get courses for track
GET    /api/courses/track/fullstack      Same as above
POST   /api/courses                      Add new course
PUT    /api/courses/:id                  Update course
DELETE /api/courses/:id                  Delete course
```

## Usage Examples

### In Teacher Dashboard (Automatic)
```javascript
// When teacher submits the form, this happens automatically:
await window.coursesManager.addCourse('fullstack', {
  code: 'FS101',
  name: 'Frontend Fundamentals',
  instructor: 'John Doe',
  schedule: 'MWF 09:00-10:00',
  students: 35,
  description: 'HTML/CSS/JS basics'
});
```

### In Other Code
```javascript
// Get courses for a track
const courses = await window.coursesManager.getTrackCourses('fullstack');

// Delete a course
await window.coursesManager.deleteCourse('fullstack', courseId);

// Update a course
await window.coursesManager.updateCourse(courseId, { students: 40 });

// Get ALL courses
const allCourses = await window.coursesManager.getAllCourses();
```

## Testing

### 1. Start Server
```bash
node server.js
```

### 2. Open Browser
Go to http://127.0.0.1:5000/teacher.html

### 3. Add a Course
- Click "My Courses" in sidebar
- Click "+ Add Course" button
- Fill form (Track: Fullstack, Code: FS104, Name: "React Advanced", etc.)
- Click "Add Course"

### 4. Check Console
```javascript
// In browser console, verify:
console.log(await window.coursesManager.getTrackCourses('fullstack'));
// Should show your new course!
```

## How Data Flows

```
Teacher Form
    ↓
Form Submission (async)
    ↓
POST /api/courses
    ↓
server.js validates
    ↓
Writes to courses.json
    ↓
Returns success response
    ↓
JavaScript alerts "Course added!"
    ↓
Refreshes table from server
    ↓
New course appears in UI
```

## When Multiple Users Use System

```
User A adds Course X
    ↓ (saves to courses.json)
User B refreshes browser
    ↓ (reads from courses.json)
User B sees Course X
    ✓ Both see same data!
```

## Error Handling

If something goes wrong:
```javascript
try {
  await window.coursesManager.addCourse('fullstack', courseData);
} catch (error) {
  console.error('Failed to add course:', error.message);
  // Shows helpful error message
}
```

The form automatically shows errors to the user with alerts.

## Server Storage

All courses stored in `courses.json`:
```json
{
  "courses": [
    {
      "id": "FS101-unique",
      "code": "FS101",
      "name": "Frontend Fundamentals",
      "track": "fullstack",
      "instructor": "John Doe",
      "schedule": "MWF 09:00-10:00",
      "students": 35,
      "description": "Learn HTML/CSS/JS",
      "created_at": "2026-01-25T...",
      "updated_at": "2026-01-25T..."
    }
  ],
  "metadata": {
    "total_courses": 50,
    "tracks": ["fullstack", ...],
    "last_updated": "2026-01-29T..."
  }
}
```

## Debug Commands

```javascript
// See all available functions
console.log(window.coursesManager);

// Test API connection
const response = await fetch('/api/courses');
console.log(await response.json());

// Add test course
const result = await window.coursesManager.addCourse('animation', {
  code: 'TEST001',
  name: 'Test Course',
  instructor: 'Test User',
  schedule: 'Online',
  students: 0
});
console.log('Created:', result);
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "Courses manager not available" | Wait for `courses.js` to load, check browser console |
| API returns 404 | Make sure course ID is correct |
| API returns 400 | Check required fields (track, code, name) are provided |
| Changes not showing | Refresh page or manually call `displayCoursesForTrack()` |
| Server won't start | Check if port 5000 is already in use |

---

**Need more details?** See:
- `COURSE_API.md` - Full API documentation
- `SERVER_COURSE_MANAGEMENT.md` - Implementation details
- `COURSE_MANAGEMENT_README.md` - Original usage guide
