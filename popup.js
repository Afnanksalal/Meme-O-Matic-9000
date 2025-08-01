document.addEventListener('DOMContentLoaded', () => {

  const el = {
    matrixCanvas: document.getElementById('matrixCanvas'),
    chaosLevelFill: document.getElementById('chaosLevelFill'),
    chaosPercent: document.getElementById('chaosPercent'),
    statsPanel: document.getElementById('statsPanel'),
    memesWatched: document.getElementById('memesWatched'),
    chaosPoints: document.getElementById('chaosPoints'),
    sanityLeft: document.getElementById('sanityLeft'),
    sanityCheckFailures: document.getElementById('sanityCheckFailures'),
    lifeQuestions: document.getElementById('lifeQuestions'),
    tabDupes: document.getElementById('tabDupes'),
    regretLevel: document.getElementById('regretLevel'),
    timeWasted: document.getElementById('timeWasted'),
    startButton: document.getElementById('startButton'),
    chaosModeBtn: document.getElementById('chaosModeBtn'),
    megaChaosBtn: document.getElementById('megaChaosBtn'),
    apocalypseBtn: document.getElementById('apocalypseBtn'),
    chaosWarning: document.getElementById('chaosWarning'),
    memeContainer: document.getElementById('memeContainer'),
    memeImage: document.getElementById('memeImage'),
    memeInfo: document.getElementById('memeInfo'),
    effectsPanel: document.getElementById('effectsPanel'),
    glitchBtn: document.getElementById('glitchBtn'),
    invertBtn: document.getElementById('invertBtn'),
    matrixBtn: document.getElementById('matrixBtn'),
    vintageBtn: document.getElementById('vintageBtn'),
    psychedelicBtn: document.getElementById('psychedelicBtn'),
    sepiaBtn: document.getElementById('sepiaBtn'),
    grayscaleBtn: document.getElementById('grayscaleBtn'),
    saturateBtn: document.getElementById('saturateBtn'),
    resetEffectsBtn: document.getElementById('resetEffectsBtn'),
    controlsContainer: document.querySelector('.controls-container'),
    badMemeBtn: document.getElementById('badMemeBtn'),
    goodMemeBtn: document.getElementById('goodMemeBtn'),
    nextMemeBtn: document.getElementById('nextMemeBtn'),
    advancedControls: document.getElementById('advancedControls'),
    banMemeBtn: document.getElementById('banMemeBtn'),
    shareBtn: document.getElementById('shareBtn'),
    reportBtn: document.getElementById('reportBtn'),
    achievementsPanel: document.getElementById('achievementsPanel'),
    achievementList: document.getElementById('achievementList'),
    soundboardPanel: document.getElementById('soundboardPanel'),
    addSoundBtn: document.getElementById('addSoundBtn'),
    muteBtn: document.getElementById('muteBtn')
  };

  let state = {};
  const defaultState = {
    currentMeme: { id: null, url: null, source: 'memegen' },
    chaosLevel: 0,
    memesWatched: 0,
    chaosPoints: 0,
    sanityLeft: 100,
    sanityCheckFailures: 0,
    lifeQuestions: 0,
    tabDupes: 0,
    timeWasted: 0,
    unlockedAchievements: [],
    bannedTemplates: [],
    badMemesClicked: 0,
    isChaosMode: false,
    isMegaChaos: false,
    isApocalypse: false,
    isMuted: false, 
    soundUrls: []
  };

  const API_SOURCES = {
    memegen: 'https://api.memegen.link/templates/',
    general: 'https://meme-api.com/gimme/dankmemes',
    cursed_images: 'https://meme-api.com/gimme/cursedimages',
    surreal_memes: 'https://meme-api.com/gimme/surrealmemes',
    dog: 'https://dog.ceo/api/breeds/image/random',
    cat: 'https://api.thecatapi.com/v1/images/search',
  };
  
  const SOUND_URLS = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  ];

  let memeTemplates = [];
  let timeWastedInterval;
  let psychedelicInterval = null;
  let mainGlitchInterval = null;
  let currentAudio = null;
  
  const TOP_TEXT_OPTIONS = [
    "when you finally", "that moment when", "nobody:", "me trying to",
    "i don't always", "one does not simply", "brace yourselves", "what if i told you",
    "my brain after 3am", "the wifi goes out", "when the code compiles", "it's not a bug, it's a feature"
  ];
  const BOTTOM_TEXT_OPTIONS = [
    "understand the code", "the wifi goes out", "my brain at 3am",
    "act normal", "but when i do, i deploy to prod", "walk into mordor",
    "the memes are coming", "this is all a simulation",
    "the final boss appears", "don't ask me about it", "a single tear rolls down my cheek", "i've seen things you people wouldn't believe"
  ];
  
  const achievements = {
    'First Taste': { description: 'Watch your first meme.', check: () => state.memesWatched >= 1 },
    'Meme Addict': { description: 'Watch 50 memes.', check: () => state.memesWatched >= 50 },
    'Existential Dread': { description: 'Question life 5 times.', check: () => state.lifeQuestions >= 5 },
    'Chaos Awakens': { description: 'Reach 25% Chaos.', check: () => state.chaosLevel >= 25 },
    'Maximum Sanity Drain': { description: 'Sanity drops below 20%.', check: () => state.sanityLeft <= 20 },
    'All Memes Are Bad': { description: 'Mark 10 memes as bad.', check: () => state.badMemesClicked >= 10 },
    'Tabocalypse': { description: 'Survived a tab flood.', check: () => state.isApocalypse && state.timeWasted > 30 },
    'Digital Hoarder': { description: 'Banned 10 meme templates.', check: () => state.bannedTemplates.length >= 10 },
    'Psychotic Episode': { description: 'Activated the Psychedelic filter.', check: () => document.body.classList.contains('psychedelic-active') },
    'A Moment of Zen': { description: 'Found a good meme at high chaos.', check: () => state.chaosLevel > 75 && state.sanityLeft > 50},
    'Audio Abomination': {description: 'Added your first YouTube sound.', check: () => state.soundUrls.length >= 1}
  };

  const saveState = () => chrome.storage.local.set(state);
  const loadState = async () => {
    const data = await chrome.storage.local.get(null);
    state = { ...defaultState, ...data };

    if (data.unlockedAchievements) {
        state.unlockedAchievements = data.unlockedAchievements;
    }

    updateUIFromState();
  };
  
  const updateUIFromState = () => {
    el.chaosLevelFill.style.width = state.chaosLevel + '%';
    el.chaosPercent.textContent = state.chaosLevel;
    el.memesWatched.textContent = state.memesWatched;
    el.chaosPoints.textContent = state.chaosPoints;
    el.sanityLeft.textContent = Math.max(0, Math.min(100, Math.floor(state.sanityLeft)));
    el.sanityCheckFailures.textContent = state.sanityCheckFailures;
    el.lifeQuestions.textContent = state.lifeQuestions;
    el.tabDupes.textContent = state.tabDupes;
    el.timeWasted.textContent = `${state.timeWasted}s`;
    const regretLevels = ['Minimal', 'Slight', 'Moderate', 'High', 'Extreme', 'Existential'];
    const regretIndex = Math.min(regretLevels.length - 1, Math.floor(state.timeWasted / 60));
    el.regretLevel.textContent = regretLevels[regretIndex];

    if (state.chaosLevel >= 25) el.chaosModeBtn.style.display = 'inline-block';
    if (state.chaosLevel >= 50) el.megaChaosBtn.style.display = 'inline-block';
    if (state.chaosLevel >= 90) el.apocalypseBtn.style.display = 'inline-block';
    
    el.muteBtn.textContent = state.isMuted ? '🔇' : '🔊';

    checkForAchievements();
  };
  
  const showMainInterface = () => {
    el.startButton.style.display = 'none';
    el.memeContainer.style.display = 'block';
    el.memeImage.style.display = 'block';
    el.memeInfo.style.display = 'block'; 
    el.controlsContainer.style.display = 'flex';
    el.statsPanel.style.display = 'block';
    el.achievementsPanel.style.display = 'block';
    el.soundboardPanel.style.display = 'block';
  };

  const showChaosWarning = (message) => {
    el.chaosWarning.textContent = message;
    el.chaosWarning.style.display = 'block';
    setTimeout(() => { el.chaosWarning.style.display = 'none'; }, 3000);
  };
  
  const fetchMemeTemplates = async () => {
    if (memeTemplates.length > 0) return;
    try {
      const response = await fetch(API_SOURCES.memegen);
      if (!response.ok) throw new Error('Network response was not ok');
      memeTemplates = await response.json();
    } catch (error) {
      console.error("Failed to fetch meme templates:", error);
      el.memeInfo.textContent = "ERROR: Could not contact the meme dimension.";
    }
  };

  const getMemeFromRandomSource = async () => {
    const sanityLevel = state.sanityLeft;
    let sources = [];

    if (sanityLevel > 75) {
      sources.push('memegen', 'general', 'dog', 'cat');
    } else if (sanityLevel > 50) {
      sources.push('general', 'general', 'surreal_memes', 'dog');
    } else if (sanityLevel > 25) {
      sources.push('surreal_memes', 'cursed_images', 'general', 'cat');
    } else {
      sources.push('cursed_images', 'cursed_images', 'surreal_memes', 'surreal_memes');
    }

    const selectedSource = sources[Math.floor(Math.random() * sources.length)];
    
    el.memeImage.style.filter = 'blur(5px) saturate(0.5)';
    el.memeInfo.textContent = `Summoning meme from ${selectedSource.toUpperCase()}...`;
    
    try {
      let memeData;
      switch (selectedSource) {
        case 'memegen':
          memeData = await getMemeFromMemeGen();
          break;
        case 'general':
        case 'cursed_images':
        case 'surreal_memes':
          memeData = await getMemeFromReddit(selectedSource);
          break;
        case 'dog':
          memeData = await getMemeFromDogApi();
          break;
        case 'cat':
          memeData = await getMemeFromCatApi();
          break;
        default:
          memeData = await getMemeFromMemeGen();
          break;
      }
      if (!memeData || !memeData.url) {
        throw new Error(`Meme URL not found from source: ${selectedSource}`);
      }
      return { ...memeData, source: selectedSource };
    } catch (error) {
      console.error(`Failed to fetch from ${selectedSource}:`, error);
      try {
        const fallbackMemeData = await getMemeFromReddit('dankmemes');
        if (fallbackMemeData && fallbackMemeData.url) {
          return { ...fallbackMemeData, info: `Fallback: ${fallbackMemeData.info}` };
        }
      } catch (fallbackError) {
        console.error("Fallback API also failed:", fallbackError);
      }
      return { url: null, info: "All meme dimensions have collapsed. Please try again later." };
    }
  };
  
  const getMemeFromMemeGen = () => {
    if (memeTemplates.length === 0) {
      throw new Error("Meme templates not loaded.");
    }
    const availableTemplates = memeTemplates.filter(t => !state.bannedTemplates.includes(t.id));
    if (availableTemplates.length === 0) {
      throw new Error("All memes banished.");
    }

    const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    const topText = TOP_TEXT_OPTIONS[Math.floor(Math.random() * TOP_TEXT_OPTIONS.length)];
    const bottomText = BOTTOM_TEXT_OPTIONS[Math.floor(Math.random() * BOTTOM_TEXT_OPTIONS.length)];

    const memeUrl = `https://api.memegen.link/images/${template.id}/${encodeMemeText(topText)}/${encodeMemeText(bottomText)}.png`;
    
    state.currentMeme = { id: template.id, url: memeUrl, source: 'memegen' };
    return { url: memeUrl, info: `Template: ${template.name}` };
  };

  const getMemeFromReddit = async (subreddit) => {
    const response = await fetch(`https://meme-api.com/gimme/${subreddit}`);
    if (!response.ok) {
      throw new Error(`Reddit API response was not OK for subreddit: ${subreddit}`);
    }
    const data = await response.json();
    const url = data.url;
    
    if (!url) {
      throw new Error(`Meme URL not found in Reddit API response from ${subreddit}`);
    }
    
    return { url: url, info: `From Reddit: "${data.title}"` };
  };

  const getMemeFromDogApi = async () => {
      const response = await fetch(API_SOURCES.dog);
      const data = await response.json();
      return { url: data.message, info: "A doggo appears. Sanity is briefly restored." };
  };

  const getMemeFromCatApi = async () => {
      const response = await fetch(API_SOURCES.cat);
      const data = await response.json();
      const catUrl = data[0].url;
      return { url: catUrl, info: "A feline overlord has blessed us." };
  };
  
  const loadNextMeme = async () => {
    try {
        const memeData = await getMemeFromRandomSource();
        if (memeData && memeData.url) {
            el.memeImage.src = memeData.url;
            el.memeImage.style.filter = 'none';
            el.memeInfo.textContent = memeData.info;
            updateStatsForNewMeme();
        } else {
            el.memeImage.src = 'placeholder.png';
            el.memeInfo.textContent = memeData.info || "Failed to summon meme.";
        }
    } catch (error) {
        console.error("Error loading meme:", error);
        el.memeImage.src = 'placeholder.png';
        el.memeInfo.textContent = "SYSTEM ERROR. RETRYING...";
    }
    saveState();
  };

  const startApp = async () => {
    showMainInterface();
    startTimeWaster();
    el.memeInfo.textContent = "Fetching meme templates...";
    await fetchMemeTemplates();
    loadNextMeme();
  };
  
  const updateStatsForNewMeme = () => {
    state.memesWatched++;
    state.chaosPoints += Math.floor(Math.random() * 5) + 1;
    const baseSanityDrain = 0.5;
    const chaosMultiplier = 1 + (state.chaosLevel / 100);
    state.sanityLeft -= baseSanityDrain * chaosMultiplier;

    if (Math.random() < (state.chaosLevel / 100)) state.lifeQuestions++;
    updateChaosLevel(state.isChaosMode ? 5 : 2);
    updateUIFromState();
    randomGlitchEffect();
  };

  const updateChaosLevel = (increase = 1) => {
    state.chaosLevel = Math.min(100, state.chaosLevel + increase);
    updateUIFromState();
  };

  const startTimeWaster = () => {
    if (timeWastedInterval) clearInterval(timeWastedInterval);
    timeWastedInterval = setInterval(() => {
      state.timeWasted++;
      updateUIFromState();
      saveState();
    }, 1000);
  };
  
  const checkForAchievements = () => {
    for (const key in achievements) {
      if (achievements.hasOwnProperty(key) && achievements[key].check() && !state.unlockedAchievements.includes(key)) {
        state.unlockedAchievements.push(key);
        showAchievement(key);
        saveState();
      }
    }
  };

  const showAchievement = (key) => {
    const achievementItem = document.createElement('li');
    achievementItem.textContent = achievements[key].description;
    el.achievementList.appendChild(achievementItem);
    el.achievementsPanel.style.display = 'block';
    el.achievementsPanel.classList.add('new-achievement');
    setTimeout(() => { el.achievementsPanel.classList.remove('new-achievement'); }, 2000);
  };
  
  const induceTabChaos = (numTabs) => {
    if (typeof chrome.tabs !== 'undefined') {
      for (let i = 0; i < numTabs; i++) {
        getMemeFromRandomSource().then(memeData => {
          if (memeData && memeData.url) {
            chrome.tabs.create({ url: memeData.url });
          }
        });
      }
    }
  };
  
  const induceCurrentTabChaos = () => {
      if (typeof chrome.tabs !== 'undefined') {
          getMemeFromRandomSource().then(memeData => {
            if (memeData && memeData.url) {
              chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                  chrome.tabs.update(tabs[0].id, { url: memeData.url });
              });
            }
          });
      }
  };
  
  const duplicateCurrentTab = (numTabs) => {
      if (typeof chrome.tabs !== 'undefined') {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
              for (let i = 0; i < numTabs; i++) {
                  chrome.tabs.duplicate(tabs[0].id);
              }
          });
          state.tabDupes += numTabs;
      }
  };

  const applyEffect = (effectName) => {
    if (effectName === 'glitch') {
        if(mainGlitchInterval) {
            clearInterval(mainGlitchInterval);
            mainGlitchInterval = null;
            document.body.style.filter = 'none';
        } else {
            mainGlitchInterval = setInterval(() => {
                const amount = Math.random() * 20;
                document.body.style.filter = `hue-rotate(${amount * 5}deg) blur(${amount / 10}px)`;
            }, 100);
        }
        return;
    }
    
    if (psychedelicInterval) clearInterval(psychedelicInterval);
    if (mainGlitchInterval) clearInterval(mainGlitchInterval);
    document.body.classList.remove('psychedelic-active');
    document.body.style.filter = 'none';

    const filters = {
      invert: "invert(1) hue-rotate(180deg)",
      matrix: "hue-rotate(120deg) contrast(1.2) brightness(0.8)",
      vintage: "sepia(1) contrast(1.2) brightness(1.1) saturate(0.8)",
      sepia: "sepia(100%)",
      grayscale: "grayscale(100%)",
      saturate: "saturate(300%)",
      reset: "none"
    };

    if (effectName === 'psychedelic') {
      document.body.classList.toggle('psychedelic-active');
      if (!document.body.classList.contains('psychedelic-active')) return;
      
      psychedelicInterval = setInterval(() => {
          el.memeImage.style.filter = `hue-rotate(${Math.floor(Math.random() * 360)}deg) saturate(3) blur(2px)`;
      }, 100);
      return;
    }
    
    el.memeImage.style.filter = filters[effectName] || 'none';
  };
  
  const randomGlitchEffect = () => {
      if (Math.random() < 0.3) {
          document.body.classList.add('glitch-effect');
          setTimeout(() => { document.body.classList.remove('glitch-effect'); }, 200);
      }
  };
  
  const playRandomSound = () => {
      if (state.isMuted) return;
      if (currentAudio) currentAudio.pause();
      
      const randomUrl = SOUND_URLS[Math.floor(Math.random() * SOUND_URLS.length)];
      currentAudio = new Audio(randomUrl);
      currentAudio.volume = 0.5;
      currentAudio.loop = true;
      currentAudio.play().catch(e => console.error("Failed to play sound:", e));
  };
  
  const toggleMute = () => {
      state.isMuted = !state.isMuted;
      saveState();
      updateUIFromState();
      
      if (state.isMuted) {
          if (currentAudio) currentAudio.pause();
      } else {
          playRandomSound();
      }
  };

  const addRandomSound = () => {
      const randomUrl = SOUND_URLS[Math.floor(Math.random() * SOUND_URLS.length)];
      state.soundUrls.push(randomUrl);
      saveState();
      showChaosWarning("NEW AUDIO ABOMINATION ADDED.");
  };

  const attachEventListeners = () => {
    el.startButton.addEventListener('click', startApp);
    el.nextMemeBtn.addEventListener('click', loadNextMeme);
    el.muteBtn.addEventListener('click', toggleMute);
    el.addSoundBtn.addEventListener('click', addRandomSound);
    
    el.chaosModeBtn.addEventListener('click', () => {
        state.isChaosMode = !state.isChaosMode;
        if (state.isChaosMode) {
            showChaosWarning("CHAOS MODE ACTIVATED. PREPARE FOR MINOR REALITY BENDS.");
            if (Math.random() > 0.5) {
                induceTabChaos(Math.floor(Math.random() * 3) + 1);
            }
        } else {
            showChaosWarning("CHAOS MODE DEACTIVATED. A MOMENT OF CALM.");
        }
        document.body.classList.toggle('chaos-mode-active');
        saveState();
    });

    el.megaChaosBtn.addEventListener('click', () => {
        state.isMegaChaos = !state.isMegaChaos;
        if (state.isMegaChaos) {
            showChaosWarning("MEGA CHAOS ENGAGED. BEHOLD THE VOID.");
            if (Math.random() > 0.3) {
                induceTabChaos(Math.floor(Math.random() * 5) + 3);
            } else {
                induceCurrentTabChaos();
            }
        } else {
            showChaosWarning("MEGA CHAOS DISENGAGED. YOUR SANITY IS STILL AT RISK.");
        }
        document.body.classList.toggle('mega-chaos-active');
        saveState();
    });

    el.apocalypseBtn.addEventListener('click', () => {
        state.isApocalypse = !state.isApocalypse;
        if (state.isApocalypse) {
            showChaosWarning("APOCALYPSE PROTOCOL INITIATED. EVERYTHING IS MEMES.");
            if (Math.random() > 0.5) {
                duplicateCurrentTab(Math.floor(Math.random() * 5) + 2);
            } else {
                induceTabChaos(Math.floor(Math.random() * 10) + 5);
            }
        } else {
            showChaosWarning("APOCALYPSE AVERTED. FOR NOW.");
        }
        document.body.classList.toggle('apocalypse-active');
        saveState();
    });

    el.badMemeBtn.addEventListener('click', () => {
      state.badMemesClicked++;
      state.sanityCheckFailures++;
      state.chaosPoints += 10;
      updateChaosLevel(10);
      state.sanityLeft -= 5;
      showChaosWarning("ANOTHER MEME HAS FAILED THE SANITY CHECK.");
      loadNextMeme();
    });

    el.goodMemeBtn.addEventListener('click', () => {
      state.chaosPoints -= 5;
      state.sanityLeft = Math.min(100, state.sanityLeft + 15);
      state.chaosLevel = Math.max(0, state.chaosLevel - 5);
      showChaosWarning("A BRIEF MOMENT OF LUCIDITY DETECTED.");
      loadNextMeme();
    });

    el.banMemeBtn.addEventListener('click', () => {
      if (state.currentMeme.id && state.currentMeme.source === 'memegen' && !state.bannedTemplates.includes(state.currentMeme.id)) {
        state.bannedTemplates.push(state.currentMeme.id);
        showChaosWarning("MEME TEMPLATE BANISHED TO THE SHADOW REALM.");
        saveState();
        loadNextMeme();
      } else {
        showChaosWarning("CANNOT BANISH THIS MEME. IT IS TOO POWERFUL.");
      }
    });

    el.shareBtn.addEventListener('click', () => {
      if (state.currentMeme.url) {
        navigator.clipboard.writeText(state.currentMeme.url).then(() => {
            showChaosWarning("URL COPIED. MAY YOUR FRIENDS SUFFER THE SAME FATE.");
        });
      }
    });
    
    el.reportBtn.addEventListener('click', () => {
      showChaosWarning("REPORTING TO THE OVERLORDS. THEY DO NOT CARE.");
      state.chaosPoints += 50;
      saveState();
    });

    el.glitchBtn.addEventListener('click', () => applyEffect('glitch'));
    el.invertBtn.addEventListener('click', () => applyEffect('invert'));
    el.matrixBtn.addEventListener('click', () => applyEffect('matrix'));
    el.vintageBtn.addEventListener('click', () => applyEffect('vintage'));
    el.psychedelicBtn.addEventListener('click', () => applyEffect('psychedelic'));
    el.sepiaBtn.addEventListener('click', () => applyEffect('sepia'));
    el.grayscaleBtn.addEventListener('click', () => applyEffect('grayscale'));
    el.saturateBtn.addEventListener('click', () => applyEffect('saturate'));
    el.resetEffectsBtn.addEventListener('click', () => applyEffect('reset'));
  };

  const initMatrix = () => {
    const ctx = el.matrixCanvas.getContext('2d');
    const resizeCanvas = () => {
        el.matrixCanvas.width = document.body.clientWidth;
        el.matrixCanvas.height = document.body.scrollHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const matrix = chars.split('');
    const drops = Array(Math.floor(el.matrixCanvas.width / 10)).fill(1);
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, el.matrixCanvas.width, el.matrixCanvas.height);
        ctx.fillStyle = '#0F0';
        ctx.font = '10px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = matrix[Math.floor(Math.random() * matrix.length)];
            ctx.fillText(text, i * 10, drops[i] * 10);
            if (drops[i] * 10 > el.matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    setInterval(draw, 35);
  };

  const encodeMemeText = (text) => {
    if (!text) return '_';
    return text.replace(/\s/g, '_').replace(/\?/g, '~q').replace(/%/g, '~p').replace(/#/g, '~h').replace(/\//g, '~s').replace(/\\/g, '~b');
  };

  const init = async () => {
    initMatrix();
    await loadState();
    attachEventListeners();
    if (state.memesWatched > 0) {
      showMainInterface();
      startTimeWaster();
    }
    if (!state.isMuted) {
        playRandomSound();
    }
    
    // Ensure achievements are displayed on startup
    if (state.unlockedAchievements.length > 0) {
        state.unlockedAchievements.forEach(key => {
            const achievementItem = document.createElement('li');
            achievementItem.textContent = achievements[key].description;
            el.achievementList.appendChild(achievementItem);
        });
        el.achievementsPanel.style.display = 'block';
    }
  };

  init();
});