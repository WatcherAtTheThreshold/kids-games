/* === SLIME MATH — Game Logic === */

const NUM_WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

/* === ROUND DATA === */
const ROUNDS = [
    {
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
let roundPhase = 'idle';
let blobsRemaining = 0;
let fedCount = 0;
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
let countBadgeEl, equationBarEl;

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
    countBadgeEl      = document.getElementById('countBadge');
    equationBarEl     = document.getElementById('equationBar');

    const saved = localStorage.getItem('kidsGames_soundEnabled');
    soundEnabled = saved !== null ? saved === 'true' : true;

    startButtonEl.addEventListener('click', startGame);
    backButtonEl.addEventListener('click', goBack);
    continueButtonEl.addEventListener('click', goBack);
    slimeEl.addEventListener('click', handleSlimeTap);

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

    progressIndicatorEl.textContent = `Round ${index + 1} of 5`;
    blobsLeftEl.innerHTML = '';
    blobsRightEl.innerHTML = '';
    questionSectionEl.classList.add('hidden');
    answerButtonsEl.innerHTML = '';
    equationBarEl.classList.add('hidden');
    equationBarEl.innerHTML = '';
    hideCount();
    slimeEl.querySelectorAll('.inner-blob').forEach(b => b.remove());

    setSlimeColor(round.startColor);
    setMouth('');
    fedCount = 0;

    if (round.type === 'add') {
        setupAdditionRound(round);
    } else {
        setupSubtractionRound(round);
    }
}

/* ============================================
   ADDITION ROUNDS — intro → feeding → equation → question → reinforcement
   ============================================ */

function setupAdditionRound(round) {
    roundPhase = 'intro';
    const g0 = round.blobGroups[0];
    const g1 = round.blobGroups[1];
    blobsRemaining = g0.count + g1.count;

    createBlobGroup(blobsLeftEl, g0.color, g0.count, round);
    createBlobGroup(blobsRightEl, g1.color, g1.count, round);

    setInstruction("Let's count the blobs!", '🔢', '👀');
    speak("Let's count the blobs!");
    showCount(0);

    setTimeout(() => {
        if (!gameActive) return;
        introBlobs(round);
    }, 800);
}

function createBlobGroup(container, color, count, round) {
    for (let i = 0; i < count; i++) {
        const blob = document.createElement('div');
        blob.className = 'blob intro-hidden';
        blob.style.backgroundColor = color;
        blob.addEventListener('click', () => onBlobTap(blob, round));
        container.appendChild(blob);
    }
}

function introBlobs(round) {
    const allBlobs = [
        ...blobsLeftEl.querySelectorAll('.blob'),
        ...blobsRightEl.querySelectorAll('.blob')
    ];
    const total = allBlobs.length;
    let idx = 0;

    function revealNext() {
        if (!gameActive || idx >= total) {
            onIntroComplete(round, total);
            return;
        }

        const blob = allBlobs[idx];
        idx++;

        blob.classList.remove('intro-hidden');
        const numLabel = document.createElement('span');
        numLabel.className = 'blob-number';
        numLabel.textContent = idx;
        blob.appendChild(numLabel);

        updateCount(idx);
        speak(NUM_WORDS[idx] + '!');
        playPop();

        setTimeout(revealNext, 550);
    }

    revealNext();
}

function onIntroComplete(round, total) {
    speak(NUM_WORDS[total] + ' blobs! Now feed them to the slime!');
    setInstruction(`${NUM_WORDS[total]} blobs! Tap each one to feed the slime!`, '🫧', '🎯');

    setTimeout(() => {
        if (!gameActive) return;
        roundPhase = 'feeding';
        fedCount = 0;
        updateCount(0);
    }, 1200);
}

/* === BLOB TAP (feeding phase) === */
function onBlobTap(blobEl, round) {
    if (roundPhase !== 'feeding' || !blobEl.isConnected) return;

    blobEl.style.pointerEvents = 'none';
    playPop();
    addSlimeAnim('squish');
    setMouth('chewing');
    slimeMouthEl.addEventListener('animationend', () => {
        if (roundPhase === 'feeding') setMouth('');
    }, { once: true });

    fedCount++;
    updateCount(fedCount);
    speak(NUM_WORDS[fedCount] + '!');

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
    roundPhase = 'equation';
    setSlimeColor(round.mixedColor);
    setMouth('happy-wide');
    addSlimeAnim('bounce');
    playJingle();
    hideCount();

    const cap = round.colorName[0].toUpperCase() + round.colorName.slice(1);
    setInstruction(`Wow! ${cap}!`, '✨', '🎨');

    setTimeout(() => {
        if (!gameActive) return;
        buildEquation(round);
    }, 1100);
}

/* === EQUATION BAR === */
function buildEquation(round) {
    equationBarEl.innerHTML = '';
    equationBarEl.classList.remove('hidden');

    const elements = [];

    if (round.type === 'add') {
        const g0 = round.blobGroups[0];
        const g1 = round.blobGroups[1];

        for (let i = 0; i < g0.count; i++) {
            elements.push(makeDot(g0.color));
        }
        elements.push(makeOp('+'));
        for (let i = 0; i < g1.count; i++) {
            elements.push(makeDot(g1.color));
        }
    } else {
        elements.push(makeNum(round.totalBlobs));
        elements.push(makeOp('−'));
        elements.push(makeNum(round.escapedBlobs));
    }

    elements.push(makeOp('='));
    const answerSlot = makeAnswer('?');
    elements.push(answerSlot);

    elements.forEach(el => equationBarEl.appendChild(el));

    let delay = 0;
    elements.forEach(el => {
        delay += 300;
        setTimeout(() => {
            if (!gameActive) return;
            el.classList.add('show');
        }, delay);
    });

    const speakDelay = delay + 400;
    setTimeout(() => {
        if (!gameActive) return;
        const g0 = round.blobGroups ? round.blobGroups[0] : null;
        const g1 = round.blobGroups ? round.blobGroups[1] : null;
        if (round.type === 'add') {
            speak(`${NUM_WORDS[g0.count]} plus ${NUM_WORDS[g1.count]} equals... what?`);
        } else {
            speak(`${NUM_WORDS[round.totalBlobs]} minus ${NUM_WORDS[round.escapedBlobs]} equals... what?`);
        }
        setInstruction(round.questionText, '🧮', '🤔');
        showQuestion(round);
    }, speakDelay);
}

function makeDot(color) {
    const dot = document.createElement('div');
    dot.className = 'eq-dot';
    dot.style.backgroundColor = color;
    return dot;
}

function makeOp(symbol) {
    const op = document.createElement('span');
    op.className = 'eq-op';
    op.textContent = symbol;
    return op;
}

function makeNum(n) {
    const num = document.createElement('span');
    num.className = 'eq-op';
    num.textContent = n;
    return num;
}

function makeAnswer(text) {
    const ans = document.createElement('span');
    ans.className = 'eq-answer';
    ans.id = 'eqAnswerSlot';
    ans.textContent = text;
    return ans;
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
        btn.addEventListener('click', () => onAnswer(num, round.answer, btn, round));
        answerButtonsEl.appendChild(btn);
    });

    questionSectionEl.classList.remove('hidden');
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
function onAnswer(selected, correct, btnEl, round) {
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
        showReinforcement(round);
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

/* === REINFORCEMENT === */
function showReinforcement(round) {
    roundPhase = 'reinforcement';

    const slot = document.getElementById('eqAnswerSlot');
    if (slot) {
        slot.textContent = round.answer;
        slot.classList.add('show');
    }

    if (round.type === 'add') {
        const g0 = round.blobGroups[0];
        const g1 = round.blobGroups[1];
        speak(`${NUM_WORDS[g0.count]} plus ${NUM_WORDS[g1.count]} equals ${NUM_WORDS[round.answer]}! Great job!`);
    } else {
        speak(`${NUM_WORDS[round.totalBlobs]} minus ${NUM_WORDS[round.escapedBlobs]} equals ${NUM_WORDS[round.answer]}! Great job!`);
    }

    showBubble(`${round.answer}! ⭐`);

    setTimeout(() => {
        if (!gameActive) return;
        hideBubble();
        if (currentRound < ROUNDS.length - 1) {
            currentRound++;
            startRound(currentRound);
        } else {
            celebrate();
        }
    }, 2200);
}

/* ============================================
   SUBTRACTION ROUND — guided count → escape → count remaining → equation → question → reinforcement
   ============================================ */

function setupSubtractionRound(round) {
    roundPhase = 'intro';
    setInstruction("Let's count the blobs inside the slime!", '👀', '🔢');
    speak("Let's count the blobs inside the slime!");
    showCount(0);

    const positions = [
        { top: '33%', left: '22%' }, { top: '33%', left: '46%' }, { top: '33%', left: '70%' },
        { top: '57%', left: '30%' }, { top: '57%', left: '54%' }, { top: '57%', left: '78%' }
    ];

    positions.forEach((pos) => {
        const inner = document.createElement('div');
        inner.className = 'inner-blob';
        inner.style.top = pos.top;
        inner.style.left = pos.left;
        inner.style.transform = 'translate(-50%, -50%)';
        inner.style.opacity = '0';
        slimeEl.appendChild(inner);
    });

    setTimeout(() => {
        if (!gameActive) return;
        guidedCountInner(round);
    }, 800);
}

function guidedCountInner(round) {
    const inners = Array.from(slimeEl.querySelectorAll('.inner-blob'));
    let idx = 0;

    function countNext() {
        if (!gameActive || idx >= inners.length) {
            onInnerCountComplete(round);
            return;
        }

        const blob = inners[idx];
        idx++;

        blob.style.opacity = '1';
        blob.classList.add('highlight');
        updateCount(idx);
        speak(NUM_WORDS[idx] + '!');
        playPop();

        setTimeout(() => {
            blob.classList.remove('highlight');
        }, 350);

        setTimeout(countNext, 450);
    }

    countNext();
}

function onInnerCountComplete(round) {
    speak(`${NUM_WORDS[round.totalBlobs]} blobs inside the slime!`);
    setInstruction(`${NUM_WORDS[round.totalBlobs]} blobs inside!`, '😮', '🔢');

    setTimeout(() => {
        if (!gameActive) return;
        setInstruction('Oh no! Some are escaping!', '😱', '💨');
        speak('Oh no! Some blobs are escaping!');
        setMouth('open');
        animateEscapeSequence(round);
    }, 1600);
}

function animateEscapeSequence(round) {
    const inners = Array.from(slimeEl.querySelectorAll('.inner-blob'));
    const escapees = [inners[1], inners[4]];
    let escaped = 0;
    let remaining = round.totalBlobs;

    function escapeNext() {
        if (!gameActive || escaped >= escapees.length) {
            onEscapeComplete(round, escapees);
            return;
        }

        const blob = escapees[escaped];
        escaped++;
        remaining--;

        const dir = escaped === 1 ? -55 : 55;
        blob.style.setProperty('--ex', dir + 'px');
        blob.style.setProperty('--ey', '-75px');
        blob.style.animation = 'blobEscape 0.65s ease-out forwards';
        playPop();

        updateCount(remaining);
        speak(`${NUM_WORDS[escaped]} escaped!`);

        setTimeout(escapeNext, 850);
    }

    escapeNext();
}

function onEscapeComplete(round, escapees) {
    setSlimeColor(round.fadedColor);
    setMouth('sad');
    playTone(280, 0.35, 'sine');
    escapees.forEach(b => b.remove());

    setTimeout(() => {
        if (!gameActive) return;
        setMouth('');
        setInstruction("Let's count what's left!", '🔢', '👀');
        speak("Let's count what's left!");
        guidedCountRemaining(round);
    }, 1000);
}

function guidedCountRemaining(round) {
    const remaining = Array.from(slimeEl.querySelectorAll('.inner-blob'));
    let idx = 0;
    updateCount(0);

    function countNext() {
        if (!gameActive || idx >= remaining.length) {
            onRemainingCounted(round, remaining.length);
            return;
        }

        const blob = remaining[idx];
        idx++;

        blob.classList.add('highlight');
        updateCount(idx);
        speak(NUM_WORDS[idx] + '!');
        playPop();

        setTimeout(() => {
            blob.classList.remove('highlight');
        }, 350);

        setTimeout(countNext, 500);
    }

    setTimeout(countNext, 600);
}

function onRemainingCounted(round, count) {
    speak(`${NUM_WORDS[count]} blobs left!`);
    setInstruction(`${NUM_WORDS[count]} blobs left!`, '🤔', '🧮');
    hideCount();

    setTimeout(() => {
        if (!gameActive) return;
        buildEquation(round);
    }, 1200);
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

/* === COUNT BADGE === */
function showCount(n) {
    countBadgeEl.textContent = n;
    countBadgeEl.classList.remove('hidden');
}

function hideCount() {
    countBadgeEl.classList.add('hidden');
}

function updateCount(n) {
    countBadgeEl.textContent = n;
    countBadgeEl.classList.remove('hidden', 'pop');
    void countBadgeEl.offsetWidth;
    countBadgeEl.classList.add('pop');
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
