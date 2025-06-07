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
    });    // Update deceased info and duaa
    function updateDeceasedInfo(name, gender) {
        const nameElement = document.getElementById('deceasedName');
        const duaaElement = document.getElementById('duaaText');
        
        // Add name with beautiful styling and animation
        nameElement.innerHTML = `
            <div class="name-update-animation">
                <span class="name-arabic">المرحوم${gender === 'male' ? '' : 'ة'}: ${name}</span>
                <br>
                <span class="name-english">For the deceased: ${name}</span>
            </div>
        `;
        
        const genderPrefix = gender === 'male' ? 'him' : 'her';
        const arabicPrefix = gender === 'male' ? 'له' : 'لها';
        
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
    }    // Reset all counters
    function resetCounters() {
        Object.keys(counters).forEach(type => {
            counters[type] = 0;
            updateCounter(type);
            updateProgress(type);
        });
        saveProgress();
    }

    // Save progress to session storage (will be cleared on refresh)
    function saveProgress() {
        sessionStorage.setItem('dhikr-counts', JSON.stringify(counters));
    }

    // Load progress from session storage
    function loadProgress() {
        const saved = sessionStorage.getItem('dhikr-counts');
        if (saved) {
            const savedCounters = JSON.parse(saved);
            Object.assign(counters, savedCounters);
            Object.keys(counters).forEach(type => {
                updateCounter(type);
                updateProgress(type);
            });
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
    }    // Enhanced completion check with beautiful animations
    function checkCompletion() {
        const isComplete = Object.keys(targets).every(type => 
            counters[type] >= targets[type]
        );
        
        if (isComplete) {
            // Create completion overlay
            const overlay = document.createElement('div');
            overlay.className = 'completion-overlay';
            overlay.innerHTML = `
                <div class="completion-message">
                    <div class="completion-icon">✨</div>
                    <h2>ما شاء الله! جزاك الله خيرا</h2>
                    <p>Masha Allah! May Allah reward you with goodness</p>
                    <div class="completion-buttons">
                        <button class="btn-new-dhikr">
                            <i class="fas fa-plus"></i> New Dhikr Page
                        </button>
                        <button class="btn-continue">
                            <i class="fas fa-redo"></i> Continue with Current
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Add completion animation to all buttons
            document.querySelectorAll('.dhikr-btn').forEach((button, index) => {
                setTimeout(() => {
                    button.classList.add('completed');
                    // Add particle effects
                    createParticles(button);
                }, index * 200);
            });

            // Handle completion buttons
            overlay.querySelector('.btn-new-dhikr').addEventListener('click', () => {
                document.getElementById('editNameInput').focus();
                overlay.classList.add('fade-out');
                setTimeout(() => overlay.remove(), 500);
            });

            overlay.querySelector('.btn-continue').addEventListener('click', () => {
                overlay.classList.add('fade-out');
                setTimeout(() => {
                    overlay.remove();
                    resetCounters();
                }, 500);
            });
        }
    }

    // Create particle effects
    function createParticles(button) {
        const colors = ['#FFD700', '#FFA500', '#FF6347', '#98FB98', '#87CEEB'];
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            const rect = button.getBoundingClientRect();
            particle.style.left = rect.left + rect.width/2 + 'px';
            particle.style.top = rect.top + rect.height/2 + 'px';
            document.body.appendChild(particle);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1 + Math.random() * 2;
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${dx * 100}px, ${dy * 100}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }).onfinish = () => particle.remove();
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
    }    // Function to handle name change and reset counters
    function handleNameChange() {
        const newName = document.getElementById('editNameInput').value.trim();
        const gender = document.querySelector('input[name="editGender"]:checked').value;
        
        if (!newName) {
            showNotification('الرجاء إدخال الاسم | Please enter a name');
            return;
        }
        
        // Update the name display with animation
        const nameElement = document.getElementById('deceasedName');
        nameElement.innerHTML = `
            <div class="name-update-animation">
                <span class="name-arabic">${gender === 'male' ? 'المرحوم' : 'المرحومة'}: ${newName}</span>
                <br>
                <span class="name-english">For the deceased: ${newName}</span>
            </div>
        `;

        // Show loading animation
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <p>جاري التحديث... | Updating...</p>
            </div>
        `;
        document.body.appendChild(loader);

        // Reset all counters to zero
        Object.keys(counters).forEach(type => {
            counters[type] = 0;
            const countElement = document.getElementById(`${type}Count`);
            if (countElement) {
                countElement.textContent = '0';
            }
            updateProgress(type);
        });

        // Save reset counters
        sessionStorage.setItem('dhikr-counts', JSON.stringify(counters));

        // Update URL and history
        const url = new URL(window.location.href);
        url.searchParams.set('name', encodeURIComponent(newName));
        url.searchParams.set('gender', gender);
        window.history.pushState({}, '', url.toString());

        // Update UI
        updateDeceasedInfo(newName, gender);
        
        // Update duas text for gender
        const allDuas = document.querySelectorAll('.duaa-text');
        allDuas.forEach(dua => {
            let text = dua.innerHTML;
            if (gender === 'female') {
                text = text.replace(/له/g, 'لها')
                         .replace(/عنه/g, 'عنها')
                         .replace(/قبره/g, 'قبرها')
                         .replace(/him/g, 'her')
                         .replace(/his/g, 'her');
            } else {
                text = text.replace(/لها/g, 'له')
                         .replace(/عنها/g, 'عنه')
                         .replace(/قبرها/g, 'قبره')
                         .replace(/her/g, 'him')
                         .replace(/her/g, 'his');
            }
            dua.innerHTML = text;
        });

        // Clear input field
        document.getElementById('editNameInput').value = '';
        
        // Update share link
        updateShareLink();
        
        // Remove loading animation after short delay
        setTimeout(() => {
            loader.remove();
            showNotification('تم تحديث الاسم وإعادة تعيين العدادات | Name updated and counters reset');
        }, 500);
    }

    // Update the save button click handler
    document.getElementById('saveNameButton').addEventListener('click', handleNameChange);

    // Update share link
    function updateShareLink() {
        const name = document.getElementById('deceasedName').textContent;
        const url = new URL(window.location.href);
        url.searchParams.set('name', encodeURIComponent(name));
        
        // Add other parameters
        const gender = document.querySelector('input[name="gender"]:checked').value;
        url.searchParams.set('gender', gender);
        
        // Add dhikr counts
        const dhikrTypes = ['tasbih', 'tahmeed', 'takbeer', 'tahleel', 'salawat'];
        dhikrTypes.forEach(type => {
            const count = document.getElementById(`${type}Count`).textContent;
            const target = document.getElementById(`${type}Target`).textContent;
            url.searchParams.set(`${type}_count`, count);
            url.searchParams.set(`${type}_target`, target);
        });
        
        document.getElementById('shareLink').value = url.toString();
    }    // Function to get share text
    function getShareText() {
        const nameElement = document.getElementById('deceasedName');
        const name = nameElement.querySelector('.name-english').textContent.replace('For the deceased: ', '');
        const gender = document.querySelector('input[name="editGender"]:checked').value;
        const prefix = gender === 'male' ? 'المرحوم' : 'المرحومة';
        return `${prefix} ${name} | Please make Dhikr for the deceased`;
    }

    // Update share link
    function updateShareLink() {
        const currentUrl = new URL(window.location.href);
        const name = document.getElementById('deceasedName').querySelector('.name-english').textContent.replace('For the deceased: ', '');
        const gender = document.querySelector('input[name="editGender"]:checked').value;
        
        currentUrl.searchParams.set('name', encodeURIComponent(name));
        currentUrl.searchParams.set('gender', gender);
        
        // Add dhikr counts
        Object.keys(counters).forEach(type => {
            currentUrl.searchParams.set(`${type}_count`, counters[type]);
            currentUrl.searchParams.set(`${type}_target`, targets[type]);
        });
        
        document.getElementById('shareLink').value = currentUrl.toString();
    }

    // Social share buttons
    document.getElementById('shareWhatsApp').addEventListener('click', function() {
        const text = getShareText();
        const url = document.getElementById('shareLink').value;
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
    });

    document.getElementById('shareTelegram').addEventListener('click', function() {
        const text = getShareText();
        const url = document.getElementById('shareLink').value;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    });

    document.getElementById('shareTwitter').addEventListener('click', function() {
        const text = getShareText();
        const url = document.getElementById('shareLink').value;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    });

    document.getElementById('copyLink').addEventListener('click', function() {
        const shareLink = document.getElementById('shareLink');
        shareLink.select();
        document.execCommand('copy');
        showNotification('تم نسخ الرابط | Link copied');
    });

    // Notification function
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Add show class after a small delay (for animation)
        setTimeout(() => {
            notification.classList.add('show');
            // Remove notification after 2 seconds
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2000);
        }, 100);
    }

    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease;
    }

    .notification.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
    `;
    document.head.appendChild(style);

    // Update share link whenever counts change
    function updateCountAndShare(type, newCount) {
        // ...existing code...
        updateShareLink();
    }

    // Function to update duas based on gender
    function updateDuasForGender(gender) {
        const allDuas = document.querySelectorAll('.duaa-text');
        
        // Define gender-specific pronouns
        const pronouns = {
            male: {
                ar: {
                    له: 'له',
                    عنه: 'عنه',
                    قبره: 'قبره',
                    فيه: 'فيه',
                    محسناً: 'محسناً',
                    مسيئاً: 'مسيئاً',
                    المرحوم: 'المرحوم'
                },
                en: {
                    him: 'him',
                    his: 'his',
                    he: 'he'
                }
            },
            female: {
                ar: {
                    له: 'لها',
                    عنه: 'عنها',
                    قبره: 'قبرها',
                    فيه: 'فيها',
                    محسناً: 'محسنة',
                    مسيئاً: 'مسيئة',
                    المرحوم: 'المرحومة'
                },
                en: {
                    him: 'her',
                    his: 'her',
                    he: 'she'
                }
            }
        };

        // Get the correct pronouns based on gender
        const currentPronouns = pronouns[gender];
        const otherPronouns = pronouns[gender === 'male' ? 'female' : 'male'];

        // Update each dua text
        allDuas.forEach(dua => {
            let text = dua.innerHTML;
            
            // Replace Arabic pronouns
            Object.entries(currentPronouns.ar).forEach(([key, value]) => {
                const otherValue = otherPronouns.ar[key];
                text = text.replace(new RegExp(otherValue, 'g'), value);
            });
            
            // Replace English pronouns
            Object.entries(currentPronouns.en).forEach(([key, value]) => {
                const otherValue = otherPronouns.en[key];
                text = text.replace(new RegExp(otherValue, 'g'), value);
            });
            
            dua.innerHTML = text;
        });
    }

    // Initialize page
    initializeFromURL();
    initializeProgress();
});
