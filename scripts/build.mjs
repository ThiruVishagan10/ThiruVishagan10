#!/usr/bin/env node
/**
 * PROJECT SELENE — profile generator
 * Reads selene.config.json and regenerates the data-driven assets + README.
 * Static assets (banner, divider, stack, *-cyan) are never touched.
 *
 * Usage: node scripts/build.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(ROOT, 'selene.config.json'), 'utf8'));

/* ─────────────────── theme tokens (edit here to retheme) ─────────────────── */
const T = {
  bg: '#0A0A0B', glass0: '#17140E', glass1: '#100E0A', glassCard: '#14120E',
  gold: '#E8C25A', goldPale: '#FBEBB0', goldDeep: '#C89B32', goldInk: '#17130A',
  amber: '#E0A23A', amberDim: '#B78B3A',
  text: '#F5EFE0', chip: '#DED6C2', body: '#B8B0A0', muted: '#8C846F', muted2: '#9A9384', muted3: '#6E675A',
};

/* ─────────────────── helpers ─────────────────── */
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s = '') => esc(s).replace(/"/g, '&quot;');
const chipW = (label) => Math.max(44, Math.round(label.length * 7.0) + 22);
const write = (rel, content) => { const p = join(ROOT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, content); console.log('  ✓', rel); };
// bold **x** -> <strong>x</strong> for README prose (markdown already supports it, so passthrough)
const stripId = (s) => s.replace(/[^a-z0-9]/gi, '');

/* ═══════════════════ TERMINAL ═══════════════════ */
function buildTerminal() {
  const lines = [];
  cfg.terminal.forEach((p) => { lines.push({ type: 'cmd', text: p.cmd }); lines.push({ type: 'out', text: p.out, kind: p.kind || 'value' }); });
  const N = lines.length;
  const y0 = 103, step = 31;
  const cursorBase = y0 + N * step;
  const vbH = cursorBase + 45;
  const winH = vbH - 20;

  const clips = lines.map((_, i) =>
    `    <clipPath id="c${i + 1}"><rect x="34" y="${84 + i * step}" width="0" height="26"><animate attributeName="width" values="0;620" dur="0.55s" begin="${(0.40 + i * 0.85).toFixed(2)}s" fill="freeze"/></rect></clipPath>`
  ).join('\n');

  const rows = lines.map((ln, i) => {
    const b = y0 + i * step;
    if (ln.type === 'cmd') {
      return `    <g clip-path="url(#c${i + 1})"><text x="40" y="${b}" fill="url(#tGold)" font-weight="700">❯</text><text x="66" y="${b}" fill="${T.text}">${esc(ln.text)}</text></g>`;
    }
    if (ln.kind === 'status') {
      return `    <g clip-path="url(#c${i + 1})"><circle cx="72" cy="${b - 6}" r="4.5" fill="${T.gold}"/><text x="86" y="${b}" fill="#A29B8A">${esc(ln.text)}</text></g>`;
    }
    const fill = ln.kind === 'text' ? '#D8D0BC' : T.gold;
    const weight = ln.kind === 'text' ? '400' : '700';
    return `    <g clip-path="url(#c${i + 1})"><text x="66" y="${b}" fill="${fill}" font-weight="${weight}">${esc(ln.text)}</text></g>`;
  }).join('\n');

  const cursorBegin = (0.40 + N * 0.85).toFixed(2);

  return `<svg viewBox="0 0 900 ${vbH}" fill="none" xmlns="http://www.w3.org/2000/svg"
     font-family="'SF Mono','JetBrains Mono',Consolas,'Courier New',monospace">
  <title>PROJECT SELENE — Boot Terminal</title>
  <defs>
    <linearGradient id="tGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T.goldPale}"/><stop offset="0.5" stop-color="${T.gold}"/><stop offset="1" stop-color="${T.goldDeep}"/></linearGradient>
    <radialGradient id="tGlow" cx="0.5" cy="0" r="0.9"><stop offset="0" stop-color="${T.gold}" stop-opacity="0.10"/><stop offset="1" stop-color="${T.bg}" stop-opacity="0"/></radialGradient>
    <filter id="tShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="#000000" flood-opacity="0.55"/></filter>
${clips}
  </defs>
  <g filter="url(#tShadow)"><rect x="10" y="10" width="880" height="${winH}" rx="16" fill="#0C0C0E" stroke="${T.gold}" stroke-opacity="0.16"/></g>
  <rect x="10" y="10" width="880" height="${winH}" rx="16" fill="url(#tGlow)"/>
  <path d="M10 26 A16 16 0 0 1 26 10 H874 A16 16 0 0 1 890 26 V50 H10 Z" fill="#151310"/>
  <line x1="10" y1="50" x2="890" y2="50" stroke="${T.gold}" stroke-opacity="0.14"/>
  <circle cx="36" cy="30" r="6" fill="${T.gold}"/><circle cx="58" cy="30" r="6" fill="${T.goldDeep}"/><circle cx="80" cy="30" r="6" fill="#6E5417"/>
  <text x="450" y="35" text-anchor="middle" font-size="13" fill="${T.muted}" letter-spacing="1">selene@profile — zsh</text>
  <g font-size="18">
${rows}
    <text x="40" y="${cursorBase}" fill="url(#tGold)" font-weight="700" opacity="0">❯<set attributeName="opacity" to="1" begin="${cursorBegin}s"/></text>
    <rect x="66" y="${cursorBase - 16}" width="11" height="21" fill="${T.gold}" opacity="0"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1s" begin="${cursorBegin}s" repeatCount="indefinite"/></rect>
  </g>
</svg>
`;
}

/* ═══════════════════ PROJECT CARD ═══════════════════ */
const STATUS = {
  'shipped':     { color: T.gold,  labelColor: T.gold,  text: 'SHIPPED',     pulse: false },
  'in-progress': { color: T.amber, labelColor: T.amber, text: 'IN PROGRESS', pulse: true },
  'planning':    { color: T.muted, labelColor: '#A29B8A', text: 'PLANNING',  pulse: false },
};

function buildProject(p, i) {
  const s = STATUS[p.status] || STATUS['planning'];
  const id = stripId(p.repo) || stripId(p.name);
  const begin = (0.10 + i * 0.12).toFixed(2);
  const pillW = Math.round(s.text.length * 6.6) + 34;
  const pillX = 558 - pillW;
  const initFont = p.initialFont === 'mono' ? ` font-family="monospace"` : '';
  const initSize = p.initialFont === 'mono' ? 19 : 18;
  const tag = p.tag ? ` <tspan font-size="13" font-weight="400" fill="${T.muted}">${esc(p.tag)}</tspan>` : '';

  let x = 22;
  const chips = p.tech.map((t) => {
    const w = chipW(t);
    const g = `      <rect x="${x}" y="140" width="${w}" height="26" rx="13" fill="${T.gold}" fill-opacity="0.06" stroke="${T.gold}" stroke-opacity="0.28"/><text x="${x + w / 2}" y="157" text-anchor="middle">${esc(t)}</text>`;
    x += w + 10; return g;
  }).join('\n');

  const pulseDot = s.pulse
    ? `<circle cx="17" cy="12" r="3.5" fill="${s.color}"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle>`
    : `<circle cx="17" cy="12" r="3.5" fill="${s.color}"/>`;

  const desc = p.desc.map((d, k) => `    <text x="24" y="${90 + k * 20}" font-size="13.5" fill="${T.body}">${esc(d)}</text>`).join('\n');

  return `<svg viewBox="0 0 580 250" fill="none" xmlns="http://www.w3.org/2000/svg"
     font-family="'Segoe UI', system-ui, Helvetica, Arial, sans-serif">
  <title>${escAttr(p.name)} — ${escAttr(p.desc.join(' '))}</title>
  <defs>
    <linearGradient id="glass${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.glass0}"/><stop offset="1" stop-color="${T.glass1}"/></linearGradient>
    <linearGradient id="tile${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T.goldPale}"/><stop offset="0.55" stop-color="${T.gold}"/><stop offset="1" stop-color="${T.goldDeep}"/></linearGradient>
  </defs>
  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.7s" begin="${begin}s" fill="freeze"/>
    <rect x="2" y="2" width="576" height="246" rx="16" fill="url(#glass${id})" stroke="${T.gold}" stroke-opacity="0.14"/>
    <rect x="2" y="20" width="4" height="210" rx="2" fill="${s.color}"/>
    <rect x="22" y="22" width="32" height="32" rx="9" fill="url(#tile${id})"/>
    <text x="38" y="45" text-anchor="middle" font-size="${initSize}" font-weight="800" fill="${T.goldInk}"${initFont}>${esc(p.initial)}</text>
    <text x="66" y="45" font-size="20" font-weight="700" fill="${T.gold}">${esc(p.name)}${tag}</text>
    <g transform="translate(${pillX} 22)">
      <rect width="${pillW}" height="24" rx="12" fill="none" stroke="${s.color}" stroke-opacity="0.6"/>
      ${pulseDot}
      <text x="30" y="16" font-size="10.5" letter-spacing="1" fill="${s.labelColor}" font-family="monospace">${s.text}</text>
    </g>
${desc}
    <g font-size="12.5" fill="${T.chip}">
${chips}
    </g>
    <rect x="22" y="192" width="536" height="1" fill="${T.gold}" fill-opacity="0.08"/>
    <text x="22" y="222" font-size="13" font-weight="600" fill="${T.gold}" font-family="monospace">❯ view repository</text>
    <text x="558" y="222" text-anchor="end" font-size="12" fill="${T.muted}" font-family="monospace">${esc(cfg.identity.username)}/${esc(p.repo)} ↗</text>
  </g>
</svg>
`;
}

/* ═══════════════════ ROADMAP ═══════════════════ */
function buildRoadmap() {
  const R = cfg.roadmap, M = R.milestones, N = M.length;
  const x0 = 80, x1 = 1120, xAt = (i) => x0 + i * ((x1 - x0) / (N - 1));
  let frontier = 0;
  M.forEach((m, i) => { if (m.status === 'done' || m.status === 'learning') frontier = i; });
  const progX = xAt(frontier), dashLen = (progX - x0).toFixed(1);
  const score = M.reduce((a, m) => a + (m.status === 'done' ? 1 : m.status === 'learning' ? 0.5 : 0), 0);
  const pct = Math.round((score / N) * 100);
  const meter = Math.round(260 * pct / 100);

  const futureLine = frontier < N - 1
    ? `  <line x1="${progX.toFixed(1)}" y1="170" x2="1120" y2="170" stroke="${T.muted}" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="2 9"/>`
    : '';

  let doneOrder = 0;
  const nodes = M.map((m, i) => {
    const x = xAt(i).toFixed(1);
    if (m.status === 'done') {
      const b = (0.7 + doneOrder * 0.3).toFixed(1); doneOrder++;
      return `  <g transform="translate(${x} 170)"><circle r="18" fill="url(#nodeGold)" stroke="${T.goldPale}" stroke-opacity="0.5"/><path d="M-7 0 l5 5.5 l9 -11" fill="none" stroke="${T.goldInk}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="26" stroke-dashoffset="26"><animate attributeName="stroke-dashoffset" values="26;0" dur="0.4s" begin="${b}s" fill="freeze"/></path></g>`;
    }
    if (m.status === 'learning') {
      return `  <g transform="translate(${x} 170)"><circle r="18" fill="none" stroke="${T.amber}" stroke-width="2.5"><animate attributeName="r" values="18;30" dur="2.2s" begin="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.7;0" dur="2.2s" begin="1.6s" repeatCount="indefinite"/></circle><circle r="18" fill="${T.glassCard}" stroke="${T.amber}" stroke-width="2.5"/><circle r="5.5" fill="${T.amber}"><animate attributeName="opacity" values="1;0.35;1" dur="1.6s" begin="1.6s" repeatCount="indefinite"/></circle></g>`;
    }
    return `  <g transform="translate(${x} 170)"><circle r="15" fill="${T.glassCard}" stroke="${T.gold}" stroke-opacity="0.35" stroke-width="1.5"/><circle r="2.5" fill="${T.muted}"/></g>`;
  }).join('\n');

  const labels = M.map((m, i) => {
    const x = xAt(i).toFixed(1);
    const col = m.status === 'done' ? T.gold : m.status === 'learning' ? T.amber : T.muted2;
    return `    <text x="${x}" y="212" font-size="14.5" font-weight="600" fill="${col}">${esc(m.label)}</text>`;
  }).join('\n');
  const statuses = M.map((m, i) => {
    const x = xAt(i).toFixed(1);
    const txt = m.status === 'done' ? 'DONE' : m.status === 'learning' ? 'LEARNING' : 'PLANNED';
    const col = m.status === 'done' ? T.muted : m.status === 'learning' ? T.amberDim : T.muted3;
    return `    <text x="${x}" y="232" font-size="10" letter-spacing="1.5" fill="${col}" font-family="monospace">${txt}</text>`;
  }).join('\n');

  return `<svg viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg"
     font-family="'Segoe UI', system-ui, Helvetica, Arial, sans-serif">
  <title>${escAttr(R.title)} — ${escAttr(M.map(m => m.label + ' (' + m.status + ')').join(', '))}</title>
  <defs>
    <linearGradient id="trackGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T.goldDeep}"/><stop offset="1" stop-color="${T.goldPale}"/></linearGradient>
    <radialGradient id="nodeGold" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#FFF6D6"/><stop offset="0.55" stop-color="${T.gold}"/><stop offset="1" stop-color="#B8860B"/></radialGradient>
    <linearGradient id="titleGoldR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T.goldPale}"/><stop offset="1" stop-color="${T.goldDeep}"/></linearGradient>
    <filter id="glowR" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <text x="40" y="50" font-size="25" font-weight="700" letter-spacing="2" fill="url(#titleGoldR)">${esc(R.title)}</text>
  <text x="42" y="74" font-size="13" fill="${T.muted}" font-family="monospace">${esc(R.subtitle)}</text>
  <text x="900" y="34" font-size="11" letter-spacing="1.5" fill="${T.muted}" font-family="monospace">MILESTONES</text>
  <text x="1160" y="34" text-anchor="end" font-size="15" font-weight="700" fill="${T.gold}" font-family="monospace">${pct}%</text>
  <rect x="900" y="44" width="260" height="8" rx="4" fill="#2A2620"/>
  <rect x="900" y="44" width="0" height="8" rx="4" fill="url(#trackGold)"><animate attributeName="width" values="0;${meter}" dur="1.4s" begin="0.3s" fill="freeze"/></rect>
  <line x1="80" y1="170" x2="1120" y2="170" stroke="${T.gold}" stroke-opacity="0.12" stroke-width="3"/>
${futureLine}
  <line x1="80" y1="170" x2="${progX.toFixed(1)}" y2="170" stroke="url(#trackGold)" stroke-width="4" stroke-linecap="round" filter="url(#glowR)" stroke-dasharray="${dashLen}" stroke-dashoffset="${dashLen}"><animate attributeName="stroke-dashoffset" values="${dashLen};0" dur="1.4s" begin="0.3s" fill="freeze"/></line>
${nodes}
  <g text-anchor="middle">
${labels}
${statuses}
  </g>
  <g font-family="monospace" font-size="11" transform="translate(40 278)">
    <circle cx="6" cy="-4" r="5" fill="url(#nodeGold)"/><text x="18" y="0" fill="${T.muted2}">shipped</text>
    <circle cx="112" cy="-4" r="5" fill="${T.glassCard}" stroke="${T.amber}" stroke-width="2"/><text x="124" y="0" fill="${T.muted2}">in progress</text>
    <circle cx="248" cy="-4" r="5" fill="${T.glassCard}" stroke="${T.gold}" stroke-opacity="0.4" stroke-width="1.5"/><text x="260" y="0" fill="${T.muted2}">planned</text>
  </g>
</svg>
`;
}

/* ═══════════════════ CONTACT BUTTONS ═══════════════════ */
function contactChannels() {
  const c = cfg.contact, u = cfg.identity.username;
  const out = [];
  if (c.email)     out.push({ key: 'email',     glyph: '@',  gf: '', label: 'Email',     sub: c.email,                       href: 'mailto:' + c.email });
  out.push({ key: 'github', glyph: 'GH', gf: ' font-family="monospace"', label: 'GitHub', sub: '@' + u, href: 'https://github.com/' + u });
  if (c.linkedin)  out.push({ key: 'linkedin',  glyph: 'in', gf: '', label: 'LinkedIn',  sub: 'connect →',                    href: c.linkedin });
  if (c.portfolio) out.push({ key: 'portfolio', glyph: '↗',  gf: '', label: 'Portfolio', sub: 'visit →',                      href: c.portfolio });
  if (c.resume)    out.push({ key: 'resume',     glyph: 'CV', gf: ' font-family="monospace"', label: 'Résumé', sub: 'download ↓', href: c.resume });
  return out;
}

function buildContactButton(ch) {
  const id = ch.key;
  const inner = Math.max(ch.label.length * 8.2, ch.sub.length * 6.7); // label 14.5 bold vs sub 11 mono
  const W = Math.round(Math.max(150, 56 + inner + 16));
  return `<svg viewBox="0 0 ${W} 54" fill="none" xmlns="http://www.w3.org/2000/svg"
     font-family="'Segoe UI', system-ui, Helvetica, Arial, sans-serif">
  <title>${escAttr(ch.label)}</title>
  <defs>
    <linearGradient id="cg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.glass0}"/><stop offset="1" stop-color="${T.glass1}"/></linearGradient>
    <linearGradient id="ct${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T.goldPale}"/><stop offset="0.55" stop-color="${T.gold}"/><stop offset="1" stop-color="${T.goldDeep}"/></linearGradient>
  </defs>
  <rect x="1" y="1" width="${W - 2}" height="52" rx="14" fill="url(#cg${id})" stroke="${T.gold}" stroke-opacity="0.22"/>
  <rect x="12" y="11" width="32" height="32" rx="9" fill="url(#ct${id})"/>
  <text x="28" y="33" text-anchor="middle" font-size="15" font-weight="800" fill="${T.goldInk}"${ch.gf}>${esc(ch.glyph)}</text>
  <text x="56" y="26" font-size="14.5" font-weight="700" fill="${T.gold}">${esc(ch.label)}</text>
  <text x="56" y="42" font-size="11" fill="${T.muted}" font-family="monospace">${esc(ch.sub)}</text>
</svg>
`;
}

/* ═══════════════════ README ═══════════════════ */
function buildReadme(channels) {
  const u = cfg.identity.username;
  const projectCells = cfg.projects.map((p) =>
`      <a href="https://github.com/${u}/${p.repo}">
        <img src="./assets/projects/${p.repo}.svg" width="100%" alt="${escAttr(p.name + ' — ' + p.desc.join(' ') + ' · ' + p.tech.join(', ') + ' · ' + (STATUS[p.status]?.text || ''))}" />
      </a>`);
  // 2-per-row
  let projRows = '';
  for (let i = 0; i < projectCells.length; i += 2) {
    projRows += `  <tr>\n    <td width="50%">\n${projectCells[i]}\n    </td>\n    <td width="50%">\n${projectCells[i + 1] || ''}\n    </td>\n  </tr>\n`;
  }

  const factsRows = cfg.about.facts.map(f => `        <tr><td valign="top"><b>${esc(f.label)}</b></td><td valign="top">&nbsp;&nbsp;${esc(f.value)}</td></tr>`).join('\n');

  const contactCells = channels.map(ch =>
    `    <td align="center"><a href="${escAttr(ch.href)}"><img src="./assets/contact/${ch.key}.svg" height="54" alt="${escAttr(ch.label)}" /></a></td>`
  ).join('\n');

  const A = (p) => `https://github-readme-stats.vercel.app/api${p}`;

  return `<!--
  ██████  PROJECT SELENE  ██████
  ⚠  GENERATED FILE — do not edit by hand.
  Edit selene.config.json and push; the Build Profile action regenerates this.
  ${cfg.identity.name} · ${cfg.identity.role} · github.com/${u}
-->

<!-- ══════════ 01 · HERO ══════════ -->
<p align="center">
  <img src="./assets/banner.svg" width="88%" alt="PROJECT SELENE — ${escAttr(cfg.identity.name)}, ${escAttr(cfg.identity.role)}" />
</p>

<!-- hover the nav for a little terminal flavour · you're already reading the source, nice -->
<p align="center">
  <a href="#-about" title="cd ~/about"><samp>about</samp></a> &nbsp;·&nbsp;
  <a href="#-stack" title="ls ./stack"><samp>stack</samp></a> &nbsp;·&nbsp;
  <a href="#-projects" title="git log --oneline"><samp>projects</samp></a> &nbsp;·&nbsp;
  <a href="#-analytics" title="top"><samp>analytics</samp></a> &nbsp;·&nbsp;
  <a href="#-roadmap" title="cat roadmap.2026"><samp>roadmap</samp></a> &nbsp;·&nbsp;
  <a href="#-contact" title="./say-hi.sh"><samp>contact</samp></a>
</p>

<!-- ══════════ CONTACT · prioritised, top of profile ══════════ -->
<a id="-contact"></a>
<p align="center"><sub><samp>❯ ./say-hi.sh</samp></sub></p>
<table align="center">
  <tr>
${contactCells}
  </tr>
</table>

<!-- ══════════ 02 · BOOT TERMINAL ══════════ -->
<p align="center">
  <img src="./assets/terminal.svg" width="700" alt="Boot terminal" />
</p>

<p align="center"><img src="./assets/divider.svg" width="88%" alt="" /></p>

<!-- ══════════ 03 · ABOUT ══════════ -->
<a id="-about"></a>
<h2>❯&nbsp;&nbsp;about</h2>

> ${cfg.about.intro}

${cfg.about.body}

<table>
  <tr>
    <td valign="middle">
      <table>
${factsRows}
      </table>
    </td>
    <td valign="middle" align="center" width="300">
      <img src="./assets/about.svg" width="272" alt="Distributed systems — backend by design (api · db · cache · queue · svc · edge)" />
    </td>
  </tr>
</table>

<p align="center"><img src="./assets/divider.svg" width="88%" alt="" /></p>

<!-- ══════════ 04 · TECH STACK ══════════ -->
<a id="-stack"></a>
<h2>❯&nbsp;&nbsp;stack</h2>

<p align="center">
  <img src="./assets/stack.svg" width="88%" alt="Tech stack — Backend, Frontend, Cloud, Databases, AI, Tools" />
</p>

<p align="center"><img src="./assets/divider.svg" width="88%" alt="" /></p>

<!-- ══════════ 05 · FEATURED PROJECTS ══════════ -->
<a id="-projects"></a>
<h2>❯&nbsp;&nbsp;projects</h2>

<table align="center" width="90%">
${projRows}</table>

<p align="center"><img src="./assets/divider.svg" width="88%" alt="" /></p>

<!-- ══════════ 06 · GITHUB ANALYTICS ══════════ -->
<a id="-analytics"></a>
<h2>❯&nbsp;&nbsp;analytics</h2>

<p align="center">
  <img width="480" alt="Contribution streak" src="https://github-readme-streak-stats.herokuapp.com/?user=${u}&background=0A0A0B&border=3A3320&border_radius=16&stroke=3A3320&ring=E8C25A&fire=E0A23A&currStreakNum=F5EFE0&currStreakLabel=E8C25A&sideNums=F5EFE0&sideLabels=DED6C2&dates=8C846F&excludeDaysLabel=8C846F" />
</p>

<p align="center">
  <img width="88%" alt="Contribution activity graph" src="https://github-readme-activity-graph.vercel.app/graph?username=${u}&bg_color=0A0A0B&color=E8C25A&title_color=E8C25A&line=E8C25A&point=FBEBB0&area=true&area_color=C89B32&hide_border=true&radius=16&custom_title=Contribution%20Graph" />
</p>

<p align="center">
  <img width="88%" alt="GitHub trophies" src="https://github-profile-trophy.vercel.app/?username=${u}&theme=gruvbox&no-frame=true&no-bg=true&column=7&margin-w=8&margin-h=8" />
</p>

<!-- Snake contribution animation — populated by .github/workflows/snake.yml (output branch) -->
<p align="center">
  <img width="88%" alt="Contribution snake" src="https://raw.githubusercontent.com/${u}/${u}/output/snake.svg" />
</p>

<p align="center"><img src="./assets/divider.svg" width="88%" alt="" /></p>

<!-- ══════════ 07 · ROADMAP ══════════ -->
<a id="-roadmap"></a>
<h2>❯&nbsp;&nbsp;roadmap</h2>

<p align="center">
  <img src="./assets/roadmap.svg" width="88%" alt="${escAttr(cfg.roadmap.title)}" />
</p>

<p align="center"><img src="./assets/divider.svg" width="88%" alt="" /></p>

<!--
   ⌘ You found the source. The moon favours the curious.
   ❯ echo $MISSION → "build things that outlast the hype"
-->

<div align="center">
<details>
<summary><sub><samp>❯ sudo reveal --easter-egg</samp></sub></summary>
<br/>
<pre>
       .-.
      (   ).        SELENE // moon protocol
     (___(__)       you read the source — respect.
    ·  ·   ·  ·     that's the kind of engineer I want to build with.
</pre>
<sub>The roadmap is a promise, not a wishlist. &nbsp;❯&nbsp; <a href="https://github.com/${u}">follow the build</a></sub>
</details>
</div>

<!-- ══════════ FOOTER ══════════ -->
<p align="center">
  <sub><samp>PROJECT SELENE</samp> &nbsp;·&nbsp; generated from <samp>selene.config.json</samp> &nbsp;·&nbsp; <samp>© 2026 ${escAttr(cfg.identity.name)}</samp></sub>
</p>
`;
}

/* ═══════════════════ RUN ═══════════════════ */
console.log('› Building PROJECT SELENE from selene.config.json');

write('assets/terminal.svg', buildTerminal());

// projects: clean regen
const projDir = join(ROOT, 'assets', 'projects');
try { for (const f of readdirSync(projDir)) if (f.endsWith('.svg')) rmSync(join(projDir, f)); } catch {}
cfg.projects.forEach((p, i) => write(`assets/projects/${p.repo}.svg`, buildProject(p, i)));

write('assets/roadmap.svg', buildRoadmap());

// contact buttons: clean regen
const conDir = join(ROOT, 'assets', 'contact');
try { for (const f of readdirSync(conDir)) if (f.endsWith('.svg')) rmSync(join(conDir, f)); } catch {}
const channels = contactChannels();
channels.forEach((ch) => write(`assets/contact/${ch.key}.svg`, buildContactButton(ch)));

write('README.md', buildReadme(channels));

console.log('✓ Done — profile rebuilt.');
