# Course Management System

## Overview
This system allows you to create and manage courses by track. Courses are stored locally and persist across page reloads.

## Files
- **courses.js** - Main course data and management functions
- **course-display.js** - Helper functions to display courses in UI
- **teacher.html** - Teacher dashboard with Add Course modal

## How to Use

### 1. Add a Course (Teacher)
1. Click the **"+ Add Course"** button in the "My Courses" section
2. Select the track (Fullstack, Animation, Web Dev, etc.)
3. Fill in course details:
   - Course Code (e.g., FS101)
   - Course Name
   - Description
   - Instructor name
   - Schedule (e.g., MWF 09:00-10:00)
   - Number of students
4. Click **"Add Course"**
5. The course is saved locally and appears in the table

### 2. Delete a Course
- Click the **"Delete"** button next to any course
- Confirm the deletion

### 3. View Courses by Track (Student View)
To display courses for a specific track in student view:

```javascript
// In your student.html or dashboard
<script src="courses.js"></script>
<script src="course-display.js"></script>

<script>
    // Display courses for a specific track
    const userTrack = 'fullstack'; // or 'animation', 'webdev', etc.
    initializeCoursesDisplay(userTrack, 'courses-list');
</script>
```

### 4. Access Course Data Directly
```javascript
// Get courses for a specific track
const fullstackCourses = window.coursesManager.getTrackCourses('fullstack');

// Get all courses across all tracks
const allCourses = window.coursesManager.getAllCourses();

// Add a course programmatically
window.coursesManager.addCourse('fullstack', {
    code: 'FS104',
    name: 'Advanced React',
    description: 'Build advanced React applications',
    instructor: 'John Doe',
    schedule: 'MWF 14:00-15:00',
    students: 20
});
```

## Data Structure
Courses are stored in `localStorage` under the key `coursesData`. Each track has its own array:

```javascript
{
    fullstack: [
        {
            id: 'FS101-1234567890',
            code: 'FS101',
            name: 'Frontend Fundamentals',
            description: '...',
            instructor: 'John Doe',
            schedule: 'MWF 09:00-10:00',
            students: 35,
            track: 'fullstack'
        },
        // more courses...
    ],
    animation: [],
    // other tracks...
}
```

## Available Tracks
- fullstack
- animation
- webdev
- mobiledev
- datascience
- cybersecurity
- cloud
- ai
- marketing
- uiux

## Integration with Student Dashboard
To show courses to students based on their registered track:

1. Add these scripts to student.html:
```html
<script src="courses.js"></script>
<script src="course-display.js"></script>
```

2. In your dashboard section where courses are displayed:
```html
<tbody id="courses-list">
    <!-- Courses will be populated here -->
</tbody>
```

3. When student logs in or selects a track:
```javascript
const studentTrack = 'fullstack'; // Get from user data
window.courseDisplay.initializeCoursesDisplay(studentTrack, 'courses-list');
```

## Local Storage
- Courses are automatically saved to browser's localStorage
- Data persists even after closing the browser
- Clear localStorage to reset all courses (only do this in development!)

## Future Enhancements
- [ ] Sync courses with Supabase database
- [ ] Search and filter courses
- [ ] Course enrollment tracking
- [ ] Course materials and resources
- [ ] Assignment management per course
