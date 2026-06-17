/* === SLIME MATH — Game Logic === */

/* === ROUND DATA === */
const ROUNDS = [
    {
        // Round 1: Red + Blue → Purple  |  1 + 1 = 2
        type: 'add',
        blobGroups: [
            { color: '#ef5350', count: 1 },
            { color: '#5c6bc0', count: 1 }
        ],
        startColor: '#66bb6a',
        mixedColor: '#9c27b0',
        colorName: 'purple',
        questionText: '1 + 1 = ?',
        answer: 2
    },
    {
        // Round 2: Yellow + Red → Orange  |  2 + 1 = 3
        type: 'add',
        blobGroups: [
            { color: '#fdd835', count: 2 },
            { color: '#ef5350', count: 1 }
        ],
        startColor: '#9c27b0',
        mixedColor: '#ff7043',
        colorName: 'orange',
        questionText: '2 + 1 = ?',
        answer: 3
    },
    {
        // Round 3: Blue + Yellow → Green  |  2 + 2 = 4
        type: 'add',
        blobGroups: [
            { color: '#5c6bc0', count: 2 },
            { color: '#fdd835', count: 2 }
        ],
        startColor: '#ff7043',
        mixedColor: '#66bb6a',
        colorName: 'green',
        questionText: '2 + 2 = ?',
        answer: 4
    },
    {
        // Round 4: Subtraction — 6 blobs, 2 escape  |  6 − 2 = 4
        type: 'subtract',
        startColor: '#ec407a',
        fadedColor: '#f48fb1',
        colorName: 'pink',
        totalBlobs: 6,
        escapedBlobs: 2,
        questionText: '6 − 2 = ?',
        answer: 4
    },
    {
        // Round 5: Red + Blue → Deep Purple  |  3 + 4 = 7
        type: 'add',
        blobGroups: [
            { color: '#ef5350', count: 3 },
            { color: '#5c6bc0', count: 4 }
        ],
        startColor: '#f48fb1',
        mixedColor: '#7b1fa2',
        colorName: 'deep purple',
        questionText: '3 + 4 = ?',
        answer: 7
    }
];

/* === GAME STATE === */
let currentRound = 0;
let gameActive = false;
let roundPhase = 'idle';    // 'feeding' | 'question' | 'transition'
let blobsRemaining = 0;
let soundEnabled = true;
let audioCtx = null;
let speechReady = false;
let eyeBlinkTimer = null;

/* === DOM REFERENCES === */
let slimeEl, slimeMouthEl, speechBubbleEl;
let leftEyeEl, rightEyeEl, leftPupilEl, rightPupilEl;
let blobsLeftEl, blobsRightEl;
let instructionTextEl, progressIndicatorEl;
let questionSectionEl, questionTextEl, answerButtonsEl;
let startScreenEl, startButtonEl, backButtonEl;
let celebrationOverlayEl, continueButtonEl;

/* === INIT === */
document.addEventListener('DOMContentLoaded', function () {
    slimeEl           = document.getElementById('slime');
    slimeMouthEl      = document.getElementById('slimeMouth');
    speechBubbleEl    = document.getElementById('speechBubble');
    leftEyeEl         = document.getElementById('leftEye');
    rightEyeEl        = document.getElementById('rightEye');
    leftPupilEl       = document.getElementById('leftPupil');
    rightPupilEl      = document.getElementById('rightPupil');
    blobsLeftEl       = document.getElementById('blobsLeft');
    blobsRightEl      = document.getElementById('blobsRight');
    instructionTextEl = document.getElementById('instructionText');
    progressIndicatorEl = document.getElementById('progressIndicator');
    questionSectionEl = document.getElementById('questionSection');
    questionTextEl    = document.getElementById('questionText');
    answerButtonsEl   = document.getElementById('answerButtons');
    startScreenEl     = document.getElementById('startScreen');
    startButtonEl     = document.getElementById('startButton');
    backButtonEl      = document.getElementById('backButton');
    celebrationOverlayEl = document.getElementById('celebrationOverlay');
    continueButtonEl  = document.getElementById('continueButton');

    const saved = localStorage.getItem('kidsGames_soundEnabled');
    soundEnabled = saved !== null ? saved === 'true' : true;

    startButtonEl.addEventListener('click', startGame);
    backButtonEl.addEventListener('click', goBack);
    continueButtonEl.addEventListener('click', goBack);
    slimeEl.addEventListener('click', handleSlimeTap);

    // iOS speech synthesis needs a user-gesture touch to unlock
    document.addEventListener('touchstart', initSpeech, { once: true });
    document.addEventListener('click', initSpeech, { once: true });

    setSlimeColor('#66bb6a');
    scheduleBlink();
});

/* === NAVIGATION === */
function goBack() {
    gameActive = false;
    clearTimeout(eyeBlinkTimer);
    window.location.href = '../index.html';
}

/* === START GAME === */
function startGame() {
    startScreenEl.classList.add('hidden');
    gameActive = true;
    currentRound = 0;
    startRound(0);
}

/* === ROUND LOGIC === */
function startRound(index) {
    const round = ROUNDS[index];
    roundPhase = 'feeding';

    progressIndicatorEl.textContent = `Round ${index + 1} of 5`;
    blobsLeftEl.innerHTML = '';
    blobsRightEl.innerHTML = '';
    questionSectionEl.classList.add('hidden');
    answerButtonsEl.innerHTML = '';
    slimeEl.querySelectorAll('.inner-blob').forEach(b => b.remove());

    setSlimeColor(round.startColor);
    setMouth('');

    if (round.type === 'add') {
        setupAdditionRound(round);
    } else {
        setupSubtractionRound(round);
    }
}

/* === ADDITION ROUND === */
function setupAdditionRound(round) {
    const g0 = round.blobGroups[0];
    const g1 = round.blobGroups[1];

    blobsRemaining = g0.count + g1.count;

    createBlobGroup(blobsLeftEl, g0.color, g0.count, round);
    createBlobGroup(blobsRightEl, g1.color, g1.count, round);

    const name0 = colorName(g0.color);
    const name1 = colorName(g1.color);
    setInstruction(`Feed the slime! Tap the ${name0} and ${name1} blobs!`, '🫧', '🎯');
    speak('Feed the slime! Tap each blob!');
}

function createBlobGroup(container, color, count, round) {
    for (let i = 0; i < count; i++) {
        const blob = document.createElement('div');
        blob.className = 'blob';
        blob.style.backgroundColor = color;
        blob.addEventListener('click', () => onBlobTap(blob, round));
        container.appendChild(blob);
    }
}

/* === SUBTRACTION ROUND === */
function setupSubtractionRound(round) {
    // Inner blob positions (relative to slime div)
    const positions = [
        { top: '33%', left: '22%' }, { top: '33%', left: '46%' }, { top: '33%', left: '70%' },
        { top: '57%', left: '30%' }, { top: '57%', left: '54%' }, { top: '57%', left: '78%' }
    ];

    positions.forEach((pos, i) => {
        const inner = document.createElement('div');
        inner.className = 'inner-blob';
        inner.style.top = pos.top;
        inner.style.left = pos.left;
        inner.style.transform = 'translate(-50%, -50%)';
        inner.dataset.idx = i;
        slimeEl.appendChild(inner);
    });

    setInstruction('Watch out! Count the blobs inside the slime!', '👀', '🔢');
    speak('Count the blobs inside the slime! Uh oh, some are about to escape!');

    setTimeout(() => {
        if (!gameActive) return;
        setInstruction('2 blobs are escaping! Watch!', '😱', '💨');
        speak('Oh no! Two blobs are escaping!');
        setMouth('open');
        animateEscape(round);
    }, 2400);
}

function animateEscape(round) {
    const inners = Array.from(slimeEl.querySelectorAll('.inner-blob'));
    const escapees = [inners[1], inners[4]];

    escapees.forEach((blob, i) => {
        blob.style.setProperty('--ex', i === 0 ? '-55px' : '55px');
        blob.style.setProperty('--ey', '-75px');
        blob.style.animation = 'blobEscape 0.65s ease-out forwards';
        playPop();
    });

    setTimeout(() => {
        if (!gameActive) return;
        setSlimeColor(round.fadedColor);
        setMouth('sad');
        playTone(280, 0.35, 'sine');
        escapees.forEach(b => b.remove());

        setTimeout(() => {
            if (!gameActive) return;
            setMouth('');
            showQuestion(round);
        }, 900);
    }, 850);
}

/* === BLOB TAP === */
function onBlobTap(blobEl, round) {
    if (roundPhase !== 'feeding' || !blobEl.isConnected) return;

    // Remove so it can't be tapped again
    blobEl.style.pointerEvents = 'none';
    playPop();
    addSlimeAnim('squish');
    setMouth('chewing');
    slimeMouthEl.addEventListener('animationend', () => {
        if (roundPhase === 'feeding') setMouth('');
    }, { once: true });

    flyBlobToSlime(blobEl, () => {
        blobsRemaining--;
        if (blobsRemaining === 0) onAllFed(round);
    });
}

function flyBlobToSlime(blobEl, onDone) {
    const sr = slimeEl.getBoundingClientRect();
    const br = blobEl.getBoundingClientRect();
    const dx = (sr.left + sr.width / 2) - (br.left + br.width / 2);
    const dy = (sr.top  + sr.height / 2) - (br.top  + br.height / 2);

    blobEl.style.transition = 'transform 0.36s ease-in, opacity 0.36s ease-in';
    blobEl.style.transform  = `translate(${dx}px, ${dy}px) scale(0.1)`;
    blobEl.style.opacity    = '0';

    setTimeout(() => {
        blobEl.remove();
        onDone();
    }, 370);
}

function onAllFed(round) {
    roundPhase = 'question';
    setSlimeColor(round.mixedColor);
    setMouth('happy-wide');
    addSlimeAnim('bounce');
    playJingle();

    setTimeout(() => {
        if (!gameActive) return;
        const cap = round.colorName[0].toUpperCase() + round.colorName.slice(1);
        setInstruction(`Wow! ${cap}! 🎉 Now answer the math question!`, '✨', '🧮');
        speak(`Wow! The slime turned ${round.colorName}! ${round.questionText.replace('?', '')} what is the answer?`);
        showQuestion(round);
    }, 1100);
}

/* === QUESTION === */
function showQuestion(round) {
    roundPhase = 'question';
    questionTextEl.textContent = round.questionText;
    answerButtonsEl.innerHTML = '';

    generateChoices(round.answer).forEach(num => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = num;
        btn.addEventListener('click', () => onAnswer(num, round.answer, btn));
        answerButtonsEl.appendChild(btn);
    });

    questionSectionEl.classList.remove('hidden');
    const spoken = round.questionText.replace('−', 'minus').replace('+', 'plus').replace('= ?', '');
    speak(spoken + ' equals what?');
}

function generateChoices(correct) {
    const distractors = new Set();
    let tries = 0;
    while (distractors.size < 2 && tries < 40) {
        const off = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
        const d = correct + off;
        if (d > 0 && d <= 12 && d !== correct) distractors.add(d);
        tries++;
    }
    // Fallback guarantees
    if (distractors.size < 2 && !distractors.has(correct - 1) && correct > 1) distractors.add(correct - 1);
    if (distractors.size < 2 && !distractors.has(correct + 1)) distractors.add(correct + 1);

    return shuffle([correct, ...[...distractors].filter(d => d !== correct).slice(0, 2)]);
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/* === ANSWER HANDLING === */
function onAnswer(selected, correct, btnEl) {
    if (roundPhase !== 'question') return;
    roundPhase = 'transition';

    answerButtonsEl.querySelectorAll('.answer-btn').forEach(b => {
        b.style.pointerEvents = 'none';
    });

    if (selected === correct) {
        btnEl.classList.add('correct-flash');
        setMouth('happy-wide');
        addSlimeAnim('bounce');
        playJingle();
        showBubble('Yay! ⭐');
        speak('Amazing! That\'s right!');

        setTimeout(() => {
            if (!gameActive) return;
            hideBubble();
            if (currentRound < ROUNDS.length - 1) {
                currentRound++;
                startRound(currentRound);
            } else {
                celebrate();
            }
        }, 1700);
    } else {
        btnEl.classList.add('wrong-flash');
        setMouth('sad');
        addSlimeAnim('wiggle');
        playTone(180, 0.4, 'sawtooth');
        showBubble('Try again! 💪');
        speak('Oops! Try again!');

        setTimeout(() => {
            if (!gameActive) return;
            btnEl.classList.remove('wrong-flash');
            hideBubble();
            setMouth('');
            answerButtonsEl.querySelectorAll('.answer-btn').forEach(b => {
                b.style.pointerEvents = '';
            });
            roundPhase = 'question';
        }, 1300);
    }
}

/* === CELEBRATION === */
function celebrate() {
    gameActive = false;
    setMouth('happy-wide');
    awardSticker();
    celebrationOverlayEl.classList.remove('hidden');
    playJingle();
    speak('Amazing! You are a Slime Math star!');
}

function awardSticker() {
    try {
        const key = 'slime-math';
        const raw = localStorage.getItem('kidsGames_earnedStickers') || '';
        const list = raw ? raw.split(',').filter(Boolean) : [];
        if (!list.includes(key)) {
            list.push(key);
            localStorage.setItem('kidsGames_earnedStickers', list.join(','));
            localStorage.setItem('kidsGames_stickerCount', String(list.length));
        }
    } catch (e) { /* ignore */ }
}

/* === IDLE SLIME TAP REACTIONS === */
const REACTIONS = [
    () => { addSlimeAnim('squish'); setMouth('open'); resetMouth(500); },
    () => { showBubble('Burp! 🤭'); setMouth('happy-wide'); resetMouth(900); hideBubbleAfter(850); },
    () => {
        addSlimeAnim('wiggle');
        leftPupilEl.classList.add('roll'); rightPupilEl.classList.add('roll');
        setTimeout(() => { leftPupilEl.classList.remove('roll'); rightPupilEl.classList.remove('roll'); }, 900);
    },
    () => { addSlimeAnim('bounce'); setMouth('happy-wide'); resetMouth(800); },
    () => { showBubble('zzz... 😴'); resetMouth(1100); hideBubbleAfter(1000); },
    () => { addSlimeAnim('squish'); showBubble('Bloop! 💧'); setMouth('open'); resetMouth(450); hideBubbleAfter(700); },
];

function handleSlimeTap() {
    REACTIONS[Math.floor(Math.random() * REACTIONS.length)]();
    playTone(300 + Math.random() * 160, 0.2, 'sine');
}

/* === EYE BLINKING === */
function scheduleBlink() {
    const delay = 2600 + Math.random() * 2200;
    eyeBlinkTimer = setTimeout(() => {
        leftEyeEl.style.transform  = 'scaleY(0.06)';
        rightEyeEl.style.transform = 'scaleY(0.06)';
        setTimeout(() => {
            leftEyeEl.style.transform  = '';
            rightEyeEl.style.transform = '';
            scheduleBlink();
        }, 110);
    }, delay);
}

/* === HELPERS === */
function setSlimeColor(hex) {
    slimeEl.style.setProperty('--slime-color', hex);
}

function setInstruction(text, e1, e2) {
    instructionTextEl.innerHTML =
        `<span class="instruction-emoji">${e1}</span> ${text} <span class="instruction-emoji">${e2}</span>`;
}

function showBubble(text) {
    speechBubbleEl.textContent = text;
    speechBubbleEl.classList.add('show');
}

function hideBubble() {
    speechBubbleEl.classList.remove('show');
}

function hideBubbleAfter(ms) {
    setTimeout(hideBubble, ms);
}

function resetMouth(ms) {
    setTimeout(() => { if (gameActive) setMouth(''); }, ms);
}

function addSlimeAnim(cls) {
    slimeEl.classList.remove(cls);
    void slimeEl.offsetWidth;
    slimeEl.classList.add(cls);
    slimeEl.addEventListener('animationend', () => slimeEl.classList.remove(cls), { once: true });
}

function setMouth(state) {
    slimeMouthEl.classList.remove('sad', 'open', 'chewing', 'happy-wide');
    void slimeMouthEl.offsetWidth;
    if (state) slimeMouthEl.classList.add(state);
}

function colorName(hex) {
    const map = {
        '#ef5350': 'red', '#5c6bc0': 'blue', '#fdd835': 'yellow',
        '#ffa726': 'orange', '#ec407a': 'pink'
    };
    return map[hex] || 'colorful';
}

/* === WEB AUDIO === */
function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

function playTone(freq, dur, type = 'sine', vol = 0.28) {
    if (!soundEnabled) return;
    try {
        const ctx = getCtx();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + dur);
    } catch (e) { /* silent fail */ }
}

function playPop() {
    playTone(430, 0.13, 'sine');
}

function playJingle() {
    if (!soundEnabled) return;
    [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.22, 'sine', 0.25), i * 135));
}

/* === SPEECH SYNTHESIS === */
function initSpeech() {
    if (speechReady || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    speechSynthesis.speak(u);
    speechReady = true;
}

function speak(text) {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate  = 0.88;
    u.pitch = 1.1;
    speechSynthesis.speak(u);
}
