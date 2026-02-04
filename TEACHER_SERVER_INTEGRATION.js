// Add this to teacher.html - REPLACE the startCourseClass function

async function startCourseClass(courseCode) {
    try {
        const teacher = JSON.parse(localStorage.getItem('teacherData') || '{}');
        const teacherId = teacher.id || teacher.userId || teacher.email || null;
        
        if (!teacherId) {
            alert('⚠️ Teacher not logged in');
            return;
        }
        
        // Generate unique meeting ID
        const meetingId = 'APKL-' + Math.random().toString(36).substr(2, 9).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
        
        // Save meeting info before requesting camera (so it survives if camera fails)
        localStorage.setItem('activeTeacherClass', JSON.stringify({
            meetingId: meetingId,
            courseCode: courseCode,
            startedAt: new Date().toISOString()
        }));
        
        // Notify server that class is starting
        try {
            const response = await fetch(`${API_URL}/api/classes/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseCode, meetingId, teacherId })
            });
            
            const data = await response.json();
            if (!data.success) {
                console.warn('⚠️ Could not notify server:', data.message);
            } else {
                console.log('✅ Server notified - class started');
            }
        } catch (err) {
            console.warn('⚠️ Could not connect to server:', err.message);
        }
        
        // Open video call modal
        const videoCallModal = document.getElementById('video-call-modal');
        if (videoCallModal) {
            videoCallModal.classList.remove('hidden');
            videoCallState.meetingId = meetingId;
            videoCallState.isActive = true;
            videoCallState.currentCourseCode = courseCode;
            
            // Set meeting info
            const savedCourses = JSON.parse(localStorage.getItem('teacher_courses_' + (teacher.id||'default')) || 'null');
            let courseName = courseCode;
            
            if (savedCourses) {
                const course = savedCourses.find(c=>c.code===courseCode);
                if (course) courseName = course.name;
            } else {
                const track = teacher.track || 'web-dev';
                const trackData = trackCoursesMap[track] || trackCoursesMap['web-dev'];
                if (trackData && trackData.courses) {
                    const course = trackData.courses.find(c=>c.code===courseCode);
                    if (course) courseName = course.name;
                }
            }

            document.getElementById('meeting-title').textContent = `${courseName} (${courseCode}) - Live Class`;
            document.getElementById('meeting-code').textContent = 'Meeting ID: ' + meetingId;

            // Initialize video call
            initializeVideoCall(meetingId, courseCode);
            
            console.log('🎥 Class started for course: ' + courseCode);
            console.log('📊 Meeting ID: ' + meetingId);
        }
    } catch (error) {
        console.error('Error starting class:', error);
        alert('Failed to start class. Please try again.');
    }
}

// Update the screen share to notify server
document.getElementById('share-screen').addEventListener('click', async () => {
    try {
        if (!videoCallState.screenSharing) {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { 
                    cursor: 'always',
                    displaySurface: 'monitor'
                },
                audio: false
            });
            
            videoCallState.screenStream = screenStream;
            videoCallState.screenSharing = true;
            
            const screenVideo = document.getElementById('screen-video');
            screenVideo.srcObject = screenStream;
            
            const screenContainer = document.getElementById('screen-share-container');
            screenContainer.classList.remove('hidden');
            
            // Make screen share full screen
            const videosGrid = document.getElementById('videos-grid');
            videosGrid.style.opacity = '0.2';
            videosGrid.style.pointerEvents = 'none';
            
            const btn = document.getElementById('share-screen');
            btn.style.backgroundColor = '#4CAF50';
            btn.innerHTML = '<span class="icon">✓</span><span class="label">Screen Sharing</span>';
            
            // Notify server that screen sharing started
            try {
                await fetch(`${API_URL}/api/classes/screen-share`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ meetingId: videoCallState.meetingId, isSharing: true })
                });
                console.log('📺 Screen sharing started - notified server and students');
            } catch (err) {
                console.warn('⚠️ Could not notify server of screen share:', err.message);
            }
            
            // Handle when user stops sharing from browser
            screenStream.getTracks()[0].addEventListener('ended', () => {
                stopScreenShare();
            });
        } else {
            stopScreenShare();
        }
    } catch (error) {
        console.error('Error sharing screen:', error);
        if (error.name !== 'NotAllowedError') {
            alert('Unable to share screen. Please try again.');
        }
    }
});

async function stopScreenShare() {
    if (videoCallState.screenStream) {
        videoCallState.screenStream.getTracks().forEach(track => track.stop());
    }
    videoCallState.screenSharing = false;
    videoCallState.screenStream = null;
    
    const screenContainer = document.getElementById('screen-share-container');
    screenContainer.classList.add('hidden');
    
    // Restore video grid visibility
    const videosGrid = document.getElementById('videos-grid');
    videosGrid.style.opacity = '1';
    videosGrid.style.pointerEvents = 'auto';
    
    const btn = document.getElementById('share-screen');
    btn.style.backgroundColor = '';
    btn.innerHTML = '<span class="icon">🖥️</span><span class="label">Share Screen</span>';
    
    // Notify server that screen sharing stopped
    try {
        await fetch(`${API_URL}/api/classes/screen-share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: videoCallState.meetingId, isSharing: false })
        });
        console.log('📺 Screen sharing stopped - notified server');
    } catch (err) {
        console.warn('⚠️ Could not notify server of screen stop:', err.message);
    }
}

// Update endVideoCall to notify server
async function endVideoCallWithServer() {
    // Stop all tracks
    if (videoCallState.localStream) {
        videoCallState.localStream.getTracks().forEach(track => track.stop());
    }
    if (videoCallState.screenStream) {
        videoCallState.screenStream.getTracks().forEach(track => track.stop());
    }
    
    // Reset state
    videoCallState.isActive = false;
    videoCallState.cameraEnabled = true;
    videoCallState.microphoneEnabled = true;
    videoCallState.screenSharing = false;
    
    const courseCode = videoCallState.currentCourseCode;
    const meetingId = videoCallState.meetingId;
    const teacher = JSON.parse(localStorage.getItem('teacherData') || '{}');
    const teacherId = teacher.id || teacher.userId || teacher.email || null;
    
    // Notify server that class is ending
    try {
        await fetch(`${API_URL}/api/classes/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId, courseCode, teacherId })
        });
        console.log('✅ Server notified - class ended');
    } catch (err) {
        console.warn('⚠️ Could not notify server of class end:', err.message);
    }
    
    // Clear persistent active class state
    localStorage.removeItem('activeTeacherClass');
    
    // Close modal
    document.getElementById('video-call-modal').classList.add('hidden');
    document.getElementById('screen-share-container').classList.add('hidden');

    alert('Class session ended. You can now schedule another class.');
}
