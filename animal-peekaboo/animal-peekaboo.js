/* === UPDATED HIDING SPOTS === */
.hiding-spot {
    position: absolute;
    width: 120px;
    height: 120px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3.5rem;
    min-width: 140px;
    min-height: 140px;
    background-size: contain !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    z-index: 20; /* Higher than animals */
    border-radius: 0; /* Remove circular shape */
}

/* === ADD BACKGROUND IMAGES TO HIDING SPOTS === */
.spot-1 { 
    background: url('images/hiding-spots/tree.png'); 
}
.spot-2 { 
    background: url('images/hiding-spots/bush.png');
}
.spot-3 { 
    background: url('images/hiding-spots/log.png');
}
.spot-4 { 
    background: url('images/hiding-spots/rock.png');
}
.spot-5 { 
    background: url('images/hiding-spots/grass.png');
}
.spot-6 { 
    background: url('images/hiding-spots/bush-small.png');
}

/* === ANIMAL IN SPOT === */
.animal-in-spot {
    position: absolute;
    font-size: 3rem;
    width: 80px;
    height: 80px;
    z-index: 10; /* Lower than hiding spots */
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* === UPDATED PEEKING ANIMATIONS === */
@keyframes peek-top {
    0% { transform: translateY(40px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}

@keyframes peek-bottom {
    0% { transform: translateY(-40px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}

@keyframes peek-left {
    0% { transform: translateX(40px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
}

@keyframes peek-right {
    0% { transform: translateX(-40px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
}

/* === VISUAL FEEDBACK STYLES === */
.correct-feedback {
    box-shadow: 0 0 20px 10px rgba(76, 217, 100, 0.7);
    transform: scale(1.05);
}

.has-animal {
    transform: scale(1.05);
}

.fade-out {
    opacity: 0;
    transition: opacity 0.3s ease;
}

.celebrating {
    animation: celebration 0.8s ease-out;
}

@keyframes celebration {
    0%, 100% { transform: scale(1) translateY(0); }
    25% { transform: scale(1.2) translateY(-10px); }
    50% { transform: scale(1.3) translateY(-15px); }
    75% { transform: scale(1.2) translateY(-5px); }
}
