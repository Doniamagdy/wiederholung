
const $ = s => document.querySelector(s);

/* ---------- Aussprache ---------- */
let deVoice = null;

function loadVoice() {
  deVoice = speechSynthesis.getVoices()
    .find(v => v.lang.startsWith('de')) || null;
}

if ('speechSynthesis' in window) {
  loadVoice();
  speechSynthesis.onvoiceschanged = loadVoice;
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;

  speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE';
  u.rate = 0.8;

  if (deVoice) u.voice = deVoice;

  speechSynthesis.speak(u);
}

function speakList(rows) {
  if (!('speechSynthesis' in window)) return;

  speechSynthesis.cancel();

  rows.forEach(r => {
    const u = new SpeechSynthesisUtterance(r.dataset.say);
    u.lang = 'de-DE';
    u.rate = 0.8;

    if (deVoice) u.voice = deVoice;

    u.onstart = () => r.classList.add('playing');
    u.onend = () => r.classList.remove('playing');

    speechSynthesis.speak(u);
  });
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-say]');
  if (el && !el.closest('.card')) speak(el.dataset.say);
});

/* ---------- Navigation ---------- */
const sections = [...document.querySelectorAll('section')];
const links = [...document.querySelectorAll('#nav a')];

function route() {
  const id = (location.hash || '#w-fragen').slice(1);
  const target = sections.some(s => s.id === id) ? id : 'w-fragen';

  sections.forEach(s =>
    s.classList.toggle('on', s.id === target)
  );

  links.forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === '#' + target)
  );

  window.scrollTo({ top: 0 });
}

window.addEventListener('hashchange', route);

/* ---------- Daten ---------- */

const PRON = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
const END = ['e', 'st', 't', 'en', 't', 'en'];
const SAY_PRON = ['ich', 'du', 'er', 'wir', 'ihr', 'sie'];

const VERBS = [
  ['wohnen', 'wohn', '🏠'],
  ['lernen', 'lern', '📚'],
  ['spielen', 'spiel', '⚽'],
  ['machen', 'mach', '🛠️'],
  ['kochen', 'koch', '🍳'],
  ['trinken', 'trink', '🥤'],
  ['lachen', 'lach', '😂'],
  ['singen', 'sing', '🎤'],
  ['malen', 'mal', '🎨'],
  ['hören', 'hör', '🎧']
];

const HABEN = ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'];
const SEIN = ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'];

const HS_EX = [
  ['Ich habe Hunger.', '🍕'],
  ['Du hast ein Buch.', '📖'],
  ['Er hat eine Katze.', '🐱'],
  ['Wir haben Zeit.', '⏰'],
  ['Ich bin müde.', '😴'],
  ['Du bist nett.', '😊'],
  ['Sie ist Lehrerin.', '👩‍🏫'],
  ['Wir sind in Kairo.', '📍'],
  ['Ihr seid Studenten.', '🎓']
];

const QUESTIONS = [
  {
    e: '🏠',
    q: 'Wohnst du in Kairo?',
    yes: 'Ja, ich wohne in Kairo.',
    no: 'Nein, ich wohne nicht in Kairo.',
    neg: 'nicht'
  },
  {
    e: '😂',
    q: 'Lachst du?',
    yes: 'Ja, ich lache.',
    no: 'Nein, ich lache nicht.',
    neg: 'nicht'
  },
  {
    e: '🎤',
    q: 'Singst du gern?',
    yes: 'Ja, ich singe gern.',
    no: 'Nein, ich singe nicht gern.',
    neg: 'nicht'
  },
  {
    e: '😴',
    q: 'Bist du müde?',
    yes: 'Ja, ich bin müde.',
    no: 'Nein, ich bin nicht müde.',
    neg: 'nicht'
  },
  {
    e: '📱',
    q: 'Hast du ein Handy?',
    yes: 'Ja, ich habe ein Handy.',
    no: 'Nein, ich habe kein Handy.',
    neg: 'kein'
  },
  {
    e: '🍕',
    q: 'Hast du Hunger?',
    yes: 'Ja, ich habe Hunger.',
    no: 'Nein, ich habe keinen Hunger.',
    neg: 'keinen'
  }
];

/* ---------- Hilfen ---------- */

function makeCard(emoji, title, sub, onClick) {
  const b = document.createElement('button');

  b.className = 'card';

  b.innerHTML = `
    <span class="e">${emoji}</span>
    <b>${title}</b>
    ${sub ? `<small>${sub}</small>` : ''}
  `;

  b.onclick = () => onClick(b);

  return b;
}

function selectOnly(container, btn) {
  container.querySelectorAll('.card').forEach(c =>
    c.classList.remove('sel')
  );

  btn.classList.add('sel');
}

function fillTable(table, stem, ends, words) {
  table.innerHTML = PRON.map((p, i) =>
    `<tr tabindex="0" data-say="${SAY_PRON[i]} ${words[i]}">
      <td>${p}</td>
      <td>
        <span class="stem">${stem}</span>
        <span class="end">${ends[i]}</span>
      </td>
    </tr>`
  ).join('');
}

function plainTable(table, forms) {
  table.innerHTML = PRON.map((p, i) =>
    `<tr tabindex="0" data-say="${SAY_PRON[i]} ${forms[i]}">
      <td>${p}</td>
      <td><span class="stem">${forms[i]}</span></td>
    </tr>`
  ).join('');
}

/* ---------- 1. W-Fragen ---------- */

const WQ = [
  ['Wer', '👤', 'bist', 'du?', 'Ich bin Sara.'],
  ['Was', '🤔', 'machst', 'du?', 'Ich lerne Deutsch.'],
  ['Wo', '📍', 'wohnst', 'du?', 'Ich wohne in Kairo.'],
  ['Woher', '🌍', 'kommst', 'du?', 'Ich komme aus Ägypten.'],
  ['Wohin', '🚶', 'gehst', 'du?', 'Ich gehe nach Hause.'],
  ['Wie', '💬', 'heißt', 'du?', 'Ich heiße Sara.'],
  ['Wie alt', '🎂', 'bist', 'du?', 'Ich bin zwanzig Jahre alt.'],
  ['Wann', '⏰', 'lernst', 'du?', 'Ich lerne am Montag.'],
  ['Warum', '❓', 'lernst', 'du Deutsch?', 'Weil ich Deutsch mag.'],
  ['Wie oft', '🔁', 'lernst', 'du?', 'Ich lerne dreimal pro Woche.'],
  ['Wie lange', '⌛', 'wohnst', 'du hier?', 'Ich wohne seit zwei Jahren hier.'],
  ['Wie viel', '💶', 'kostet', 'das?', 'Das kostet zehn Euro.'],
  ['Wie viele Geschwister', '👦👧', 'hast', 'du?', 'Ich habe zwei Geschwister.']
];

const wc = $('#wCards');
let wCur = WQ[0];

function showW(q, btn) {
  wCur = q;

  const [w, e, v, r] = q;

  $('#wEmoji').textContent = e;

  const Q = $('#wQuestion');

  Q.innerHTML = `
    <span class="w">${w}</span>
    <span class="end">${v}</span> ${r}
  `;

  Q.dataset.say = `${w} ${v} ${r}`;

  $('#wAnswer').textContent = '';
  $('#wAnswer').dataset.say = '';

  if (btn) selectOnly(wc, btn);
}

WQ.forEach(q =>
  wc.appendChild(
    makeCard(q[1], q[0] + '?', '', b => {
      showW(q, b);
      speak(`${q[0]} ${q[2]} ${q[3]}`);
    })
  )
);

showW(WQ[0], wc.children[0]);

$('#wBtn').onclick = () => {
  const a = $('#wAnswer');

  a.textContent = wCur[4];
  a.dataset.say = wCur[4];

  speak(wCur[4]);
};

/* ---------- 2. Regelmäßige Verben ---------- */

const picker = $('#verbPicker');
const rvTable = $('#rvTable');

function showVerb(i, btn) {
  const [inf, stem, em] = VERBS[i];

  $('#rvEmoji').textContent = em;
  $('#rvTitle').textContent = inf;

  fillTable(rvTable, stem, END, END.map(e => stem + e));

  if (btn) selectOnly(picker, btn);
}

VERBS.forEach((v, i) =>
  picker.appendChild(
    makeCard(v[2], v[0], '', b => {
      showVerb(i, b);
      speak(v[0]);
    })
  )
);

showVerb(0, picker.children[0]);

$('#rvAll').onclick = () =>
  speakList([...rvTable.querySelectorAll('tr')]);

$('#endTable').innerHTML = PRON.map((p, i) =>
  `<span class="pill">${p} → <b>-${END[i]}</b></span>`
).join('');

/* ---------- 3. haben & sein ---------- */

plainTable($('#haben'), HABEN);
plainTable($('#sein'), SEIN);

document.querySelectorAll('[data-all]').forEach(b => {
  b.onclick = () => {
    speakList([
      ...$('#' + b.dataset.all).querySelectorAll('tr')
    ]);
  };
});

$('#hsEx').innerHTML = HS_EX.map(([s, e]) =>
  `<li data-say="${s}">${e} ${s}</li>`
).join('');

/* ---------- 4. Ja/Nein-Fragen ---------- */

const qp = $('#qPicker');
let cur = QUESTIONS[0];

function showAnswer(kind) {
  let t = cur[kind];

  if (kind === 'no') {
    t = t.replace(
      ` ${cur.neg} `,
      ` <span class="nicht">${cur.neg}</span> `
    );
  }

  const a = $('#qAnswer');

  a.innerHTML = t;
  a.dataset.say = cur[kind];

  speak(cur[kind]);
}

function showQuestion(q, btn) {
  cur = q;

  $('#qText').textContent = q.e + ' ' + q.q;
  $('#qText').dataset.say = q.q;

  $('#qAnswer').textContent = 'Klick auf Ja oder Nein.';
  $('#qAnswer').dataset.say = '';

  if (btn) selectOnly(qp, btn);
}

QUESTIONS.forEach(q =>
  qp.appendChild(
    makeCard(q.e, q.q, '', b => {
      showQuestion(q, b);
      speak(q.q);
    })
  )
);

showQuestion(QUESTIONS[0], qp.children[0]);

$('#yesBtn').onclick = () => showAnswer('yes');
$('#noBtn').onclick = () => showAnswer('no');

/* ---------- 5. Familie ---------- */

const FAMILY = [
  ['die Mutter', '👩',
   'Sie ist eine Frau. Sie hat ein Kind.'],

  ['der Vater', '👨',
   'Er ist ein Mann. Er hat ein Kind.'],

  ['die Eltern', '👨‍👩',
   'Das sind die Mutter und der Vater.'],

  ['die Großmutter', '👵',
   'Sie ist die Mutter von der Mutter oder vom Vater.'],

  ['der Großvater', '👴',
   'Er ist der Vater von der Mutter oder vom Vater.'],

  ['die Oma', '👵',
   'Sie ist eine Großmutter.'],

  ['der Opa', '👴',
   'Er ist ein Großvater.'],

  ['der Bruder', '👦',
   'Er ist ein Junge in der Familie.'],

  ['die Schwester', '👧',
   'Sie ist ein Mädchen in der Familie.'],

  ['die Geschwister', '👦👧',
   'Das sind Bruder und Schwester.'],

  ['der Onkel', '🧔',
   'Er ist der Bruder von der Mutter oder vom Vater.'],

  ['die Tante', '👩',
   'Sie ist die Schwester von der Mutter oder vom Vater.'],

  ['der Sohn', '👶',
   'Er ist ein männliches Kind.'],

  ['die Tochter', '👧',
   'Sie ist ein weibliches Kind.'],

  ['der Cousin', '👦',
   'Er ist der Sohn von der Tante oder vom Onkel.'],

  ['die Cousine', '👧',
   'Sie ist die Tochter von der Tante oder vom Onkel.']
];

const fc = $('#famCards');

FAMILY.forEach(([word, emoji, explanation]) => {
  fc.appendChild(
    makeCard(emoji, word, '', b => {
      selectOnly(fc, b);

      const el = $('#famSentence');

      el.innerHTML = `
        <h3>${word}</h3>
        <p>${explanation}</p>
      `;

      el.dataset.say = `${word}. ${explanation}`;

      speak(`${word}. ${explanation}`);
    })
  );
});

/* ---------- Start ---------- */

route();
