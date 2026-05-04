document.addEventListener('DOMContentLoaded', () => {

    // Nav links
    const navItems = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.section');
    const modal = document.getElementById('settingsModal');
    const closeModal = document.getElementById('closeModal');
    const btnC = document.getElementById('btnC');
    const btnPython = document.getElementById('btnPython');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            if(section === 'settings') { modal.classList.add('show'); return; }
            if(section === 'alldays') { window.location.href = 'day.html'; return; }
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(s => s.style.display = 'none');
            document.getElementById(section).style.display = 'block';
        });
    });

    closeModal.addEventListener('click', () => { modal.classList.remove('show'); });

    btnC.addEventListener('click', () => {
        btnC.classList.add('active');
        btnPython.classList.remove('active');
        localStorage.setItem('language', 'C');
        alert('Language set to C!');
    });

    btnPython.addEventListener('click', () => {
        btnPython.classList.add('active');
        btnC.classList.remove('active');
        localStorage.setItem('language', 'Python');
        alert('Language set to Python!');
    });

    // Greeting
    const hour = new Date().getHours();
    let greeting = '';
    if(hour >= 5 && hour < 12) greeting = 'Good Morning';
    else if(hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if(hour >= 17 && hour < 21) greeting = 'Good Evening';
    else greeting = 'Good Night';
    if(document.getElementById('greeting')) {
        document.getElementById('greeting').textContent = greeting;
    }

    // Current day
    if(document.getElementById('currentDay')) {
        const currentDay = localStorage.getItem('currentDay') || 1;
        document.getElementById('currentDay').textContent = 'Today is Day ' + currentDay;
    }
    // Check if questions already done on page load
const todayDay = parseInt(localStorage.getItem('currentDay')) || 1;
const q1Done = localStorage.getItem(`day${todayDay}_q1`) === 'true';
const q2Done = localStorage.getItem(`day${todayDay}_q2`) === 'true';

if(document.getElementById('q1-btn')) {
    if(q1Done) document.getElementById('q1-btn').classList.add('completed');
}
if(document.getElementById('q2-btn')) {
    if(q2Done) document.getElementById('q2-btn').classList.add('completed');
}

// Mark as done function
window.markDone = function(qNum) {
    const currentDay = parseInt(localStorage.getItem('currentDay')) || 1;
    
    localStorage.setItem(`day${currentDay}_q${qNum}`, 'true');
    document.getElementById(`q${qNum}-btn`).classList.add('completed');
    document.getElementById(`q${qNum}-btn`).textContent = '✅ Done!';

    // Check if both done
    const q1 = localStorage.getItem(`day${currentDay}_q1`) === 'true';
    const q2 = localStorage.getItem(`day${currentDay}_q2`) === 'true';

    if(q1 && q2) {
        // Both done — move to next day!
        const nextDay = currentDay + 1;
        if(nextDay <= 30) {
            localStorage.setItem('currentDay', nextDay);
            
            // Show congratulations
            alert(`🎉 Day ${currentDay} Complete! Day ${nextDay} is now unlocked!`);
            
            // Refresh page to update everything
            location.reload();
        } else {
            alert('🏆 Congratulations! You completed all 30 days!');
        }
    }
}
    // Progress
    if(document.querySelector('.percent')) {
        const currentDay = parseInt(localStorage.getItem('currentDay')) || 1;
        const daysCompleted = currentDay - 1;
        const questionsCompleted = daysCompleted * 2;
        const percent = Math.round((daysCompleted / 30) * 100);
        document.querySelector('.percent').textContent = percent + '%';
        document.getElementById('daysCompleted').textContent = daysCompleted + ' / 30';
        document.getElementById('questionsCompleted').textContent = questionsCompleted + ' / 60';
    }

    // Activity
    if(document.getElementById('activityList')) {
        const currentDay = parseInt(localStorage.getItem('currentDay')) || 1;
        const activityList = document.getElementById('activityList');
        let html = '';
        for(let i = currentDay - 1; i >= 1 && i >= currentDay - 3; i--) {
            html += `
                <div class="activity-item">
                    <span>✅ Day ${i} completed</span>
                    <span>${currentDay - i === 1 ? 'Yesterday' : currentDay - i + ' days ago'}</span>
                </div>
            `;
        }
        if(html === '') html = '<p style="color: var(--text-muted); font-size: 13px;">No activity yet. Start solving!</p>';
        activityList.innerHTML = html;
    }

    // Day grid
    if(document.getElementById('daysGrid')) {
        const grid = document.getElementById('daysGrid');
        const currentDay = parseInt(localStorage.getItem('currentDay')) || 1;
        for(let i = 1; i <= 30; i++) {
            let icon, status, questions, pct, cardClass;
            if(i < currentDay) {
                icon = '✅'; status = 'Completed'; questions = '2 / 2'; pct = '100%'; cardClass = 'completed';
            } else if(i === currentDay) {
                icon = '🕐'; status = 'In Progress'; questions = '0 / 2'; pct = '0%'; cardClass = 'inprogress';
            } else {
                icon = '🔒'; status = 'Locked'; questions = '0 / 2'; pct = '0%'; cardClass = 'locked';
            }
            grid.innerHTML += `
                <div class="day-card ${cardClass}" data-day="${i}">
                    <span class="day-icon">${icon}</span>
                    <div class="day-info">
                        <h4>Day ${i}</h4>
                        <p>${status}</p>
                    </div>
                    <div class="day-stats">
                        <span>Questions</span>
                        <span>${questions}</span>
                    </div>
                    <span class="day-percent">${pct}</span>
                </div>
            `;
        }
    }

}); // only ONE closing bracket!
