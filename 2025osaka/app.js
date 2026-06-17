// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initDaySelectors();
    initItineraryFilters();
    initMapsModal();
    initTextToSpeech();
    initChecklist();
});

/* ==================== 1. THEME SWITCHER ==================== */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (prefersDark) {
        htmlElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('#theme-toggle i');
    if (theme === 'dark') {
        themeIcon.className = 'fa-solid fa-sun';
    } else {
        themeIcon.className = 'fa-solid fa-moon';
    }
}

/* ==================== 2. NAVIGATION TABS ==================== */
function initNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const viewPanels = document.querySelectorAll('.view-panel');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs & panels
            navTabs.forEach(t => t.classList.remove('active'));
            viewPanels.forEach(p => p.classList.remove('active'));

            // Add active to clicked tab
            tab.classList.add('active');
            
            // Show corresponding panel
            const targetId = tab.getAttribute('data-target');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }

            // Scroll to top of app container on tab switch
            window.scrollTo({
                top: document.querySelector('.nav-tabs-wrapper').offsetTop - 20,
                behavior: 'smooth'
            });
        });
    });
}

/* ==================== 3. DAY SELECTORS ==================== */
function initDaySelectors() {
    const dayButtonsDesktop = document.querySelectorAll('.day-btn');
    const dayButtonsMobile = document.querySelectorAll('.day-btn-mobile');
    const dayContents = document.querySelectorAll('.day-content');

    function switchDay(dayId) {
        // Sync active state in desktop buttons
        dayButtonsDesktop.forEach(btn => {
            if (btn.getAttribute('data-day') === dayId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Sync active state in mobile buttons
        dayButtonsMobile.forEach(btn => {
            if (btn.getAttribute('data-day') === dayId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Show corresponding day content
        dayContents.forEach(content => {
            if (content.id === `${dayId}-content`) {
                content.style.display = 'block';
                // Trigger reflow for animation
                content.style.animation = 'none';
                content.offsetHeight; /* trigger reflow */
                content.style.animation = null;
            } else {
                content.style.display = 'none';
            }
        });

        // Reset filter when switching days to show all items first
        resetItineraryFilter();
    }

    // Attach desktop button events
    dayButtonsDesktop.forEach(btn => {
        btn.addEventListener('click', () => {
            const dayId = btn.getAttribute('data-day');
            switchDay(dayId);
        });
    });

    // Attach mobile button events
    dayButtonsMobile.forEach(btn => {
        btn.addEventListener('click', () => {
            const dayId = btn.getAttribute('data-day');
            switchDay(dayId);
            // Center the active mobile tab in horizontal scrolling
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
    });
}

/* ==================== 4. ITINERARY FILTERS ==================== */
let currentCategoryFilter = 'all';

function initItineraryFilters() {
    const filterPills = document.querySelectorAll('.filter-pill');

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            currentCategoryFilter = pill.getAttribute('data-filter');
            applyItineraryFilter();
        });
    });
}

function applyItineraryFilter() {
    const activeDayContent = document.querySelector('.day-content[style*="display: block"]') 
                             || document.querySelector('.day-content:not([style*="display: none"])');
    
    if (!activeDayContent) return;

    const timelineItems = activeDayContent.querySelectorAll('.timeline-item');
    let visibleCount = 0;

    timelineItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        const isEasyWalking = item.querySelector('.accessibility-tag.easy') !== null;
        const isMediumWalking = item.querySelector('.accessibility-tag.medium') !== null;
        const isCautionWalking = item.querySelector('.accessibility-tag.caution') !== null;

        // Logic for filtering
        let shouldShow = false;

        if (currentCategoryFilter === 'all') {
            shouldShow = true;
        } else if (currentCategoryFilter === 'elderly') {
            // For Elderly filter: show items that are transit, hotel, or explicitly marked 'easy' or NOT 'caution'
            // In our data, the few outdoor activities that have walking are marked 'medium' or 'caution'
            shouldShow = isEasyWalking || (!isMediumWalking && !isCautionWalking);
        } else {
            shouldShow = itemCategory === currentCategoryFilter;
        }

        if (shouldShow) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    // Handle empty state (if a filter has no items on a specific day)
    let emptyStateMsg = activeDayContent.querySelector('.empty-filter-state');
    if (visibleCount === 0) {
        if (!emptyStateMsg) {
            emptyStateMsg = document.createElement('div');
            emptyStateMsg.className = 'empty-filter-state';
            emptyStateMsg.style.textAlign = 'center';
            emptyStateMsg.style.padding = '40px 20px';
            emptyStateMsg.style.color = 'var(--text-secondary)';
            emptyStateMsg.style.backgroundColor = 'var(--bg-primary)';
            emptyStateMsg.style.borderRadius = 'var(--border-radius-md)';
            emptyStateMsg.style.marginTop = '20px';
            emptyStateMsg.innerHTML = `
                <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 12px; color: var(--accent-gold);"></i>
                <p style="font-weight: 600;">今天沒有此類型的行程排程喔！</p>
                <p style="font-size: 0.85rem; margin-top: 4px;">請試著選擇其他分類或查看「全部行程」。</p>
            `;
            activeDayContent.querySelector('.timeline').appendChild(emptyStateMsg);
        } else {
            emptyStateMsg.style.display = 'block';
        }
    } else if (emptyStateMsg) {
        emptyStateMsg.style.display = 'none';
    }
}

function resetItineraryFilter() {
    currentCategoryFilter = 'all';
    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(p => p.classList.remove('active'));
    // Make 'All' active
    const allPill = document.querySelector('.filter-pill[data-filter="all"]');
    if (allPill) allPill.classList.add('active');

    // Show all timeline items on the newly active day
    const activeDayContent = document.querySelector('.day-content[style*="display: block"]') 
                             || document.querySelector('.day-content:not([style*="display: none"])');
    if (activeDayContent) {
        const timelineItems = activeDayContent.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => item.style.display = 'block');
        
        const emptyStateMsg = activeDayContent.querySelector('.empty-filter-state');
        if (emptyStateMsg) emptyStateMsg.style.display = 'none';
    }
}

/* ==================== 5. GOOGLE MAPS MODAL ==================== */
const MAP_SOURCES = {
    'odysis': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3293.415174039308!2d135.29749507632616!3d34.40997197302636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000c19bb8ebc517%3A0xe962886f34fbf502!2sOdysis%20Suites%20Osaka%20Airport%20Hotel!5e0!3m2!1szh-TW!2stw!4v1718300000000!5m2!1szh-TW!2stw',
    'keihan-grande': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3269.049449830574!2d135.75783307635678!3d34.98038897281699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x600108ae557342fb%3A0xe10ad5fe0df33100!2sHotel%20Keihan%20Kyoto%20Grande!5e0!3m2!1szh-TW!2stw!4v1718300000001!5m2!1szh-TW!2stw',
    'gracery-sanjo': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3268.0163351989476!2d135.766746076358!3d35.00632207282755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6001089403d15bf3%3A0x64cf8e3f94689cf9!2sHotel%20Gracery%20Kyoto%20Sanjo!5e0!3m2!1szh-TW!2stw!4v1718300000002!5m2!1szh-TW!2stw',
    'respire-osaka': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3280.08272990666!2d135.49495147634283!3d34.70313137292272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e7cc73121549%3A0xb3047a8cdb6f4e15!2sHotel%20Hankyu%20Respire%20Osaka!5e0!3m2!1szh-TW!2stw!4v1718300000003!5m2!1szh-TW!2stw',
    
    // Sightseeing/Spots
    'rinku-outlets': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3293.70119782502!2d135.2938166763259!3d34.402773373033744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000c1bcde205c05%3A0xf69305141fa16db6!2sRinku%20Premium%20Outlets!5e0!3m2!1szh-TW!2stw!4v1718300000004!5m2!1szh-TW!2stw',
    'rinku-park': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3293.4357774780516!2d135.29087597632616!3d34.40945327302685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000c1bc3d59e38d%3A0xd3b347b2c0199144!2z6Ieo56m65YWs5ZyS!5e0!3m2!1szh-TW!2stw!4v1718300000005!5m2!1szh-TW!2stw',
    'kamogawa': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3267.935105260171!2d135.77028757635805!3d35.008365272825425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60010894fe83fca3%3A0xb36b7ff017c603b5!2z5LiJ5p2h5aSn6aaF!5e0!3m2!1szh-TW!2stw!4v1718300000006!5m2!1szh-TW!2stw',
    'toji': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3269.0435133694005!2d135.74507007635678!3d34.98053827281685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6001061f5c6b6537%3A0x6b77df7f0c1cf0a!2z5p2x5a-6!5e0!3m2!1szh-TW!2stw!4v1718300000007!5m2!1szh-TW!2stw',
    'daimaru-shinsaibashi': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.332304899539!2d135.50117077634125!3d34.671542472909476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e710df5eb425%3A0xe962d3a2416f5619!2z5aSn5Li455m-6LKo5b-D6bqy6aaF5bqX!5e0!3m2!1szh-TW!2stw!4v1718300000008!5m2!1szh-TW!2stw',
    'glico': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.396556111812!2d135.50130607634135!3d34.669921672910385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e716c526be4b%3A0xb48b26e036df52b!2z6YGT6aCT5aCA5Zu65Yqb5p6c6Leo6Leo5Lq65pys5p2_!5e0!3m2!1szh-TW!2stw!4v1718300000009!5m2!1szh-TW!2stw',
    'tenmangu': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3280.407987820121!2d135.51187497634252!3d34.69492167292723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e0df6fbf3fa5%3A0xfbdc38ff02a9b2b5!2z5aSn6Ziq5aSp5ru_5a6u!5e0!3m2!1szh-TW!2stw!4v1718300000010!5m2!1szh-TW!2stw'
};

const MAP_TITLES = {
    'odysis': 'Odysis Suites Osaka Hotel',
    'keihan-grande': 'Hotel Keihan Kyoto Grande',
    'gracery-sanjo': 'Hotel Gracery Kyoto Sanjo',
    'respire-osaka': 'Hotel Hankyu Respire Osaka',
    'rinku-outlets': '臨空城 Premium Outlets',
    'rinku-park': '臨空公園 (Marble Beach)',
    'kamogawa': '鴨川 (三条大橋)',
    'toji': '世界遺產 東寺 (Kobo市集地點)',
    'daimaru-shinsaibashi': '大丸百貨 心齋橋店',
    'glico': '道頓堀 固力果跑跑人霓荷看板',
    'tenmangu': '大阪天滿宮 (天神祭地點)'
};

function initMapsModal() {
    const modal = document.getElementById('maps-modal');
    const modalClose = document.getElementById('modal-close');
    const iframe = document.getElementById('map-iframe');
    const modalTitle = document.getElementById('modal-map-title');
    
    // Attach to all map buttons in DOM (both static and future)
    document.body.addEventListener('click', (e) => {
        const button = e.target.closest('[data-map]');
        if (button) {
            e.preventDefault();
            const mapKey = button.getAttribute('data-map');
            const embedSrc = MAP_SOURCES[mapKey];
            const title = MAP_TITLES[mapKey] || '地圖位置';
            
            if (embedSrc) {
                modalTitle.textContent = title;
                iframe.src = embedSrc;
                modal.classList.add('active');
            }
        }
    });

    // Close on click close button
    modalClose.addEventListener('click', () => {
        closeModal();
    });

    // Close on click backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on ESC key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('active');
        // Clear src to stop playing map scripts in the background
        iframe.src = '';
    }
}

/* ==================== 6. TEXT TO SPEECH (TTS) ==================== */
function initTextToSpeech() {
    const speakButtons = document.querySelectorAll('.speak-btn');

    if ('speechSynthesis' in window) {
        speakButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const textToSpeak = btn.getAttribute('data-speak');
                
                // Cancel ongoing speech
                window.speechSynthesis.cancel();

                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = 'ja-JP';
                utterance.rate = 0.85; // Speak slightly slower for clarity
                utterance.pitch = 1.0;

                // Attempt to find a native Japanese voice
                const voices = window.speechSynthesis.getVoices();
                const jaVoice = voices.find(voice => voice.lang.includes('ja-JP'));
                if (jaVoice) {
                    utterance.voice = jaVoice;
                }

                // Add visual feedback
                const icon = btn.querySelector('i');
                icon.className = 'fa-solid fa-circle-play';
                btn.style.transform = 'scale(1.1)';
                
                utterance.onend = () => {
                    icon.className = 'fa-solid fa-volume-high';
                    btn.style.transform = '';
                };

                utterance.onerror = () => {
                    icon.className = 'fa-solid fa-volume-high';
                    btn.style.transform = '';
                };

                window.speechSynthesis.speak(utterance);
            });
        });
        
        // Populate voices asynchronously for Chrome/Safari compatibility
        window.speechSynthesis.onvoiceschanged = () => {};
    } else {
        // Hide speaker buttons or log if unsupported
        console.warn('Text-to-speech not supported on this browser.');
        speakButtons.forEach(btn => btn.style.display = 'none');
    }
}

/* ==================== 7. INTERACTIVE PACKING CHECKLIST ==================== */
function initChecklist() {
    const checklistItems = document.querySelectorAll('.checklist-item');
    
    // Load saved checklist items state from localStorage
    const savedState = JSON.parse(localStorage.getItem('packingChecklist')) || {};

    checklistItems.forEach((item, index) => {
        // Set unique ID for tracking
        item.setAttribute('data-id', `check-${index}`);
        
        // Restore check state
        if (savedState[`check-${index}`]) {
            item.classList.add('checked');
        }

        // Attach click listener directly
        item.addEventListener('click', () => {
            item.classList.toggle('checked');
            saveChecklistState();
            updateChecklistProgress();
        });
    });

    // Initial update
    updateChecklistProgress();
}

// Global scope toggle function to support inline onclick if necessary
window.toggleChecklist = function(element) {
    // Handled by event listener, but keep this stub just in case
};

function saveChecklistState() {
    const checklistItems = document.querySelectorAll('.checklist-item');
    const state = {};
    
    checklistItems.forEach(item => {
        const id = item.getAttribute('data-id');
        const isChecked = item.classList.contains('checked');
        state[id] = isChecked;
    });

    localStorage.setItem('packingChecklist', JSON.stringify(state));
}

function updateChecklistProgress() {
    const checklistItems = document.querySelectorAll('.checklist-item');
    const totalItems = checklistItems.length;
    const checkedItems = document.querySelectorAll('.checklist-item.checked').length;
    
    const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
    
    const fillElement = document.getElementById('checklist-progress-fill');
    const textElement = document.getElementById('checklist-progress-text');
    
    if (fillElement && textElement) {
        fillElement.style.width = `${progressPercent}%`;
        textElement.textContent = `${progressPercent}% (${checkedItems}/${totalItems})`;
    }
}
