import { useState, useEffect, useRef, useCallback } from "react";

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SKINR v3 — EDITABLE CONFIGURATION                                       ║
// ║  Edit this section freely. Do not edit below the closing ═══ line.       ║
// ╚══════════════════════════════════════════════════════════════════════════╝
const CONFIG = {
  business: {
    domain:            "https://www.getskinr.com",
    affiliateTag:      "skinr07-20",
    amazonBase:        "https://www.amazon.com",
    skincareGuide:     "",   // Paste Gumroad/Etsy URL when live
    shavingGuide:      "",   // Paste Gumroad/Etsy URL when live
    // Optional $10 reports — set unlock code after Gumroad purchase
    // Gumroad: set redirect URL to https://www.getskinr.com?unlock=YOUR_CODE
    biologyReportPrice:  10,
    routineCardPrice:    10,
    comboPrice:          15,
    unlockCode:          "SKINR2025",  // Change this to match your Gumroad product
    biologyGumroad:      "",  // Paste Gumroad link for Biology Report
    routineCardGumroad:  "",  // Paste Gumroad link for Routine Card
    comboGumroad:        "",  // Paste Gumroad link for Combo ($15)
    twitterHandle:       "@getskinr",
  },
  // Skincare brands by budget tier
  skinBrandsByTier: {
    budget:  ["The Ordinary","CeraVe","Neutrogena","Vanicream","Differin"],
    mid:     ["La Roche-Posay","Paula's Choice","EltaMD","First Aid Beauty","Cetaphil"],
    premium: ["Kiehl's","Clinique for Men","Peter Thomas Roth","Murad","Vichy"],
    luxury:  ["SkinCeuticals","Drunk Elephant","Sunday Riley","Augustinus Bader","Tom Ford Beauty"],
  },
  // Shaving product brands by budget tier
  shaveBrandsByTier: {
    budget:  ["Cremo","Nivea Men","Barbasol","Dollar Shave Club","Gillette","Edge"],
    mid:     ["Proraso","Art of Shaving","Kiehl's Men","Jack Black","Baxter of California","Anthony"],
    premium: ["Taylor of Old Bond Street","D.R. Harris","Penhaligon's","Truefitt & Hill","Castle Forbes"],
    luxury:  ["Geo. F. Trumper","Czech & Speake","Acqua di Parma","Floris","St. James of London"],
  },
  // Razor recommendations by skin profile — the AI uses these as a reference
  bladeScience: {
    cartridge_bumps:  "Multi-blade cartridges use a lift-and-cut mechanism that severs hair below the skin surface, dramatically increasing pseudofolliculitis barbae risk. Clinical recommendation: transition to single-blade immediately.",
    safety_mild:      "The Merkur 34C and Edwin Jagger DE89 have blade gaps of approximately 0.68mm — classified as mild/medium aggressive. Ideal for sensitive or reactive skin beginning safety razor use.",
    safety_standard:  "The Parker 99R and Muhle R89 offer standard aggression with excellent blade exposure. Suitable for most skin types once technique is established.",
    foil_electric:    "Foil electric shavers (Braun Series 9, Panasonic Arc5) use a thin foil membrane that prevents blade-to-skin contact, making them the least irritating electric option for sensitive skin.",
    rotary_electric:  "Rotary shavers (Philips Norelco 9000 series) use circular cutting heads suited for longer, coarser stubble but can pull finer or curly hair, increasing irritation risk.",
    oneblade:         "The Philips OneBlade and Leaf Razor use a single-blade pivoting head — the only cartridge-style razor that does not use multi-blade lift-and-cut, making it suitable for bump-prone skin.",
  },
};

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  DO NOT EDIT BELOW THIS LINE                                              ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ── STORAGE — localStorage (production-safe) ────────────────────────────────
const LS = {
  get: (key)       => { try { const v=localStorage.getItem(key); return v?JSON.parse(v):null; } catch(_){ return null; } },
  set: (key, val)  => { try { localStorage.setItem(key, JSON.stringify(val)); } catch(_){} },
  del: (key)       => { try { localStorage.removeItem(key); } catch(_){} },
};
const SK = {
  profile:"skinr2:profile", checkins:"skinr2:checkins",
  lang:"skinr2:lang", shave:"skinr2:shave", email:"skinr2:email",
  chat:"skinr2:chat",
};

// ── API — calls Netlify Function proxy (key never in browser) ───────────────
const callAI = async (messages, system="", maxTokens=1500) => {
  try {
    const res = await fetch("/.netlify/functions/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, system, maxTokens }),
    });
    if(!res.ok){
      console.error("callAI HTTP error:", res.status, res.statusText);
      return "";
    }
    const data = await res.json();
    const text = data.content?.map(c => c.text||"").join("") || "";
    if(!text) console.error("callAI: empty response", JSON.stringify(data).slice(0,200));
    return text;
  } catch(err){
    console.error("callAI exception:", err.message);
    return "";
  }
};

const parseJSON = (raw) => {
  try {
    // Strip markdown code blocks — Haiku sometimes wraps JSON despite instructions
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    return JSON.parse(cleaned);
  } catch(_){
    // Try to find JSON object in the response
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if(match) return JSON.parse(match[0]);
    } catch(_){}
    return null;
  }
};

// ── TRANSLATIONS ─────────────────────────────────────────────────────────────
// ── LANGUAGE CONFIG ───────────────────────────────────────────────────────────
const LANGUAGES = [
  { code:"en", label:"English",    native:"English",    dir:"ltr" },
  { code:"fr", label:"French",     native:"Français",   dir:"ltr" },
  { code:"es", label:"Spanish",    native:"Español",    dir:"ltr" },
];

// ── BASE TRANSLATIONS (English) ───────────────────────────────────────────────
// All other languages are generated from this via AI and cached in localStorage.
// To update any string: edit it here. On next visit in a non-English language,
// the AI will retranslate automatically.
const BASE_T = {
  appName:"SKINR",
  badge:"Free. Clinical. Built for Men.",
  heroTitle:"Your Skin. Your Shave.", heroTitle2:"Finally, Understood.",
  heroBody:"Most men have no idea what their skin actually needs. They grab whatever looks right, apply it in the wrong order, and wonder why nothing changes. SKINR ends that. Six honest questions. A clinical skin profile, a personalised morning and evening routine, and the exact products that work for your biology and your budget. No appointments. No guesswork. Sixty seconds.",
  pathTitle:"Two Problems. One Platform.",
  pathSub:"Clinical shaving science and personalised skincare — both free, both built for men.",
  skinCardTitle:"Skin Analysis",
  skinCardDesc:"Six questions. A clinical skin type profile. A personalised morning and evening routine with exact application instructions. Budget-matched product recommendations from leading brands — with the scientific reason behind every single one.",
  skinCardPills:["6 Questions","Clinical Profile","Budget-Matched","Ingredient Science"],
  skinCardBtn:"Analyse My Skin",
  shaveCardTitle:"Shaving Protocol",
  shaveCardDesc:"Seven questions — blade type, beard characteristics, active bumps, shaving frequency. The exact biological reason your shave is failing identified. A clinical three-phase protocol and budget-matched products to fix it permanently.",
  shaveCardPills:["7 Questions","Blade Science","Prevention + Treatment","Clinical Protocol"],
  shaveCardBtn:"Build My Protocol",
  back:"← Back", next:"Continue", analyze:"Analyse My Skin",
  analyzing:"ANALYSING",
  loadSteps:["Reading your profile...","Analysing skin chemistry...","Matching products to your budget...","Checking ingredient compatibility...","Finalising your protocol..."],
  q_feel:"One hour after washing — no products — how does your face feel?",
  q_breakouts:"How frequently do you experience breakouts?",
  q_sensitivity:"How does your skin respond to new products or shaving?",
  q_age:"What is your age range?",
  q_concern:"What is your primary skin concern?",
  q_budget:"What is your monthly skincare budget?",
  opts_feel:["Tight, dry, possibly flaking","Comfortable and balanced","Visibly oily across the entire face","Oily T-zone, dry cheeks"],
  opts_breakouts:["Rarely, if ever","Once or twice monthly","Several times per week","Persistently — always present"],
  opts_sensitivity:["No reaction. Highly resilient.","Occasional mild redness","Frequent irritation or stinging","Near-constant reactivity or rosacea"],
  opts_age:["Under 25","25 – 35","36 – 50","50+"],
  opts_concern:["Dryness and rough texture","Excess oil and shine","Acne and breakouts","Ageing — lines and dullness","Redness and irritation","Hyperpigmentation and dark spots"],
  opts_budget:["Budget — Under $35","Mid-Range — $35–$80","Premium — $80–$150","Luxury — $150+"],
  quizHints:[
    "Be precise. No one is watching.",
    "Any breakout — pimples, cysts, whiteheads, blackheads.",
    "Redness, burning, stinging, or itching after application.",
    "Skin needs change significantly by decade.",
    "Select the concern that bothers you most right now.",
    "This determines which brands and products we recommend.",
  ],
  analysisComplete:"Analysis Complete",
  yourProtocol:"Your Daily Protocol",
  morning:"Morning", evening:"Evening",
  whyThisWorks:"Why these products work together →",
  hideScience:"Close ↑",
  findProduct:"Find on Amazon ↗",
  findSephora:"Find on Sephora ↗",
  ingredientWarning:"Ingredient Conflict Warning",
  emailTitle:"Get Your Protocol as a PDF",
  emailDesc:"We will email you your complete morning and evening routine, your product list with direct links, and weekly skin tips. One email. No spam.",
  emailBtn:"Send My Protocol",
  emailSkip:"No thanks",
  emailSuccess:"Check your inbox — your protocol is on its way.",
  emailPlaceholder:"your@email.com",
  coachTitle:"Ask the Coach Anything.",
  coachSub:"Your AI coach has reviewed your full profile and budget. Ask about products, ingredients, timing, or anything your protocol does not cover.",
  coachOnline:"Coach Available",
  suggestions:["Why am I still breaking out?","Can I add retinol to my routine?","What order do I apply my products?","How long until I see real results?","Is my routine right for summer?"],
  youLabel:"You", coachLabel:"Coach",
  inputPlaceholder:"Ask anything about your skin or protocol...",
  checkinTitle:"How Is the Protocol Working?",
  checkinSub:"A 30-second check-in refines your protocol based on real results. The AI adapts its advice to what your skin is actually telling you.",
  todayStatus:"Current Status",
  submitCheckin:"Submit Check-In",
  submitting:"Processing...",
  progressHistory:"Progress Log",
  noHistory:"Your progress log will appear after your first check-in.",
  moods:[
    {v:"excellent",emoji:"◆",label:"Excellent",    desc:"Skin is clear, hydrated, performing well"},
    {v:"improving",emoji:"▲",label:"Improving",    desc:"Visible positive changes this week"},
    {v:"stable",   emoji:"■",label:"Stable",       desc:"No change — neither better nor worse"},
    {v:"worse",    emoji:"▼",label:"Declining",    desc:"Something is irritating or breaking out"},
  ],
  shaveTitle:"Shaving Protocol",
  shaveSub:"A clinical 7-question analysis — blade type, beard characteristics, skin type, and active problems all analysed together. The most precise shaving tool ever built for men.",
  shaveQ1:"What is your current primary shaving method?",
  shaveOpts1:[{v:"cartridge",label:"Cartridge Razor (2–5 blades)"},{v:"safety",label:"Safety / Double-Edge Razor (single blade)"},{v:"electric_foil",label:"Electric Foil Shaver (Braun, Panasonic)"},{v:"electric_rotary",label:"Electric Rotary Shaver (Philips Norelco)"},{v:"straight",label:"Straight Razor"},{v:"oneblade",label:"OneBlade / Leaf Razor (single blade pivot)"},{v:"beard",label:"I maintain a beard — no close shaving"}],
  shaveQ2:"How would you describe your beard hair?",
  shaveOpts2:[{v:"fine_straight",label:"Fine and straight — grows soft, little resistance"},{v:"medium",label:"Medium — average thickness and density"},{v:"coarse_straight",label:"Coarse and straight — thick, heavy stubble"},{v:"coarse_curly",label:"Coarse and curly — tight curls, waves, or coils"},{v:"patchy",label:"Patchy — uneven density across the face"}],
  shaveQ3:"What is your primary shaving problem?",
  shaveOpts3:[{v:"bumps",label:"Razor Bumps & Ingrown Hairs"},{v:"redness",label:"Redness, Burning & Irritation"},{v:"dryness",label:"Post-Shave Dryness & Tightness"},{v:"cuts",label:"Frequent Nicks & Cuts"},{v:"none",label:"No significant problems — just optimising"}],
  shaveQ4:"Do you currently have active razor bumps on your face or neck?",
  shaveOpts4:[{v:"none",label:"None — no current bumps"},{v:"mild",label:"Mild — a few occasional bumps"},{v:"moderate",label:"Moderate — several bumps, some inflamed"},{v:"severe",label:"Severe — widespread, painful, or causing scarring"}],
  shaveQ5:"What razor or blade are you currently using?",
  shaveOpts5:[{v:"gillette",label:"Gillette Fusion, Mach3, or similar cartridge"},{v:"dollar_shave",label:"Dollar Shave Club or subscription cartridge"},{v:"merkur",label:"Merkur safety razor"},{v:"feather",label:"Feather or Japanese safety razor"},{v:"braun",label:"Braun electric shaver"},{v:"philips",label:"Philips Norelco electric"},{v:"other",label:"Different brand or not sure"},{v:"none_currently",label:"Not currently shaving regularly"}],
  shaveQ6:"How frequently do you shave?",
  shaveOpts6:[{v:"daily",label:"Daily"},{v:"every_other",label:"Every other day"},{v:"twice_week",label:"Twice a week"},{v:"weekly",label:"Once a week or less"}],
  shaveQ7:"What is your monthly shaving budget?",
  shaveOpts7:[{v:"budget",label:"Budget — Under $20/month"},{v:"mid",label:"Mid-Range — $20–$50/month"},{v:"premium",label:"Premium — $50–$100/month"},{v:"luxury",label:"Luxury — $100+/month"}],
  analyzeShave:"Generate My Clinical Protocol",
  shaveAnalyzing:"Analysing your shave profile...",
  shaveResult:"Your Clinical Shaving Protocol",
  bladeSection:"Blade & Razor Recommendation",
  preShave:"Pre-Shave Preparation",
  duringShave:"The Shave",
  postShave:"Post-Shave Treatment",
  preventionProducts:"Prevention Products",
  treatmentProducts:"Active Bump Treatment",
  shaveCritical:"Clinical Finding",
  medDisclaimer:"This protocol provides general clinical guidance. Pseudofolliculitis barbae (razor bumps), persistent irritation, or suspected skin conditions should be evaluated by a board-certified dermatologist. This is not a substitute for professional medical advice.",
  optionalTitle:"Unlock Your Complete Analysis",
  optionalSub:"Two optional reports generated specifically from your results. Not generic guides — built from your exact profile.",
  biologyTitle:"Know Your Skin Biology",
  biologyDesc:"The complete cellular explanation of why your skin behaves exactly the way it does. The biological mechanism of every ingredient in your protocol. Your long-term skin trajectory and what happens at the dermal level when you follow — or ignore — the protocol.",
  routineCardTitle:"Personalized Daily Routine Card",
  routineCardDesc:"Your exact products, in your exact order, with your exact application instructions — formatted as a print-ready card for your bathroom wall. Generated from your specific analysis.",
  comboTitle:"Both Reports — Best Value",
  unlockBtn:"Unlock — $10",
  comboBtn:"Get Both — $15",
  enterCode:"Have an unlock code?",
  unlockCodePlaceholder:"Enter unlock code",
  unlockCodeBtn:"Unlock",
  alreadyUnlocked:"◆ Reports Unlocked",
  nav:{home:"Home",analysis:"Analysis",coach:"Coach",checkin:"Progress",shave:"Shave",guides:"Guides",community:"Community"},
  // Community
  communityTitle:"The SKINR Community",
  communitySub:"Real men. Real results. Real skin types. Share your progress and read what is actually working for men with your exact profile.",
  communityPost:"Share My Progress",
  communityFeed:"Progress Feed",
  communityEmpty:"No updates yet. Be the first to share your progress.",
  communityShareTitle:"Share Your Update",
  communityShareSub:"Anonymous by default. Your skin type and update are visible — your name is not.",
  communitySharePlaceholder:"What has changed since you started your protocol? What is working? What are you struggling with?",
  communityShareBtn:"Post My Update",
  communityCancel:"Cancel",
  communityPosted:"Your update has been shared.",
  communityLike:"◆ Helpful",
  skinTypeLabel:"Skin Type",
  weekLabel:"Week",
  discordTitle:"Join the Conversation",
  discordSub:"For real-time discussion, questions, and before/after sharing — join the SKINR Discord community.",
  discordBtn:"Join SKINR Discord",
  guidesTitle:"The SKINR Guides",
  guidesSub:"The complete written reference for everything the quiz covers — and everything it cannot fit in 60 seconds.",
  skincareGuideTitle:"The No-BS Men's Skincare Guide",
  skincareGuideDesc:"Your skin type protocol in full. Product scorecards. Ingredient conflict cheat sheet. Seasonal adjustments. Printable routine cards.",
  shavingGuideTitle:"The Shaving Bible",
  shavingGuideDesc:"The complete clinical guide to a perfect shave. Blade mechanics and selection science. Pre-shave protocol. Post-shave treatment for every skin and beard type.",
  guidePrice:"$9 USD",
  guideBuyBtn:"Get the Guide",
  guideComingSoon:"Coming Soon",
  welcomeBack:"Good to Have You Back.",
  continueJourney:"Your protocol is waiting.",
  lastAnalyzed:"Last analysed",
  viewProtocol:"View Protocol",
  consultCoach:"Consult Coach",
  newAnalysis:"New Analysis",
  newShave:"New Shave Analysis",
  disclaimer:"Amazon affiliate links support this free service at no extra cost to you. All recommendations are based solely on your skin profile and budget.",
  of:"/",
  translating:"Setting up your language...",
  // Founder story — translatable
  storyLabel:"The Story Behind SKINR",
  storyTitle:"Why I Built This",
  storyP1:"As a man who shaves every day, I had no idea what my blade was actually doing to my skin. Every morning — the same routine, the same razor, the same result. Razor bumps. Redness. Irritation that stayed for days. I went to barbers who made it worse. I changed products constantly — one after another, hoping something would work, never understanding why nothing did.",
  storyP2:"The answer, it turned out, was not in a better product. It was in understanding my skin. Once I learned my skin type, why my specific blade was causing bumps, which ingredients actually work for my biology, and how to build a routine in the right order — everything changed. Fewer bumps. Less redness. Better skin. And for the first time, genuine confidence about how I looked.",
  storyP3:"That is why SKINR exists. A single platform where every man — regardless of age, skin type, or budget — can understand his skin biology, make informed decisions about what goes on his face, and build a routine that actually works. Not someone else's routine. His.",
  missionLabel:"Our Mission",
  missionText:"To be the one-stop platform where every man discovers his skin biology, makes the right decisions, and takes care of his skin — at every age.",
  copyright:"All rights reserved.",
  skinScore:"Skin Score",
  consistencyRating:"Consistency Rating",
  weekOneLabel:"Week One Protocol",
  expectedTimeline:"Expected Timeline",
  whenDermatologist:"When to See a Dermatologist",
  criticalRuleLabel:"Critical Rule",
  clinicalAssessmentLabel:"Clinical Assessment",
  techniqueLabel:"Technique",
  transitionLabel:"Transition Note",
  recommendedBladesLabel:"Recommended Blades",
  avoidLabel:"Avoid",
  expertInsight:"Expert Insight",
};

// ── TRANSLATION ENGINE ────────────────────────────────────────────────────────
// Translates UI strings via AI for FR and ES (3 languages total).
// Only translates ~20 essential visible strings — small enough to complete
// reliably within Netlify function timeout. Quiz protocols are already
// generated in the user's language by Claude so quiz options can stay in English.

const TRANSLATION_CACHE_VERSION = "v4";
const getCacheKey = (langCode) => `skinr2:t_${langCode}_${TRANSLATION_CACHE_VERSION}`;

// Only the 3 languages — EN (base), FR, ES
const SUPPORTED_LANGS = ["en", "fr", "es"];

const translateAndCache = async (langCode) => {
  if(langCode === "en") return BASE_T;
  if(!SUPPORTED_LANGS.includes(langCode)) return BASE_T;

  const cached = LS.get(getCacheKey(langCode));
  if(cached) return cached;

  const langInfo = LANGUAGES.find(l => l.code === langCode);
  const langName = langInfo?.native || langCode;

  // Translate ONLY the ~20 strings users see before starting the quiz
  // Keep quiz options in English — the AI generates results in user's language anyway
  const minimal = {
    badge:BASE_T.badge,
    heroTitle:BASE_T.heroTitle,
    heroTitle2:BASE_T.heroTitle2,
    heroBody:BASE_T.heroBody,
    pathTitle:BASE_T.pathTitle,
    pathSub:BASE_T.pathSub,
    skinCardTitle:BASE_T.skinCardTitle,
    skinCardDesc:BASE_T.skinCardDesc,
    skinCardBtn:BASE_T.skinCardBtn,
    shaveCardTitle:BASE_T.shaveCardTitle,
    shaveCardDesc:BASE_T.shaveCardDesc,
    shaveCardBtn:BASE_T.shaveCardBtn,
    back:BASE_T.back,
    next:BASE_T.next,
    analyze:BASE_T.analyze,
    analyzeShave:BASE_T.analyzeShave,
    emailTitle:BASE_T.emailTitle,
    emailDesc:BASE_T.emailDesc,
    emailBtn:BASE_T.emailBtn,
    emailSkip:BASE_T.emailSkip,
    welcomeBack:BASE_T.welcomeBack,
    continueJourney:BASE_T.continueJourney,
    storyTitle:BASE_T.storyTitle,
    storyP1:BASE_T.storyP1,
    storyP2:BASE_T.storyP2,
    storyP3:BASE_T.storyP3,
    missionLabel:BASE_T.missionLabel,
    missionText:BASE_T.missionText,
    nav:BASE_T.nav,
  };

  try {
    const prompt = `Translate these English strings to ${langName} (${langCode}). Rules: Never translate "SKINR". Keep ◆▲■▼→← unchanged. ${langCode==="fr"?"Use formal French.":"Use Latin American Spanish."} Return ONLY raw JSON starting with { and ending with } — no markdown, no backticks, no explanation, nothing else.

${JSON.stringify(minimal)}`;

    const raw = await callAI([{role:"user", content:prompt}], "", 3000);
    console.log(\`Translation for \${langCode}: \${raw.length} chars\`);

    const parsed = parseJSON(raw);
    if(!parsed){
      console.error(\`Translation parse failed for \${langCode}\`);
      return BASE_T;
    }

    // Merge translated strings over BASE_T — everything else stays English
    const result = {...BASE_T, ...parsed};
    if(parsed.nav) result.nav = {...BASE_T.nav, ...parsed.nav};
    result.appName = "SKINR";

    LS.set(getCacheKey(langCode), result);
    console.log(\`Translation cached for \${langCode}\`);
    return result;
  } catch(e) {
    console.error("translateAndCache error:", e.message);
    return BASE_T;
  }
};


// ── SKIN QUIZ QUESTIONS ───────────────────────────────────────────────────────
const getSkinQs = (t, lang) => [
  { id:"feel",      q:t.q_feel,      opts:t.opts_feel.map((o,i)=>({v:["dry","normal","oily","combo"][i],label:o}))      },
  { id:"breakouts", q:t.q_breakouts, opts:t.opts_breakouts.map((o,i)=>({v:["never","sometimes","often","always"][i],label:o})) },
  { id:"sensitivity",q:t.q_sensitivity,opts:t.opts_sensitivity.map((o,i)=>({v:["none","mild","moderate","severe"][i],label:o})) },
  { id:"age",       q:t.q_age,       opts:t.opts_age.map((o,i)=>({v:["under25","25to35","36to50","50plus"][i],label:o})) },
  { id:"concern",   q:t.q_concern,   opts:t.opts_concern.map((o,i)=>({v:["dryness","oiliness","acne","aging","redness","pigmentation"][i],label:o})) },
  { id:"budget",    q:t.q_budget,    opts:t.opts_budget.map((o,i)=>({v:["budget","mid","premium","luxury"][i],label:o})) },
];

// ── AI PROMPTS ────────────────────────────────────────────────────────────────
const buildSkinPrompt = (answers, lang) => {
  const ln = (LANGUAGES.find(l=>l.code===lang)?.label || "English");
  const tier = answers.budget || "mid";
  const brands = CONFIG.skinBrandsByTier[tier]?.join(", ") || "The Ordinary, CeraVe";
  return `You are a dermatologist. Respond ONLY in ${ln}. Return ONLY valid compact JSON — no markdown, no extra whitespace.

Patient: feel=${answers.feel}, breakouts=${answers.breakouts}, sensitivity=${answers.sensitivity}, age=${answers.age}, concern=${answers.concern}, budget=${tier}
Brands: ${brands}

Return this JSON (keep all string values short — max 20 words each):
{"skinType":"2-3 word type","code":"TYPE-CODE","headline":"one clinical sentence","summary":"two sentences why and what needed","morning":[{"step":1,"product":"exact name","brand":"brand","category":"cleanser|toner|serum|moisturizer|spf|treatment","estimatedPrice":"$X","keyIngredient":"ingredient","instruction":"exact instruction","why":"clinical reason","clinicalMechanism":"mechanism","knownRating":"X/5 Amazon","amazonSearch":"search term"}],"evening":[same structure max 3 products no SPF],"ingredientConflicts":[],"avoid":"ingredient to avoid and why","timeToResults":"week 2 week 4 week 12","proTip":"non-obvious insight","coachIntro":"two sentence welcome","skinBiologyTeaser":"two sentences biology teaser"}

Rules: morning 3-4 products ending with SPF, evening 2-3 products no SPF, all on Amazon within ${tier} budget using brands: ${brands}.`;
};

const buildShavePrompt = (answers, skinProfile, lang) => {
  const ln = (LANGUAGES.find(l=>l.code===lang)?.label || "English");
  const tier = answers.budget || "mid";
  const brands = CONFIG.shaveBrandsByTier[tier]?.slice(0,3).join(", ") || "Cremo, Nivea Men";
  const skinType = skinProfile?.skinType || "unknown";
  const hasBumps = answers.activeBumps && answers.activeBumps !== "none";

  return `Shaving dermatologist. ${ln} only. Return raw JSON only — no markdown.
Profile: method=${answers.method},beard=${answers.beard},problem=${answers.problem},bumps=${answers.activeBumps||"none"},blade=${answers.currentBlade||"?"},freq=${answers.frequency},budget=${tier},skin=${skinType}
Brands:${brands}
JSON(max 15 words per string):{"clinicalFinding":"","severityAssessment":"","bladeRecommendation":{"recommendedType":"","specificModel":"","whyThisRazor":"","bladeGap":"","recommendedBlades":[{"name":"","estimatedPrice":"","why":"","rating":"","amazonSearch":""}],"transitionNote":"","techniqueAdjustment":""},"preShave":[{"step":1,"title":"","instruction":"","duration":"","why":""}],"shaveProtocol":[{"step":1,"title":"","instruction":"","why":""}],"postShave":[{"step":1,"title":"","instruction":"","why":""}],"preventionProducts":[{"name":"","brand":"","category":"","estimatedPrice":"","keyIngredient":"","use":"","clinicalMechanism":"","knownRating":"","amazonSearch":"","priority":"essential"}]${hasBumps?`,"treatmentProducts":[{"name":"","brand":"","category":"","estimatedPrice":"","keyIngredient":"","use":"","clinicalMechanism":"","knownRating":"","amazonSearch":"","expectedTimeline":""}],"treatmentProtocol":""`:``},"criticalRule":"","weekOneProtocol":"","expectedImprovement":"","whenToSeeDoctor":"","skinBiologyTeaser":""}
Fill every field. preShave=3steps,shaveProtocol=3steps,postShave=3steps,prevention=2items,within ${tier} budget.`;
};

const buildCheckinPrompt = (mood, profile, history, lang) => {
  const ln = (LANGUAGES.find(l=>l.code===lang)?.label || "English");
  return `Respond ONLY in ${ln}. You are a clinical skincare coach reviewing a check-in.
Patient skin type: ${profile?.skinType || "unknown"}
Current status reported: ${mood}
Protocol they are following: ${profile?.headline || "standard protocol"}
Recent history: ${history?.slice(0,3).map(h=>h.mood).join(", ") || "first check-in"}
Return ONE sentence of precise, actionable clinical advice specific to this status and skin type. No generic advice.`;
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
const getAffLink = (search) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(search)}&tag=${CONFIG.business.affiliateTag}&linkCode=ur2`;

const calcScore = (profile, checkins=[]) => {
  if(!profile) return 0;
  let s = 20;
  s += Math.min(checkins.length * 5, 35);
  s += checkins.slice(0,5).filter(c=>c.mood==="excellent"||c.mood==="improving").length * 7;
  if(checkins.length >= 7) s += 10;
  return Math.min(s, 100);
};

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Josefin+Sans:wght@300;400;600&family=DM+Mono:wght@300;400&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#050505; --s:#0C0C0C; --card:#101010; --card2:#161616;
  --border:#1E1E1E; --border2:#2C2C2C;
  --gold:#B8972A; --gold2:#D4AF50; --gold3:rgba(184,151,42,0.08);
  --goldb:rgba(184,151,42,0.22); --goldbr:rgba(184,151,42,0.45);
  --white:#F2EEE6; --cream:#D8D2C8; --soft:#A09890; --muted:#4E4844;
  --red:#9E2B2B; --green:#2E6B46; --amber:#B87820; --purple:#7254B8;
  --fh:'Playfair Display',serif; --fc:'Cormorant Garamond',serif;
  --fb:'Josefin Sans',sans-serif; --fm:'DM Mono',monospace;
}
html,body{height:100%;background:var(--bg);}
.app{min-height:100vh;background:var(--bg);color:var(--white);font-family:var(--fb);
  display:flex;flex-direction:column;align-items:center;padding:0 0 120px;
  position:relative;overflow-x:hidden;}
.app::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.018;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:200px 200px;}
.bg-vig{position:fixed;inset:0;pointer-events:none;z-index:0;
  background:radial-gradient(ellipse 130% 70% at 50% 0%,rgba(184,151,42,0.03),transparent 55%),
  radial-gradient(ellipse 100% 100% at 50% 100%,rgba(0,0,0,0.5),transparent 70%);}

/* NAV */
.nav{width:100%;max-width:920px;padding:0 20px;display:flex;align-items:stretch;
  justify-content:space-between;border-bottom:1px solid var(--border);position:sticky;top:0;
  background:rgba(6,6,6,0.97);backdrop-filter:blur(24px);z-index:100;gap:12px;min-height:54px;}
.logo{font-family:var(--fh);font-size:15px;font-weight:900;color:var(--white);
  display:flex;align-items:center;gap:9px;letter-spacing:3px;flex-shrink:0;
  text-transform:uppercase;cursor:pointer;border:none;background:none;}
.logo:focus-visible{outline:2px solid var(--gold);outline-offset:3px;}
.logo-m{width:17px;height:17px;border:1px solid var(--gold);display:flex;align-items:center;
  justify-content:center;font-size:7px;color:var(--gold);}
.logo-m::after{content:'◆';}
.nav-c{display:flex;gap:0;overflow-x:auto;scrollbar-width:none;flex:1;justify-content:center;}
.nav-c::-webkit-scrollbar{display:none;}
.ntab{background:none;border:none;border-bottom:2px solid transparent;padding:0 12px;
  font-family:var(--fc);font-size:13px;letter-spacing:2px;color:var(--soft);
  cursor:pointer;transition:all .3s;text-transform:uppercase;white-space:nowrap;
  display:flex;align-items:center;min-height:54px;}
.ntab:hover{color:var(--cream);}
.ntab.active{color:var(--gold);border-bottom-color:var(--gold);}
.ntab:focus-visible{outline:2px solid var(--gold);outline-offset:-2px;}
.lang-r{display:flex;gap:3px;align-items:center;flex-shrink:0;}
.lbtn{background:none;border:none;color:var(--soft);padding:4px 6px;
  font-family:var(--fm);font-size:9px;letter-spacing:2px;cursor:pointer;
  transition:all .25s;text-transform:uppercase;border-bottom:1px solid transparent;}
.lbtn:hover{color:var(--cream);}
.lbtn.active{color:var(--gold);border-bottom-color:var(--gold);}

/* MOBILE TICKER */
.nav-ticker-wrap{display:none;flex:1;overflow:hidden;position:relative;align-items:center;
  mask-image:linear-gradient(90deg,transparent,black 10%,black 90%,transparent);
  -webkit-mask-image:linear-gradient(90deg,transparent,black 10%,black 90%,transparent);}
.nav-ticker{display:flex;gap:0;white-space:nowrap;animation:ticker 20s linear infinite;}
.nav-ticker:hover{animation-play-state:paused;}
@keyframes ticker{0%{transform:translateX(0%)}100%{transform:translateX(-50%)}}
.ticker-tab{background:none;border:none;border-bottom:2px solid transparent;
  padding:0 14px;font-family:var(--fc);font-size:13px;letter-spacing:2px;
  color:var(--soft);cursor:pointer;transition:color .25s;text-transform:uppercase;
  white-space:nowrap;display:inline-flex;align-items:center;min-height:54px;}
.ticker-tab:hover{color:var(--cream);}
.ticker-tab.active{color:var(--gold);border-bottom-color:var(--gold);}
.ticker-sep{color:var(--border2);font-size:8px;padding:0 4px;display:inline-flex;align-items:center;min-height:54px;}

/* SKIP LINK */
.skip-link{position:absolute;top:-100px;left:20px;background:var(--gold);color:#060606;
  padding:8px 16px;font-family:var(--fc);font-size:14px;font-weight:700;z-index:999;transition:top .2s;}
.skip-link:focus{top:8px;}

/* WRAP */
.wrap{width:100%;max-width:920px;padding:0 20px 48px;position:relative;z-index:1;}
.fade-in{animation:fadeUp .5s cubic-bezier(.2,0,.1,1) forwards;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

/* HERO */
.hero{padding:52px 0 44px;border-bottom:1px solid var(--border);}
.hero-badge{display:inline-flex;align-items:center;gap:9px;font-family:var(--fc);font-size:13px;letter-spacing:4px;color:var(--soft);text-transform:uppercase;margin-bottom:24px;font-style:italic;}
.hero-badge::before{content:'◆';color:var(--gold);font-size:8px;}
.hero-h{font-family:var(--fh);font-size:clamp(34px,6vw,60px);font-weight:900;line-height:.95;letter-spacing:-1px;font-style:italic;}
.hero-h2{font-family:var(--fh);font-size:clamp(34px,6vw,60px);font-weight:900;line-height:.95;letter-spacing:-1px;color:var(--gold);margin-bottom:16px;}
.hero-rule{width:44px;height:1px;background:var(--gold);margin:18px 0;}
.hero-body{font-family:var(--fc);font-size:17px;line-height:1.85;color:var(--soft);font-weight:400;max-width:600px;font-style:italic;}

/* PATH CARDS */
.path-sec{padding:44px 0 36px;}
.path-title{font-family:var(--fh);font-size:clamp(20px,3vw,30px);font-weight:700;font-style:italic;margin-bottom:6px;}
.path-sub{font-family:var(--fc);font-size:15px;color:var(--soft);font-style:italic;margin-bottom:28px;}
.path-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px;background:var(--border);}
.path-card{background:var(--card);padding:32px 28px;cursor:pointer;transition:background .3s;
  position:relative;overflow:hidden;display:flex;flex-direction:column;}
.path-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--border);transition:background .3s;}
.path-card:hover,.path-card:focus{background:var(--card2);outline:none;}
.path-card:hover::before,.path-card:focus::before{background:var(--gold);}
.p-inner{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;}
.p-num{font-family:var(--fh);font-size:64px;font-weight:900;font-style:italic;
  color:rgba(197,160,40,0.07);line-height:1;margin-bottom:-6px;transition:color .3s;}
.path-card:hover .p-num{color:rgba(197,160,40,0.13);}
.p-tag{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--goldb);
  color:var(--gold);padding:2px 9px;font-family:var(--fm);font-size:8px;letter-spacing:2px;
  text-transform:uppercase;margin-bottom:12px;width:fit-content;}
.p-title{font-family:var(--fh);font-size:24px;font-weight:900;font-style:italic;margin-bottom:12px;line-height:1.1;}
.p-desc{font-family:var(--fc);font-size:15px;line-height:1.78;color:var(--soft);font-style:italic;margin-bottom:18px;flex:1;}
.p-pills{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:20px;}
.p-pill{border:1px solid var(--border2);color:var(--muted);padding:3px 9px;
  font-family:var(--fc);font-size:10px;letter-spacing:1px;font-style:italic;transition:all .3s;}
.path-card:hover .p-pill{border-color:var(--goldb);color:var(--soft);}
.p-btn{display:inline-flex;align-items:center;gap:9px;background:none;border:1px solid var(--border2);
  color:var(--soft);padding:13px 18px;font-family:var(--fc);font-size:13px;letter-spacing:2px;
  text-transform:uppercase;font-style:italic;cursor:pointer;transition:all .3s;width:100%;justify-content:space-between;}
.p-btn::after{content:'→';font-family:var(--fh);font-size:16px;font-style:normal;transition:transform .3s;}
.path-card:hover .p-btn{background:var(--gold);border-color:var(--gold);color:#060606;}
.path-card:hover .p-btn::after{transform:translateX(4px);}

/* RETURNING USER */
.ret-sec{padding:28px 0 0;border-top:1px solid var(--border);}
.ret-lbl{font-family:var(--fc);font-size:8px;letter-spacing:4px;color:var(--gold);text-transform:uppercase;margin-bottom:3px;font-style:italic;}
.ret-title{font-family:var(--fh);font-size:18px;font-weight:700;font-style:italic;margin-bottom:18px;}
.score-w{border:1px solid var(--border);padding:20px;margin-bottom:14px;
  display:flex;align-items:center;gap:20px;position:relative;overflow:hidden;}
.score-w::before{content:'';position:absolute;top:0;left:0;bottom:0;width:2px;background:var(--gold);}
.s-arc{position:relative;width:70px;height:70px;flex-shrink:0;}
.s-arc svg{transform:rotate(-90deg);}
.arc-bg{fill:none;stroke:var(--border2);stroke-width:3;}
.arc-fill{fill:none;stroke:var(--gold);stroke-width:3;stroke-linecap:butt;transition:stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1);}
.arc-n{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.arc-v{font-family:var(--fh);font-size:19px;font-weight:700;color:var(--white);line-height:1;}
.arc-mx{font-family:var(--fm);font-size:7px;color:var(--soft);letter-spacing:1px;}
.s-info .s-title{font-family:var(--fh);font-size:15px;font-weight:600;margin-bottom:3px;}
.s-info .s-sub{font-family:var(--fc);font-size:12px;color:var(--soft);font-style:italic;}
.s-bar{height:1px;background:var(--border2);margin-top:8px;}
.s-bar-f{height:100%;background:var(--gold);transition:width 1.2s ease;}
.prof-strip{border:1px solid var(--border);padding:20px 22px;display:flex;
  align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;
  position:relative;overflow:hidden;margin-bottom:8px;}
.prof-strip::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,var(--gold),transparent);}
.ps-lbl{font-family:var(--fc);font-size:8px;letter-spacing:4px;color:var(--gold);
  text-transform:uppercase;font-style:italic;margin-bottom:5px;}
.ps-type{font-family:var(--fh);font-size:22px;font-weight:900;font-style:italic;margin-bottom:3px;}
.ps-sub{font-family:var(--fc);font-size:11px;color:var(--soft);font-style:italic;}
.ps-btns{display:flex;gap:8px;flex-wrap:wrap;}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;
  padding:12px 24px;border:none;font-family:var(--fc);font-size:12px;font-weight:600;
  cursor:pointer;transition:all .3s;letter-spacing:2px;text-transform:uppercase;font-style:italic;}
.btn-p{background:var(--gold);color:#060606;}
.btn-p:hover{background:var(--gold2);box-shadow:0 0 32px rgba(197,160,40,0.2);}
.btn-p:disabled{opacity:.25;cursor:not-allowed;box-shadow:none;}
.btn-g{background:none;border:1px solid var(--border2);color:var(--soft);}
.btn-g:hover{border-color:var(--goldb);color:var(--gold);}
button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible{
  outline:2px solid var(--gold);outline-offset:2px;}

/* QUIZ */
.quiz-wrap{padding:44px 0 0;}
.quiz-hdr{display:flex;align-items:center;gap:16px;margin-bottom:32px;}
.back-btn{background:none;border:1px solid var(--border);color:var(--soft);
  padding:8px 14px;font-family:var(--fc);font-size:11px;letter-spacing:2px;
  cursor:pointer;transition:all .25s;font-style:italic;flex-shrink:0;}
.back-btn:hover{border-color:var(--goldb);color:var(--gold);}
.back-btn:disabled{opacity:.2;cursor:not-allowed;}
.prog-track{flex:1;height:1px;background:var(--border);}
.prog-fill{height:100%;background:var(--gold);transition:width .5s cubic-bezier(.4,0,.2,1);}
.q-num{font-family:var(--fh);font-size:64px;font-weight:900;font-style:italic;
  color:rgba(197,160,40,0.06);line-height:1;margin-bottom:-12px;}
.q-meta{font-family:var(--fm);font-size:9px;letter-spacing:3px;color:var(--soft);
  text-transform:uppercase;margin-bottom:9px;}
.q-text{font-family:var(--fh);font-size:clamp(18px,3vw,27px);font-weight:700;
  line-height:1.25;margin-bottom:7px;font-style:italic;}
.q-hint{font-family:var(--fc);font-size:13px;color:var(--soft);margin-bottom:22px;font-style:italic;}
.opts{display:grid;gap:6px;margin-bottom:24px;}
.opt{display:flex;align-items:center;gap:12px;border:1px solid var(--border);
  padding:13px 16px;cursor:pointer;transition:all .25s;text-align:left;
  width:100%;background:transparent;color:var(--white);}
.opt:hover{border-color:var(--goldb);background:var(--gold3);}
.opt.sel{border-color:var(--gold);background:var(--gold3);}
.opt-m{width:15px;height:15px;border:1px solid var(--border2);flex-shrink:0;
  display:flex;align-items:center;justify-content:center;transition:all .25s;}
.opt.sel .opt-m{border-color:var(--gold);background:var(--gold);}
.opt.sel .opt-m::after{content:'◆';font-size:6px;color:#060606;}
.opt-lbl{font-family:var(--fc);font-size:15px;color:var(--soft);transition:color .25s;font-style:italic;}
.opt.sel .opt-lbl{color:var(--white);}
.q-foot{display:flex;align-items:center;justify-content:space-between;}
.q-count{font-family:var(--fm);font-size:9px;color:var(--soft);letter-spacing:2px;}

/* LOADING */
.load-wrap{display:flex;flex-direction:column;align-items:center;text-align:center;padding:72px 0;gap:24px;}
.load-svg{animation:spin 3s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.load-h{font-family:var(--fh);font-size:26px;font-weight:900;font-style:italic;letter-spacing:2px;}
.load-step{font-family:var(--fc);font-size:11px;letter-spacing:3px;color:var(--soft);
  text-transform:uppercase;font-style:italic;}
.load-line{width:110px;height:1px;background:var(--border2);position:relative;overflow:hidden;}
.load-line::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;
  background:var(--gold);animation:slide 1.5s ease-in-out infinite;}
@keyframes slide{0%{left:-100%}100%{left:100%}}

/* EMAIL MODAL */
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:200;
  display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeUp .3s ease;}
.modal{background:var(--card);border:1px solid var(--border);max-width:460px;
  width:100%;position:relative;overflow:hidden;}
.modal::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--gold),var(--gold2),var(--gold));}
.modal-inner{padding:32px;}
.modal-h{font-family:var(--fh);font-size:24px;font-weight:900;font-style:italic;margin-bottom:6px;}
.modal-s{font-family:var(--fc);font-size:14px;color:var(--soft);font-style:italic;margin-bottom:22px;line-height:1.7;}
.email-in{width:100%;background:var(--s);border:1px solid var(--border);
  padding:12px 16px;font-family:var(--fc);font-size:14px;color:var(--white);
  outline:none;margin-bottom:10px;font-style:italic;}
.email-in:focus{border-color:var(--goldb);}
.email-in::placeholder{color:var(--soft);}
.email-skip{background:none;border:none;color:var(--soft);font-family:var(--fc);
  font-size:12px;cursor:pointer;padding:8px 0;font-style:italic;width:100%;text-align:center;}
.email-skip:hover{color:var(--cream);}
.modal-success{text-align:center;padding:8px 0;}
.modal-success-icon{font-family:var(--fh);font-size:28px;color:var(--green);margin-bottom:10px;}
.modal-success-h{font-family:var(--fh);font-size:18px;font-weight:700;font-style:italic;margin-bottom:6px;}
.modal-success-s{font-family:var(--fc);font-size:13px;color:var(--soft);font-style:italic;}

/* RESULTS */
.res-wrap{padding-top:32px;}
.prof-banner{border:1px solid var(--border);padding:28px;margin-bottom:16px;position:relative;overflow:hidden;}
.prof-banner::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,var(--gold),rgba(197,160,40,0.2),transparent);}
.p-code{font-family:var(--fm);font-size:8px;letter-spacing:5px;color:var(--gold);
  text-transform:uppercase;margin-bottom:8px;}
.p-type{font-family:var(--fh);font-size:clamp(26px,4.5vw,42px);font-weight:900;
  font-style:italic;line-height:1;margin-bottom:8px;}
.p-hl{font-family:var(--fc);font-size:16px;color:var(--gold);margin-bottom:10px;font-style:italic;}
.p-sum{font-family:var(--fc);font-size:14px;line-height:1.8;color:var(--soft);font-style:italic;}

/* PROTOCOL CARDS */
.period-hdr{font-family:var(--fc);font-size:9px;letter-spacing:4px;text-transform:uppercase;
  color:var(--gold);margin-bottom:12px;display:flex;align-items:center;gap:10px;font-style:italic;}
.period-hdr::after{content:'';flex:1;height:1px;background:var(--border);}
.step-card{border:1px solid var(--border);margin-bottom:8px;position:relative;overflow:hidden;transition:border-color .25s;}
.step-card:hover{border-color:var(--goldb);}
.step-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:0;
  background:var(--gold);transition:width .3s;}
.step-card:hover::before{width:2px;}
.step-inner{padding:16px;}
.step-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:4px;}
.step-num{font-family:var(--fc);font-size:9px;color:var(--gold);letter-spacing:2px;font-style:italic;flex-shrink:0;margin-top:2px;}
.step-name{font-family:var(--fh);font-size:15px;font-weight:700;line-height:1.2;flex:1;}
.step-price{font-family:var(--fh);font-size:14px;color:var(--gold);white-space:nowrap;font-style:italic;}
.step-brand{font-family:var(--fc);font-size:9px;letter-spacing:2px;color:var(--soft);text-transform:uppercase;font-style:italic;margin-bottom:8px;}
.step-key{display:inline-flex;align-items:center;gap:3px;border:1px solid var(--goldb);
  color:var(--gold);padding:2px 8px;font-family:var(--fm);font-size:8px;
  letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
.step-instruction{font-family:var(--fc);font-size:14px;line-height:1.65;color:var(--cream);margin-bottom:6px;}
.step-why{font-family:var(--fc);font-size:13px;line-height:1.65;color:var(--soft);font-style:italic;margin-bottom:10px;}
.step-links{display:flex;gap:8px;flex-wrap:wrap;}
.step-link{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--goldb);
  color:var(--gold);text-decoration:none;padding:5px 11px;font-family:var(--fc);
  font-size:9px;letter-spacing:2px;text-transform:uppercase;transition:all .25s;
  cursor:pointer;font-style:italic;}
.step-link:hover{background:var(--gold3);border-color:var(--goldbr);}
.sci-tog{background:none;border:none;color:var(--soft);font-family:var(--fm);
  font-size:8px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;
  padding:5px 0;transition:color .25s;display:flex;align-items:center;gap:3px;margin-top:4px;}
.sci-tog:hover{color:var(--gold);}
.sci-box{border-left:1px solid var(--goldb);padding:11px 14px;margin-top:9px;animation:fadeUp .3s ease;}
.sci-text{font-family:var(--fc);font-size:13px;line-height:1.75;color:var(--soft);font-style:italic;}

/* CONFLICT WARNING */
.conflict-box{border:1px solid rgba(168,48,48,0.25);border-left:2px solid var(--red);
  padding:14px 16px;margin:12px 0;}
.conflict-lbl{font-family:var(--fc);font-size:8px;letter-spacing:4px;text-transform:uppercase;
  color:var(--red);margin-bottom:5px;font-style:italic;}
.conflict-text{font-family:var(--fc);font-size:13px;color:var(--soft);font-style:italic;line-height:1.65;}

/* INSIGHTS */
.ins-box{padding:14px 18px;margin-bottom:12px;}
.ins-box.warn{border:1px solid rgba(168,48,48,0.2);border-left:2px solid var(--red);}
.ins-box.tip{border:1px solid var(--goldb);border-left:2px solid var(--gold);}
.ins-lbl{font-family:var(--fc);font-size:8px;letter-spacing:4px;text-transform:uppercase;margin-bottom:5px;font-style:italic;}
.ins-box.warn .ins-lbl{color:var(--red);}
.ins-box.tip .ins-lbl{color:var(--gold);}
.ins-text{font-family:var(--fc);font-size:14px;line-height:1.75;color:var(--soft);font-style:italic;}

/* COACH */
.coach-top{padding-top:32px;margin-bottom:20px;}
.coach-status{display:inline-flex;align-items:center;gap:7px;font-family:var(--fc);
  font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--soft);
  font-style:italic;margin-bottom:7px;}
.coach-status::before{content:'◆';font-size:7px;color:var(--green);animation:pulse-g 2s infinite;}
@keyframes pulse-g{0%,100%{opacity:.4}50%{opacity:1}}
.coach-h{font-family:var(--fh);font-size:24px;font-weight:900;font-style:italic;margin-bottom:5px;}
.coach-s{font-family:var(--fc);font-size:14px;color:var(--soft);font-style:italic;}
.sug-row{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;}
.sug-btn{background:none;border:1px solid var(--border);padding:5px 12px;
  font-family:var(--fc);font-size:11px;color:var(--soft);cursor:pointer;
  transition:all .25s;font-style:italic;}
.sug-btn:hover{border-color:var(--goldb);color:var(--gold);}
.chat-win{border:1px solid var(--border);min-height:340px;max-height:420px;
  overflow-y:auto;padding:16px;margin-bottom:11px;display:flex;flex-direction:column;
  gap:12px;scroll-behavior:smooth;background:var(--s);}
.chat-win::-webkit-scrollbar{width:2px;}
.chat-win::-webkit-scrollbar-thumb{background:var(--border2);}
.msg{display:flex;flex-direction:column;max-width:84%;}
.msg.user{align-self:flex-end;align-items:flex-end;}
.msg.ai{align-self:flex-start;}
.msg-role{font-family:var(--fc);font-size:7px;letter-spacing:3px;text-transform:uppercase;
  color:var(--soft);margin-bottom:3px;font-style:italic;}
.msg-bubble{padding:10px 14px;font-family:var(--fc);font-size:14px;line-height:1.65;font-style:italic;}
.msg.user .msg-bubble{background:var(--gold);color:#060606;}
.msg.ai .msg-bubble{border:1px solid var(--border);color:var(--cream);}
.msg.typing .msg-bubble{display:flex;gap:4px;align-items:center;}
.chat-row{display:flex;gap:7px;}
.chat-in{flex:1;background:var(--s);border:1px solid var(--border);padding:11px 14px;
  font-family:var(--fc);font-size:14px;color:var(--white);outline:none;
  transition:border-color .25s;resize:none;font-style:italic;}
.chat-in::placeholder{color:var(--soft);}
.chat-in:focus{border-color:var(--goldb);}
.chat-send{background:var(--gold);border:none;padding:11px 16px;color:#060606;
  cursor:pointer;font-size:14px;transition:all .25s;flex-shrink:0;
  font-family:var(--fh);font-weight:700;}
.chat-send:hover{background:var(--gold2);}
.chat-send:disabled{opacity:.25;cursor:not-allowed;}

/* CHECKIN */
.ci-wrap{padding-top:32px;}
.streak-b{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(197,160,40,0.2);
  padding:4px 12px;font-family:var(--fc);font-size:9px;color:var(--gold);
  letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;font-style:italic;}
.ci-h{font-family:var(--fh);font-size:24px;font-weight:900;font-style:italic;margin-bottom:5px;}
.ci-s{font-family:var(--fc);font-size:14px;color:var(--soft);font-style:italic;margin-bottom:22px;}
.mood-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-bottom:20px;}
.mood-opt{border:1px solid var(--border);padding:16px;cursor:pointer;
  transition:all .25s;text-align:left;background:transparent;}
.mood-opt:hover{border-color:var(--goldb);}
.mood-opt.sel{border-color:var(--gold);background:var(--gold3);}
.mood-e{font-family:var(--fh);font-size:16px;margin-bottom:7px;color:var(--gold);}
.mood-l{font-family:var(--fh);font-size:13px;font-weight:700;margin-bottom:2px;font-style:italic;}
.mood-d{font-family:var(--fc);font-size:11px;color:var(--soft);font-style:italic;}
.hist-list{display:flex;flex-direction:column;gap:1px;background:var(--border);}
.hist-item{background:var(--card);padding:12px 16px;display:flex;gap:14px;transition:background .25s;}
.hist-item:hover{background:var(--card2);}
.hist-date{font-family:var(--fm);font-size:8px;color:var(--soft);min-width:60px;letter-spacing:1px;padding-top:2px;}
.hist-text{font-family:var(--fc);font-size:13px;color:var(--soft);line-height:1.6;font-style:italic;}

/* SHAVE */
.shave-wrap{padding-top:32px;}
.shave-h{font-family:var(--fh);font-size:24px;font-weight:900;font-style:italic;margin-bottom:5px;}
.shave-s{font-family:var(--fc);font-size:14px;color:var(--soft);font-style:italic;margin-bottom:26px;}
.shave-finding{border:1px solid var(--goldb);border-left:2px solid var(--gold);
  padding:14px 18px;margin-bottom:16px;}
.shave-finding-lbl{font-family:var(--fc);font-size:8px;letter-spacing:4px;
  text-transform:uppercase;color:var(--gold);margin-bottom:5px;font-style:italic;}
.shave-finding-text{font-family:var(--fc);font-size:14px;color:var(--cream);font-style:italic;line-height:1.7;}
.shave-severity{border:1px solid var(--border);padding:12px 16px;margin-bottom:16px;}
.shave-severity-lbl{font-family:var(--fc);font-size:8px;letter-spacing:4px;
  text-transform:uppercase;color:var(--amber);margin-bottom:4px;font-style:italic;}
.shave-severity-text{font-family:var(--fc);font-size:13px;color:var(--soft);font-style:italic;line-height:1.65;}
.phase-block{border:1px solid var(--border);margin-bottom:10px;position:relative;}
.phase-block::before{content:'';position:absolute;top:0;left:0;bottom:0;width:2px;}
.phase-block.pre::before{background:var(--gold);}
.phase-block.during::before{background:var(--amber);}
.phase-block.post::before{background:var(--green);}
.phase-hdr{font-family:var(--fc);font-size:9px;letter-spacing:4px;text-transform:uppercase;
  padding:12px 16px 0 18px;font-style:italic;}
.phase-block.pre .phase-hdr{color:var(--gold);}
.phase-block.during .phase-hdr{color:var(--amber);}
.phase-block.post .phase-hdr{color:var(--green);}
.phase-steps{padding:10px 16px 14px 18px;display:flex;flex-direction:column;gap:14px;}
.phase-step{display:flex;gap:12px;}
.phase-step-n{font-family:var(--fm);font-size:9px;color:var(--gold);min-width:16px;padding-top:2px;flex-shrink:0;}
.phase-step-body{}
.phase-step-title{font-family:var(--fh);font-size:14px;font-weight:700;font-style:italic;margin-bottom:2px;}
.phase-step-inst{font-family:var(--fc);font-size:13px;color:var(--cream);line-height:1.6;margin-bottom:3px;}
.phase-step-why{font-family:var(--fc);font-size:12px;color:var(--soft);font-style:italic;line-height:1.55;}
.crit-box{border:1px solid rgba(168,48,48,0.2);border-left:2px solid var(--red);
  padding:14px 18px;margin-bottom:16px;}
.crit-lbl{font-family:var(--fc);font-size:8px;letter-spacing:4px;
  text-transform:uppercase;color:var(--red);margin-bottom:5px;font-style:italic;}
.crit-text{font-family:var(--fc);font-size:14px;color:var(--white);font-style:italic;line-height:1.7;}
.shave-prod-card{border:1px solid var(--border);padding:16px;margin-bottom:8px;
  position:relative;overflow:hidden;transition:border-color .25s;}
.shave-prod-card:hover{border-color:var(--goldb);}
.shave-prod-card::before{content:'';position:absolute;left:0;top:0;bottom:0;
  width:0;background:var(--gold);transition:width .3s;}
.shave-prod-card:hover::before{width:2px;}
.prod-priority{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;
  font-family:var(--fm);font-size:7px;letter-spacing:2px;text-transform:uppercase;
  margin-bottom:8px;}
.prod-priority.essential{border:1px solid var(--goldb);color:var(--gold);}
.prod-priority.recommended{border:1px solid var(--border2);color:var(--soft);}
.prod-priority.optional{border:1px solid var(--border2);color:var(--muted);}
.med-disclaimer{border:1px solid rgba(168,48,48,0.1);background:rgba(168,48,48,0.04);
  padding:14px 18px;margin-top:20px;}
.med-disclaimer-lbl{font-family:var(--fc);font-size:8px;letter-spacing:4px;
  text-transform:uppercase;color:var(--red);margin-bottom:5px;font-style:italic;}
.med-disclaimer-text{font-family:var(--fc);font-size:12px;color:var(--soft);
  font-style:italic;line-height:1.65;}

/* GUIDES */
.guides-wrap{padding-top:32px;}
.guides-h{font-family:var(--fh);font-size:26px;font-weight:900;font-style:italic;margin-bottom:6px;}
.guides-s{font-family:var(--fc);font-size:14px;color:var(--soft);font-style:italic;margin-bottom:28px;}
.guide-card{border:1px solid var(--border);padding:28px;margin-bottom:12px;
  position:relative;overflow:hidden;}
.guide-card::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,var(--gold),transparent);}
.guide-h{font-family:var(--fh);font-size:20px;font-weight:700;font-style:italic;margin-bottom:8px;}
.guide-s{font-family:var(--fc);font-size:14px;color:var(--soft);font-style:italic;
  line-height:1.75;margin-bottom:18px;}
.guide-price{font-family:var(--fh);font-size:24px;color:var(--gold);font-style:italic;margin-bottom:14px;}
.guide-soon{font-family:var(--fc);font-size:11px;color:var(--soft);font-style:italic;margin-top:8px;text-align:center;}

/* MISC */
.sec-h{font-family:var(--fc);font-size:9px;letter-spacing:4px;text-transform:uppercase;
  color:var(--soft);margin-bottom:14px;display:flex;align-items:center;gap:9px;font-style:italic;}
.sec-h::after{content:'';flex:1;height:1px;background:var(--border);}
.sec-mark{color:var(--gold);}
.div-orn{display:flex;align-items:center;gap:10px;margin:18px 0;}
.div-orn::before,.div-orn::after{content:'';flex:1;height:1px;background:var(--border);}
.div-orn-dot{color:var(--gold);font-size:7px;}
.disc{font-family:var(--fc);font-size:10px;color:var(--soft);text-align:center;
  margin-top:12px;line-height:1.7;font-style:italic;}
.empty{text-align:center;padding:40px 20px;color:var(--soft);}
.empty-mark{font-family:var(--fh);font-size:28px;color:var(--goldb);margin-bottom:10px;font-style:italic;}
.empty-text{font-family:var(--fc);font-size:14px;font-style:italic;}
.dots{display:flex;gap:4px;}
.dot{width:4px;height:4px;background:var(--border2);border-radius:50%;}
.dot:nth-child(1){animation:blink 1.5s .0s infinite}
.dot:nth-child(2){animation:blink 1.5s .25s infinite}
.dot:nth-child(3){animation:blink 1.5s .5s infinite}
@keyframes blink{0%,100%{opacity:.2;background:var(--border2)}50%{opacity:1;background:var(--gold)}}

/* SEO METADATA injected via JS */

/* COMMUNITY */
.comm-wrap{padding-top:32px;}
.comm-h{font-family:var(--fh);font-size:24px;font-weight:900;font-style:italic;margin-bottom:5px;}
.comm-s{font-family:var(--fc);font-size:14px;color:var(--soft);font-style:italic;margin-bottom:22px;line-height:1.7;}
.post-card{border:1px solid var(--border);padding:20px;margin-bottom:8px;
  position:relative;overflow:hidden;transition:border-color .25s;}
.post-card:hover{border-color:var(--goldb);}
.post-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,var(--gold),transparent);opacity:0;transition:opacity .3s;}
.post-card:hover::before{opacity:1;}
.post-meta{display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;}
.post-type{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--goldb);
  color:var(--gold);padding:2px 9px;font-family:var(--fm);font-size:8px;
  letter-spacing:2px;text-transform:uppercase;}
.post-week{font-family:var(--fm);font-size:8px;color:var(--soft);letter-spacing:1px;}
.post-date{font-family:var(--fm);font-size:8px;color:var(--muted);margin-left:auto;}
.post-text{font-family:var(--fc);font-size:14px;line-height:1.8;color:var(--cream);
  font-style:italic;margin-bottom:12px;}
.post-actions{display:flex;align-items:center;gap:12px;}
.post-like{background:none;border:1px solid var(--border);color:var(--soft);
  padding:4px 12px;font-family:var(--fc);font-size:11px;cursor:pointer;
  transition:all .25s;font-style:italic;display:flex;align-items:center;gap:4px;}
.post-like:hover{border-color:var(--goldb);color:var(--gold);}
.post-like-count{font-family:var(--fm);font-size:9px;color:var(--soft);letter-spacing:1px;}
.share-modal{border:1px solid var(--goldb);padding:24px;margin-bottom:16px;
  position:relative;overflow:hidden;animation:fadeUp .3s ease;}
.share-modal::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--gold),var(--gold2),transparent);}
.share-ta{width:100%;background:var(--s);border:1px solid var(--border);
  padding:12px 14px;font-family:var(--fc);font-size:14px;color:var(--white);
  outline:none;resize:none;font-style:italic;line-height:1.7;margin-bottom:10px;}
.share-ta::placeholder{color:var(--soft);}
.share-ta:focus{border-color:var(--goldb);}
.discord-cta{border:1px solid var(--border);padding:20px;margin-top:16px;
  display:flex;align-items:center;justify-content:space-between;gap:14px;
  background:var(--s);flex-wrap:wrap;}
.discord-icon{width:32px;height:32px;flex-shrink:0;}
.comm-posted{display:inline-flex;align-items:center;gap:6px;
  font-family:var(--fc);font-size:12px;color:var(--green);font-style:italic;}

/* PRODUCT CARD ICON */
.prod-icon-wrap{width:56px;height:56px;border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  background:var(--s);margin-bottom:10px;}

/* RTL support for Arabic */
[dir="rtl"] .nav{flex-direction:row-reverse;}
[dir="rtl"] .hero-body,[dir="rtl"] .p-desc,[dir="rtl"] .step-instruction,
[dir="rtl"] .sci-text,[dir="rtl"] .ins-text,[dir="rtl"] .phase-step-inst{
  text-align:right;direction:rtl;}
[dir="rtl"] .period-hdr,[dir="rtl"] .sec-h{flex-direction:row-reverse;}
[dir="rtl"] .step-top{flex-direction:row-reverse;}
[dir="rtl"] .step-links{flex-direction:row-reverse;}
[dir="rtl"] .prof-strip{flex-direction:row-reverse;}
[dir="rtl"] .ps-btns{flex-direction:row-reverse;}

/* Translation loading overlay */
.t-loading{position:fixed;inset:0;background:rgba(6,6,6,0.88);z-index:300;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;}
.t-loading-ring{width:36px;height:36px;border:1px solid var(--border2);
  border-top-color:var(--gold);border-radius:50%;animation:rs 1.5s linear infinite;}
@keyframes rs{to{transform:rotate(360deg)}}
.t-loading-text{font-family:var(--fc);font-size:13px;color:var(--soft);font-style:italic;letter-spacing:2px;}

@media(prefers-color-scheme:dark){:root{--soft:#B0A898;--cream:#E0DAD0;--white:#F5F0E8;}}
@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;}.nav-ticker{animation:none;}}
@media(forced-colors:active){.btn-p{background:Highlight;color:HighlightText;}.opt.sel{border-color:Highlight;}}

@media(max-width:640px){
  .path-grid{grid-template-columns:1fr;}
  .mood-grid{grid-template-columns:1fr;}
  .wrap{padding:0 14px 48px;}
  .nav{padding:0 12px;gap:8px;}
  .nav-c{display:none;}
  .hamburger-btn{display:flex;}
}

/* HAMBURGER MENU — mobile only */
.hamburger-btn{display:none;flex-direction:column;justify-content:center;
  align-items:center;gap:5px;width:36px;height:36px;background:none;
  border:1px solid var(--border);cursor:pointer;padding:0;flex-shrink:0;
  transition:border-color .25s;}
.hamburger-btn:hover{border-color:var(--goldb);}
.hb-line{display:block;width:18px;height:1.5px;background:var(--soft);
  transition:all .3s;transform-origin:center;}
.hb-line.open:nth-child(1){transform:translateY(6.5px) rotate(45deg);background:var(--gold);}
.hb-line.open:nth-child(2){opacity:0;transform:scaleX(0);}
.hb-line.open:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);background:var(--gold);}

/* Mobile dropdown menu */
.mobile-menu{position:absolute;top:calc(100% + 8px);right:0;
  background:var(--card);border:1px solid var(--goldb);
  min-width:200px;z-index:300;box-shadow:0 16px 48px rgba(0,0,0,0.7);
  overflow:hidden;animation:fadeUp .2s ease;}
.mobile-menu-item{display:block;width:100%;background:none;
  border:none;border-bottom:1px solid var(--border);
  padding:14px 18px;font-family:var(--fc);font-size:16px;
  color:var(--soft);cursor:pointer;text-align:left;font-style:italic;
  transition:all .2s;}
.mobile-menu-item:hover{background:var(--gold3);color:var(--cream);}
.mobile-menu-item.active{background:var(--gold3);color:var(--gold);}
.mobile-menu-item:last-child{border-bottom:none;}

/* OLIVE color override for success/positive states */
:root{--green:#5C6B3A;--green-light:rgba(92,107,58,0.15);}

/* ── ACCESSIBILITY OVERRIDES ──────────────────────────────────────────────────
   Goal: WCAG AA minimum contrast 4.5:1 for normal text, 3:1 for large text.
   Problem: Cormorant Garamond italic at 13-14px on #050505 fails contrast.
   Fix: Increase sizes, improve contrast values, reduce italics on body copy.
────────────────────────────────────────────────────────────────────────────── */

/* Body text — remove italic, increase size and contrast */
.hero-body{font-size:18px;line-height:2;color:var(--cream);font-style:normal;}
.p-desc{font-size:16px;line-height:1.85;color:var(--cream);font-style:normal;}
.step-instruction{font-size:15px;line-height:1.75;color:var(--white);}
.step-why{font-size:14px;line-height:1.75;color:var(--cream);font-style:normal;}
.sci-text{font-size:14px;line-height:1.8;color:var(--cream);font-style:normal;}
.ins-text{font-size:15px;line-height:1.8;color:var(--cream);font-style:normal;}
.phase-step-inst{font-size:14px;line-height:1.7;color:var(--white);}
.phase-step-why{font-size:13px;line-height:1.65;color:var(--cream);font-style:normal;}
.post-text{font-size:15px;line-height:1.85;color:var(--cream);font-style:normal;}
.msg.ai .msg-bubble{font-size:15px;line-height:1.75;color:var(--white);}
.p-sum{font-size:15px;line-height:1.85;color:var(--cream);font-style:normal;}
.hist-text{font-size:14px;line-height:1.7;color:var(--cream);font-style:normal;}
.comm-s{font-size:15px;line-height:1.8;color:var(--cream);font-style:normal;}
.shave-s{font-size:15px;line-height:1.8;color:var(--cream);font-style:normal;}
.ci-s{font-size:15px;line-height:1.8;color:var(--cream);font-style:normal;}

/* Quiz — larger question text and option labels */
.q-text{font-size:clamp(20px,3.5vw,30px);}
.opt-lbl{font-size:16px;color:var(--cream);font-style:normal;}
.opt.sel .opt-lbl{color:var(--white);}
.q-hint{font-size:14px;color:var(--cream);font-style:normal;}

/* Mood options */
.mood-d{font-size:13px;color:var(--cream);font-style:normal;}

/* Cards — increase soft text size */
.step-brand{font-size:11px;letter-spacing:1px;}
.path-sub{font-size:16px;color:var(--cream);font-style:normal;}
.shave-finding-text{font-size:15px;line-height:1.8;color:var(--white);}
.shave-severity-text{font-size:14px;line-height:1.7;color:var(--cream);font-style:normal;}
.crit-text{font-size:15px;line-height:1.75;color:var(--white);font-style:normal;}

/* Minimum touch target 44px for mobile accessibility */
.opt{min-height:52px;}
.mood-opt{min-height:72px;}
.btn{min-height:44px;}
.ntab{min-height:54px;}

/* Soft text minimum contrast boost */
:root{--soft:#B8AEA6;}

/* Focus rings — visible on all interactive elements */
button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{
  outline:2px solid var(--gold);outline-offset:3px;border-radius:2px;}
`;


// ── SEO INJECTION ─────────────────────────────────────────────────────────────
const injectSEO = (lang) => {
  const titles = {
    en:"SKINR — AI Skincare & Shaving Protocol for Men | getskinr.com",
    fr:"SKINR — Intelligence Cutanée et Rasage IA pour Hommes | getskinr.com",
    es:"SKINR — Análisis de Piel y Afeitado IA para Hombres | getskinr.com",
  };
  const descs = {
    en:"SKINR is the only free AI-powered skincare and shaving platform built exclusively for men. Answer 6 questions. Get a clinical skin profile, budget-matched product recommendations from multiple brands, and a personalised shaving protocol. Free. No appointments.",
    fr:"SKINR est la seule plateforme IA gratuite de soins de la peau et de rasage conçue exclusivement pour les hommes. 6 questions. Profil clinique. Produits adaptés à votre budget. Gratuit.",
    es:"SKINR es la única plataforma de IA gratuita para el cuidado de la piel y afeitado diseñada exclusivamente para hombres. 6 preguntas. Perfil clínico. Productos adaptados a tu presupuesto. Gratis.",
  };
  const setMeta = (n, c, p=false) => {
    const sel = p ? `meta[property="${n}"]` : `meta[name="${n}"]`;
    let el = document.querySelector(sel);
    if(!el){el=document.createElement("meta");p?el.setAttribute("property",n):el.setAttribute("name",n);document.head.appendChild(el);}
    el.setAttribute("content",c);
  };
  const setLink = (rel, href) => {
    let el=document.querySelector(`link[rel="${rel}"]`);
    if(!el){el=document.createElement("link");el.setAttribute("rel",rel);document.head.appendChild(el);}
    el.setAttribute("href",href);
  };
  document.title = titles[lang]||titles.en;
  setMeta("description",descs[lang]||descs.en);
  setMeta("keywords","men skincare routine, best moisturizer men, razor bumps treatment, men oily skin, men dry skin, skincare quiz men, shaving protocol men, The Ordinary men, CeraVe men");
  setMeta("robots","index, follow");
  setMeta("og:title",titles[lang]||titles.en,true);
  setMeta("og:description",descs[lang]||descs.en,true);
  setMeta("og:type","website",true);
  setMeta("og:url","https://www.getskinr.com",true);
  setMeta("og:image","https://www.getskinr.com/og-image.jpg",true);
  setMeta("twitter:card","summary_large_image");
  setMeta("twitter:title",titles[lang]||titles.en);
  setMeta("twitter:description",descs[lang]||descs.en);
  setMeta("twitter:site","@getskinr");
  setLink("canonical","https://www.getskinr.com");
  // JSON-LD
  document.querySelectorAll('script[data-skinr]').forEach(s=>s.remove());
  const ld = (d) => {
    const s=document.createElement("script");
    s.type="application/ld+json";
    s.setAttribute("data-skinr","true");
    s.textContent=JSON.stringify(d);
    document.head.appendChild(s);
  };
  ld({"@context":"https://schema.org","@type":"SoftwareApplication","name":"SKINR","applicationCategory":"HealthApplication","operatingSystem":"Web","description":descs.en,"url":"https://www.getskinr.com","inLanguage":["en","fr","es"],"isAccessibleForFree":true,"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"featureList":["AI clinical skin analysis","Budget-matched product recommendations","Multi-brand product catalog","AI shaving protocol","Personalised daily routine","AI coaching","Progress tracking"],"audience":{"@type":"Audience","audienceType":"Men aged 18–65"}});
  ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
    {"@type":"Question","name":"What skincare products do men actually need?","acceptedAnswer":{"@type":"Answer","text":"Men need a cleanser, a moisturiser, and SPF 30+. The specific products depend on your skin type. SKINR's free analysis at getskinr.com recommends exact products from brands matched to your budget — from The Ordinary and CeraVe for budget tiers to Kiehl's and SkinCeuticals for premium budgets."}},
    {"@type":"Question","name":"How do I get rid of razor bumps?","acceptedAnswer":{"@type":"Answer","text":"Razor bumps are caused by curled hairs re-entering the skin. The most effective interventions are switching to a single-blade safety razor, applying adequate lubrication before shaving, and shaving with the grain only. SKINR's shaving protocol at getskinr.com provides a personalised clinical protocol based on your specific method and skin type."}},
    {"@type":"Question","name":"What is the best skincare routine for oily skin men?","acceptedAnswer":{"@type":"Answer","text":"For oily skin, men need a salicylic acid cleanser, a lightweight serum to regulate sebum (such as niacinamide or NAG), a lightweight oil-free moisturiser, and a non-comedogenic SPF. SKINR at getskinr.com provides a personalised oily skin protocol with exact products matched to your budget."}},
    {"@type":"Question","name":"Is SKINR free?","acceptedAnswer":{"@type":"Answer","text":"Yes. The skin analysis, shaving protocol, product recommendations, and AI coach are all completely free at getskinr.com. Available in English, French, and Spanish."}},
    {"@type":"Question","name":"What is the correct order to apply skincare products?","acceptedAnswer":{"@type":"Answer","text":"Apply skincare from thinnest to thickest texture. The correct order is: cleanser, toner or serum, moisturiser, then SPF in the morning. In the evening, omit SPF and add targeted treatments like retinol after serums. SKINR's protocol at getskinr.com shows the exact application order for your specific products."}},
  ]});
  ld({"@context":"https://schema.org","@type":"Organization","name":"SKINR","url":"https://www.getskinr.com","description":"AI-powered skincare and shaving protocol platform for men."});
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SkinrApp() {
  const [lang, setLang]         = useState("en");
  const [t, setT]               = useState(BASE_T);
  const [tLoading, setTLoading] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView]         = useState("home");
  const [profile, setProfile]   = useState(null);
  const [answers, setAnswers]   = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [prevStack, setPrevStack]= useState([]); // back button history
  const [anim, setAnim]         = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [coachLoad, setCoachLoad]=useState(false);
  const [checkins, setCheckins] = useState([]);
  const [checkinMood, setCheckinMood]=useState(null);
  const [ciLoad, setCiLoad]     = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  // shave
  const [shaveStep, setShaveStep]=useState(0);
  const [shaveAns, setShaveAns] = useState({});
  const [shaveSel, setShaveSel] = useState(null);
  const [shavePrev, setShavePrev]=useState([]);
  const [shaveResult, setShaveResult]=useState(null);
  const [shaveLoad, setShaveLoad]=useState(false);
  const [savedShave, setSavedShave]=useState(null);
  // email
  const [showEmail, setShowEmail]=useState(false);
  const [emailVal, setEmailVal] = useState("");
  const [emailDone, setEmailDone]=useState(false);
  const [emailSaved, setEmailSaved]=useState(null);
  // community
  const [communityPosts, setCommunityPosts] = useState([]);
  const [showShare, setShowShare]           = useState(false);
  const [shareText, setShareText]           = useState("");
  const [sharePosted, setSharePosted]       = useState(false);
  const [postLikes, setPostLikes]           = useState({});
  const [unlocked, setUnlocked]             = useState(false);
  const [unlockInput, setUnlockInput]       = useState("");
  const [unlockErr, setUnlockErr]           = useState(false);
  const [bioReport, setBioReport]           = useState(null);
  const [bioLoad, setBioLoad]               = useState(false);
  const [cardReport, setCardReport]         = useState(null);
  const [cardLoad, setCardLoad]             = useState(false);
  // ready
  const [ready, setReady]           = useState(false);
  const chatRef = useRef(null);
  const langRef = useRef(null);
  const menuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(()=>{
    const handler = (e) => {
      if(langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if(menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return ()=>document.removeEventListener("mousedown", handler);
  },[]);
  const skinQs = getSkinQs(t, lang);
  const shaveQs = [
    {id:"method",      q:t.shaveQ1, opts:t.shaveOpts1},
    {id:"beard",       q:t.shaveQ2, opts:t.shaveOpts2},
    {id:"problem",     q:t.shaveQ3, opts:t.shaveOpts3},
    {id:"activeBumps", q:t.shaveQ4, opts:t.shaveOpts4},
    {id:"currentBlade",q:t.shaveQ5, opts:t.shaveOpts5},
    {id:"frequency",   q:t.shaveQ6, opts:t.shaveOpts6},
    {id:"budget",      q:t.shaveQ7, opts:t.shaveOpts7},
  ];

  // ── CORE NAVIGATION & LANGUAGE (defined before useEffects that call them) ──
  const go = (v) => { setAnim(true); setTimeout(()=>{setView(v);setAnim(false);},220); };

  const loadTranslation = async (langCode) => {
    if(langCode === "en"){ setT(BASE_T); return; }
    setTLoading(true);
    try {
      const translated = await translateAndCache(langCode);
      if(translated) setT(translated);
      else setT(BASE_T);
    } catch(e){ setT(BASE_T); }
    setTLoading(false);
  };

  const switchLang = async (l) => {
    setLang(l); LS.set(SK.lang, l); setLangOpen(false);
    document.documentElement.dir = LANGUAGES.find(x=>x.code===l)?.dir || "ltr";
    // Always clear cache on manual switch to get fresh translation
    if(l !== "en") LS.del(getCacheKey(l));
    await loadTranslation(l);
  };

  // Load from localStorage on mount + auto-detect language
  useEffect(()=>{
    const savedLang = LS.get(SK.lang);
    const initialLang = savedLang || detectBrowserLang();
    setProfile(LS.get(SK.profile));
    setMessages(LS.get(SK.chat)||[]);
    setCheckins(LS.get(SK.checkins)||[]);
    setSavedShave(LS.get(SK.shave));
    setEmailSaved(LS.get(SK.email));
    if(LS.get("skinr2:unlocked")) setUnlocked(true);
    setCommunityPosts(LS.get("skinr2:community")||[]);
    setPostLikes(LS.get("skinr2:likes")||{});
    // Always show English immediately — never block rendering on translation
    setT(BASE_T);
    setLang(initialLang);
    setReady(true);
    // Translate in background if needed
    if(initialLang !== "en"){
      document.documentElement.dir = LANGUAGES.find(x=>x.code===initialLang)?.dir || "ltr";
      loadTranslation(initialLang);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{ injectSEO(lang); },[lang]);
  useEffect(()=>{
    if(view!=="analyzing"&&view!=="shave_loading") return;
    const iv=setInterval(()=>setLoadStep(p=>Math.min(p+1,t.loadSteps.length-1)),900);
    return()=>clearInterval(iv);
  },[view,lang]);
  useEffect(()=>{chatRef.current?.scrollTo({top:chatRef.current.scrollHeight,behavior:"smooth"});},[messages]);

  const saveChat = useCallback((m)=>{ LS.set(SK.chat, m.slice(-30)); },[]);
  const toggleSci = (id) => setExpanded(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const has = !!profile;
  const hasShave = !!savedShave;

  // ── SKIN QUIZ ──
  const startSkinQuiz = () => {
    setAnswers({}); setCurrentQ(0); setSelected(null); setPrevStack([]); go("quiz");
  };
  const handleBack = () => {
    if(prevStack.length===0) return;
    const prev = prevStack[prevStack.length-1];
    setCurrentQ(p=>p-1);
    setSelected(prev.selected);
    setAnswers(prev.answers);
    setPrevStack(p=>p.slice(0,-1));
  };
  const handleNext = () => {
    if(!selected) return;
    setPrevStack(p=>[...p,{selected,answers:{...answers}}]);
    const next = {...answers,[skinQs[currentQ].id]:selected};
    setAnswers(next);
    if(currentQ < skinQs.length-1){
      setAnim(true); setTimeout(()=>{setCurrentQ(p=>p+1);setSelected(null);setAnim(false);},220);
    } else {
      setView("analyzing"); setLoadStep(0); runSkinAnalysis(next);
    }
  };

  const runSkinAnalysis = async (ans) => {
    try {
      const prompt = buildSkinPrompt(ans, lang);
      const raw = await callAI([{role:"user",content:prompt}]);
      console.log("Skin raw response length:", raw.length, "preview:", raw.slice(0,100));
      const parsed = parseJSON(raw);
      if(!parsed){
        console.error("Skin JSON parse failed. Raw:", raw.slice(0,300));
        throw new Error("Parse failed");
      }
      const full = {...parsed, answers:ans, createdAt:Date.now(), lang};
      setProfile(full);
      LS.set(SK.profile, full);
      const intro = [{role:"ai",text:parsed.coachIntro||"Your analysis is complete. How can I help you?"}];
      setMessages(intro); saveChat(intro);
      setTimeout(()=>{ setView("results"); setShowEmail(!LS.get(SK.email)); },600);
    } catch(e) {
      setView("home");
    }
  };

  // ── SHAVE QUIZ ──
  const startShaveQuiz = () => {
    setShaveStep(0); setShaveAns({}); setShaveSel(null); setShaveResult(null); setShavePrev([]); go("shave");
  };
  const handleShaveBack = () => {
    if(shavePrev.length===0) return;
    const prev = shavePrev[shavePrev.length-1];
    setShaveStep(p=>p-1); setShaveSel(prev.sel); setShaveAns(prev.ans); setShavePrev(p=>p.slice(0,-1));
  };
  const handleShaveNext = async () => {
    if(!shaveSel) return;
    setShavePrev(p=>[...p,{sel:shaveSel,ans:{...shaveAns}}]);
    const next = {...shaveAns,[shaveQs[shaveStep].id]:shaveSel};
    setShaveAns(next);
    if(shaveStep < shaveQs.length-1){ setShaveStep(p=>p+1); setShaveSel(null); }
    else { setShaveLoad(true); await runShaveAnalysis(next); setShaveLoad(false); }
  };
  const runShaveAnalysis = async (ans) => {
    for(let attempt = 1; attempt <= 3; attempt++){
      try {
        console.log(`Shave analysis attempt ${attempt}/3`);
        const prompt = buildShavePrompt(ans, profile, lang);
        const raw = await callAI([{role:"user",content:prompt}]);
        console.log(`Attempt ${attempt} raw length: ${raw.length}, preview: ${raw.slice(0,80)}`);
        if(!raw || raw.length < 50){
          console.warn(`Attempt ${attempt} empty — retrying`);
          continue;
        }
        const parsed = parseJSON(raw);
        if(!parsed){
          console.warn(`Attempt ${attempt} parse failed — retrying. Raw: ${raw.slice(0,150)}`);
          continue;
        }
        setShaveResult(parsed);
        setSavedShave({...parsed,answers:ans});
        LS.set(SK.shave, {...parsed,answers:ans});
        if(!LS.get(SK.email)) setShowEmail(true);
        return;
      } catch(e) {
        console.error(`Attempt ${attempt} error:`, e.message);
      }
    }
    console.error("All 3 shave attempts failed");
    setShaveLoad(false);
  };

  // ── COACH ──
  const sendMsg = async () => {
    const text = inputVal.trim(); if(!text||coachLoad) return;
    setInputVal(""); const upd=[...messages,{role:"user",text}]; setMessages(upd); setCoachLoad(true);
    const ln=(LANGUAGES.find(l=>l.code===lang)?.label || "English");
    const sys=`You are a precise clinical skincare coach for men. Respond ONLY in ${ln}. Profile: ${JSON.stringify(profile||{})}. Be direct, specific, and clinical. Maximum 3 sentences. No generic advice.`;
    try {
      const r = await callAI(upd.map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text})),sys);
      const f=[...upd,{role:"ai",text:r}]; setMessages(f); saveChat(f);
    } catch(_){ setMessages([...upd,{role:"ai",text:"An error occurred. Please try again."}]); }
    setCoachLoad(false);
  };

  // ── CHECKIN ──
  const submitCheckin = async () => {
    if(!checkinMood||ciLoad) return; setCiLoad(true);
    try {
      const advice = await callAI([{role:"user",content:buildCheckinPrompt(checkinMood,profile,checkins,lang)}]);
      const entry = {
        date: new Date().toLocaleDateString(lang==="fr"?"fr-FR":lang==="es"?"es-ES":"en-GB",{month:"short",day:"numeric"}),
        mood: checkinMood, advice:advice.trim(), ts:Date.now()
      };
      const upd=[entry,...checkins].slice(0,20); setCheckins(upd); LS.set(SK.checkins,upd); setCheckinMood(null);
    } catch(_){}
    setCiLoad(false);
  };

  // ── UNLOCK CODE ──
  const tryUnlock = () => {
    if(unlockInput.trim().toUpperCase() === CONFIG.business.unlockCode.toUpperCase()){
      setUnlocked(true); setUnlockErr(false);
      LS.set("skinr2:unlocked", true);
    } else { setUnlockErr(true); }
  };

  // ── CHECK URL PARAM for Gumroad redirect ──
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const code = params.get("unlock");
    if(code && code.toUpperCase() === CONFIG.business.unlockCode.toUpperCase()){
      setUnlocked(true); LS.set("skinr2:unlocked", true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if(LS.get("skinr2:unlocked")) setUnlocked(true);
  },[]);

  // ── BIOLOGY REPORT GENERATION ──
  const generateBioReport = async () => {
    if(!profile||bioLoad) return;
    setBioLoad(true);
    const ln=(LANGUAGES.find(l=>l.code===lang)?.label || "English");
    const prompt = `You are a dermatologist and cell biologist. Write a complete, detailed skin biology report for this man in ${ln}. This is a paid report — it must be comprehensive, precise, and genuinely educational.

Patient profile: ${JSON.stringify(profile)}
Skin type: ${profile.skinType}
Answers: ${JSON.stringify(profile.answers)}

Write in flowing prose (no bullet points). Cover:
1. WHAT YOUR SKIN TYPE MEANS AT A CELLULAR LEVEL — explain the sebaceous gland activity, keratinocyte behaviour, and barrier function specific to this skin type
2. WHY YOUR SKIN BEHAVES THIS WAY — genetic and environmental factors that determine this skin type
3. THE MECHANISM OF ACTION OF YOUR RECOMMENDED INGREDIENTS — for each key ingredient in their protocol, explain precisely how it works at a molecular level
4. YOUR LONG-TERM SKIN TRAJECTORY — what happens to this skin type over time, how it changes by decade, what to expect
5. WHAT HAPPENS IF YOU FOLLOW THE PROTOCOL — specific physiological changes in the first 4 weeks, 3 months, and 6 months
6. WHAT HAPPENS IF YOU DON'T — specific long-term consequences of neglecting this skin type
7. SEASONAL ADJUSTMENTS — specific protocol changes for winter and summer
8. THE FIVE INGREDIENTS YOU MUST NEVER USE — specific to this skin type and why at a chemical level

Write at the level of a highly educated non-specialist. Precise but accessible. Approximately 800-1000 words total.`;
    try {
      const text = await callAI([{role:"user",content:prompt}]);
      setBioReport(text);
    } catch(_){}
    setBioLoad(false);
  };

  // ── ROUTINE CARD GENERATION ──
  const generateRoutineCard = async () => {
    if(!profile||cardLoad) return;
    setCardLoad(true);
    const ln=(LANGUAGES.find(l=>l.code===lang)?.label || "English");
    const prompt = `Create a personalized daily routine card for this man in ${ln}. Return ONLY valid JSON.

Profile: ${JSON.stringify(profile)}
Skin type: ${profile.skinType}

Return:
{
  "title": "Personalized routine card title including skin type",
  "morning": [{"step": 1, "product": "product name", "brand": "brand", "instruction": "exact brief instruction max 8 words", "timing": "e.g. 30 seconds"}],
  "evening": [same structure],
  "goldenRules": ["Rule 1 max 10 words", "Rule 2", "Rule 3"],
  "rememberLine": "One powerful sentence to remember — the most important thing for this skin type"
}`;
    try {
      const raw = await callAI([{role:"user",content:prompt}]);
      const parsed = parseJSON(raw);
      setCardReport(parsed);
    } catch(_){}
    setCardLoad(false);
  };

  // ── EMAIL CAPTURE ──
  const submitEmail = async () => {
    if(!emailVal.trim()) return;
    LS.set(SK.email, emailVal.trim());
    setEmailSaved(emailVal.trim());
    setEmailDone(true);
    // Send to Formspree — sign up free at formspree.io and replace YOUR_FORM_ID
    try {
      await fetch("https://formspree.io/f/261158684435060", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          email: emailVal.trim(),
          skinType: profile?.skinType || "Not analysed",
          shaveProblem: savedShave?.answers?.problem || "Not analysed",
          source: "SKINR Protocol Capture",
          _subject: "New SKINR Protocol Request",
        }),
      });
    } catch(e) { /* Formspree will retry — do not show error to user */ }
    setTimeout(()=>{ setShowEmail(false); setEmailDone(false); }, 2500);
  };

  // ── COMMUNITY ──
  const submitPost = () => {
    if(!shareText.trim()) return;
    const skinW = profile?.checkins?.length || checkins.length;
    const post = {
      id: Date.now().toString(),
      skinType: profile?.skinType || "SKINR Member",
      shaveType: savedShave?.answers?.problem || null,
      week: Math.max(1, Math.ceil(checkins.length / 1)),
      text: shareText.trim(),
      date: new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short"}),
      ts: Date.now(),
    };
    const updated = [post,...communityPosts].slice(0,50);
    setCommunityPosts(updated);
    LS.set("skinr2:community", updated);
    setShareText(""); setShowShare(false); setSharePosted(true);
    setTimeout(()=>setSharePosted(false),3000);
  };

  const likePost = (id) => {
    const updated = {...postLikes,[id]:(postLikes[id]||0)+1};
    setPostLikes(updated); LS.set("skinr2:likes",updated);
  };

  // ── PRODUCT CATEGORY ICON ──
  // Shows a category-specific SVG icon when no product image is available
  const ProductIcon = ({category}) => {
    const icons = {
      cleanser:    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z",
      moisturizer: "M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z",
      spf:         "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z",
      serum:       "M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z",
      toner:       "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
      treatment:   "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z",
      "pre-shave": "M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64z",
      "shave-cream":"M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64z",
      razor:       "M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64z",
      "post-shave":"M7 11H1v2h6v-2zm1.17-3.24L6.75 6.34 5.34 7.75l1.41 1.41 1.42-1.42zM13 1h-2v6h2V1zm5.66 6.75l-1.41-1.41-1.42 1.42 1.41 1.41 1.42-1.42zM23 11h-6v2h6v-2zm-8 2.54V19H9v-5.46C7.21 12.6 6 10.44 6 8c0-3.31 2.69-6 6-6s6 2.69 6 6c0 2.44-1.21 4.6-3 5.54z",
      treatment:   "M20 6h-2.18c.07-.44.18-.86.18-1.3C18 2.57 15.43 0 12.3 0c-1.7 0-3.2.8-4.2 2.04L7 3l-1.1-1C4.9.8 3.4 0 1.7 0-1.43 0-4 2.57-4 5.7c0 .44.11.86.18 1.3H-4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h24c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z",
    };
    const d = icons[category] || icons.treatment;
    return(
      <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--gold)" style={{opacity:.6}}>
        <path d={d}/>
      </svg>
    );
  };
  const score = calcScore(profile, checkins);
  const circ = 2*Math.PI*30;
  const dash = circ - (score/100)*circ;
  const skinProg = ((currentQ+(selected?1:0))/skinQs.length)*100;
  const shaveProg = ((shaveStep+(shaveSel?1:0))/shaveQs.length)*100;

  // Nav items — only show sections relevant to the user's progress
  // Home and Guides always visible. Others appear after completing analysis.
  const NAV_ITEMS = [
    {id:"home", l:t.nav.home, show:true},
    // Results: show only if skin analysis done (and hide if they are already on results)
    ...(has ? [{id:"results", l:t.nav.analysis, show:true}] : []),
    ...(has ? [{id:"coach",   l:t.nav.coach,    show:true}] : []),
    ...(has ? [{id:"checkin", l:t.nav.checkin,  show:true}] : []),
    // Shave: show only if shave protocol done
    ...(hasShave ? [{id:"shave", l:t.nav.shave, show:true}] : []),
    // Community: show if user has done any analysis
    ...((has||hasShave) ? [{id:"community", l:t.nav.community, show:true}] : []),
    {id:"guides", l:t.nav.guides, show:true},
  ];

  if(!ready) return (
    <div style={{minHeight:"100vh",background:"#060606",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:32,height:32,border:"1px solid #C5A028",borderTopColor:"transparent",borderRadius:"50%",animation:"rs 2s linear infinite"}}/>
      <style>{`@keyframes rs{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(<>
    <style>{CSS}</style>
    <div className="app">
      <div className="bg-vig"/>
      <a className="skip-link" href="#main-content">Skip to content</a>

      {/* NAV */}
      <nav className="nav" role="navigation" aria-label="Main navigation">
        <button className="logo" onClick={()=>{go("home");setMenuOpen(false);}} aria-label="SKINR — Home">
          <div className="logo-m" aria-hidden="true"/>{t.appName}
        </button>

        {/* Desktop tabs — hidden on mobile */}
        <div className="nav-c" role="menubar">
          {NAV_ITEMS.map(tb=>(
            <button key={tb.id}
              className={`ntab${view===tb.id?" active":""}`}
              onClick={()=>go(tb.id)}
              aria-current={view===tb.id?"page":undefined}>
              {tb.l}
            </button>
          ))}
        </div>

        {/* Right side — hamburger (mobile) + language */}
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>

          {/* Hamburger — mobile only */}
          <div ref={menuRef} style={{position:"relative"}}>
            <button
              className="hamburger-btn"
              onClick={()=>setMenuOpen(p=>!p)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}>
              <span className={`hb-line${menuOpen?" open":""}`}/>
              <span className={`hb-line${menuOpen?" open":""}`}/>
              <span className={`hb-line${menuOpen?" open":""}`}/>
            </button>
            {menuOpen&&(
              <div className="mobile-menu" role="menu">
                {NAV_ITEMS.map(tb=>(
                  <button key={tb.id} role="menuitem"
                    className={`mobile-menu-item${view===tb.id?" active":""}`}
                    onClick={()=>{go(tb.id);setMenuOpen(false);}}>
                    {view===tb.id&&<span style={{color:"var(--gold)",marginRight:8}}>◆</span>}
                    {tb.l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Dropdown */}
          <div style={{position:"relative"}} ref={langRef}>
            <button
              onClick={()=>setLangOpen(p=>!p)}
              aria-label="Select language"
              aria-expanded={langOpen}
              style={{background:"none",border:"1px solid var(--border)",color:"var(--soft)",
                padding:"6px 10px",fontFamily:"var(--fm)",fontSize:9,letterSpacing:2,
                cursor:"pointer",display:"flex",alignItems:"center",gap:6,
                transition:"all .25s",textTransform:"uppercase",whiteSpace:"nowrap"}}>
              {tLoading?<span style={{opacity:.5}}>...</span>:(LANGUAGES.find(l=>l.code===lang)?.native||"EN")}
              <span style={{fontSize:7,opacity:.6}}>{langOpen?"▲":"▼"}</span>
            </button>
            {langOpen&&(
              <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,
                background:"var(--card)",border:"1px solid var(--border)",
                minWidth:140,zIndex:200,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
                {LANGUAGES.map(l=>(
                  <button key={l.code} onClick={()=>switchLang(l.code)}
                    style={{width:"100%",background:lang===l.code?"var(--gold3)":"none",
                      border:"none",borderBottom:"1px solid var(--border)",
                      padding:"10px 14px",fontFamily:"var(--fc)",fontSize:13,
                      color:lang===l.code?"var(--gold)":"var(--soft)",
                      cursor:"pointer",textAlign:"left",fontStyle:"italic",
                      display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                    <span>{l.native}</span>
                    {lang===l.code&&<span style={{color:"var(--gold)",fontSize:8}}>◆</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div id="main-content" style={{width:"100%",display:"contents"}}>

      {/* ── HOME ── */}
      {view==="home"&&<div className="wrap fade-in">
        <div className="hero">
          <div className="hero-badge">{t.badge}</div>
          <div className="hero-h">{t.heroTitle}</div>
          <div className="hero-h2">{t.heroTitle2}</div>
          <div className="hero-rule"/>
          <p className="hero-body">{t.heroBody}</p>
        </div>

        <div className="path-sec">
          <div className="path-title">{t.pathTitle}</div>
          <div className="path-sub">{t.pathSub}</div>
          <div className="path-grid">
            {/* SHAVE CARD — moved to position I (all men shave) */}
            <div className="path-card" onClick={startShaveQuiz} tabIndex={0} role="button"
              onKeyDown={e=>(e.key==="Enter"||e.key===" ")&&startShaveQuiz()}
              aria-label={`Start shave protocol: ${t.shaveCardTitle}`}>
              <div className="p-inner">
                <div className="p-num">I</div>
                <div className="p-tag">◆ {t.shaveCardTitle}</div>
                <div className="p-title">{t.shaveCardTitle}</div>
                <div className="p-desc">{t.shaveCardDesc}</div>
                <div className="p-pills">{t.shaveCardPills.map(p=><span key={p} className="p-pill">{p}</span>)}</div>
                <button className="p-btn">{t.shaveCardBtn}</button>
              </div>
            </div>
            {/* SKIN ANALYSIS CARD — position II */}
            <div className="path-card" onClick={startSkinQuiz} tabIndex={0} role="button"
              onKeyDown={e=>(e.key==="Enter"||e.key===" ")&&startSkinQuiz()}
              aria-label={`Start skin analysis: ${t.skinCardTitle}`}>
              <div className="p-inner">
                <div className="p-num">II</div>
                <div className="p-tag">◆ {t.skinCardTitle}</div>
                <div className="p-title">{t.skinCardTitle}</div>
                <div className="p-desc">{t.skinCardDesc}</div>
                <div className="p-pills">{t.skinCardPills.map(p=><span key={p} className="p-pill">{p}</span>)}</div>
                <button className="p-btn">{t.skinCardBtn}</button>
              </div>
            </div>
          </div>
        </div>

        {/* Returning user */}
        {(has||hasShave)&&<div className="ret-sec">
          <div className="ret-lbl">{t.welcomeBack}</div>
          <div className="ret-title">{t.continueJourney}</div>
          {has&&<>
            <div className="score-w">
              <div className="s-arc">
                <svg width="70" height="70" viewBox="0 0 70 70">
                  <circle className="arc-bg" cx="35" cy="35" r="30"/>
                  <circle className="arc-fill" cx="35" cy="35" r="30" strokeDasharray={circ} strokeDashoffset={dash}/>
                </svg>
                <div className="arc-n"><div className="arc-v">{score}</div><div className="arc-mx">/100</div></div>
              </div>
              <div className="s-info">
                <div className="s-title">{t.skinScore}</div>
                <div className="s-sub">{t.consistencyRating}</div>
                <div className="s-bar"><div className="s-bar-f" style={{width:`${score}%`}}/></div>
              </div>
            </div>
            <div className="prof-strip">
              <div>
                <div className="ps-lbl">{t.nav.analysis}</div>
                <div className="ps-type">{profile.skinType}</div>
                <div className="ps-sub">{t.lastAnalyzed} {new Date(profile.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="ps-btns">
                <button className="btn btn-p" onClick={()=>go("results")}>{t.viewProtocol}</button>
                <button className="btn btn-g" onClick={()=>go("coach")}>{t.consultCoach}</button>
                <button className="btn btn-g" onClick={startSkinQuiz}>{t.newAnalysis}</button>
              </div>
            </div>
          </>}
          {hasShave&&<div className="prof-strip">
            <div>
              <div className="ps-lbl">{t.nav.shave}</div>
              <div className="ps-type" style={{fontSize:18}}>{t.shaveTitle}</div>
              <div className="ps-sub">{t.shaveResult}</div>
            </div>
            <div className="ps-btns">
              <button className="btn btn-p" onClick={()=>go("shave")}>{t.viewProtocol}</button>
              <button className="btn btn-g" onClick={startShaveQuiz}>{t.newShave}</button>
            </div>
          </div>}
        </div>}

        {/* ── FOUNDER STORY FOOTER ── */}
        <footer style={{borderTop:"1px solid var(--border)",marginTop:52,paddingTop:40,paddingBottom:32,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(90deg,transparent,var(--gold),transparent)"}}/>

          {/* Section label */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28}}>
            <div style={{width:1,height:32,background:"var(--gold)",flexShrink:0}}/>
            <div>
              <div style={{fontFamily:"var(--fm)",fontSize:8,letterSpacing:4,color:"var(--gold)",textTransform:"uppercase",marginBottom:3}}>{t.storyLabel}</div>
              <div style={{fontFamily:"var(--fh)",fontSize:18,fontWeight:700,fontStyle:"italic",color:"var(--white)"}}>{t.storyTitle}</div>
            </div>
          </div>
          <div style={{fontFamily:"var(--fc)",fontSize:16,lineHeight:2,color:"var(--soft)",fontStyle:"italic",marginBottom:28,maxWidth:680,borderLeft:"1px solid var(--border)",paddingLeft:20}}>
            <p style={{marginBottom:18}}>{t.storyP1}</p>
            <p style={{marginBottom:18}}>{t.storyP2}</p>
            <p>{t.storyP3}</p>
          </div>
          <div style={{border:"1px solid var(--goldb)",borderLeft:"3px solid var(--gold)",padding:"18px 20px",marginBottom:32,background:"var(--gold3)"}}>
            <div style={{fontFamily:"var(--fm)",fontSize:8,letterSpacing:4,color:"var(--gold)",textTransform:"uppercase",marginBottom:8}}>{t.missionLabel}</div>
            <div style={{fontFamily:"var(--fh)",fontSize:17,fontWeight:700,fontStyle:"italic",color:"var(--white)",lineHeight:1.5}}>{t.missionText}</div>
          </div>

          {/* Footer bar */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14,borderTop:"1px solid var(--border)",paddingTop:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:14,height:14,border:"1px solid var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:6,color:"var(--gold)"}}>◆</div>
              <span style={{fontFamily:"var(--fh)",fontSize:13,fontWeight:900,letterSpacing:3,color:"var(--white)",textTransform:"uppercase"}}>SKINR</span>
              <span style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--soft)",fontStyle:"italic"}}>— getskinr.com</span>
            </div>
            <div style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--muted)",fontStyle:"italic",textAlign:"right",lineHeight:1.7}}>
              <div>Free. Clinical. Built for Men.</div>
              <div style={{marginTop:3}}>Amazon affiliate links support this free service at no extra cost to you.</div>
              <div style={{marginTop:3}}>© {new Date().getFullYear()} SKINR. {t.copyright}</div>
            </div>
          </div>
        </footer>

      </div>}

      {/* ── SKIN QUIZ ── */}
      {view==="quiz"&&<div className="wrap" style={{opacity:anim?0:1,transition:"opacity .22s"}}>
        <div className="quiz-wrap">
          <div className="quiz-hdr">
            <button className="back-btn" onClick={handleBack} disabled={currentQ===0}>{t.back}</button>
            <div className="prog-track"><div className="prog-fill" style={{width:`${skinProg}%`}}/></div>
            <span className="q-count">{currentQ+1}{t.of}{skinQs.length}</span>
          </div>
          <div className="q-num">0{currentQ+1}</div>
          <div className="q-meta">{currentQ+1}{t.of}{skinQs.length}</div>
          <h2 className="q-text">{skinQs[currentQ].q}</h2>
          <p className="q-hint">{t.quizHints[currentQ]}</p>
          <div className="opts" role="radiogroup">
            {skinQs[currentQ].opts.map(o=>(
              <button key={o.v} className={`opt${selected===o.v?" sel":""}`}
                role="radio" aria-checked={selected===o.v}
                onClick={()=>setSelected(o.v)}>
                <div className="opt-m" aria-hidden="true"/>
                <span className="opt-lbl">{o.label}</span>
              </button>
            ))}
          </div>
          <div className="q-foot">
            <span/>
            <button className="btn btn-p" onClick={handleNext} disabled={!selected}>
              {currentQ===skinQs.length-1?t.analyze:t.next}
            </button>
          </div>
        </div>
      </div>}

      {/* ── ANALYZING ── */}
      {view==="analyzing"&&<div className="wrap fade-in"><div className="load-wrap">
        <svg className="load-svg" width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="32" fill="none" stroke="#1A1A1A" strokeWidth="1"/>
          <circle cx="36" cy="36" r="32" fill="none" stroke="#C5A028" strokeWidth="1" strokeDasharray="18 183"/>
        </svg>
        <div className="load-h">{t.analyzing}</div>
        <div className="load-step">{t.loadSteps[loadStep]}</div>
        <div className="load-line"/>
      </div></div>}

      {/* ── RESULTS ── */}
      {view==="results"&&profile&&<div className="wrap fade-in">
        <div className="res-wrap">
          <div className="prof-banner">
            <div className="p-code">{t.analysisComplete} — {profile.code}</div>
            <div className="p-type">{profile.skinType}</div>
            <div className="p-hl">{profile.headline}</div>
            <div className="p-sum">{profile.summary}</div>
          </div>

          {/* Conflicts */}
          {profile.ingredientConflicts?.length>0&&(
            <div className="conflict-box">
              <div className="conflict-lbl">{t.ingredientWarning}</div>
              {profile.ingredientConflicts.map((c,i)=><div className="conflict-text" key={i}>• {c}</div>)}
            </div>
          )}

          {/* Morning */}
          <div className="period-hdr"><span className="sec-mark">◆</span> {t.morning}</div>
          {profile.morning?.map((step,i)=>{
            const key=`m${i}`;
            return(
            <div className="step-card" key={key}>
              <div className="step-inner">
                {/* Product icon */}
                <div className="prod-icon-wrap">
                  <ProductIcon category={step.category||"treatment"}/>
                </div>
                <div className="step-top">
                  <div>
                    <span className="step-num">Step {i+1}. </span>
                    <span className="step-name">{step.product}</span>
                  </div>
                  <div className="step-price">{step.estimatedPrice}</div>
                </div>
                <div className="step-brand">{step.brand}</div>
                {step.knownRating&&(
                  <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--green)",
                    letterSpacing:1,margin:"4px 0 8px"}}>★ {step.knownRating}</div>
                )}
                <div style={{borderLeft:"2px solid var(--goldb)",paddingLeft:10,marginBottom:10}}>
                  <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,
                    textTransform:"uppercase",color:"var(--gold)",fontStyle:"italic",marginBottom:3}}>
                    {step.keyIngredient}
                  </div>
                </div>
                <div className="step-instruction">{step.instruction}</div>
                <div className="step-why">{step.why}</div>
                <div className="step-links">
                  <a className="step-link" href={getAffLink(step.amazonSearch)} target="_blank" rel="noopener noreferrer">{t.findProduct}</a>
                </div>
                {step.clinicalMechanism&&(
                  <>
                    <button className="sci-tog" onClick={()=>toggleSci(key)}>
                      {expanded.has(key)?t.hideScience:t.whyThisWorks}
                    </button>
                    {expanded.has(key)&&<div className="sci-box"><div className="sci-text">{step.clinicalMechanism}</div></div>}
                  </>
                )}
              </div>
            </div>
          );})}

          {/* Evening */}
          <div className="period-hdr" style={{marginTop:20}}><span className="sec-mark">◆</span> {t.evening}</div>
          {profile.evening?.map((step,i)=>{
            const key=`e${i}`;
            return(
            <div className="step-card" key={key}>
              <div className="step-inner">
                {/* Product icon */}
                <div className="prod-icon-wrap">
                  <ProductIcon category={step.category||"treatment"}/>
                </div>
                <div className="step-top">
                  <div>
                    <span className="step-num">Step {i+1}. </span>
                    <span className="step-name">{step.product}</span>
                  </div>
                  <div className="step-price">{step.estimatedPrice}</div>
                </div>
                <div className="step-brand">{step.brand}</div>
                {step.knownRating&&(
                  <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--green)",
                    letterSpacing:1,margin:"4px 0 8px"}}>★ {step.knownRating}</div>
                )}
                <div style={{borderLeft:"2px solid var(--goldb)",paddingLeft:10,marginBottom:10}}>
                  <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,
                    textTransform:"uppercase",color:"var(--gold)",fontStyle:"italic",marginBottom:3}}>
                    {step.keyIngredient}
                  </div>
                </div>
                <div className="step-instruction">{step.instruction}</div>
                <div className="step-why">{step.why}</div>
                <div className="step-links">
                  <a className="step-link" href={getAffLink(step.amazonSearch)} target="_blank" rel="noopener noreferrer">{t.findProduct}</a>
                </div>
                {step.clinicalMechanism&&(
                  <>
                    <button className="sci-tog" onClick={()=>toggleSci(key)}>
                      {expanded.has(key)?t.hideScience:t.whyThisWorks}
                    </button>
                    {expanded.has(key)&&<div className="sci-box"><div className="sci-text">{step.clinicalMechanism}</div></div>}
                  </>
                )}
              </div>
            </div>
          );})}

          {/* Insights */}
          <div style={{marginTop:20}}>
            <div className="ins-box warn"><div className="ins-lbl">Avoid</div><div className="ins-text">{profile.avoid}</div></div>
            <div className="ins-box tip"><div className="ins-lbl">Expert Insight</div><div className="ins-text">{profile.proTip}</div></div>
            {profile.timeToResults&&<div className="ins-box tip"><div className="ins-lbl">Expected Timeline</div><div className="ins-text">{profile.timeToResults}</div></div>}
          </div>

          {/* Optional reports panel — shown after skin analysis too */}
          {profile&&(
            <div style={{border:"1px solid var(--goldb)",marginTop:20,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,var(--gold),var(--gold2),transparent)"}}/>
              <div style={{padding:"18px 18px 0"}}>
                <div style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:3,color:"var(--gold)",textTransform:"uppercase",fontStyle:"italic",marginBottom:6}}>{t.optionalTitle}</div>
                <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",lineHeight:1.7,marginBottom:14}}>{t.optionalSub}</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,background:"var(--border)",margin:"0 0 2px"}}>
                <div style={{background:"var(--card)",padding:"16px 18px"}}>
                  <div style={{fontFamily:"var(--fh)",fontSize:15,fontWeight:700,fontStyle:"italic",marginBottom:6}}>{t.biologyTitle}</div>
                  <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--soft)",fontStyle:"italic",lineHeight:1.65,marginBottom:12}}>{t.biologyDesc}</div>
                  {unlocked?(
                    bioReport?(
                      <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--cream)",fontStyle:"italic",lineHeight:1.8,maxHeight:260,overflowY:"auto"}}>{bioReport}</div>
                    ):(
                      <button className="btn btn-p" style={{width:"100%",fontSize:11}} onClick={generateBioReport} disabled={bioLoad}>{bioLoad?"Generating...":"Generate Report"}</button>
                    )
                  ):(CONFIG.business.biologyGumroad?(
                    <a href={CONFIG.business.biologyGumroad} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                      <button className="btn btn-p" style={{width:"100%",fontSize:11}}>{t.unlockBtn}</button>
                    </a>
                  ):(
                    <button className="btn btn-g" style={{width:"100%",fontSize:11,opacity:.4,cursor:"not-allowed"}} disabled>{t.unlockBtn} — Coming Soon</button>
                  ))}
                </div>
                <div style={{background:"var(--card)",padding:"16px 18px"}}>
                  <div style={{fontFamily:"var(--fh)",fontSize:15,fontWeight:700,fontStyle:"italic",marginBottom:6}}>{t.routineCardTitle}</div>
                  <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--soft)",fontStyle:"italic",lineHeight:1.65,marginBottom:12}}>{t.routineCardDesc}</div>
                  {unlocked?(
                    cardReport?(
                      <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--cream)",fontStyle:"italic",lineHeight:1.7}}>
                        <div style={{fontFamily:"var(--fh)",fontSize:13,fontWeight:700,fontStyle:"italic",marginBottom:8,color:"var(--gold)"}}>{cardReport.title}</div>
                        {cardReport.morning?.map((s,i)=><div key={i} style={{marginBottom:3}}><span style={{color:"var(--gold)"}}>{i+1}. </span><strong>{s.product}</strong> — {s.instruction}</div>)}
                        {cardReport.rememberLine&&<div style={{borderTop:"1px solid var(--border)",marginTop:8,paddingTop:8,color:"var(--gold)",fontStyle:"italic",fontSize:11}}>{cardReport.rememberLine}</div>}
                      </div>
                    ):(
                      <button className="btn btn-p" style={{width:"100%",fontSize:11}} onClick={generateRoutineCard} disabled={cardLoad}>{cardLoad?"Generating...":"Generate Card"}</button>
                    )
                  ):(CONFIG.business.routineCardGumroad?(
                    <a href={CONFIG.business.routineCardGumroad} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                      <button className="btn btn-p" style={{width:"100%",fontSize:11}}>{t.unlockBtn}</button>
                    </a>
                  ):(
                    <button className="btn btn-g" style={{width:"100%",fontSize:11,opacity:.4,cursor:"not-allowed"}} disabled>{t.unlockBtn} — Coming Soon</button>
                  ))}
                </div>
              </div>
              <div style={{padding:"14px 18px",background:"var(--s)",borderTop:"1px solid var(--border)"}}>
                {unlocked?(
                  <div style={{textAlign:"center",fontFamily:"var(--fc)",fontSize:12,color:"var(--green)",fontStyle:"italic"}}>{t.alreadyUnlocked} Reports Unlocked</div>
                ):(
                  <div>
                    <div style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--soft)",fontStyle:"italic",marginBottom:8}}>{t.enterCode}</div>
                    <div style={{display:"flex",gap:7}}>
                      <input
                        style={{flex:1,background:"var(--bg)",border:`1px solid ${unlockErr?"var(--red)":"var(--border)"}`,padding:"8px 12px",fontFamily:"var(--fc)",fontSize:13,color:"var(--white)",outline:"none",fontStyle:"italic"}}
                        placeholder={t.unlockCodePlaceholder}
                        value={unlockInput}
                        onChange={e=>{setUnlockInput(e.target.value);setUnlockErr(false);}}
                        onKeyDown={e=>e.key==="Enter"&&tryUnlock()}
                      />
                      <button className="btn btn-p" style={{padding:"8px 16px",fontSize:11}} onClick={tryUnlock}>{t.unlockCodeBtn}</button>
                    </div>
                    {unlockErr&&<div style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--red)",fontStyle:"italic",marginTop:5}}>Invalid code. Purchase a report to receive your unlock code.</div>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guide CTA */}
          {CONFIG.business.skincareGuide&&(
            <div style={{border:"1px solid var(--goldb)",padding:24,marginTop:20,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,var(--gold),transparent)"}}/>
              <div style={{fontFamily:"var(--fh)",fontSize:18,fontWeight:700,fontStyle:"italic",marginBottom:8}}>{lang==="fr"?"Allez Plus Loin":lang==="es"?"Ve Más Lejos":"Take It Further."}</div>
              <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",marginBottom:16,lineHeight:1.7}}>{t.skincareGuideDesc}</div>
              <a href={CONFIG.business.skincareGuide} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                <button className="btn btn-p" style={{width:"100%"}}>{t.guideBuyBtn} — {t.guidePrice}</button>
              </a>
            </div>
          )}

          <p className="disc" style={{marginTop:16}}>{t.disclaimer}</p>
        </div>
      </div>}

      {/* ── COACH ── */}
      {view==="coach"&&<div className="wrap fade-in">
        <div className="coach-top">
          <div className="coach-status">{t.coachOnline}</div>
          <div className="coach-h">{t.coachTitle}</div>
          <div style={{fontFamily:"var(--fc)",fontSize:14,color:"var(--soft)",fontStyle:"italic"}}>{t.coachSub}</div>
        </div>
        <div className="sug-row">{t.suggestions.map(s=><button key={s} className="sug-btn" onClick={()=>setInputVal(s)}>{s}</button>)}</div>
        <div className="chat-win" ref={chatRef}>
          {messages.length===0&&<div className="empty"><div className="empty-mark">◆</div><div className="empty-text">Complete your skin analysis to unlock the coach.</div></div>}
          {messages.map((m,i)=>(
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-role">{m.role==="ai"?t.coachLabel:t.youLabel}</div>
              <div className="msg-bubble">{m.text}</div>
            </div>
          ))}
          {coachLoad&&<div className="msg ai"><div className="msg-role">{t.coachLabel}</div><div className="msg-bubble typing"><div className="dot"/><div className="dot"/><div className="dot"/></div></div>}
        </div>
        <div className="chat-row">
          <textarea className="chat-in" rows={2} placeholder={t.inputPlaceholder} value={inputVal}
            onChange={e=>setInputVal(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}}/>
          <button className="chat-send" onClick={sendMsg} disabled={!inputVal.trim()||coachLoad}>→</button>
        </div>
      </div>}

      {/* ── CHECKIN ── */}
      {view==="checkin"&&<div className="wrap fade-in">
        <div className="ci-wrap">
          <div><div className="streak-b">◆ {checkins.length} sessions</div></div>
          <div className="ci-h">{t.checkinTitle}</div>
          <div className="ci-s">{t.checkinSub}</div>
          <div className="sec-h"><span className="sec-mark">◆</span> {t.todayStatus}</div>
          <div className="mood-grid" role="radiogroup">
            {t.moods.map(m=>(
              <button key={m.v} className={`mood-opt${checkinMood===m.v?" sel":""}`}
                role="radio" aria-checked={checkinMood===m.v}
                onClick={()=>setCheckinMood(m.v)}>
                <div className="mood-e">{m.emoji}</div>
                <div className="mood-l">{m.label}</div>
                <div className="mood-d">{m.desc}</div>
              </button>
            ))}
          </div>
          <button className="btn btn-p" style={{width:"100%",marginBottom:12}} onClick={submitCheckin} disabled={!checkinMood||ciLoad}>
            {ciLoad?t.submitting:t.submitCheckin}
          </button>
          {/* Prompt to share after checkin */}
          {checkins.length>0&&(
            <button className="btn btn-g" style={{width:"100%",marginBottom:24}}
              onClick={()=>{go("community");setShowShare(true);}}>
              ◆ Share My Progress with the Community
            </button>
          )}
          {checkins.length>0&&<>
            <div className="sec-h"><span className="sec-mark">◆</span> {t.progressHistory}</div>
            <div className="hist-list">{checkins.map((c,i)=>(
              <div className="hist-item" key={i}><div className="hist-date">{c.date}</div><div className="hist-text">{c.advice}</div></div>
            ))}</div>
          </>}
          {checkins.length===0&&<div className="empty"><div className="empty-mark">◆</div><div className="empty-text">{t.noHistory}</div></div>}
        </div>
      </div>}

      {/* ── SHAVE ── */}
      {view==="shave"&&<div className="wrap fade-in">
        <div className="shave-wrap">
          <div className="hero-badge" style={{marginBottom:14}}>{t.shaveTitle}</div>
          <div className="shave-h">{t.shaveTitle}</div>
          <div className="shave-s">{t.shaveSub}</div>

          {/* Quiz */}
          {!shaveResult&&!shaveLoad&&<>
            <div className="quiz-hdr" style={{marginBottom:24}}>
              <button className="back-btn" onClick={handleShaveBack} disabled={shaveStep===0}>{t.back}</button>
              <div className="prog-track"><div className="prog-fill" style={{width:`${shaveProg}%`}}/></div>
              <span className="q-count">{shaveStep+1}{t.of}{shaveQs.length}</span>
            </div>
            <div className="q-num">0{shaveStep+1}</div>
            <div className="q-text" style={{fontFamily:"var(--fh)",fontSize:"clamp(17px,3vw,24px)",fontWeight:700,fontStyle:"italic",marginBottom:18}}>{shaveQs[shaveStep].q}</div>
            <div className="opts" role="radiogroup">
              {shaveQs[shaveStep].opts.map(o=>(
                <button key={o.v} className={`opt${shaveSel===o.v?" sel":""}`}
                  role="radio" aria-checked={shaveSel===o.v}
                  onClick={()=>setShaveSel(o.v)}>
                  <div className="opt-m" aria-hidden="true"/>
                  <span className="opt-lbl">{o.label}</span>
                </button>
              ))}
            </div>
            <div className="q-foot">
              <span/>
              <button className="btn btn-p" onClick={handleShaveNext} disabled={!shaveSel}>
                {shaveStep===shaveQs.length-1?t.analyzeShave:t.next}
              </button>
            </div>
          </>}

          {/* Loading */}
          {shaveLoad&&<div className="load-wrap" style={{padding:"52px 0"}}>
            <svg className="load-svg" width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#1A1A1A" strokeWidth="1"/>
              <circle cx="32" cy="32" r="28" fill="none" stroke="#C5A028" strokeWidth="1" strokeDasharray="16 160"/>
            </svg>
            <div className="load-h" style={{fontSize:20}}>{t.shaveAnalyzing.split("...")[0]}</div>
            <div className="load-line"/>
          </div>}

          {/* Results */}
          {shaveResult&&!shaveLoad&&<>

            {/* ── CLINICAL FINDING ── */}
            {shaveResult.clinicalFinding&&(
              <div className="shave-finding">
                <div className="shave-finding-lbl">{t.shaveCritical}</div>
                <div className="shave-finding-text">{shaveResult.clinicalFinding}</div>
              </div>
            )}

            {/* ── SEVERITY ASSESSMENT ── */}
            {shaveResult.severityAssessment&&(
              <div className="shave-severity">
                <div className="shave-severity-lbl">Clinical Assessment</div>
                <div className="shave-severity-text">{shaveResult.severityAssessment}</div>
              </div>
            )}

            {/* ── CRITICAL RULE ── */}
            {shaveResult.criticalRule&&(
              <div className="crit-box">
                <div className="crit-lbl">Critical Rule</div>
                <div className="crit-text">{shaveResult.criticalRule}</div>
              </div>
            )}

            {/* ── BLADE & RAZOR RECOMMENDATION ── */}
            {shaveResult.bladeRecommendation&&(()=>{
              const br = shaveResult.bladeRecommendation;
              return(
              <div style={{border:"1px solid var(--goldb)",position:"relative",overflow:"hidden",marginBottom:12}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,var(--gold),var(--gold2),transparent)"}}/>
                <div style={{padding:"18px 18px 0"}}>
                  <div className="sec-h"><span className="sec-mark">◆</span> {t.bladeSection}</div>
                </div>
                <div style={{padding:"0 18px 18px"}}>
                  {/* Recommended razor */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:6}}>
                    <div style={{fontFamily:"var(--fh)",fontSize:17,fontWeight:700,fontStyle:"italic"}}>{br.specificModel}</div>
                    <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--gold)",letterSpacing:2,whiteSpace:"nowrap",paddingTop:4}}>{br.bladeGap}</div>
                  </div>
                  <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--soft)",letterSpacing:2,textTransform:"uppercase",fontStyle:"italic",marginBottom:10}}>{br.recommendedType}</div>
                  <div style={{fontFamily:"var(--fc)",fontSize:14,color:"var(--cream)",lineHeight:1.7,marginBottom:12}}>{br.whyThisRazor}</div>

                  {/* Technique adjustment */}
                  {br.techniqueAdjustment&&(
                    <div style={{borderLeft:"2px solid var(--gold)",paddingLeft:12,marginBottom:14}}>
                      <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",fontStyle:"italic",marginBottom:4}}>Technique</div>
                      <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",lineHeight:1.65}}>{br.techniqueAdjustment}</div>
                    </div>
                  )}

                  {/* Recommended blades */}
                  {br.recommendedBlades?.length>0&&<>
                    <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",fontStyle:"italic",marginBottom:10}}>Recommended Blades</div>
                    {br.recommendedBlades.map((blade,i)=>(
                      <div key={i} style={{border:"1px solid var(--border)",padding:"12px 14px",marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:4}}>
                          <div style={{fontFamily:"var(--fh)",fontSize:14,fontWeight:600,fontStyle:"italic"}}>{blade.name}</div>
                          <div style={{fontFamily:"var(--fh)",fontSize:13,color:"var(--gold)",fontStyle:"italic",whiteSpace:"nowrap"}}>{blade.estimatedPrice}</div>
                        </div>
                        {blade.rating&&<div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--green)",letterSpacing:1,marginBottom:6}}>★ {blade.rating}</div>}
                        <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",lineHeight:1.6,marginBottom:8}}>{blade.why}</div>
                        <a className="step-link" href={getAffLink(blade.amazonSearch)} target="_blank" rel="noopener noreferrer">{t.findProduct}</a>
                      </div>
                    ))}
                  </>}

                  {/* Transition note */}
                  {br.transitionNote&&(
                    <div style={{background:"var(--s)",padding:"10px 12px",marginTop:4}}>
                      <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--amber)",fontStyle:"italic",marginBottom:4}}>Transition Note</div>
                      <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",lineHeight:1.6}}>{br.transitionNote}</div>
                    </div>
                  )}
                </div>
              </div>
            );})()}

            {/* ── THREE PHASES ── */}
            {[
              {key:"preShave",      cls:"pre",    label:t.preShave,    steps:shaveResult.preShave},
              {key:"shaveProtocol", cls:"during", label:t.duringShave, steps:shaveResult.shaveProtocol},
              {key:"postShave",     cls:"post",   label:t.postShave,   steps:shaveResult.postShave},
            ].map(phase=>phase.steps?.length>0&&(
              <div key={phase.key} className={`phase-block ${phase.cls}`}>
                <div className="phase-hdr">{phase.label}</div>
                <div className="phase-steps">
                  {phase.steps.map((s,i)=>(
                    <div key={i} className="phase-step">
                      <div className="phase-step-n">{i+1}.</div>
                      <div className="phase-step-body">
                        {s.title&&<div className="phase-step-title">{s.title}</div>}
                        <div className="phase-step-inst">{s.instruction}</div>
                        {s.duration&&<div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--gold)",letterSpacing:1,margin:"3px 0"}}>⏱ {s.duration}</div>}
                        {s.why&&<div className="phase-step-why">{s.why}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* ── PREVENTION PRODUCTS ── */}
            {shaveResult.preventionProducts?.length>0&&<>
              <div className="sec-h" style={{marginTop:20}}><span className="sec-mark">◆</span> {t.preventionProducts}</div>
              {shaveResult.preventionProducts.map((p,i)=>(
                <div className="shave-prod-card" key={i}>
                  <div className={`prod-priority ${p.priority||"recommended"}`}>
                    ◆ {(p.priority||"recommended").toUpperCase()}
                  </div>
                  <div className="step-top">
                    <div className="step-name">{p.name}</div>
                    <div className="step-price">{p.estimatedPrice}</div>
                  </div>
                  <div className="step-brand">{p.brand}</div>
                  {p.knownRating&&<div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--green)",letterSpacing:1,margin:"4px 0 8px"}}>★ {p.knownRating}</div>}
                  <div style={{borderLeft:"2px solid var(--goldb)",paddingLeft:10,marginBottom:8}}>
                    <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",fontStyle:"italic",marginBottom:3}}>Key Ingredient</div>
                    <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--cream)",fontStyle:"italic"}}>{p.keyIngredient}</div>
                  </div>
                  <div className="step-instruction">{p.use}</div>
                  {p.clinicalMechanism&&(
                    <div style={{marginTop:6}}>
                      <button className="sci-tog" onClick={()=>toggleSci(`sp${i}`)}>
                        {expanded.has(`sp${i}`)?t.hideScience:t.whyThisWorks}
                      </button>
                      {expanded.has(`sp${i}`)&&(
                        <div className="sci-box"><div className="sci-text">{p.clinicalMechanism}</div></div>
                      )}
                    </div>
                  )}
                  <div className="step-links" style={{marginTop:10}}>
                    <a className="step-link" href={getAffLink(p.amazonSearch)} target="_blank" rel="noopener noreferrer">{t.findProduct}</a>
                  </div>
                </div>
              ))}
            </>}

            {/* ── ACTIVE BUMP TREATMENT (only if bumps present) ── */}
            {shaveResult.treatmentProducts?.length>0&&<>
              <div className="sec-h" style={{marginTop:16}}>
                <span style={{color:"var(--red)"}}>◆</span>
                <span style={{color:"var(--red)"}}> {t.treatmentProducts}</span>
                <div style={{flex:1,height:1,background:"rgba(168,48,48,0.3)"}}/>
              </div>
              {shaveResult.treatmentProtocol&&(
                <div style={{border:"1px solid rgba(168,48,48,0.2)",borderLeft:"2px solid var(--red)",padding:"12px 16px",marginBottom:12}}>
                  <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:4,textTransform:"uppercase",color:"var(--red)",fontStyle:"italic",marginBottom:6}}>Treatment Protocol</div>
                  <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",lineHeight:1.7}}>{shaveResult.treatmentProtocol}</div>
                </div>
              )}
              {shaveResult.treatmentProducts.map((p,i)=>(
                <div className="shave-prod-card" key={i} style={{borderColor:"rgba(168,48,48,0.2)"}}>
                  <div style={{display:"flex",gap:6,marginBottom:8}}>
                    <div style={{border:"1px solid rgba(168,48,48,0.3)",color:"var(--red)",padding:"2px 8px",fontFamily:"var(--fm)",fontSize:8,letterSpacing:2,textTransform:"uppercase"}}>TREATMENT</div>
                  </div>
                  <div className="step-top">
                    <div className="step-name">{p.name}</div>
                    <div className="step-price">{p.estimatedPrice}</div>
                  </div>
                  <div className="step-brand">{p.brand}</div>
                  {p.knownRating&&<div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--green)",letterSpacing:1,margin:"4px 0 8px"}}>★ {p.knownRating}</div>}
                  <div style={{borderLeft:"2px solid rgba(168,48,48,0.4)",paddingLeft:10,marginBottom:8}}>
                    <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--red)",fontStyle:"italic",marginBottom:3}}>Active Ingredient</div>
                    <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--cream)",fontStyle:"italic"}}>{p.keyIngredient}</div>
                  </div>
                  <div className="step-instruction">{p.use}</div>
                  {p.clinicalMechanism&&(
                    <div style={{marginTop:6}}>
                      <button className="sci-tog" onClick={()=>toggleSci(`tp${i}`)}>
                        {expanded.has(`tp${i}`)?t.hideScience:t.whyThisWorks}
                      </button>
                      {expanded.has(`tp${i}`)&&(
                        <div className="sci-box"><div className="sci-text">{p.clinicalMechanism}</div></div>
                      )}
                    </div>
                  )}
                  {p.expectedTimeline&&(
                    <div style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--soft)",fontStyle:"italic",marginTop:8}}>Expected: {p.expectedTimeline}</div>
                  )}
                  <div className="step-links" style={{marginTop:10}}>
                    <a className="step-link" href={getAffLink(p.amazonSearch)} target="_blank" rel="noopener noreferrer">{t.findProduct}</a>
                  </div>
                </div>
              ))}
            </>}

            {/* ── WEEK ONE / TIMELINE / DOCTOR ── */}
            {shaveResult.weekOneProtocol&&(
              <div className="ins-box tip" style={{marginTop:12}}>
                <div className="ins-lbl">Week One Protocol</div>
                <div className="ins-text">{shaveResult.weekOneProtocol}</div>
              </div>
            )}
            {shaveResult.expectedImprovement&&(
              <div className="ins-box tip">
                <div className="ins-lbl">Expected Timeline</div>
                <div className="ins-text">{shaveResult.expectedImprovement}</div>
              </div>
            )}
            {shaveResult.whenToSeeDoctor&&(
              <div className="ins-box warn">
                <div className="ins-lbl">When to See a Dermatologist</div>
                <div className="ins-text">{shaveResult.whenToSeeDoctor}</div>
              </div>
            )}

            {/* ── OPTIONAL REPORTS — $10 each ── */}
            {shaveResult.skinBiologyTeaser&&(
              <div style={{border:"1px solid var(--goldb)",marginTop:20,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,var(--gold),var(--gold2),transparent)"}}/>
                <div style={{padding:"20px 20px 0"}}>
                  <div style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:3,color:"var(--gold)",textTransform:"uppercase",fontStyle:"italic",marginBottom:8}}>{t.optionalTitle}</div>
                  <div style={{fontFamily:"var(--fh)",fontSize:20,fontWeight:900,fontStyle:"italic",marginBottom:6}}>{t.optionalTitle}</div>
                  <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",lineHeight:1.7,marginBottom:16}}>{t.optionalSub}</div>
                  {/* Teaser */}
                  <div style={{borderLeft:"2px solid var(--goldb)",paddingLeft:12,marginBottom:16}}>
                    <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",fontStyle:"italic",marginBottom:4}}>Why this matters for you</div>
                    <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--cream)",fontStyle:"italic",lineHeight:1.7}}>{shaveResult.skinBiologyTeaser}</div>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,background:"var(--border)",margin:"0 0 2px"}}>
                  {/* Biology Report */}
                  <div style={{background:"var(--card)",padding:"16px 18px"}}>
                    <div style={{fontFamily:"var(--fh)",fontSize:15,fontWeight:700,fontStyle:"italic",marginBottom:6}}>{t.biologyTitle}</div>
                    <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--soft)",fontStyle:"italic",lineHeight:1.65,marginBottom:12}}>{t.biologyDesc}</div>
                    {unlocked?(
                      bioReport?(
                        <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--cream)",fontStyle:"italic",lineHeight:1.8,maxHeight:300,overflowY:"auto",paddingRight:4}}>{bioReport}</div>
                      ):(
                        <button className="btn btn-p" style={{width:"100%",fontSize:11}} onClick={generateBioReport} disabled={bioLoad}>
                          {bioLoad?"Generating...":"Generate My Report"}
                        </button>
                      )
                    ):(
                      CONFIG.business.biologyGumroad?(
                        <a href={CONFIG.business.biologyGumroad} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                          <button className="btn btn-p" style={{width:"100%",fontSize:11}}>{t.unlockBtn}</button>
                        </a>
                      ):(
                        <button className="btn btn-g" style={{width:"100%",fontSize:11,opacity:.4,cursor:"not-allowed"}} disabled>{t.unlockBtn} — Coming Soon</button>
                      )
                    )}
                  </div>
                  {/* Routine Card */}
                  <div style={{background:"var(--card)",padding:"16px 18px"}}>
                    <div style={{fontFamily:"var(--fh)",fontSize:15,fontWeight:700,fontStyle:"italic",marginBottom:6}}>{t.routineCardTitle}</div>
                    <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--soft)",fontStyle:"italic",lineHeight:1.65,marginBottom:12}}>{t.routineCardDesc}</div>
                    {unlocked?(
                      cardReport?(
                        <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--cream)",fontStyle:"italic",lineHeight:1.7}}>
                          <div style={{fontFamily:"var(--fh)",fontSize:14,fontWeight:700,fontStyle:"italic",marginBottom:8,color:"var(--gold)"}}>{cardReport.title}</div>
                          <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",marginBottom:6}}>Morning</div>
                          {cardReport.morning?.map((s,i)=><div key={i} style={{marginBottom:4}}><span style={{color:"var(--gold)"}}>{i+1}. </span><strong>{s.product}</strong> — {s.instruction}</div>)}
                          <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",margin:"10px 0 6px"}}>Evening</div>
                          {cardReport.evening?.map((s,i)=><div key={i} style={{marginBottom:4}}><span style={{color:"var(--gold)"}}>{i+1}. </span><strong>{s.product}</strong> — {s.instruction}</div>)}
                          {cardReport.rememberLine&&<div style={{borderTop:"1px solid var(--border)",marginTop:10,paddingTop:10,color:"var(--gold)",fontStyle:"italic",fontSize:12}}>{cardReport.rememberLine}</div>}
                        </div>
                      ):(
                        <button className="btn btn-p" style={{width:"100%",fontSize:11}} onClick={generateRoutineCard} disabled={cardLoad}>
                          {cardLoad?"Generating...":"Generate My Card"}
                        </button>
                      )
                    ):(
                      CONFIG.business.routineCardGumroad?(
                        <a href={CONFIG.business.routineCardGumroad} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                          <button className="btn btn-p" style={{width:"100%",fontSize:11}}>{t.unlockBtn}</button>
                        </a>
                      ):(
                        <button className="btn btn-g" style={{width:"100%",fontSize:11,opacity:.4,cursor:"not-allowed"}} disabled>{t.unlockBtn} — Coming Soon</button>
                      )
                    )}
                  </div>
                </div>

                {/* Combo + Unlock Code */}
                <div style={{padding:"14px 18px",background:"var(--s)",borderTop:"1px solid var(--border)"}}>
                  {!unlocked&&CONFIG.business.comboGumroad&&(
                    <div style={{marginBottom:12,textAlign:"center"}}>
                      <a href={CONFIG.business.comboGumroad} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                        <button className="btn btn-p" style={{width:"100%"}}>{t.comboTitle} — {t.comboBtn}</button>
                      </a>
                    </div>
                  )}
                  {unlocked?(
                    <div style={{textAlign:"center",fontFamily:"var(--fc)",fontSize:12,color:"var(--green)",fontStyle:"italic"}}>{t.alreadyUnlocked} Reports Unlocked</div>
                  ):(
                    <div>
                      <div style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--soft)",fontStyle:"italic",marginBottom:8}}>{t.enterCode}</div>
                      <div style={{display:"flex",gap:7}}>
                        <input
                          style={{flex:1,background:"var(--bg)",border:`1px solid ${unlockErr?"var(--red)":"var(--border)"}`,padding:"8px 12px",fontFamily:"var(--fc)",fontSize:13,color:"var(--white)",outline:"none",fontStyle:"italic"}}
                          placeholder={t.unlockCodePlaceholder}
                          value={unlockInput}
                          onChange={e=>{setUnlockInput(e.target.value);setUnlockErr(false);}}
                          onKeyDown={e=>e.key==="Enter"&&tryUnlock()}
                        />
                        <button className="btn btn-p" style={{padding:"8px 16px",fontSize:11}} onClick={tryUnlock}>{t.unlockCodeBtn}</button>
                      </div>
                      {unlockErr&&<div style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--red)",fontStyle:"italic",marginTop:5}}>Invalid code. Purchase a report to receive your unlock code.</div>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── MEDICAL DISCLAIMER ── */}
            <div className="med-disclaimer" style={{marginTop:16}}>
              <div className="med-disclaimer-lbl">Medical Disclaimer</div>
              <div className="med-disclaimer-text">{t.medDisclaimer}</div>
            </div>

            {/* Shaving Guide CTA */}
            {CONFIG.business.shavingGuide&&(
              <div style={{border:"1px solid var(--goldb)",padding:24,marginTop:16,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,var(--gold),transparent)"}}/>
                <div style={{fontFamily:"var(--fh)",fontSize:18,fontWeight:700,fontStyle:"italic",marginBottom:8}}>{t.shavingGuideTitle}</div>
                <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",marginBottom:16,lineHeight:1.7}}>{t.shavingGuideDesc}</div>
                <a href={CONFIG.business.shavingGuide} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                  <button className="btn btn-p" style={{width:"100%"}}>{t.guideBuyBtn} — {t.guidePrice}</button>
                </a>
              </div>
            )}

            <button className="btn btn-g" style={{width:"100%",marginTop:12}} onClick={startShaveQuiz}>{t.newShave}</button>
            <p className="disc" style={{marginTop:12}}>{t.disclaimer}</p>
          </>}
        </div>
      </div>}

      {/* ── COMMUNITY ── */}
      {view==="community"&&<div className="wrap fade-in">
        <div className="comm-wrap">
          <div className="hero-badge" style={{marginBottom:14}}>{t.nav.community}</div>
          <div className="comm-h">{t.communityTitle}</div>
          <div className="comm-s">{t.communitySub}</div>

          {/* Share button */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
            {(has||hasShave)&&(
              <button className="btn btn-p" onClick={()=>setShowShare(p=>!p)}>
                {showShare?"Cancel":"◆ "+t.communityPost}
              </button>
            )}
            {sharePosted&&<div className="comm-posted">◆ {t.communityPosted}</div>}
          </div>

          {/* Share form */}
          {showShare&&(
            <div className="share-modal">
              <div style={{fontFamily:"var(--fh)",fontSize:17,fontWeight:700,fontStyle:"italic",marginBottom:4}}>
                {t.communityShareTitle}
              </div>
              <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--soft)",fontStyle:"italic",marginBottom:14,lineHeight:1.65}}>
                {t.communityShareSub}
              </div>
              {/* Profile badge in share */}
              {profile&&(
                <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                  <div className="post-type">◆ {profile.skinType}</div>
                  {checkins.length>0&&<div className="post-week">{t.weekLabel} {checkins.length}</div>}
                </div>
              )}
              <textarea className="share-ta" rows={5}
                placeholder={t.communitySharePlaceholder}
                value={shareText}
                onChange={e=>setShareText(e.target.value)}/>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-p" style={{flex:1}} onClick={submitPost}
                  disabled={!shareText.trim()}>
                  {t.communityShareBtn}
                </button>
                <button className="btn btn-g" onClick={()=>setShowShare(false)}>
                  {t.communityCancel}
                </button>
              </div>
            </div>
          )}

          {/* Feed */}
          <div className="sec-h"><span className="sec-mark">◆</span> {t.communityFeed}</div>

          {communityPosts.length===0?(
            <div className="empty">
              <div className="empty-mark">◆</div>
              <div className="empty-text">{t.communityEmpty}</div>
              <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--muted)",
                fontStyle:"italic",marginTop:8}}>
                Complete your analysis and share your first update.
              </div>
            </div>
          ):(
            <div>
              {communityPosts.map(post=>(
                <div className="post-card" key={post.id}>
                  <div className="post-meta">
                    <div className="post-type">◆ {post.skinType}</div>
                    {post.shaveType&&<div className="post-type" style={{borderColor:"var(--amber)",color:"var(--amber)"}}>
                      {post.shaveType}
                    </div>}
                    <div className="post-week">{t.weekLabel} {post.week}</div>
                    <div className="post-date">{post.date}</div>
                  </div>
                  <div className="post-text">"{post.text}"</div>
                  <div className="post-actions">
                    <button className="post-like" onClick={()=>likePost(post.id)}>
                      {t.communityLike}
                    </button>
                    {(postLikes[post.id]||0)>0&&(
                      <div className="post-like-count">{postLikes[post.id]} found this helpful</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Discord CTA */}
          <div className="discord-cta">
            <div>
              <div style={{fontFamily:"var(--fh)",fontSize:16,fontWeight:700,
                fontStyle:"italic",marginBottom:4}}>{t.discordTitle}</div>
              <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",
                fontStyle:"italic",lineHeight:1.65}}>{t.discordSub}</div>
            </div>
            <a href={`https://discord.gg/skinr`} target="_blank" rel="noopener noreferrer"
              style={{textDecoration:"none",flexShrink:0}}>
              <button className="btn btn-p" style={{whiteSpace:"nowrap"}}>
                {t.discordBtn}
              </button>
            </a>
          </div>
        </div>
      </div>}

      {/* ── GUIDES ── */}
      {view==="guides"&&<div className="wrap fade-in">
        <div className="guides-wrap">
          <div className="guides-h">{t.guidesTitle}</div>
          <div className="guides-s">{t.guidesSub}</div>

          {[
            {title:t.skincareGuideTitle, desc:t.skincareGuideDesc, link:CONFIG.business.skincareGuide},
            {title:t.shavingGuideTitle,  desc:t.shavingGuideDesc,  link:CONFIG.business.shavingGuide},
          ].map((g,i)=>(
            <div key={i} className="guide-card">
              <div className="guide-h">{g.title}</div>
              <div className="guide-s">{g.desc}</div>
              <div className="guide-price">{t.guidePrice}</div>
              {g.link?(
                <a href={g.link} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                  <button className="btn btn-p" style={{width:"100%"}}>{t.guideBuyBtn}</button>
                </a>
              ):(
                <>
                  <button className="btn btn-g" style={{width:"100%",opacity:.4,cursor:"not-allowed"}} disabled>{t.guideBuyBtn}</button>
                  <div className="guide-soon">{t.guideComingSoon} — {lang==="fr"?"Disponible bientôt":lang==="es"?"Próximamente":"Available soon"}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>}

      </div>{/* end main-content */}
    </div>

    {/* Translation loading overlay */}
    {tLoading&&(
      <div className="t-loading">
        <div className="t-loading-ring"/>
        <div className="t-loading-text">{BASE_T.translating}</div>
      </div>
    )}

    {/* Email capture modal */}
    {showEmail&&<div className="modal-ov" role="dialog" aria-modal="true" aria-label={t.emailTitle}>
      <div className="modal">
        <div className="modal-inner">
          {!emailDone?(
            <>
              <div className="modal-h">{t.emailTitle}</div>
              <div className="modal-s">{t.emailDesc}</div>
              <input className="email-in" type="email" placeholder={t.emailPlaceholder}
                value={emailVal} onChange={e=>setEmailVal(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&submitEmail()}
                autoFocus/>
              <button className="btn btn-p" style={{width:"100%",marginBottom:8}} onClick={submitEmail}>
                {t.emailBtn}
              </button>
              <button className="email-skip" onClick={()=>setShowEmail(false)}>{t.emailSkip}</button>
            </>
          ):(
            <div className="modal-success">
              <div className="modal-success-icon">◆</div>
              <div className="modal-success-h">{lang==="fr"?"Parfait":lang==="es"?"Perfecto":"Perfect."}</div>
              <div className="modal-success-s">{t.emailSuccess}</div>
            </div>
          )}
        </div>
      </div>
    </div>}
  </>);
}
