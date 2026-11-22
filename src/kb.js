// Verified knowledge base for the Natal Diary assistant.
// Every answer is short, plain-language and cites its source. Content is general
// education, not a diagnosis. It is to be reviewed by a midwife before a real pilot.
(function (root) {
  const KB = [
    { id: "anc-schedule", q: "How many antenatal visits should I have? When are my clinic visits?", a: "WHO recommends at least 8 antenatal contacts: one before 12 weeks, then at about 20, 26, 30, 34, 36, 38 and 40 weeks. Book your first visit as early as you can. Natal Diary adds these to your plan automatically.", src: "WHO 2016 ANC recommendations" },
    { id: "danger-signs", q: "What are the danger signs in pregnancy? When should I go to the hospital?", a: "Go to a hospital immediately if you have vaginal bleeding, fits, severe headache with blurred vision, fever, difficulty breathing, fluid leaking, severe belly pain, or if your baby stops moving.", src: "WHO / FMoH Nigeria antenatal card" },
    { id: "bleeding", q: "I am bleeding from my vagina, is it normal?", a: "Bleeding in pregnancy is a danger sign. Go to the nearest hospital now, even if it's light. Bring your antenatal card or open your Natal Diary record.", src: "WHO MCPC 2017" },
    { id: "headache", q: "I have a headache that won't go away and my eyes are blurry", a: "A severe or persistent headache, especially with blurred vision or swelling, can be a sign of pre-eclampsia (high blood pressure in pregnancy). Check your blood pressure and go to your clinic today. If it's severe, go now.", src: "WHO MCPC 2017; NICE NG133" },
    { id: "bp", q: "What blood pressure is too high in pregnancy?", a: "140/90 or higher is high and needs a clinic check the same day. 160/110 or higher is dangerous, so go to a hospital immediately.", src: "WHO 2011 pre-eclampsia recommendations" },
    { id: "kicks", q: "How often should my baby move? How do I count kicks?", a: "From about 28 weeks, lie on your left side after a meal and count movements. You should feel at least 10 in 2 hours. Fewer than usual means call your clinic today. No movement means go to the hospital now.", src: "RCOG reduced fetal movements guideline" },
    { id: "swelling", q: "My feet are swollen, is that okay?", a: "Mild swelling of the feet and ankles is common, especially in late pregnancy. Sudden swelling of the face or hands, or swelling with headache, can be pre-eclampsia, so contact your clinic today.", src: "NICE NG133" },
    { id: "diet", q: "What should I eat during pregnancy? Nigerian foods that are good for pregnancy", a: "Eat a variety: beans, eggs, fish, lean meat, ugu and other leafy greens, fruits like oranges and pawpaw, and whole grains. Drink plenty of clean water. Limit sugary drinks. Avoid alcohol, raw or undercooked meat and eggs, and unpasteurised milk.", src: "WHO 2016 ANC nutrition recommendations" },
    { id: "iron-folic", q: "Why do I need iron and folic acid tablets? Fefol, routine drugs", a: "Daily iron (30–60 mg) and folic acid (400 µg) prevent anaemia and protect your baby's brain and spine. Take them every day as your clinic prescribes. Taking them with orange juice helps, but avoid taking them with tea.", src: "WHO 2016 ANC recommendations" },
    { id: "malaria", q: "How do I prevent malaria in pregnancy? IPTp SP fansidar", a: "Sleep under an insecticide-treated net every night. In Nigeria, pregnant women receive preventive malaria medicine (IPTp-SP) at antenatal visits from the second trimester, at least 3 doses. Treat any fever as urgent.", src: "WHO malaria guidelines; NMEP Nigeria" },
    { id: "tetanus", q: "Which vaccines do I need in pregnancy? tetanus Td injection", a: "You need tetanus-diphtheria (Td) vaccine doses to protect you and your newborn from tetanus. Your clinic will tell you how many depending on past doses, usually 2 in a first pregnancy, at least 4 weeks apart.", src: "WHO immunization schedule; NPHCDA" },
    { id: "exercise", q: "Can I exercise while pregnant?", a: "Yes. Moderate activity such as walking for about 30 minutes most days is good for you. Stop and call your clinic if you feel pain, bleeding, dizziness or fluid leakage.", src: "WHO 2016 ANC recommendations" },
    { id: "nausea", q: "I feel sick and vomit every morning, what can I do?", a: "Nausea is common in early pregnancy. Eat small meals often, try dry crackers or ginger, and sip water. If you can't keep any food or water down for a day, contact your clinic, because you may get dehydrated.", src: "WHO 2016 ANC recommendations" },
    { id: "heartburn", q: "I have heartburn and chest burning after eating", a: "Eat smaller meals, avoid lying down right after eating, and cut down on spicy and fatty foods. Your clinic can give you a safe antacid if it continues.", src: "WHO 2016 ANC recommendations" },
    { id: "labour-signs", q: "What are the signs of labour? How do I know labour has started?", a: "Regular painful contractions that get closer together, a 'show' (mucus with a little blood), or your waters breaking. Go to your facility when contractions are about 5 minutes apart, or immediately if your waters break or you bleed.", src: "WHO intrapartum care 2018" },
    { id: "birth-plan", q: "How do I prepare a birth plan? What should I bring to the hospital for delivery?", a: "Choose your facility, plan transport and how to pay, and pick a companion. Save money for emergencies. Pack your antenatal card, baby clothes, wrappers, pads, soap and a phone charger.", src: "WHO birth preparedness guidance" },
    { id: "after-birth", q: "How do I take care of myself after giving birth? postnatal care", a: "Go for postnatal checks at 24 hours, day 3, between days 7 and 14, and at 6 weeks. Danger signs after birth are heavy bleeding, fever, smelly discharge, severe headache, and fits. Rest, eat well and keep taking iron.", src: "WHO postnatal care 2022" },
    { id: "breastfeeding", q: "When should I start breastfeeding? exclusive breastfeeding", a: "Start breastfeeding within the first hour after birth. Give only breast milk, with no water or other foods, for the first 6 months. Breastfeed whenever your baby wants.", src: "WHO / UNICEF infant feeding" },
    { id: "newborn-danger", q: "What are danger signs in a newborn baby? baby unwell", a: "Take your baby to the clinic now if they are not feeding well, have fits, fast or difficult breathing, fever or feel cold, have yellow palms or soles, or have redness or pus around the cord.", src: "WHO postnatal care 2022" },
    { id: "baby-vaccines", q: "What vaccines does my newborn need? immunisation schedule Nigeria", a: "At birth: BCG, OPV0 and Hepatitis B. At 6, 10 and 14 weeks: Pentavalent, PCV, OPV and Rotavirus, plus IPV. At 9 months: measles and yellow fever. Natal Diary's baby mode reminds you of each one.", src: "NPHCDA National Routine Immunization schedule" },
    { id: "miscarriage", q: "I lost my pregnancy, miscarriage, how do I cope?", a: "We're so sorry. Losing a pregnancy is not your fault. Go to a clinic to check you are physically well, especially if you are bleeding heavily or have a fever. It's normal to grieve. Talk to someone you trust, and ask your clinic about counselling support.", src: "WHO / RCOG pregnancy loss guidance" },
    { id: "sex", q: "Is it safe to have sex during pregnancy?", a: "For most healthy pregnancies, yes. Avoid sex and call your clinic if you have bleeding, your waters have broken, or your doctor has told you your placenta is low.", src: "NHS / RCOG" },
    { id: "sleep", q: "What is the best position to sleep in pregnancy?", a: "After 28 weeks, go to sleep on your side, ideally the left, rather than on your back. This improves blood flow to your baby.", src: "RCOG / Tommy's sleep-on-side guidance" },
    { id: "medicines", q: "Can I take drugs or herbs while pregnant? paracetamol, herbal concoction, agbo", a: "Only take medicines your health worker has approved. Paracetamol is generally safe for pain or fever. Avoid herbal mixtures (agbo) and other drugs unless a doctor says they're safe, because some can harm your baby.", src: "WHO 2016 ANC recommendations" },
    { id: "edd", q: "How is my due date calculated? expected delivery date EDD", a: "Your due date is about 40 weeks (280 days) from the first day of your last menstrual period. An early ultrasound scan can confirm it. Babies are often born between 37 and 42 weeks.", src: "WHO 2016 ANC recommendations" },
    { id: "anaemia", q: "I feel very tired and dizzy, could it be anaemia? low blood", a: "Tiredness, dizziness, pale palms or breathlessness can be signs of anaemia. Keep taking your iron, eat iron-rich foods like beans, ugu and liver, and ask your clinic to check your blood level (PCV/Hb).", src: "WHO 2016 ANC recommendations" },
    { id: "uti", q: "It burns when I urinate, what should I do? urine infection", a: "Burning or pain when you urinate may be a urinary infection, which needs treatment in pregnancy. Contact your clinic today and drink plenty of water.", src: "WHO 2016 ANC recommendations" },
    { id: "weight", q: "How much weight should I gain in pregnancy?", a: "Most women gain about 11–16 kg if they started at a healthy weight. Sudden weight gain over a few days with swelling can be a warning sign, so tell your clinic.", src: "IOM 2009 guidelines" },
  ];

  const STOP = new Set("a an the is are am i my me do does should what when how can it to of in on for and or with be will have has your you this that at from about any much many".split(" "));
  const SYN = { kick: "movement", kicks: "movement", moving: "movement", move: "movement", moves: "movement", blood: "bleeding", bleed: "bleeding", pressure: "bp", hypertension: "bp", food: "diet", eat: "diet", eating: "diet", injection: "vaccine", vaccines: "vaccine", vaccination: "vaccine", immunisation: "vaccine", immunization: "vaccine", head: "headache", vomit: "nausea", vomiting: "nausea", nauseous: "nausea", pee: "urine", urinate: "urine", urinating: "urine", wee: "urine", anc: "visit", appointment: "visit", appointments: "visit", visits: "visit", checkup: "visit", kg: "weight", gain: "weight", add: "weight", pack: "bring", carry: "bring", foods: "diet", nutrition: "diet", seeing: "bleeding", spotting: "bleeding", ill: "unwell", sick: "unwell", pains: "pain", contractions: "labour", labor: "labour", deliver: "labour", delivery: "labour", swollen: "swelling", swell: "swelling", tired: "anaemia", dizzy: "anaemia", fefol: "iron", drugs: "medicines", drug: "medicines", herbs: "medicines", agbo: "medicines", newborn: "baby", infant: "baby" };

  function tokens(text) {
    return text.toLowerCase()
      .replace(/blood pressure/g, "bp") // keep "blood pressure" apart from "blood" (bleeding)
      .replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter((t) => t && !STOP.has(t))
      .map((t) => SYN[t] || (t.length > 5 ? t.replace(/(ing|ed|s)$/, "") : t));
  }

  const docs = KB.map((d) => tokens(d.q + " " + d.q + " " + d.a));
  const df = new Map();
  docs.forEach((ts) => new Set(ts).forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  const N = docs.length;
  const idf = (t) => Math.log((N + 1) / ((df.get(t) || 0) + 1)) + 1;
  const vec = (ts) => { const v = new Map(); ts.forEach((t) => v.set(t, (v.get(t) || 0) + 1)); for (const [k, c] of v) v.set(k, c * idf(k)); return v; };
  const norm = (v) => Math.sqrt([...v.values()].reduce((s, x) => s + x * x, 0)) || 1;
  const docVecs = docs.map(vec);

  function ask(question, k = 3) {
    const qv = vec(tokens(question));
    const qn = norm(qv);
    const scored = docVecs.map((dv, i) => {
      let dot = 0; for (const [t, w] of qv) dot += w * (dv.get(t) || 0);
      return { i, score: dot / (qn * norm(dv)) };
    }).sort((a, b) => b.score - a.score);
    const best = scored.slice(0, k).map((s) => ({ ...KB[s.i], score: +s.score.toFixed(3) }));
    const confident = best[0] && best[0].score >= 0.12;
    return { confident, answer: confident ? best[0] : null, related: best.slice(confident ? 1 : 0) };
  }

  const api = { KB, ask, tokens };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NDKB = api;
})(typeof window !== "undefined" ? window : globalThis);
