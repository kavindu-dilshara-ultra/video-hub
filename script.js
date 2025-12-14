// Updated script.js (without fetch, using hardcoded data)
let videos = {};
let categories = new Set();

function loadVideoData() {
    if (Object.keys(videos).length === 0) {
        try {
            videos = videoData;  // Use hardcoded data
            Object.values(videos).forEach(video => {
                video.category.forEach(cat => categories.add(cat));
            });
        } catch (error) {
            console.error('Error loading video data:', error);
        }
    }
}

function getUniqueCategories() {
    return Array.from(categories);
}

function getURLParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function displayVideos(filteredVideos, containerId, isSuggested = false) {
    const grid = document.getElementById(containerId);
    grid.innerHTML = '';
    filteredVideos.forEach(video => {
        const card = document.createElement('div');
        card.classList.add('video-card');
        card.innerHTML = `
    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
    <h3>${video.title}</h3>
    <p>${video.date}</p>
`;
        if (!isSuggested) {
            card.addEventListener('click', () => {
                window.location.href = `videoplayback.html?id=${video.id}`;
            });
        } else {
            card.addEventListener('click', () => {
                window.location.href = `videoplayback.html?id=${video.id}`;
            });
        }
        grid.appendChild(card);
    });
}

function showSkeletons(containerId, count = 6) {
    const grid = document.getElementById(containerId);
    grid.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.classList.add('video-card');
        skeleton.innerHTML = `
            <div style="width:100%;height:150px; background: linear-gradient(90deg, #1e1e1e 25%, #282828 50%, #1e1e1e 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite;"></div>
            <h3 style="height:20px; background: linear-gradient(90deg, #1e1e1e 25%, #282828 50%, #1e1e1e 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite;"></h3>
            <p style="height:15px; background: linear-gradient(90deg, #1e1e1e 25%, #282828 50%, #1e1e1e 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite;"></p>
        `;
        grid.appendChild(skeleton);
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = Object.values(videos).filter(video => video.title.toLowerCase().includes(query));
        displayVideos(filtered, 'video-grid');
    });
}

function setupCategoryFilters() {
    const filterContainer = document.getElementById('category-filters');
    const allButton = document.createElement('button');
    allButton.textContent = 'All';
    allButton.classList.add('active');
    allButton.addEventListener('click', () => {
        document.querySelectorAll('.category-filters button').forEach(btn => btn.classList.remove('active'));
        allButton.classList.add('active');
        displayVideos(Object.values(videos), 'video-grid');
    });
    filterContainer.appendChild(allButton);

    getUniqueCategories().forEach(cat => {
        const button = document.createElement('button');
        button.textContent = cat;
        button.addEventListener('click', () => {
            document.querySelectorAll('.category-filters button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filtered = Object.values(videos).filter(video => video.category.includes(cat));
            displayVideos(filtered, 'video-grid');
        });
        filterContainer.appendChild(button);
    });
}

function setupScrollToTop() {
    const btn = document.getElementById('scroll-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.style.display = 'block';
        } else {
            btn.style.display = 'none';
        }
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function loadVideos() {
    showSkeletons('video-grid');
    loadVideoData();
    displayVideos(Object.values(videos), 'video-grid');
    setupSearch();
    setupCategoryFilters();
    setupScrollToTop();
}

function loadPlayback() {
    loadVideoData();
    const id = getURLParam('id');
    const video = Object.values(videos).find(v => v.id === id);
    if (video) {
        document.getElementById('thumbnail').src = video.thumbnail;
        document.getElementById('title').textContent = video.title;
        const playBtn = document.getElementById('play-button');
        const countdownEl = document.getElementById('countdown');
        const watchFull = document.getElementById('watch-full');
        playBtn.addEventListener('click', () => {
            playBtn.classList.add('hidden');
            countdownEl.classList.remove('hidden');
            let time = 5;
            countdownEl.textContent = time;
            const interval = setInterval(() => {
                time--;
                countdownEl.textContent = time;
                if (time === 0) {
                    clearInterval(interval);
                    countdownEl.classList.add('hidden');
                    watchFull.href = `videoplay.html?id=${id}`;
                    watchFull.classList.remove('hidden');
                }
            }, 1000);
        });
    }
}

function loadVideo() {
    loadVideoData();
    const id = getURLParam('id');
    const video = Object.values(videos).find(v => v.id === id);
    if (video) {
        document.getElementById('video-source').src = video.url;
        document.getElementById('video-player').load();
        document.getElementById('title').textContent = video.title;
        document.getElementById('description').textContent = video.description;
        document.getElementById('date').textContent = video.date;
        document.getElementById('view-count').textContent = `${Math.floor(Math.random() * 1000)} views`; // Simulated

        const likeBtn = document.getElementById('like-button');
        likeBtn.addEventListener('click', () => {
            likeBtn.classList.toggle('liked');
        });

        const shareBtn = document.getElementById('share-button');
        shareBtn.addEventListener('click', () => {
            const shareUrl = `${window.location.origin}/videoplayback.html?id=${id}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Link copied to clipboard!');
            });
        });

        // Suggested videos, prioritize same category
        const sameCat = Object.values(videos).filter(v => v.id !== id && v.category.some(cat => video.category.includes(cat)));
        const others = Object.values(videos).filter(v => v.id !== id && !sameCat.includes(v));
        const suggested = [...sameCat, ...others];
        showSkeletons('suggested-grid', 3);
        setTimeout(() => {
            displayVideos(suggested.slice(0, 6), 'suggested-grid', true);
        }, 1000); // Simulate load delay for skeletons
    }
    setupScrollToTop();
}

function loadDashboard() {
    loadVideoData();
    document.getElementById('total-videos').textContent = Object.keys(videos).length || '0';
    document.getElementById('total-categories').textContent = categories.size || '0';
    let latestText = 'None';
    if (Object.keys(videos).length > 0) {
        const latest = Object.values(videos).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (latest) {
            latestText = `${latest.title} (${latest.date})`;
        }
    } else {
        latestText = 'Error loading data'; // Fallback for errors
    }
    document.getElementById('latest-video').textContent = latestText;
}