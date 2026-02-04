// Add this to student.html - REPLACE the joinVideoClass function and update initialization

async function joinVideoClass(meetingId, courseCode, courseName) {
    try {
        // Get student info
        const studentData = JSON.parse(localStorage.getItem('userData') || '{}');
        const studentId = studentData.userId || studentData.id || 'anonymous';
        
        // Persist active student class state
        localStorage.setItem('activeStudentClass', JSON.stringify({
            meetingId: meetingId,
            courseCode: courseCode,
            courseName: courseName,
            joinedAt: new Date().toISOString()
        }));

        // Request camera and microphone permissions (optional)
        let stream = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: true
            });
            console.log('✅ Camera/microphone access granted');
        } catch (mediaError) {
            console.warn('⚠️ Camera/microphone not available, continuing without them:', mediaError.message);
        }
        
        // Notify server that student is joining
        try {
            const response = await fetch('http://localhost:5001/api/classes/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meetingId, studentId, courseCode })
            });
            
            const data = await response.json();
            if (!data.success) {
                console.warn('⚠️ Class not active on server:', data.message);
                alert('Class is not currently active. Please try again later.');
                return;
            } else {
                console.log('✅ Joined class on server');
            }
        } catch (err) {
            console.warn('⚠️ Could not connect to server:', err.message);
        }
        
        // Create a full class view interface
        const classView = document.createElement('div');
        classView.id = 'student-class-view';
        classView.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #0a0a0a;
            display: flex;
            flex-direction: column;
            z-index: 9999;
            font-family: Arial, sans-serif;
            color: white;
        `;
        
        classView.innerHTML = `
            <!-- Class Header -->
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(0, 0, 0, 0.2);
            ">
                <div>
                    <h2 style="margin: 0; font-size: 18px;">${courseName} (${courseCode}) - Live Class</h2>
                    <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Meeting ID: ${meetingId}</p>
                </div>
                <button id="close-class-btn" style="
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                ">✕</button>
            </div>

            <!-- Video/Screen Area -->
            <div style="
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #000;
                position: relative;
                overflow: auto;
            " id="class-content">
                <div id="waiting-message" style="
                    text-align: center;
                    color: #999;
                    padding: 40px;
                ">
                    <div style="font-size: 80px; margin-bottom: 20px;">🎬</div>
                    <p style="font-size: 20px; margin: 0 0 10px 0;">Waiting for teacher...</p>
                    <p style="font-size: 14px; margin: 0; opacity: 0.7;">Teacher will share their video or screen here</p>
                </div>
            </div>

            <!-- Control Bar -->
            <div style="
                background: #2a2a2a;
                padding: 15px 20px;
                display: flex;
                justify-content: center;
                gap: 10px;
                border-top: 1px solid #444;
                flex-wrap: wrap;
            ">
                <button id="student-leave-btn" style="
                    padding: 10px 20px;
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                ">Leave Class</button>
            </div>
        `;
        
        document.body.appendChild(classView);
        
        // Monitor for server updates via WebSocket
        let lastScreenShareState = null;
        
        const monitorClassStatus = setInterval(async () => {
            try {
                // Check if class is still active
                const response = await fetch(`http://localhost:5001/api/classes/active/${meetingId}`);
                const data = await response.json();
                
                if (!data.success) {
                    // Class ended on server
                    console.log('📭 Class has ended on server');
                    clearInterval(monitorClassStatus);
                    return;
                }
                
                const session = data.session;
                const waitingMsg = document.getElementById('waiting-message');
                
                if (session.screenSharing && !lastScreenShareState) {
                    lastScreenShareState = true;
                    if (waitingMsg) {
                        waitingMsg.innerHTML = `
                            <div style="
                                text-align: center;
                                color: #4CAF50;
                                padding: 40px;
                            ">
                                <div style="font-size: 80px; margin-bottom: 20px; animation: pulse 1.5s infinite;">📺</div>
                                <p style="font-size: 20px; margin: 0 0 10px 0; font-weight: bold;">Teacher is Sharing Screen</p>
                                <p style="font-size: 14px; margin: 0; opacity: 0.7;">Viewing teacher's screen share...</p>
                            </div>
                            <style>
                                @keyframes pulse {
                                    0%, 100% { transform: scale(1); }
                                    50% { transform: scale(1.05); }
                                }
                            </style>
                        `;
                    }
                } else if (!session.screenSharing && lastScreenShareState) {
                    lastScreenShareState = false;
                    if (waitingMsg) {
                        waitingMsg.innerHTML = `
                            <div style="
                                text-align: center;
                                color: #999;
                                padding: 40px;
                            ">
                                <div style="font-size: 80px; margin-bottom: 20px;">🎬</div>
                                <p style="font-size: 20px; margin: 0 0 10px 0;">Waiting for teacher...</p>
                                <p style="font-size: 14px; margin: 0; opacity: 0.7;">Teacher will share their video or screen here</p>
                            </div>
                        `;
                    }
                }
            } catch (e) {
                // Ignore errors and continue monitoring
            }
        }, 500);
        
        // Leave class button
        document.getElementById('student-leave-btn').addEventListener('click', () => {
            clearInterval(monitorClassStatus);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            localStorage.removeItem('activeStudentClass');
            classView.remove();
            console.log('👋 Left the class');
        });

        // Close button
        document.getElementById('close-class-btn').addEventListener('click', () => {
            clearInterval(monitorClassStatus);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            localStorage.removeItem('activeStudentClass');
            classView.remove();
            console.log('👋 Left the class');
        });
        
        // Keep stream active
        if (stream) {
            console.log('✅ Student connected to class with active stream');
        } else {
            console.log('✅ Student connected to class (audio/video optional)');
        }
        
    } catch (error) {
        console.error('Error joining class:', error);
        alert('Unable to join class. Please try again.');
    }
}

// Update initialization to check for active class on server
function initPageWithRestoration() {
    // Check server for active classes for this student
    checkForActiveClasses();
    
    // Normal initialization
    initPage();
}

async function checkForActiveClasses() {
    try {
        const response = await fetch('http://localhost:5001/api/classes/active');
        const data = await response.json();
        
        if (data.success && data.activeSessions && data.activeSessions.length > 0) {
            const activeClass = data.activeSessions[0]; // Join the first active class
            console.log('🔔 Found active class:', activeClass.meetingId);
            
            // Restore student connection
            setTimeout(() => {
                joinVideoClass(activeClass.meetingId, activeClass.courseCode, activeClass.courseCode);
            }, 500);
        }
    } catch (err) {
        console.warn('⚠️ Could not check for active classes:', err.message);
        // Continue with normal init if server check fails
    }
}
