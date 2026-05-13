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
            if (section === 'settings') { modal.classList.add('show'); return; }
            if (section === 'alldays') { window.location.href = 'day.html'; return; }
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(s => s.style.display = 'none');
            document.getElementById(section).style.display = 'block';
        });
    });

    closeModal.addEventListener('click', () => { modal.classList.remove('show'); });

    // ✅ FIX 1: Toggle buttons now call applyLanguage() so cards update immediately
    btnC.addEventListener('click', () => {
        applyLanguage('C');
    });

    btnPython.addEventListener('click', () => {
        applyLanguage('Python');
    });

    // Greeting
    const hour = new Date().getHours();
    let greeting = '';
    if (hour >= 5 && hour < 12) greeting = 'Good Morning';
    else if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if (hour >= 17 && hour < 21) greeting = 'Good Evening';
    else greeting = 'Good Night';
    if (document.getElementById('greeting')) {
        document.getElementById('greeting').textContent = greeting;
    }

    // Current day
    if (document.getElementById('currentDay')) {
        const currentDay = localStorage.getItem('currentDay') || 1;
        document.getElementById('currentDay').textContent = 'Today is Day ' + currentDay;
    }

    // Check if questions already done on page load
    const todayDay = parseInt(localStorage.getItem('currentDay')) || 1;
    const q1Done = localStorage.getItem(`day${todayDay}_q1`) === 'true';
    const q2Done = localStorage.getItem(`day${todayDay}_q2`) === 'true';

    if (document.getElementById('q1-btn')) {
        if (q1Done) document.getElementById('q1-btn').classList.add('completed');
    }
    if (document.getElementById('q2-btn')) {
        if (q2Done) document.getElementById('q2-btn').classList.add('completed');
    }

    // Mark as done function
    window.markDone = function (qNum) {
        const currentDay = parseInt(localStorage.getItem('currentDay')) || 1;

        localStorage.setItem(`day${currentDay}_q${qNum}`, 'true');
        document.getElementById(`q${qNum}-btn`).classList.add('completed');
        document.getElementById(`q${qNum}-btn`).textContent = '✅ Done!';

        // Check if both done
        const q1 = localStorage.getItem(`day${currentDay}_q1`) === 'true';
        const q2 = localStorage.getItem(`day${currentDay}_q2`) === 'true';

        if (q1 && q2) {
            const nextDay = currentDay + 1;
            if (nextDay <= 30) {
                localStorage.setItem('currentDay', nextDay);
                alert(`🎉 Day ${currentDay} Complete! Day ${nextDay} is now unlocked!`);
                location.reload();
            } else {
                alert('🏆 Congratulations! You completed all 30 days!');
            }
        }
    };

    // Progress
    if (document.querySelector('.percent')) {
        const currentDay = parseInt(localStorage.getItem('currentDay')) || 1;
        const daysCompleted = currentDay - 1;
        const questionsCompleted = daysCompleted * 2;
        const percent = Math.round((daysCompleted / 30) * 100);
        document.querySelector('.percent').textContent = percent + '%';
        document.getElementById('daysCompleted').textContent = daysCompleted + ' / 30';
        document.getElementById('questionsCompleted').textContent = questionsCompleted + ' / 60';
    }

    // Activity
    if (document.getElementById('activityList')) {
        const currentDay = parseInt(localStorage.getItem('currentDay')) || 1;
        const activityList = document.getElementById('activityList');
        let html = '';
        for (let i = currentDay - 1; i >= 1 && i >= currentDay - 3; i--) {
            html += `
                <div class="activity-item">
                    <span>✅ Day ${i} completed</span>
                    <span>${currentDay - i === 1 ? 'Yesterday' : currentDay - i + ' days ago'}</span>
                </div>
            `;
        }
        if (html === '') html = '<p style="color: var(--text-muted); font-size: 13px;">No activity yet. Start solving!</p>';
        activityList.innerHTML = html;
    }

    // Day grid
    if (document.getElementById('daysGrid')) {
        const grid = document.getElementById('daysGrid');
        const currentDay = parseInt(localStorage.getItem('currentDay')) || 1;
        for (let i = 1; i <= 30; i++) {
            let icon, status, questions, pct, cardClass;
            if (i < currentDay) {
                icon = '✅'; status = 'Completed'; questions = '2 / 2'; pct = '100%'; cardClass = 'completed';
            } else if (i === currentDay) {
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

    // ✅ FIX 2: Apply saved language preference on page load (restores toggle state + loads questions)
    const savedLang = localStorage.getItem('language') || 'C';
    applyLanguage(savedLang);

}); // end DOMContentLoaded


// ✅ Single, clean applyLanguage function — updates buttons, lang tags, and fetches questions
function applyLanguage(lang) {
    localStorage.setItem('language', lang);

    const btnC = document.getElementById('btnC');
    const btnPython = document.getElementById('btnPython');

    if (btnC && btnPython) {
        btnC.classList.toggle('active', lang === 'C');
        btnPython.classList.toggle('active', lang === 'Python');
    }

    // Update all language tags shown on question cards
    document.querySelectorAll('.lang-tag').forEach(tag => {
        tag.textContent = lang;
    });

    // Fetch and display questions for current day + selected language
    loadQuestions(lang);
}


// ✅ Single, clean loadQuestions function — no duplicate, uses passed lang param
function loadQuestions(lang) {
    lang = lang || localStorage.getItem('language') || 'C';
    const today = 'day' + (parseInt(localStorage.getItem('currentDay')) || 1);
    const langKey = lang === 'C' ? 'c' : 'python';

    fetch('/Logic-forge/questions.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load questions.json: ' + res.status);
            return res.json();
        })
        .then(data => {
            const dayData = data[today];
            if (!dayData) { console.warn('No data found for', today); return; }

            const questions = dayData[langKey];
            if (!questions || questions.length < 2) { console.warn('Not enough questions for', today, langKey); return; }

            const cards = document.querySelectorAll('.question-card');
            if (cards.length >= 1) {
                cards[0].querySelector('h4').textContent = questions[0].title;
                cards[0].querySelector('p').textContent  = '🎯 ' + questions[0].difficulty;
            }
            if (cards.length >= 2) {
                cards[1].querySelector('h4').textContent = questions[1].title;
                cards[1].querySelector('p').textContent  = '🎯 ' + questions[1].difficulty;
            }
        })
        .catch(err => {
            console.error('loadQuestions error:', err);
        });
}
