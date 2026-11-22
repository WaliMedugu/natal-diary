// Natal Diary danger-sign triage engine.
// Rules follow WHO antenatal care guidance (WHO 2016 ANC recommendations, WHO/IMPAC
// "Managing complications in pregnancy and childbirth") and the Nigerian Federal
// Ministry of Health danger-sign list used on antenatal cards.
// Output levels: "red" (go to a hospital now), "amber" (contact your clinic today),
// "green" (no danger signs; keep logging).

(function (root) {
  const RED_SYMPTOMS = {
    bleeding: "Vaginal bleeding",
    convulsions: "Fits / convulsions",
    severe_headache_vision: "Severe headache with blurred vision",
    breathing: "Difficulty breathing",
    fluid_leak: "Water / fluid leaking from the vagina",
    severe_abdominal_pain: "Severe abdominal pain",
    no_movement: "Baby has stopped moving",
    fainting: "Fainting or unconsciousness",
  };

  const AMBER_SYMPTOMS = {
    headache: "Persistent headache",
    blurred_vision: "Blurred vision",
    swelling_face_hands: "Swelling of the face or hands",
    fever: "Fever",
    reduced_movement: "Baby moving less than usual",
    burning_urine: "Pain or burning when passing urine",
    vomiting: "Vomiting that won't stop",
    tired_breathless: "Very tired or breathless doing light work",
  };

  function triage(entry) {
    const reasons = [];
    let level = "green";
    const bump = (l) => {
      const rank = { green: 0, amber: 1, red: 2 };
      if (rank[l] > rank[level]) level = l;
    };
    const s = new Set(entry.symptoms || []);
    const week = Number(entry.week) || 0;
    const sys = Number(entry.systolic) || 0;
    const dia = Number(entry.diastolic) || 0;
    const temp = Number(entry.temperature) || 0;
    const kicks = entry.kicks2h === undefined || entry.kicks2h === "" ? null : Number(entry.kicks2h);

    for (const k of Object.keys(RED_SYMPTOMS)) {
      if (s.has(k)) { bump("red"); reasons.push(RED_SYMPTOMS[k]); }
    }
    for (const k of Object.keys(AMBER_SYMPTOMS)) {
      if (s.has(k)) { bump("amber"); reasons.push(AMBER_SYMPTOMS[k]); }
    }

    // Blood pressure (hypertension / pre-eclampsia)
    if (sys >= 160 || dia >= 110) {
      bump("red"); reasons.push(`Very high blood pressure (${sys}/${dia})`);
    } else if (sys >= 140 || dia >= 90) {
      const preEclampsiaSigns = ["headache", "blurred_vision", "swelling_face_hands", "severe_headache_vision", "severe_abdominal_pain"].some((k) => s.has(k));
      if (preEclampsiaSigns && week >= 20) {
        bump("red"); reasons.push(`High blood pressure (${sys}/${dia}) with possible pre-eclampsia signs`);
      } else {
        bump("amber"); reasons.push(`High blood pressure (${sys}/${dia})`);
      }
    }

    // Fever
    if (temp >= 39) { bump("red"); reasons.push(`High fever (${temp}°C)`); }
    else if (temp >= 38) { bump("amber"); reasons.push(`Fever (${temp}°C)`); }

    // Fetal movement: fewer than 10 kicks in 2 hours after 28 weeks
    if (kicks !== null && week >= 28) {
      if (kicks === 0) { bump("red"); reasons.push("No baby movements felt in 2 hours"); }
      else if (kicks < 10) { bump("amber"); reasons.push(`Only ${kicks} movements in 2 hours (expect 10 or more)`); }
    }

    const advice = {
      red: "Go to the nearest hospital or call your midwife NOW. Do not wait for your next appointment.",
      amber: "Contact your clinic or midwife today and tell them what you logged.",
      green: "No danger signs in this log. Keep logging and keep your next appointment.",
    }[level];

    return { level, reasons, advice };
  }

  const api = { triage, RED_SYMPTOMS, AMBER_SYMPTOMS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NDTriage = api;
})(typeof window !== "undefined" ? window : globalThis);
