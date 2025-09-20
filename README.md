// Droit d'auteur (c) 2025 Kevin St-Onge. Tous droits réservés.
// Ce code est la propriété intellectuelle de Kevin St-Onge.
// Sa duplication ou distribution sans permission est strictement interdite.
// Licence : Voir le fichier LICENSE.md
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
// === CLASSE IA DE FEEDBACK (intégrée directement) ===
class AIFeedbackCollector {
constructor() {
this.feedbackDatabase = [];
this.userSegments = new Map();
this.emotionKeywords = {
positive: ['relaxing', 'amazing', 'perfect', 'love', 'beautiful', 'calming', 'hypnotic', 'mesmerizing'],
negative: ['boring', 'annoying', 'confusing', 'frustrating', 'slow', 'broken', 'bad'],
neutral: ['interesting', 'different', 'unique', 'strange', 'weird']
};
this.useCaseKeywords = {
coding: ['programming', 'coding', 'development', 'work', 'focus', 'concentration'],
study: ['studying', 'learning', 'exam', 'homework', 'university', 'school'],
wellness: ['meditation', 'relaxation', 'sleep', 'stress', 'calm', 'peace'],
creative: ['art', 'design', 'writing', 'creativity', 'inspiration', 'drawing']
};
}
// MÉTHODE LOADDATA AJOUTÉE
loadData(data) {
if (data.feedbacks) {
this.feedbackDatabase = data.feedbacks;
}
if (data.segments) {
this.userSegments = new Map(data.segments);
}
console.log(🤖 IA Feedback: ${this.feedbackDatabase.length} feedbacks et ${this.userSegments.size} segments chargés);
}
// Collecte automatique du feedback basée sur les interactions
collectImplicitFeedback(userId, sensationId, interactionData) {
const feedback = {
id: fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)},
userId,
sensationId,
timestamp: Date.now(),
type: 'implicit',
data: {
duration: interactionData.duration,
repeat: interactionData.repeat || false,
skip: interactionData.skip || false,
sequence: interactionData.sequence || []
},
sentiment: this.analyzeBehavioralSentiment(interactionData),
useCase: this.predictUseCase(interactionData)
};
this.feedbackDatabase.push(feedback);
this.updateUserSegment(userId, feedback);
return feedback;

}
// Analyse de sentiment basée sur le comportement
analyzeBehavioralSentiment(data) {
let score = 0;
if (data.duration > 8000) score += 2;
else if (data.duration > 3000) score += 1;
else if (data.duration < 1000) score -= 2;

if (data.repeat) score += 3;
if (data.skip && data.duration < 2000) score -= 3;
if (data.sequence && data.sequence.length > 3) score += 1;

if (score >= 3) return 'very_positive';
if (score >= 1) return 'positive';
if (score <= -3) return 'very_negative';
if (score <= -1) return 'negative';
return 'neutral';

}
// Prédiction du cas d'usage
predictUseCase(data) {
const hour = new Date().getHours();
const dayOfWeek = new Date().getDay();
if (hour >= 9 && hour <= 17 && dayOfWeek >= 1 && dayOfWeek <= 5) {
  return data.duration > 5000 ? 'coding' : 'study';
}
if (hour >= 22 || hour <= 6) return 'wellness';
if (dayOfWeek === 0 || dayOfWeek === 6) {
  return data.sequence?.length > 2 ? 'creative' : 'wellness';
}
return 'general';

}
// Mise à jour des segments utilisateur
updateUserSegment(userId, feedback) {
if (!this.userSegments.has(userId)) {
this.userSegments.set(userId, {
userId,
primaryUseCase: 'general',
sentimentHistory: [],
interactionPattern: 'casual',
lastUpdate: Date.now()
});
}
const userSegment = this.userSegments.get(userId);
userSegment.sentimentHistory.push(feedback.sentiment);

if (userSegment.sentimentHistory.length > 10) {
  userSegment.sentimentHistory.shift();
}

if (feedback.useCase && feedback.useCase !== 'general') {
  userSegment.primaryUseCase = feedback.useCase;
}

userSegment.lastUpdate = Date.now();
this.userSegments.set(userId, userSegment);

}
// Export des données
exportData() {
return {
feedbacks: this.feedbackDatabase,
segments: Array.from(this.userSegments.entries()),
timestamp: Date.now()
};
}
// Génération d'insights
generateInsights() {
const sentiments = this.feedbackDatabase.map(f => f.sentiment);
const useCases = this.feedbackDatabase.map(f => f.useCase);
const sentimentDistribution = {};
const useCaseDistribution = {};

sentiments.forEach(s => sentimentDistribution[s] = (sentimentDistribution[s] || 0) + 1);
useCases.forEach(u => useCaseDistribution[u] = (useCaseDistribution[u] || 0) + 1);

return {
  sentiment: sentimentDistribution,
  useCases: useCaseDistribution,
  totalFeedbacks: this.feedbackDatabase.length,
  activeUsers: this.userSegments.size
};

}
}
// === MODULES D'INTELLIGENCE ===
const aiCollector = new AIFeedbackCollector();
// === PERSISTENCE & ANALYTICS ===
const MEMORY_FILE = path.join(__dirname, 'memory.json');
let HUMAN_SENSES_DB, sensorWeights, generation, memoryLog, analytics;
function loadMemory() {
if (fs.existsSync(MEMORY_FILE)) {
const data = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
HUMAN_SENSES_DB = data.HUMAN_SENSES_DB || getInitialSensations();
sensorWeights = data.sensorWeights || {};
generation = data.generation || 1;
memoryLog = data.memoryLog || [];
analytics = data.analytics || initAnalytics();
aiCollector.loadData(data.aiData || {});
console.log("🧠 Mémoire fractale restaurée. Sessions:", analytics.totalSessions);
} else {
HUMAN_SENSES_DB = getInitialSensations();
sensorWeights = {};
HUMAN_SENSES_DB.sensations.forEach(s => sensorWeights[s.id] = 1);
generation = 1;
memoryLog = [];
analytics = initAnalytics();
saveMemory();
console.log("🌱 Mémoire initialisée. Le Nexus s'éveille.");
}
}
function saveMemory() {
const aiData = aiCollector.exportData();
fs.writeFileSync(MEMORY_FILE, JSON.stringify({
HUMAN_SENSES_DB,
sensorWeights,
generation,
memoryLog,
analytics,
aiData
}, null, 2));
}
function getInitialSensations() {
return {
sensations: [
{ id: "sensation_01", description: "Neon Dreams", visual: { bgColor: "#ff006e", textColor: "#ffffff", particleColor: "#00f5ff" } },
{ id: "sensation_02", description: "Forest Whispers", visual: { bgColor: "#2d5016", textColor: "#90ee90", particleColor: "#228b22" } },
{ id: "sensation_03", description: "Cosmic Void", visual: { bgColor: "#0a0a2e", textColor: "#e94560", particleColor: "#16213e" } },
{ id: "sensation_04", description: "Golden Hour", visual: { bgColor: "#ff8c42", textColor: "#2c1810", particleColor: "#ffd23f" } },
{ id: "sensation_05", description: "Arctic Silence", visual: { bgColor: "#b8e6e6", textColor: "#2c5f5f", particleColor: "#ffffff" } },
{ id: "sensation_06", description: "Underground Jazz", visual: { bgColor: "#1a0a00", textColor: "#cd853f", particleColor: "#daa520" } },
{ id: "sensation_07", description: "Electric Storm", visual: { bgColor: "#4b0082", textColor: "#ffffff", particleColor: "#9370db" } },
{ id: "sensation_08", description: "Desert Wind", visual: { bgColor: "#d2691e", textColor: "#f4e4bc", particleColor: "#cd853f" } }
]
};
}
function initAnalytics() {
return {
totalSessions: 0,
totalActivations: 0,
sensationStats: {},
dailyStats: {},
avgSessionDuration: 0,
launchDate: new Date().toISOString()
};
}
// === ÉVOLUTION GÉNÉTIQUE (CORRIGÉE) - SensiGen Evolution Engine ===
function geneticEvolution() {
// CORRECTION: Basé sur les activations, pas sur le nombre de sensations
if (analytics.totalActivations < 50) return; // Seuil minimum d'activations
const sorted = Object.entries(sensorWeights).sort(([,a],[,b]) => b-a);
if (sorted.length < 2) return;
const parentA = HUMAN_SENSES_DB.sensations.find(s => s.id === sorted[0][0]);
const parentB = HUMAN_SENSES_DB.sensations.find(s => s.id === sorted[1][0]);
if (!parentA || !parentB) return;
const mutant = {
id: gen${generation++}_mutant_${Date.now()},
description: Evolution of ${parentA.description} & ${parentB.description},
visual: {
bgColor: mutateColor(parentA.visual.bgColor, parentB.visual.bgColor),
textColor: mutateColor(parentA.visual.textColor, parentB.visual.textColor),
particleColor: mutateColor(parentA.visual.particleColor, parentB.visual.particleColor)
},
parents: [parentA.id, parentB.id],
generation: generation - 1,
birthDate: new Date().toISOString()
};
HUMAN_SENSES_DB.sensations.push(mutant);
sensorWeights[mutant.id] = 1;
// Log de l'évolution
memoryLog.push({
timestamp: Date.now(),
event: 'mutation_created',
mutantId: mutant.id,
parents: [parentA.id, parentB.id],
generation: mutant.generation
});
saveMemory();
console.log(✨ ÉVOLUTION: ${mutant.id} né de ${parentA.description} + ${parentB.description});
return mutant;
}
function mutateColor(hexA, hexB) {
let {r: rA, g: gA, b: bA} = hexToRgb(hexA);
let {r: rB, g: gB, b: bB} = hexToRgb(hexB);
let r = Math.floor((rA + rB) / 2);
let g = Math.floor((gA + gB) / 2);
let b = Math.floor((bA + bB) / 2);
// Mutation aléatoire
r = Math.max(0, Math.min(255, r + (Math.random() * 60 - 30)));
g = Math.max(0, Math.min(255, g + (Math.random() * 60 - 30)));
b = Math.max(0, Math.min(255, b + (Math.random() * 60 - 30)));
return rgbToHex(Math.floor(r), Math.floor(g), Math.floor(b));
}
function hexToRgb(hex) {
const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
return result ? {
r: parseInt(result[1], 16),
g: parseInt(result[2], 16),
b: parseInt(result[3], 16)
} : null;
}
function rgbToHex(r, g, b) {
return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
// === SERVEUR HTTP ===
const server = http.createServer((req, res) => {
if (req.method === 'POST' && req.url === '/track') {
let body = '';
req.on('data', chunk => body += chunk);
req.on('end', () => {
try {
const data = JSON.parse(body);
    if (data.type === 'activation') {
      // Mise à jour analytics
      analytics.totalActivations++;
      if (!analytics.sensationStats[data.sensationId]) {
        analytics.sensationStats[data.sensationId] = { 
          activations: 0, 
          totalDuration: 0, 
          avgDuration: 0 
        };
      }
      analytics.sensationStats[data.sensationId].activations++;
      
      // Collecte IA
      aiCollector.collectImplicitFeedback(
        data.userId, 
        data.sensationId, 
        { 
          duration: data.duration,
          sequence: data.sequence || []
        }
      );

      // Mise à jour des poids pour l'évolution génétique (Neuro-Feedback Loop)
      if (data.duration > 0) {
        sensorWeights[data.sensationId] = 
          (sensorWeights[data.sensationId] || 1) + Math.sqrt(data.duration / 1000);
      }

      // Déclenchement évolution (CORRIGÉ: tous les 25 activations)
      if (analytics.totalActivations % 25 === 0) {
        const newMutant = geneticEvolution();
        if (newMutant) {
          // Notification de la nouvelle mutation dans la réponse
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            status: 'tracked', 
            mutation: newMutant 
          }));
          saveMemory();
          return;
        }
      }
      
    } else if (data.type === 'session') {
      analytics.totalSessions++;
      const today = new Date().toISOString().split('T')[0];
      if (!analytics.dailyStats[today]) {
        analytics.dailyStats[today] = { sessions: 0, activations: 0 };
      }
      analytics.dailyStats[today].sessions++;
      
      if (data.duration) {
        analytics.avgSessionDuration = 
          (analytics.avgSessionDuration + data.duration) / 2;
      }
    }

    saveMemory();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'tracked' }));
    
  } catch (e) {
    console.error('Erreur tracking:', e);
    res.writeHead(400);
    res.end('Invalid data');
  }
});

} else if (req.method === 'GET' && req.url === '/insights') {
// Endpoint pour les insights IA
const insights = aiCollector.generateInsights();
res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({
ai: insights,
analytics: analytics,
evolution: {
generation: generation,
totalMutations: HUMAN_SENSES_DB.sensations.filter(s => s.id.includes('mutant')).length,
topSensations: Object.entries(sensorWeights)
.sort(([,a],[,b]) => b-a)
.slice(0, 5)
}
}));
} else {
// Interface principale
res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
res.end(generateHTML());
}
});
function generateHTML() {
const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sensory Nexus - Cathedral of Evolution</title>
<style>
:root {
--bg-color1: #ff006e; --bg-color2: #ffffff;
--text-color: #ffffff; --particle-color: #00f5ff;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
min-height: 100vh;
background: linear-gradient(45deg, var(--bg-color1), var(--bg-color2));
background-size: 200% 200%;
animation: gradientBG 20s ease infinite;
color: var(--text-color);
transition: all 2s ease;
overflow-x: hidden;
}
@keyframes gradientBG {
0% { background-position: 0% 50%; }
50% { background-position: 100% 50%; }
100% { background-position: 0% 50%; }
}
#particle-canvas {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  z-index: -1; opacity: 0.3;
}

.content {
  position: relative; z-index: 1; text-align: center;
  padding: 2rem; min-height: 100vh;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
}

h1 {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 300; margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(255,255,255,0.5);
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: clamp(1rem, 3vw, 1.5rem);
  opacity: 0.9; font-weight: 300; margin-bottom: 3rem;
}

#sensation-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem; max-width: 1000px; width: 100%;
}

.sensation-btn {
  padding: 1rem 2rem; border: 2px solid var(--text-color);
  font-weight: 400; font-size: 1.1rem; border-radius: 12px;
  cursor: pointer; background: rgba(0,0,0,0.1);
  backdrop-filter: blur(10px); color: var(--text-color);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative; overflow: hidden;
}

.sensation-btn::before {
  content: ''; position: absolute; top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.sensation-btn:hover {
  background: rgba(255,255,255,0.15);
  transform: translateY(-5px) scale(1.02);
  border-color: var(--particle-color);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.sensation-btn:hover::before { left: 100%; }

.sensation-btn.active {
  background: rgba(255,255,255,0.25);
  transform: scale(1.05);
  box-shadow: 0 0 30px var(--particle-color);
}

.sensation-btn.mutant {
  border-style: dashed;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 var(--particle-color); }
  70% { box-shadow: 0 0 0 10px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

.info-panel {
  position: fixed; bottom: 2rem; right: 2rem;
  background: rgba(0,0,0,0.3); backdrop-filter: blur(10px);
  padding: 1rem; border-radius: 8px; font-size: 0.9rem;
  opacity: 0.7; transition: opacity 0.3s;
}

.info-panel:hover { opacity: 1; }

.mutation-alert {
  position: fixed; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.8); backdrop-filter: blur(20px);
  padding: 2rem; border-radius: 16px; text-align: center;
  animation: fadeInOut 4s forwards;
  z-index: 1000;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
}

@media (max-width: 768px) {
  .content { padding: 1rem; }
  #sensation-buttons { grid-template-columns: 1fr; gap: 1rem; }
  .info-panel { display: none; }
}

</style>
</head>
<body>
<canvas id="particle-canvas"></canvas>
<div class="content">
<h1>Sensory Nexus</h1>
<p class="subtitle">Cathedral of Evolution</p>
<div id="sensation-buttons"></div>
<audio id="audio-player"></audio>
</div>
<div class="info-panel">
<div>🧠 Génération: <span id="gen-counter">{generation}\</span\>\</div\>
\<div\>✨ Sessions: \<span id="session-counter"\>{analytics.totalSessions}</span></div>
<div>🔬 Mutations: <span id="mutation-counter">${HUMAN_SENSES_DB.sensations.filter(s => s.id.includes('mutant')).length}</span></div>
</div>
<script>
const DB = {JSON.stringify(HUMAN\_SENSES\_DB)};
const root = document.documentElement;
const audioP = document.getElementById('audio-player');
let currentActive = null;
let sessionId = '{sessionId}';
let sessionStart = Date.now();
let currentSensationId = null;
let sequence = [];
// === SYSTÈME DE PARTICULES (AJOUTÉ) ===
const canvas = document.getElementById(&#39;particle-canvas&#39;);
const ctx = canvas.getContext(&#39;2d&#39;);
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createParticles();
}

function createParticles() {
  particles = [];
  const numberOfParticles = Math.min(50, (canvas.width * canvas.height) / 15000);
  for (let i = 0; i &lt; numberOfParticles; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 0.5,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.5 + 0.2
    });
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const particleColor = getComputedStyle(root).getPropertyValue(&#39;--particle-color&#39;).trim();
  
  for (let p of particles) {
    p.x += p.speedX;
    p.y += p.speedY;
    
    if (p.x &gt; canvas.width || p.x &lt; 0) p.speedX *= -1;
    if (p.y &gt; canvas.height || p.y &lt; 0) p.speedY *= -1;
    
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = particleColor;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(animateParticles);
}

window.addEventListener(&#39;resize&#39;, resizeCanvas);
resizeCanvas();
animateParticles();

// === TRACKING &amp; FEEDBACK ===
function trackActivation(sensationId, duration) {
  if (!sensationId) return;
  sequence.push(sensationId);
  
  const data = {
    type: &#39;activation&#39;,
    sensationId,
    userId: sessionId,
    duration: duration || 0,
    sequence: sequence.slice(-5)
  };
  
  fetch(&#39;/track&#39;, {
    method: &#39;POST&#39;,
    headers: { &#39;Content-Type&#39;: &#39;application/json&#39; },
    body: JSON.stringify(data)
  })
  .then(response =&gt; response.json())
  .then(result =&gt; {
    if (result.mutation) {
      showMutationAlert(result.mutation);
      addNewMutationButton(result.mutation);
    }
  })
  .catch(e =&gt; console.log(&#39;Tracking offline&#39;));
}

function trackSession() {
  const duration = Date.now() - sessionStart;
  fetch(&#39;/track&#39;, {
    method: &#39;POST&#39;,
    headers: { &#39;Content-Type&#39;: &#39;application/json&#39; },
    body: JSON.stringify({ 
      type: &#39;session&#39;, 
      sessionId, 
      duration 
    })
  }).catch(e =&gt; console.log(&#39;Tracking offline&#39;));
}

// === GESTION DES SENSATIONS ===
function play(a) {
  if (a) {
    audioP.src = a;
    audioP.play().catch(e =&gt; console.log(&#39;Audio:&#39;, e.message));
  }
}

function stop() {
  audioP.pause();
  audioP.currentTime = 0;
}

function activate(exp, buttonEl) {
  if (currentActive === buttonEl) return;
  
  // Track la sensation précédente
  if (currentSensationId) {
    trackActivation(currentSensationId, Date.now() - sessionStart);
  }
  
  currentSensationId = exp.id;
  sessionStart = Date.now();

  // UI Updates
  if (currentActive) currentActive.classList.remove(&#39;active&#39;);
  buttonEl.classList.add(&#39;active&#39;);
  currentActive = buttonEl;
  
  // Visual transition
  root.style.setProperty(&#39;--bg-color1&#39;, exp.visual.bgColor);
  root.style.setProperty(&#39;--bg-color2&#39;, exp.visual.textColor);
  root.style.setProperty(&#39;--text-color&#39;, exp.visual.textColor);
  root.style.setProperty(&#39;--particle-color&#39;, exp.visual.particleColor);

  play(exp.audio);
  
  setTimeout(() =&gt; {
    stop();
    if (buttonEl.classList.contains(&#39;active&#39;)) {
      buttonEl.classList.remove(&#39;active&#39;);
      currentActive = null;
    }
  }, 8000);
}

function addBtn(s) {
  const b = document.createElement(&#39;button&#39;);
  b.textContent = s.description;
  b.className = &#39;sensation-btn&#39;;
  
  // Marquer les mutations
  if (s.id.includes(&#39;mutant&#39;)) {
    b.classList.add(&#39;mutant&#39;);
    b.title = &#39;Generated by Evolution Algorithm&#39;;
  }
  
  b.onclick = () =&gt; activate(s, b);
  document.getElementById(&#39;sensation-buttons&#39;).appendChild(b);
}

// === NOUVELLE MUTATION ===
function showMutationAlert(mutation) {
  const alert = document.createElement(&#39;div&#39;);
  alert.className = &#39;mutation-alert&#39;;
  alert.innerHTML = \`
    &lt;h2&gt;🧬 Évolution détectée !&lt;/h2&gt;
    &lt;p&gt;&lt;strong&gt;\${mutation.description}&lt;/strong&gt;&lt;/p&gt;
    &lt;p&gt;Une nouvelle sensation a émergé de l&#39;expérience collective&lt;/p&gt;
  \`;
  
  document.body.appendChild(alert);
  
  setTimeout(() =&gt; {
    if (document.body.contains(alert)) {
      alert.remove();
    }
  }, 4000);
}

function addNewMutationButton(mutation) {
  const buttonsDiv = document.getElementById(&#39;sensation-buttons&#39;);
  const b = document.createElement(&#39;button&#39;);
  b.textContent = mutation.description;
  b.className = &#39;sensation-btn mutant&#39;;
  b.title = &#39;Generated by Evolution Algorithm&#39;;
  b.onclick = () =&gt; activate(mutation, b);
  buttonsDiv.prepend(b); // Ajoutez le nouveau bouton au début
}

// Initialisation
DB.sensations.forEach(addBtn);
trackSession();
window.addEventListener(&#39;beforeunload&#39;, trackSession);

// Fonction de rechargement périodique pour les nouveaux mutants
setInterval(() =&gt; {
    fetch(&#39;/insights&#39;)
        .then(res =&gt; res.json())
        .then(data =&gt; {
            const currentButtons = Array.from(document.querySelectorAll(&#39;.sensation-btn&#39;)).map(b =&gt; b.textContent);
            const serverSensations = data.evolution.topSensations;
            
            // Mettre à jour les compteurs
            document.getElementById(&#39;gen-counter&#39;).textContent = data.evolution.generation;
            document.getElementById(&#39;session-counter&#39;).textContent = data.analytics.totalSessions;
            document.getElementById(&#39;mutation-counter&#39;).textContent = data.evolution.totalMutations;
            
            // Vérifier si de nouveaux mutants sont apparus
            // NOTE: Cette logique est une simplification, idéalement on ferait un check plus précis
            const mutantIdsOnServer = data.evolution.topSensations.filter(s =&gt; s[0].includes(&#39;mutant&#39;));
            if (mutantIdsOnServer.length &gt; 0 &amp;&amp; !currentButtons.some(b =&gt; b.includes(&#39;Evolution&#39;))) {
                // C&#39;est un peu &quot;hacky&quot;, mais pour le moment, c&#39;est suffisant pour le prototype
                window.location.reload(); 
            }
        })
        .catch(e =&gt; console.error(&quot;Could not fetch insights&quot;));
}, 10000); // Rafraîchissement toutes les 10 secondes pour le prototype

</script>
</body>
</html>`;
}
loadMemory();
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(🏛️ Cathédrale avec mémoire vivante sur http://localhost:${PORT}));
# sb1-runvdo7n

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/bertcentral/sb1-runvdo7n)