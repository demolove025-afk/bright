<!-- Integration Guide for Course Display in Student Dashboard -->

<!-- ADD THESE SCRIPTS TO YOUR HTML FILE (before closing body tag) -->
<!--
<script src="courses.js"></script>
<script src="course-display.js"></script>
-->

<!-- IN YOUR STUDENT DASHBOARD, USE THIS STRUCTURE FOR COURSES TABLE -->
<!--
<div class="section-panel">
    <h3>Available Courses</h3>
    <table class="data-table">
        <thead>
            <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Students</th>
                <th>Schedule</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody id="courses-list">
            <!-- Courses will be populated here -->
        </tbody>
    </table>
</div>
-->

<!-- THEN IN YOUR JAVASCRIPT, WHEN DISPLAYING STUDENT DASHBOARD -->
<!--
<script>
    // When showing dashboard for a specific track
    const studentTrack = 'fullstack'; // Replace with actual user track
    
    // Wait for page to load then display courses
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.courseDisplay.initializeCoursesDisplay(studentTrack, 'courses-list');
        });
    } else {
        window.courseDisplay.initializeCoursesDisplay(studentTrack, 'courses-list');
    }
</script>
-->

====================================
EXAMPLE IMPLEMENTATION IN STUDENT.HTML
====================================

// 1. Add scripts to head or before closing body tag:
<script src="courses.js"></script>
<script src="course-display.js"></script>

// 2. Add courses table where you want to display them:
<table class="data-table">
    <thead>
        <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Students</th>
            <th>Schedule</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody id="courses-list">
    </tbody>
</table>

// 3. Add this JavaScript when initializing student view:
<script>
    function showStudentDashboard(userData) {
        // Your existing code...
        
        // Get the track the student is enrolled in
        const studentTrack = userData.track || 'fullstack';
        
        // Display courses for this track
        window.courseDisplay.initializeCoursesDisplay(studentTrack, 'courses-list');
    }
</script>

====================================
QUICK TEST
====================================

Open browser console and run:

// Test 1: Get courses for fullstack track
console.log(window.coursesManager.getTrackCourses('fullstack'));

// Test 2: Add a new course
window.coursesManager.addCourse('animation', {
    code: 'ANIM101',
    name: '3D Animation Basics',
    description: 'Learn 3D animation with Blender',
    instructor: 'Jane Smith',
    schedule: 'MWF 13:00-14:00',
    students: 25
});

// Test 3: Display animation courses
window.courseDisplay.displayCoursesInTable('animation', 'courses-list');

// Test 4: Get all courses
console.log(window.coursesManager.getAllCourses());
