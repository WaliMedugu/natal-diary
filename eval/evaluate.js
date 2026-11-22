// Evaluation of Natal Diary's two decision components.
// 1) Danger-sign triage: 40 clinical vignettes written from the WHO/FMoH danger-sign
//    list, each labelled with the expected urgency BEFORE running the engine.
// 2) Assistant retrieval: 30 paraphrased questions (different wording from the library)
//    labelled with the library entry that should answer them.
// Run: node eval/evaluate.js
const { triage } = require("../src/triage.js");
const { ask } = require("../src/kb.js");

const V = (week, o, expected, note) => ({ week, ...o, expected, note });
const TRIAGE_CASES = [
  V(30, { systolic: 118, diastolic: 76 }, "green", "normal BP, no symptoms"),
  V(14, { systolic: 110, diastolic: 70, temperature: 36.8 }, "green", "early normal"),
  V(32, { systolic: 124, diastolic: 80, kicks2h: 14 }, "green", "normal kicks"),
  V(24, { symptoms: [] }, "green", "empty log"),
  V(36, { systolic: 128, diastolic: 84, kicks2h: 10 }, "green", "borderline kicks = 10 ok"),
  V(20, { temperature: 37.4 }, "green", "low-grade temp"),
  V(26, { systolic: 139, diastolic: 89 }, "green", "just under threshold"),
  V(22, { symptoms: ["burning_urine"] }, "amber", "UTI symptoms"),
  V(18, { symptoms: ["vomiting"] }, "amber", "persistent vomiting"),
  V(30, { systolic: 142, diastolic: 88 }, "amber", "systolic hypertension, no symptoms"),
  V(33, { systolic: 136, diastolic: 92 }, "amber", "diastolic hypertension, no symptoms"),
  V(16, { systolic: 145, diastolic: 95, symptoms: ["headache"] }, "amber", "high BP + headache before 20w (chronic HTN, not pre-eclampsia)"),
  V(29, { kicks2h: 6 }, "amber", "reduced movements"),
  V(25, { temperature: 38.2 }, "amber", "fever"),
  V(31, { symptoms: ["swelling_face_hands"] }, "amber", "facial swelling alone"),
  V(27, { symptoms: ["headache"] }, "amber", "headache alone"),
  V(34, { symptoms: ["blurred_vision"] }, "amber", "blurred vision alone"),
  V(23, { symptoms: ["tired_breathless"] }, "amber", "possible anaemia"),
  V(35, { symptoms: ["reduced_movement"] }, "amber", "mother reports fewer movements"),
  V(12, { symptoms: ["fever"] }, "amber", "reported fever"),
  V(20, { kicks2h: 3 }, "green", "kick counting not applicable before 28w"),
  V(10, { symptoms: ["bleeding"] }, "red", "early bleeding"),
  V(32, { symptoms: ["bleeding"] }, "red", "antepartum haemorrhage"),
  V(36, { symptoms: ["convulsions"] }, "red", "eclampsia"),
  V(30, { symptoms: ["severe_headache_vision"] }, "red", "severe headache + vision"),
  V(28, { symptoms: ["breathing"] }, "red", "difficulty breathing"),
  V(34, { symptoms: ["fluid_leak"] }, "red", "PROM"),
  V(26, { symptoms: ["severe_abdominal_pain"] }, "red", "severe abdominal pain"),
  V(38, { symptoms: ["no_movement"] }, "red", "no movement reported"),
  V(31, { kicks2h: 0 }, "red", "zero kicks"),
  V(22, { symptoms: ["fainting"] }, "red", "fainting"),
  V(30, { systolic: 165, diastolic: 100 }, "red", "severe systolic"),
  V(33, { systolic: 150, diastolic: 112 }, "red", "severe diastolic"),
  V(32, { systolic: 146, diastolic: 94, symptoms: ["headache"] }, "red", "pre-eclampsia: HTN + headache"),
  V(35, { systolic: 150, diastolic: 96, symptoms: ["swelling_face_hands"] }, "red", "pre-eclampsia: HTN + swelling"),
  V(29, { systolic: 141, diastolic: 91, symptoms: ["blurred_vision"] }, "red", "pre-eclampsia: HTN + vision"),
  V(24, { temperature: 39.4 }, "red", "high fever"),
  V(37, { systolic: 120, diastolic: 80, symptoms: ["headache", "bleeding"] }, "red", "mixed, bleeding dominates"),
  V(30, { systolic: 144, diastolic: 92, symptoms: ["severe_abdominal_pain"] }, "red", "HTN + epigastric pain"),
  V(39, { kicks2h: 4, symptoms: ["fluid_leak"] }, "red", "PROM + reduced kicks"),
];

const Q = (q, id) => ({ q, id });
const QA_CASES = [
  Q("my baby is not kicking as much, how many kicks are normal", "kicks"),
  Q("is 150 over 100 blood pressure dangerous for a pregnant woman", "bp"),
  Q("what food is good for me now that I'm pregnant", "diet"),
  Q("when is my next ANC appointment supposed to be", "anc-schedule"),
  Q("I'm seeing blood, should I worry", "bleeding"),
  Q("my head has been pounding for two days and my sight is blurry", "headache"),
  Q("what injections will my newborn get", "baby-vaccines"),
  Q("signs that I am in labour", "labour-signs"),
  Q("my legs and feet are swelling up", "swelling"),
  Q("is it okay to drink agbo herbs", "medicines"),
  Q("why should I take fefol tablets", "iron-folic"),
  Q("how do I avoid getting malaria", "malaria"),
  Q("do I need tetanus injection", "tetanus"),
  Q("can I still do exercise and walk", "exercise"),
  Q("I'm vomiting every morning", "nausea"),
  Q("burning chest after food", "heartburn"),
  Q("what should I bring to the hospital for delivery", "birth-plan"),
  Q("how to care for myself after delivery", "after-birth"),
  Q("when do I start to breastfeed", "breastfeeding"),
  Q("signs my newborn is sick", "newborn-danger"),
  Q("I had a miscarriage last week", "miscarriage"),
  Q("can my husband and I have sex", "sex"),
  Q("which side should I sleep on", "sleep"),
  Q("how do they calculate my EDD", "edd"),
  Q("I always feel tired and dizzy", "anaemia"),
  Q("pain when I pee", "uti"),
  Q("how many kg should I add during pregnancy", "weight"),
  Q("what are pregnancy danger signs I should know", "danger-signs"),
  Q("can I take paracetamol for pain", "medicines"),
  Q("when should I go to hospital urgently", "danger-signs"),
];

// ---- triage metrics
const levels = ["green", "amber", "red"];
const cm = Object.fromEntries(levels.map((a) => [a, Object.fromEntries(levels.map((b) => [b, 0]))]));
const misses = [];
for (const c of TRIAGE_CASES) {
  const got = triage(c).level;
  cm[c.expected][got]++;
  if (got !== c.expected) misses.push(`${c.note}: expected ${c.expected}, got ${got}`);
}
const correct = levels.reduce((s, l) => s + cm[l][l], 0);
const redTotal = levels.reduce((s, l) => s + cm.red[l], 0);
const redSens = cm.red.red / redTotal;
const urgentTotal = TRIAGE_CASES.filter((c) => c.expected !== "green").length;
const urgentCaught = TRIAGE_CASES.filter((c) => c.expected !== "green" && triage(c).level !== "green").length;
const greenTotal = TRIAGE_CASES.filter((c) => c.expected === "green").length;
const greenSpec = cm.green.green / greenTotal;

// ---- retrieval metrics
let top1 = 0, top3 = 0; const qaMiss = [];
for (const c of QA_CASES) {
  const r = ask(c.q, 3);
  const ids = [r.answer?.id, ...r.related.map((x) => x.id)].filter(Boolean);
  if (r.answer && r.answer.id === c.id) top1++; else qaMiss.push(`"${c.q}" -> ${r.answer ? r.answer.id : "(no confident answer)"} (want ${c.id})`);
  if (ids.slice(0, 3).includes(c.id)) top3++;
}

const pct = (x) => (100 * x).toFixed(1) + "%";
console.log("NATAL DIARY EVALUATION\n");
console.log(`Triage (${TRIAGE_CASES.length} labelled vignettes)`);
console.log(`  Exact-level accuracy:         ${correct}/${TRIAGE_CASES.length} = ${pct(correct / TRIAGE_CASES.length)}`);
console.log(`  RED sensitivity (emergencies): ${cm.red.red}/${redTotal} = ${pct(redSens)}`);
console.log(`  Urgent (amber+red) flagged:    ${urgentCaught}/${urgentTotal} = ${pct(urgentCaught / urgentTotal)}`);
console.log(`  GREEN specificity:             ${cm.green.green}/${greenTotal} = ${pct(greenSpec)}`);
console.log("  Confusion matrix (rows = expected, cols = predicted):");
console.log("           green amber   red");
for (const l of levels) console.log(`    ${l.padEnd(6)} ${levels.map((m) => String(cm[l][m]).padStart(5)).join(" ")}`);
if (misses.length) console.log("  Misses:\n   - " + misses.join("\n   - "));
console.log(`\nAssistant retrieval (${QA_CASES.length} paraphrased questions)`);
console.log(`  Top-1 accuracy: ${top1}/${QA_CASES.length} = ${pct(top1 / QA_CASES.length)}`);
console.log(`  Top-3 accuracy: ${top3}/${QA_CASES.length} = ${pct(top3 / QA_CASES.length)}`);
if (qaMiss.length) console.log("  Top-1 misses:\n   - " + qaMiss.join("\n   - "));
