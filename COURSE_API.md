# Course API Documentation

## Server Endpoints

All endpoints are available at the base URL: `http://127.0.0.1:5000`

### GET /api/courses
Get all courses (optionally filtered by track)

**Query Parameters:**
- `track` (optional): Filter by track name (e.g., `?track=fullstack`)

**Example:**
```javascript
// Get all courses
fetch('/api/courses')
  .then(res => res.json())
  .then(data => console.log(data));

// Get courses for a specific track
fetch('/api/courses?track=fullstack')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Response:**
```json
{
  "success": true,
  "courses": [
    {
      "id": "FS101-1704067200000",
      "code": "FS101",
      "name": "Frontend Fundamentals",
      "description": "Frontend development with HTML/CSS/JS",
      "instructor": "John Doe",
      "schedule": "MWF 09:00-10:00",
      "students": 35,
      "track": "fullstack",
      "created_at": "2026-01-25T10:00:00Z",
      "updated_at": "2026-01-25T10:00:00Z"
    }
  ],
  "total": 3,
  "metadata": { ... }
}
```

---

### GET /api/courses/track/:trackName
Get courses for a specific track

**Parameters:**
- `trackName`: Name of the track (e.g., `fullstack`, `animation`, `webdev`)

**Example:**
```javascript
fetch('/api/courses/track/fullstack')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Response:**
```json
{
  "success": true,
  "track": "fullstack",
  "courses": [...],
  "total": 3
}
```

---

### POST /api/courses
Add a new course

**Request Body:**
```json
{
  "track": "fullstack",
  "code": "FS104",
  "name": "Advanced React",
  "description": "Build advanced React applications",
  "instructor": "Jane Smith",
  "schedule": "TTh 10:00-11:30",
  "students": 25
}
```

**Example:**
```javascript
const newCourse = {
  track: 'fullstack',
  code: 'FS104',
  name: 'Advanced React',
  description: 'Build advanced React applications',
  instructor: 'Jane Smith',
  schedule: 'TTh 10:00-11:30',
  students: 25
};

fetch('/api/courses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newCourse)
})
  .then(res => res.json())
  .then(data => console.log(data));
```

**Response:**
```json
{
  "success": true,
  "message": "Course FS104 added successfully",
  "course": {
    "id": "FS104-1704067200000",
    "code": "FS104",
    "name": "Advanced React",
    ...
  }
}
```

---

### PUT /api/courses/:courseId
Update an existing course

**Parameters:**
- `courseId`: The ID of the course to update

**Request Body:**
```json
{
  "name": "Advanced React & TypeScript",
  "students": 28
}
```

**Example:**
```javascript
const updates = {
  name: 'Advanced React & TypeScript',
  students: 28
};

fetch('/api/courses/FS104-1704067200000', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates)
})
  .then(res => res.json())
  .then(data => console.log(data));
```

**Response:**
```json
{
  "success": true,
  "message": "Course updated successfully",
  "course": { ... }
}
```

---

### DELETE /api/courses/:courseId
Delete a course

**Parameters:**
- `courseId`: The ID of the course to delete

**Example:**
```javascript
fetch('/api/courses/FS104-1704067200000', {
  method: 'DELETE'
})
  .then(res => res.json())
  .then(data => console.log(data));
```

**Response:**
```json
{
  "success": true,
  "message": "Course deleted successfully",
  "deletedCourse": { ... }
}
```

---

## Using the Courses Manager (Client-Side)

The `courses.js` file provides a convenient interface for calling these APIs:

```javascript
// Get courses for a track
const courses = await window.coursesManager.getTrackCourses('fullstack');

// Add a course
const newCourse = {
  code: 'FS105',
  name: 'Testing & Debugging',
  description: 'Unit testing and debugging strategies',
  instructor: 'Bob Wilson',
  schedule: 'MWF 14:00-15:00',
  students: 20
};
const result = await window.coursesManager.addCourse('fullstack', newCourse);

// Delete a course
await window.coursesManager.deleteCourse('fullstack', courseId);

// Update a course
const updates = { students: 30, instructor: 'New Instructor' };
await window.coursesManager.updateCourse(courseId, updates);

// Get all courses
const allCourses = await window.coursesManager.getAllCourses();

// Get all courses for a specific track (async)
const trackCourses = await window.coursesManager.getTrackCourses('animation');
```

---

## Available Tracks

- `fullstack` - Fullstack Development
- `animation` - Animation
- `webdev` - Web Development
- `mobiledev` - Mobile Development
- `datascience` - Data Science
- `cybersecurity` - Cybersecurity
- `cloud` - Cloud Computing
- `ai` - Artificial Intelligence
- `marketing` - Digital Marketing
- `uiux` - UI/UX Design

---

## Data Storage

Courses are stored in `courses.json` file on the server. The file structure is:

```json
{
  "courses": [
    {
      "id": "unique-id",
      "code": "COURSE_CODE",
      "name": "Course Name",
      "description": "Course description",
      "instructor": "Instructor Name",
      "schedule": "Schedule info",
      "students": 30,
      "track": "track_name",
      "created_at": "ISO timestamp",
      "updated_at": "ISO timestamp"
    }
  ],
  "metadata": {
    "total_courses": 50,
    "tracks": ["fullstack", "animation", ...],
    "last_updated": "ISO timestamp"
  }
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad request (missing required fields)
- `404` - Not found (course doesn't exist)
- `500` - Server error

Error response format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```
