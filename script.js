// Digital Dhikr Page Script
document.addEventListener('DOMContentLoaded', function() {
    const inputForm = document.getElementById('inputForm');
    const dhikrPage = document.getElementById('dhikrPage');
    const createPageBtn = document.getElementById('createPage');
    const shareButton = document.getElementById('shareButton');
    const shareLinkInput = document.getElementById('shareLink');

    // Dhikr counters and state
    const counters = {
        tasbih: 0,
        tahmeed: 0,
        takbeer: 0,
        tahleel: 0,
        salawat: 0
    };

    let targets = {
        tasbih: 33,
        tahmeed: 33,
        takbeer: 34,
        tahleel: 33,
        salawat: 33
    };

    // Initialize from URL parameters
    function initializeFromURL() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('name')) {
            const name = decodeURIComponent(params.get('name'));
            const gender = params.get('gender') || 'male';
            targets = {
                tasbih: parseInt(params.get('tasbih')) || 33,
                tahmeed: parseInt(params.get('tahmeed')) || 33,
                takbeer: parseInt(params.get('takbeer')) || 34,
                tahleel: parseInt(params.get('tahleel')) || 33,
                salawat: parseInt(params.get('salawat')) || 33
            };
            
            // Hide input form and show dhikr page
            inputForm.classList.add('hidden');
            dhikrPage.classList.remove('hidden');
            
            // Update UI
            updateDeceasedInfo(name, gender);
            updateTargets();
            
            // Load saved counts from localStorage
            loadProgress();
        }
    }

    // Create new page
    createPageBtn.addEventListener('click', () => {
        const name = document.getElementById('name').value.trim();
        if (!name) {
            alert('Please enter a name | الرجاء إدخال الاسم');
            return;
        }

        const gender = document.querySelector('input[name="gender"]:checked').value;
          // Update targets from input
        targets = {
            tasbih: parseInt(document.getElementById('tasbih').value) || 33,
            tahmeed: parseInt(document.getElementById('tahmeed').value) || 33,
            takbeer: parseInt(document.getElementById('takbeer').value) || 34,
            tahleel: parseInt(document.getElementById('tahleel').value) || 33,
            salawat: parseInt(document.getElementById('salawat').value) || 33
        };        // Generate URL
        const params = new URLSearchParams();
        params.set('name', encodeURIComponent(name));
        params.set('gender', gender);
        Object.entries(targets).forEach(([key, value]) => {
            params.set(key, value);
        });

        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', url);

        // Update UI
        inputForm.classList.add('hidden');
        dhikrPage.classList.remove('hidden');
        updateDeceasedInfo(name, gender);
        updateTargets();
        
        // Initialize localStorage for this page
        initializeLocalStorage();
    });

    // Update deceased info and duaa
    function updateDeceasedInfo(name, gender) {
        const nameElement = document.getElementById('deceasedName');
        const duaaElement = document.getElementById('duaaText');
        
        nameElement.textContent = name;
        
        // Generate appropriate duaa based on gender
        const genderPrefix = gender === 'male' ? 'him' : 'her';
        const arabicPrefix = gender === 'male' ? 'له' : 'لها';
        
        // Add name with beautiful styling
        nameElement.innerHTML = `
            <span class="name-arabic">المرحوم${gender === 'male' ? '' : 'ة'}: ${name}</span>
            <br>
            <span class="name-english">For the deceased: ${name}</span>
        `;
        
        // Set main dua with name
        duaaElement.innerHTML = `
            <div class="main-dua-content">
                <div class="arabic-text">
                    اللهم ارحم${arabicPrefix} وارفع درجت${arabicPrefix} في المهديين واخلف${arabicPrefix} في عقب${arabicPrefix} في الغابرين واغفر لنا و${arabicPrefix} يا رب العالمين
                </div>
                <div class="english-text">
                    O Allah, have mercy on ${name} and elevate ${genderPrefix} rank among the guided ones, 
                    compensate ${genderPrefix} family, and forgive us and ${genderPrefix}, O Lord of the worlds
                </div>
            </div>
        `;
    }

    // Update target displays
    function updateTargets() {
        Object.keys(targets).forEach(type => {
            const targetElement = document.getElementById(`${type}Target`);
            if (targetElement) {
                targetElement.textContent = targets[type];
            }
        });
    }

    // Enhanced dhikr button click handling with animations
    document.querySelectorAll('.dhikr-btn').forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;
            if (counters[type] < targets[type]) {
                // Add click animation
                button.classList.add('clicked');
                setTimeout(() => button.classList.remove('clicked'), 600);

                // Increment counter with animation
                counters[type]++;
                const countElement = document.getElementById(`${type}Count`);
                if (countElement) {
                    countElement.style.animation = 'none';
                    countElement.offsetHeight; // Trigger reflow
                    countElement.style.animation = 'countChange 0.3s ease-out';
                    countElement.textContent = counters[type];
                }

                // Vibrate on mobile devices if supported
                if (navigator.vibrate) {
                    navigator.vibrate(20);
                }

                saveProgress();
                checkCompletion();

                // Update progress visualization
                updateProgress(type);
            }
        });
    });

    // Add progress visualization
    function updateProgress(type) {
        const button = document.querySelector(`[data-type="${type}"]`);
        const progress = (counters[type] / targets[type]) * 100;
        button.style.background = `linear-gradient(145deg, 
            var(--gradient-start) ${progress}%, 
            var(--gradient-end) ${progress}%
        )`;
    }

    // Update counter display
    function updateCounter(type) {
        const countElement = document.getElementById(`${type}Count`);
        if (countElement) {
            countElement.textContent = counters[type];
        }
    }

    // Save progress to localStorage
    function saveProgress() {
        const pageId = window.location.search;
        localStorage.setItem(`dhikr-counts-${pageId}`, JSON.stringify(counters));
    }

    // Load progress from localStorage
    function loadProgress() {
        const pageId = window.location.search;
        const saved = localStorage.getItem(`dhikr-counts-${pageId}`);
        if (saved) {
            const savedCounters = JSON.parse(saved);
            Object.assign(counters, savedCounters);
            Object.keys(counters).forEach(type => updateCounter(type));
            checkCompletion();
        }
    }

    // Initialize localStorage for new page
    function initializeLocalStorage() {
        const pageId = window.location.search;
        if (!localStorage.getItem(`dhikr-counts-${pageId}`)) {
            Object.keys(counters).forEach(type => counters[type] = 0);
            saveProgress();
        }
    }

    // Enhanced completion check with animation
    function checkCompletion() {
        const isComplete = Object.keys(targets).every(type => 
            counters[type] >= targets[type]
        );
        
        if (isComplete) {
            // Add completion animation to all buttons
            document.querySelectorAll('.dhikr-btn').forEach(button => {
                button.style.transform = 'scale(1.05)';
                button.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                setTimeout(() => {
                    button.style.transform = '';
                    button.style.boxShadow = '';
                }, 1000);
            });

            setTimeout(() => {
                alert('ما شاء الله! جزاك الله خيرا\nMasha Allah! May Allah reward you with goodness\nAll dhikr targets have been completed!');
            }, 500);
        }
    }

    // Share functionality
    shareButton.addEventListener('click', () => {
        const url = window.location.href;
        shareLinkInput.value = url;
        shareLinkInput.classList.remove('hidden');
        
        if (navigator.share) {
            navigator.share({
                title: 'Digital Dhikr Page',
                text: 'Join me in making dhikr for our deceased loved one',
                url: url
            }).catch(console.error);
        } else {
            shareLinkInput.select();
            document.execCommand('copy');
            alert('Link copied to clipboard | تم نسخ الرابط');
        }
    });

    // Initialize progress bars
    function initializeProgress() {
        Object.keys(counters).forEach(type => {
            updateProgress(type);
        });
    }

    // Initialize page
    initializeFromURL();
    initializeProgress();
});
