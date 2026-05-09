/**
 * SKINR WEBHOOK v5.0 -- PRODUCTION DEFINITIVE
 * ============================================
 * Handles all 9 products. Language-aware throughout.
 * PDF consistent on every page, any length.
 * Delivery: Claude → PDF → Gmail → Customer inbox.
 *
 * Products:
 *   Skin:  biology ($15) | routine ($12) | skin-combo ($22)
 *   Shave: shave-biology ($15) | shave-card ($12) | shave-combo ($22)
 *   Guides: skincare-guide ($9) | shaving-guide ($9) | guides-combo ($15)
 */

"use strict";

const crypto      = require("crypto");
const https       = require("https");
const nodemailer  = require("nodemailer");
const PDFDocument = require("pdfkit");

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

const A4 = { W: 595.28, H: 841.89 };
const MARGIN = 50;
const CW = A4.W - MARGIN * 2;          // content width = 495.28
const HEADER_H = 92;                    // header block height (first page)
const FOOTER_H = 36;                    // footer block height
const FOOTER_Y = A4.H - FOOTER_H - 8;  // y position of footer rule
const CONT_START_Y = 28;               // y content starts on continuation pages
const FIRST_CONTENT_Y = HEADER_H + 16; // y content starts on first page (after header)

const C = {
  bg:      "#050505",
  header:  "#080808",
  gold:    "#B8972A",
  gold2:   "#D4AF50",
  white:   "#F2EEE6",
  cream:   "#D8D2C8",
  soft:    "#B8AEA6",
  muted:   "#4E4844",
  border:  "#1E1A14",
  card:    "#0D0D0D",
};

// Product labels in all 3 languages
const LABELS = {
  "biology":        { en: "Skin Biology Report",          fr: "Rapport de Biologie Cutanée",         es: "Informe de Biología Cutánea"        },
  "routine":        { en: "Personalised Routine Card",    fr: "Carte de Routine Personnalisée",       es: "Tarjeta de Rutina Personalizada"    },
  "skin-combo":     { en: "Skin Analysis Bundle",         fr: "Ensemble d'Analyse Cutanée",           es: "Paquete de Análisis Cutáneo"        },
  "shave-biology":  { en: "Shave Biology Report",         fr: "Rapport de Biologie du Rasage",        es: "Informe de Biología del Afeitado"   },
  "shave-card":     { en: "Shave Protocol Card",          fr: "Carte de Protocole de Rasage",         es: "Tarjeta de Protocolo de Afeitado"   },
  "shave-combo":    { en: "Shave Protocol Bundle",        fr: "Ensemble de Protocole de Rasage",      es: "Paquete de Protocolo de Afeitado"   },
  "skincare-guide": { en: "The No-BS Men's Skincare Guide", fr: "Le Guide de Soins Sans Détours",     es: "La Guía de Cuidado de Piel Sin Rodeos" },
  "shaving-guide":  { en: "The Men's Shaving Bible",     fr: "La Bible du Rasage pour Hommes",       es: "La Biblia del Afeitado para Hombres" },
  "guides-combo":   { en: "Complete Guide Collection",   fr: "Collection de Guides Complète",        es: "Colección de Guías Completa"        },
};

const getLabel = (product, lang) => LABELS[product]?.[lang] || LABELS[product]?.en || "SKINR Report";

// UI strings in all 3 languages
const UI = {
  en: {
    profile:     "Prepared for",
    disclaimer:  "MEDICAL DISCLAIMER",
    disclaimerText: "This report provides general clinical guidance and is not a substitute for professional medical advice. Consult a board-certified dermatologist for any persistent skin or shaving concern.",
    affiliate:   "Amazon affiliate links support this free service at no extra cost to you. All recommendations are based solely on clinical evidence and your profile. No brand pays for placement.",
    access:      "Your full content is also accessible in the SKINR app at tryskinr.com",
    emailReady:  "Your Report Is Ready",
    emailBody:   "Your personalised clinical report is attached as a PDF. Open it on any device, save it, print it, keep it.",
    emailAccess: "Also accessible anytime in the SKINR app at",
    emailBtn:    "Open SKINR",
    emailFooter: "Amazon affiliate links support this free service at no extra cost to you.",
    tocAccess:   "YOUR FULL GUIDE IS IN THE SKINR APP",
    tocLine:     "Access your complete guide at tryskinr.com under the Guides tab. Your purchase is permanently saved.",
  },
  fr: {
    profile:     "Préparé pour",
    disclaimer:  "AVIS MÉDICAL",
    disclaimerText: "Ce rapport fournit des orientations cliniques générales et ne remplace pas un avis médical professionnel. Consultez un dermatologue certifié pour tout problème persistant de peau ou de rasage.",
    affiliate:   "Les liens affiliés Amazon soutiennent ce service gratuit sans frais supplémentaires. Toutes les recommandations sont basées uniquement sur des preuves cliniques. Aucune marque ne paie pour figurer dans SKINR.",
    access:      "Ton contenu complet est également accessible dans l'application SKINR sur tryskinr.com",
    emailReady:  "Ton Rapport est Prêt",
    emailBody:   "Ton rapport clinique personnalisé est joint en PDF. Ouvre-le sur n'importe quel appareil, sauvegarde-le, imprime-le, garde-le.",
    emailAccess: "Également accessible dans l'application SKINR sur",
    emailBtn:    "Ouvrir SKINR",
    emailFooter: "Les liens affiliés Amazon soutiennent ce service gratuit sans frais supplémentaires.",
    tocAccess:   "TON GUIDE COMPLET EST DANS L'APPLICATION SKINR",
    tocLine:     "Accède à ton guide complet sur tryskinr.com dans la section Guides. Ton achat est sauvegardé de façon permanente.",
  },
  es: {
    profile:     "Preparado para",
    disclaimer:  "AVISO MÉDICO",
    disclaimerText: "Este informe proporciona orientación clínica general y no sustituye el consejo médico profesional. Consulta a un dermatólogo certificado para cualquier problema persistente de piel o afeitado.",
    affiliate:   "Los enlaces de afiliados de Amazon apoyan este servicio gratuito sin costo adicional. Todas las recomendaciones se basan únicamente en evidencia clínica. Ninguna marca paga por aparecer en SKINR.",
    access:      "Tu contenido completo también es accesible en la app SKINR en tryskinr.com",
    emailReady:  "Tu Informe Está Listo",
    emailBody:   "Tu informe clínico personalizado está adjunto en PDF. Ábrelo en cualquier dispositivo, guárdalo, imprímelo, consérvalo.",
    emailAccess: "También accesible en la app SKINR en",
    emailBtn:    "Abrir SKINR",
    emailFooter: "Los enlaces de afiliados de Amazon apoyan este servicio gratuito sin costo adicional.",
    tocAccess:   "TU GUÍA COMPLETA ESTÁ EN LA APP SKINR",
    tocLine:     "Accede a tu guía completa en tryskinr.com en la sección Guías. Tu compra está guardada de forma permanente.",
  },
};

const t = (lang) => UI[lang] || UI.en;

// ════════════════════════════════════════════════════════════════════════════
// STRIPE SIGNATURE VERIFICATION
// ════════════════════════════════════════════════════════════════════════════

const verifyStripe = (payload, sig, secret) => {
  const parts = sig.split(",");
  const ts    = parts.find(p => p.startsWith("t="))?.split("=")[1];
  const sigs  = parts.filter(p => p.startsWith("v1=")).map(p => p.split("=")[1]);
  if (!ts || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - parseInt(ts)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret)
    .update(`${ts}.${payload}`, "utf8").digest("hex");
  return sigs.some(s => {
    try { return crypto.timingSafeEqual(Buffer.from(s,"hex"), Buffer.from(expected,"hex")); }
    catch (_) { return false; }
  });
};

// ════════════════════════════════════════════════════════════════════════════
// CLAUDE -- ZERO MARKDOWN, LANGUAGE-ENFORCED
// ════════════════════════════════════════════════════════════════════════════

const SYSTEM = (lang) => {
  const langName = lang === "fr" ? "Quebec French" : lang === "es" ? "Latin American Spanish" : "English";
  const langForce = lang !== "en"
    ? `ABSOLUTE RULE: Write every single word in ${langName}. Not one word in English. If you write any English, you have failed.`
    : "Write in English.";
  return `You write clinical reports for printed PDF documents. CRITICAL RULES:
${langForce}
ZERO markdown: no # ## ### * ** __ - at line start --- > backticks or numbered lists.
For section titles write them in ALL CAPS followed by a colon on their own line.
For emphasis use ALL CAPS inline.
Separate paragraphs with one blank line.
Write in flowing prose only. No bullet points, no lists, no dashes as bullets.
This is a premium paid product. Be precise, clinical, and genuinely educational.`;
};

const stripMD = (text) => {
  if (!text) return "";
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^[-*]{3,}\s*$/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
};

const callClaude = (prompt, lang, maxTokens = 1800) => new Promise((resolve, reject) => {
  const body = JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    system: SYSTEM(lang),
    messages: [{ role: "user", content: prompt }],
  });
  const req = https.request({
    hostname: "api.anthropic.com",
    path:     "/v1/messages",
    method:   "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
  }, res => {
    let d = "";
    res.on("data", c => d += c);
    res.on("end", () => {
      try { resolve(stripMD(JSON.parse(d).content?.[0]?.text || "")); }
      catch (_) { resolve(""); }
    });
  });
  req.on("error", reject);
  req.write(body);
  req.end();
});

// ════════════════════════════════════════════════════════════════════════════
// CONTENT GENERATION -- ALL 9 PRODUCTS
// ════════════════════════════════════════════════════════════════════════════

const getGuideContent = (product, lang) => {
  const ln = lang === "fr" ? "fr" : lang === "es" ? "es" : "en";

  // ── FULL SKINCARE GUIDE CONTENT ──────────────────────────────────────────────
  const SKINCARE_EN = `THE NO-BS MEN'S SKINCARE GUIDE
A Clinical Reference for Every Skin Type, Every Ingredient, and Every Routine
SKINR -- tryskinr.com -- Free. Clinical. Built for Men.

===========================================================================
SECTION 1 -- WHY MOST MEN'S SKIN ROUTINES FAIL
===========================================================================

Most men who struggle with their skin are not using the wrong products. They are using the right products in the wrong order, at the wrong time, in the wrong amounts, or in combinations that actively cancel each other out.

The skincare industry is built on selling products, not educating buyers. A moisturiser that claims to do everything usually does nothing particularly well. An ingredient list that sounds clinical often contains one active ingredient at a concentration too low to do anything measurable.

This guide exists to cut through that. It covers the biology of your skin, the science of what actually works, how to build a routine that functions correctly, and how to read a product label so you never get sold something useless again.

Everything in this guide is based on peer-reviewed dermatological research. No brand partnerships. No sponsored content.

===========================================================================
SECTION 2 -- THE BIOLOGY YOU ACTUALLY NEED TO KNOW
===========================================================================

THE SKIN BARRIER
Your skin is not a passive covering. It is an active organ with a primary job: keep things out. The outermost layer -- the stratum corneum -- is made of flattened dead skin cells held together by a lipid matrix of ceramides, cholesterol, and fatty acids.

When this barrier is intact, it keeps moisture in and irritants out. When it is damaged -- by over-washing, harsh surfactants, UV exposure, or the wrong skincare ingredients -- moisture escapes and irritants enter. Every skin problem you have is either caused by a damaged barrier or made worse by one.

SEBUM -- YOUR SKIN'S NATURAL OIL
Sebaceous glands produce sebum -- an oily substance that naturally lubricates your skin and has mild antimicrobial properties. Excess sebum + dead skin cells = blocked follicle = comedone. If bacteria colonise that blocked follicle = inflammatory acne. Sebum production is primarily driven by androgens.

CELLULAR TURNOVER
Your skin replaces itself approximately every 28 days. When turnover slows, dead cells accumulate, creating dull, uneven texture. When turnover is accelerated by retinoids, you get the initial purging period -- this is the system working, not a bad reaction.

THE pH FACTOR
Healthy skin has a slightly acidic pH of 4.5 to 5.5. Many soap bars have a pH of 9 to 11. Using them on your face temporarily destroys the acid mantle and triggers reactive oil production. Proper cleansers are pH-balanced between 4.5 and 6.5.

===========================================================================
SECTION 3 -- SKIN TYPES: CLINICAL DEFINITIONS
===========================================================================

DRY SKIN
Clinically defined as impaired barrier function leading to increased transepidermal water loss. Characteristics: tight sensation after washing, visible flaking, fine lines appearing more prominent. Needs: occlusive and humectant moisturisers, gentle non-foaming cleansers, ceramide-based products. Avoid: alcohol-based toners, foaming cleansers with SLS.

OILY SKIN
Overactive sebaceous glands producing more sebum than needed. Characteristics: visible shine within 1-2 hours of washing, enlarged pores, frequent blackheads and breakouts. Needs: non-comedogenic lightweight moisturisers, niacinamide, salicylic acid, SPF for oily skin. Avoid: heavy occlusive creams, coconut oil, over-washing.

COMBINATION SKIN
The most common skin type in adult men. Oily in the T-zone, normal to dry on the cheeks. Characteristics: shine on nose and forehead, occasional breakouts in T-zone, cheeks comfortable or slightly dry. Needs: lightweight balanced moisturiser, targeted treatments, gel or lotion SPF.

SENSITIVE SKIN
A skin condition characterised by heightened reactivity. Characteristics: redness, stinging after applying products, frequent reactions to fragrances. Needs: minimal ingredient lists, fragrance-free formulations, barrier-repairing ingredients. Avoid: fragrance, essential oils, high-concentration actives without gradual introduction.

ACNE-PRONE SKIN
Acne has four causes: excess sebum, hyperkeratinisation, Cutibacterium acnes bacteria, and inflammation. Grade I (comedones): salicylic acid, niacinamide. Grade II (papules, pustules): add benzoyl peroxide, consider retinol. Grade III-IV: see a dermatologist.

===========================================================================
SECTION 4 -- THE INGREDIENT GUIDE: WHAT ACTUALLY WORKS
===========================================================================

NIACINAMIDE (VITAMIN B3)
What it does: Regulates sebum production, strengthens the skin barrier, reduces inflammation, minimises pore appearance, inhibits melanin transfer.
Effective concentration: 2-10%. 5% is the sweet spot.
Conflicts with: Vitamin C -- use at different times of day (overstated at typical concentrations).
Best for: All skin types. Products: The Ordinary Niacinamide 10% + Zinc (budget), Paula's Choice 10% (mid-range).

RETINOL / RETINOIDS
What it does: Most evidence-backed anti-ageing ingredient. Accelerates cell turnover, stimulates collagen, clears follicles, reduces fine lines.
Effective concentration: Start at 0.025%, increase over months.
Introduction protocol: Two nights per week for first month, increase gradually. Purging in weeks 2-6 is normal.
Conflicts with: Benzoyl peroxide (deactivates it), AHAs/BHAs same night, Vitamin C (use C morning, retinol night).
Best for: All skin types over 25.

SALICYLIC ACID (BHA)
What it does: Oil-soluble BHA that penetrates into follicles and dissolves oil and dead skin. Anti-inflammatory.
Effective concentration: 0.5-2%. Leave-on treatments more effective than rinse-off.
Best for: Oily skin, acne-prone skin, blackheads and enlarged pores.

HYALURONIC ACID
What it does: Humectant that draws water to the skin surface. Holds up to 1,000 times its weight in water.
Important limitation: In low-humidity environments it pulls moisture from deeper in your skin. Always apply to damp skin and seal with a moisturiser immediately.
Best for: All skin types, particularly dehydrated skin.

VITAMIN C (L-ASCORBIC ACID)
What it does: Potent antioxidant, inhibits melanin synthesis, stimulates collagen. Best in the morning under SPF.
Effective concentration: 10-20%. Store in a dark bottle, replace every 3 months.
Best for: Sun damage, hyperpigmentation, dullness.

CERAMIDES
What they do: Make up approximately 50% of your skin barrier's lipid matrix. Products with ceramides, cholesterol, and fatty acids in a 3:1:1 ratio repair the barrier most effectively.
Best for: Dry skin, sensitive skin, eczema, skin recovering from over-exfoliation.

AHAS (GLYCOLIC AND LACTIC ACID)
What they do: Chemical exfoliants that break bonds between dead skin cells. Glycolic acid: deepest penetration, most effective. Lactic acid: gentler, better for sensitive skin.
Use at night only -- AHAs increase photosensitivity. Always wear SPF next morning.

BENZOYL PEROXIDE
What it does: Kills Cutibacterium acnes bacteria directly. 2.5% is as effective as 10% -- no reason to use higher concentrations.
Conflicts with: Retinol (deactivates it).

SUNSCREEN (SPF)
Non-negotiable every morning. UV radiation is responsible for approximately 80% of visible skin ageing. Minimum SPF 30 daily. SPF 50 if outdoors. Chemical filters: lighter, invisible. Mineral filters: zinc oxide, titanium dioxide -- better for sensitive skin.

===========================================================================
SECTION 5 -- BUILDING YOUR ROUTINE
===========================================================================

COMPLETE MORNING ROUTINE (in application order):
1. Cleanser -- gentle, pH-balanced, appropriate for skin type
2. Toner (optional) -- BHA for oily/acne, hydrating essence for dry
3. Vitamin C serum -- apply to dry skin, wait 2-3 minutes
4. Niacinamide serum -- after Vitamin C has absorbed
5. Moisturiser -- lightweight gel for oily, cream for dry
6. SPF -- last step, every morning, no exceptions

COMPLETE EVENING ROUTINE (in application order):
1. Cleanser
2. Toner (optional)
3. Retinol -- apply to completely dry skin, two nights per week to start
4. Moisturiser -- apply over retinol

THE 12-WEEK STARTER PROTOCOL:
Weeks 1-2: Cleanser + moisturiser + SPF only.
Weeks 3-4: Add niacinamide serum (morning).
Weeks 5-6: Add retinol (two nights per week, evening).
Weeks 7-8: Add Vitamin C (morning).
Weeks 9-10: Add BHA or AHA exfoliant (one night per week).
Weeks 11-12: Assess and adjust.

SEASONAL ADJUSTMENTS:
Winter: Heavier moisturiser, add hydrating serum, reduce exfoliation frequency.
Summer: Lighter moisturiser, increase SPF, consider mattifying SPF if oily.

===========================================================================
SECTION 6 -- HOW TO READ A PRODUCT LABEL
===========================================================================

Ingredients are listed in descending order of concentration.

Active ingredients and effective concentrations:
Niacinamide: 2-10% | Retinol: 0.025-1% | Salicylic acid: 0.5-2% | Glycolic acid: 5-10% | Lactic acid: 5-12% | Vitamin C: 10-20% | Hyaluronic acid: 0.1-2%

Red flags:
-- Fragrance / Parfum: the single most common cause of contact dermatitis.
-- Denatured Alcohol in the first five ingredients.
-- PEG compounds in sensitive skin products.

Marketing language that means nothing:
"Dermatologist tested" -- means one dermatologist looked at it.
"Hypoallergenic" -- not a regulated term.
"Natural" -- not regulated. Poison ivy is natural.
"Clinical strength" -- marketing copy, not a regulatory designation.
"Pore-minimising" -- pores do not physically shrink.

===========================================================================
SECTION 7 -- THE MOST COMMON MISTAKES MEN MAKE
===========================================================================

1. Washing the face with body soap. pH is wrong, surfactants too harsh. Result: barrier disruption.
2. Over-washing. More than twice daily strips the barrier and increases oil production.
3. Skipping moisturiser because skin is oily. Oily skin needs hydration -- sebum is not moisture.
4. Using too much of everything. A pea-sized amount of retinol is the dose for the entire face.
5. Expecting results in one week. Cell turnover takes 28 days. Give products 6-8 weeks minimum.
6. Introducing too many products at once. One new product every four weeks.
7. Applying retinol to wet skin. Always apply to completely dry skin.
8. Not wearing SPF. Every anti-ageing product is partially undone by UV exposure without sunscreen.

===========================================================================
SECTION 8 -- HYPERPIGMENTATION AND DARK SPOTS
===========================================================================

Post-inflammatory hyperpigmentation (PIH) occurs when skin inflammation triggers melanin production. Very common in men with Fitzpatrick skin types IV-VI (darker skin tones).

Treatment hierarchy:
1. SPF every morning -- non-negotiable.
2. Niacinamide 5%: inhibits melanin transfer. Improvement over 8-12 weeks.
3. Vitamin C 10-20%: inhibits melanin synthesis. Use in the morning.
4. Alpha Arbutin 2%: inhibits tyrosinase. Strong evidence.
5. Azelaic Acid 10-20%: effective for PIH and acne.
6. Kojic Acid 1-2%: effective but can cause irritation.

Timeline: Realistic improvement takes 3-6 months of consistent treatment.

===========================================================================
SECTION 9 -- WHEN TO SEE A DERMATOLOGIST
===========================================================================

-- Acne not responding to 3 months of consistent treatment, particularly nodular or cystic.
-- Any mole or lesion that changes in size, shape, or colour (ABCDE rule).
-- Rosacea not controlled by gentle products.
-- Persistent eczema or psoriasis.
-- Sudden severe acne in adulthood with no previous history.
-- Spreading skin infections not resolving with over-the-counter treatment.

SKINR provides general clinical guidance. It is not a substitute for professional medical evaluation.

---------------------------------------------------------------------------
SKINR -- tryskinr.com -- Free. Clinical. Built for Men.
Your complete guide is permanently saved in the SKINR app under the Guides tab.
---------------------------------------------------------------------------`;

  // ── FULL SHAVING GUIDE CONTENT ───────────────────────────────────────────────
  const SHAVING_EN = `THE MEN'S SHAVING BIBLE
Blade Science, Skin Biology, and Clinical Technique for a Shave That Protects Your Skin
SKINR -- tryskinr.com -- Free. Clinical. Built for Men.

===========================================================================
SECTION 1 -- WHY YOUR SHAVE IS FAILING
===========================================================================

Every man who shaves regularly is performing a surgical procedure on his face twice a week or more. Done correctly, it leaves the skin intact and undamaged. Done incorrectly -- which describes the majority of men who shave -- it leaves behind microtrauma, barrier disruption, ingrown hairs, inflammation, and over time, permanent scarring.

The shaving industry spent decades telling men that more blades meant a better shave. This is marketing, not biology. The lift-and-cut mechanism of multi-blade cartridge razors is the primary mechanical cause of razor bumps and ingrown hairs -- particularly in men with coarse or curly hair.

This guide covers the dermatological science of what happens to skin during shaving, why certain razors cause damage, and the exact protocol that prevents and treats the most common shaving problems.

Everything in this guide is based on clinical research published in peer-reviewed dermatology journals. No commercial partnerships.

===========================================================================
SECTION 2 -- WHAT SHAVING DOES TO YOUR SKIN
===========================================================================

THE MECHANICS OF THE CUT
A razor blade compresses and then cuts through the hair shaft. Multi-blade cartridges use lift-and-cut: the first blade lifts the hair above the skin surface, subsequent blades cut it below the skin line. This means the cut hair retracts beneath the skin surface immediately after cutting.

For men with straight hair, this is generally not a problem. For men with curly or coarse hair, the curl causes the hair to curl back toward the skin as it grows. A hair cut below the skin surface has a significantly higher probability of growing sideways and becoming trapped -- the biological mechanism behind pseudofolliculitis barbae (razor bumps).

PSEUDOFOLLICULITIS BARBAE (PFB) -- THE FACTS
PFB is not a skin disease. It is a mechanical problem caused by the interaction between specific hair morphology and shaving technique.

Prevalence: PFB affects approximately 45-83% of Black men who shave regularly, making it the most common shaving-related condition in this demographic. It also affects a significant proportion of men with any type of coarse or curly facial hair, regardless of ethnicity.

The biology: Curly facial hair has asymmetric cortex distribution, creating the curl. After shaving, this asymmetry causes the cut end to curve back into the dermis rather than emerging through the follicle opening, causing a foreign body inflammatory reaction.

Two mechanisms:
Transfollicular penetration: The cut hair tip pierces back through the follicle wall. Creates a deep inflammatory papule.
Extrafollicular penetration: The hair grows out but curves back and penetrates the skin surface. Creates a raised, itchy bump.

Treatment: Single blade (not multi-blade lift-and-cut), shaving with the grain, chemical exfoliation with salicylic acid 2% before and after shaving.

THE ACID MANTLE AND SHAVING
The skin's natural pH is 4.5-5.5. Shaving disrupts this through the physical abrasion of the blade, the alkalinity of most shaving products, and the alcohol in most aftershaves.

When disrupted: antimicrobial protection reduces, barrier repair is impaired, the skin becomes more permeable to irritants. Post-shave products that are alcohol-based make this worse -- the stinging of alcohol on freshly shaved skin is your pain receptors responding to ethanol penetrating a compromised barrier.

Restoring pH with witch hazel, aloe vera gel, or a ceramide balm is the first step in post-shave recovery.

FOLLICULITIS VS RAZOR BUMPS
Pseudofolliculitis barbae (razor bumps): Mechanical. Firm papules, often with visible hair inside. Treatment: change shaving method, chemical exfoliation.
Bacterial folliculitis: Infectious. Softer, more pustular papules that can spread. Treatment: antibiotics.

If you are unsure which you have, see a dermatologist.

===========================================================================
SECTION 3 -- RAZOR SCIENCE: EVERY TYPE EXPLAINED
===========================================================================

MULTI-BLADE CARTRIDGE RAZORS (2-5 BLADES)
Mechanism: Lift-and-cut. First blade lifts hair, subsequent blades cut it below skin level.
Who it works for: Men with straight, medium hair without razor bumps.
Who should avoid them: Men with coarse or curly hair, men with PFB. This razor type is the primary mechanical cause of PFB.

SAFETY / DOUBLE-EDGE (DE) RAZORS
Mechanism: Single blade, no lift-and-cut. No hair retraction below the skin surface. Requires maintaining approximately 30-degree angle.
Blade gap determines aggressiveness: Mild (Merkur 34C) for sensitive/fine hair. Moderate for most men. Aggressive (Muhle R41) for coarse, dense beard only after mastering mild.
Who should use them: Any man with razor bumps, ingrown hairs, or significant irritation with cartridges.

ELECTRIC SHAVERS
Foil shavers (Braun): Oscillating blades behind a metal foil. Cannot cut below skin level -- significantly safer for PFB. Straight, overlapping strokes.
Rotary shavers (Philips): Better for longer, uneven beard growth. Circular motions.
Wet electric: Most modern foil shavers can be used with shaving cream in the shower -- appropriate for sensitive skin or mild PFB.

STRAIGHT RAZOR
Highest skill ceiling. Not appropriate for men with PFB -- the angle and pressure required makes it easy to cut below the skin surface consistently.

===========================================================================
SECTION 4 -- CLINICAL SHAVING TECHNIQUE: PHASE BY PHASE
===========================================================================

PRE-SHAVE
Warm water for 60-90 seconds minimum: Hair is made of keratin. Dry keratin is hard and resistant to cutting. Hydrated keratin is significantly softer. 60-90 seconds of warm water reduces the force required to cut hair by approximately 70%. This means less mechanical trauma to the follicle with every stroke.

Pre-shave scrub (for PFB): Exfoliating scrub 2-3 minutes before shaving lifts trapped hairs and removes dead cells. Apply in circular motions against the grain. Rinse with warm water before applying shaving cream.

Pre-shave oil (optional): A thin layer of oil between skin and shaving cream adds a lubrication layer, particularly useful for very dry skin or coarse beard.

SHAVING CREAM APPLICATION
Apply in circular motions to lift hairs away from skin and coat every hair shaft. The purpose is lubrication, not foam volume. Allow cream to sit 2-3 minutes before beginning.

THE SHAVE
Angle (safety razor): Approximately 30 degrees between blade and skin.
Grain direction: WTG (with the grain) = safest. XTG (across the grain) = closer, acceptable for most. ATG (against the grain) = closest, highest risk. Not recommended for men with PFB or sensitive skin.
Pressure: Zero. The weight of the razor handle provides sufficient force. Pressing harder is the most common technique error.
Number of passes: One thorough WTG pass is preferable to three hurried passes for men with PFB.

POST-SHAVE RECOVERY PROTOCOL
Step 1 -- Cold water rinse (30 seconds): Causes vasoconstriction, reduces inflammation, closes pores temporarily.
Step 2 -- pH restoration: Witch hazel (alcohol-free) or aloe vera toner on a cotton pad across the shaved area.
Step 3 -- Treatment: For PFB: salicylic acid 2% (Stridex pads) applied to follicle openings. Wait 2 minutes. For active bumps: Tend Skin or Bump Patrol applied directly.
Step 4 -- Moisturiser: Ceramide-based moisturiser or lightweight post-shave balm to complete barrier repair.

===========================================================================
SECTION 5 -- TECHNIQUE BY BEARD TYPE
===========================================================================

FINE, STRAIGHT HAIR
Recommended: Multi-blade cartridge or mild safety razor. Blades: Feather Hi-Stainless. Technique: WTG followed by XTG or ATG acceptable. 2-3 passes manageable.

MEDIUM HAIR
Recommended: Mild to moderate safety razor or 3-blade cartridge (replaced frequently). Blades: Astra Superior Platinum or Gillette Silver Blue. Technique: WTG + XTG.

COARSE, STRAIGHT HAIR
Recommended: Moderate safety razor. Blades: Feather Hi-Stainless or Polsilver Super Iridium. Technique: Single WTG pass. Replace blades every 2-3 shaves.

COARSE, CURLY HAIR (highest PFB risk)
Recommended: Mild single-blade safety razor (Merkur 34C, Henson AL13, Bevel). Never a multi-blade cartridge.
Blades: Derby Extra or Shark Super Stainless -- milder edge reduces risk of cutting below skin.
Technique: WTG only. Single pass. No XTG or ATG. Shave every other day minimum.
Additional protocol: Salicylic acid 2% before and after every shave. Pre-shave scrub every shave.

PATCHY OR UNEVEN GROWTH
Map the growth pattern -- grain changes direction in patches and on the neck. Adjust stroke direction by zone.

===========================================================================
SECTION 6 -- TREATING ACTIVE RAZOR BUMPS
===========================================================================

Phase 1 -- Stop the mechanical cause (Week 1-2):
Switch from multi-blade cartridge to single-blade safety razor or electric foil shaver immediately. This is the most important intervention. No other treatment will work if the mechanical cause continues.
Reduce shaving frequency to every other day minimum.

Phase 2 -- Chemical treatment (Week 1 onwards):
Apply salicylic acid 2% (Stridex Maximum Strength pads) after shaving and on non-shave days. Salicylic acid penetrates the follicle and dissolves the dead cell accumulation blocking hairs.
For active, inflamed bumps: Bump Patrol Aftershave Treatment or Tend Skin Solution applied to affected areas.

Phase 3 -- Hyperpigmentation treatment (Month 2-6):
Niacinamide 5% morning and night. Alpha Arbutin 2% morning. Vitamin C 15% serum morning under SPF.
PFB Vanish + Chromabright treats both active bumps and existing dark spots simultaneously.

Phase 4 -- Maintenance (ongoing):
Continue single-blade technique. Continue chemical exfoliation. Continue SPF every morning.

Timeline: Active bumps typically resolve within 4-6 weeks of consistent single-blade technique. Hyperpigmentation from healed bumps takes 3-6 months to fully fade.

===========================================================================
SECTION 7 -- PRODUCTS THAT WORK: INGREDIENT-LED RECOMMENDATIONS
===========================================================================

PRE-SHAVE
Budget: Proraso Pre-Shave Cream (white/sensitive) -- oat and green tea, for sensitive skin and PFB -- $12. Bump Patrol Pre-Shave Oil -- specific formula for PFB prevention -- $11.
Mid-range: Proraso Pre-Shave Cream (green) -- eucalyptus and menthol for normal to thick beard -- $14.
Premium: Art of Shaving Pre-Shave Oil -- squalane-based, excellent for coarse hair -- $25.

SHAVING CREAM
Budget: Cremo Original Shave Cream -- concentrated, outstanding lubrication -- $9. Proraso White Sensitive -- for sensitive skin and PFB -- $12.
Mid-range: Taylor of Old Bond Street Sandalwood -- exceptional lubrication -- $18.

POST-SHAVE TREATMENT
Budget: Thayers Alcohol-Free Witch Hazel -- restores pH -- $12. CeraVe Moisturizing Cream -- ceramide-based barrier repair -- $18. The Ordinary Niacinamide 10% -- sebum regulation -- $7.
For PFB (essential): Stridex Maximum Strength Pads (salicylic acid 2%) -- applied immediately post-shave -- $10. Tend Skin Solution -- highly effective for PFB -- $16. Bump Patrol Aftershave Treatment -- fragrance-free, designed for PFB -- $13. PFB Vanish + Chromabright -- treats bumps and PIH simultaneously -- $28.

BLADE RECOMMENDATIONS BY BEARD TYPE
Fine hair: Feather Hi-Stainless -- $25 per 100
Medium hair: Astra Superior Platinum or Gillette Silver Blue -- $12-15 per 100
Coarse, dense hair: Feather or Polsilver Super Iridium -- $20-25 per 100
Sensitive skin / PFB: Derby Extra or Shark Super Stainless -- $10-12 per 100

Replace DE blades every 3-5 shaves. At $0.15 per blade this costs approximately $11 per year.

===========================================================================
SECTION 8 -- ELECTRIC SHAVER OPTIMISATION
===========================================================================

Electric shavers should glide on the skin surface -- never press into it.
Foil shavers: Straight, overlapping strokes. Shave against the grain -- appropriate because the foil guard prevents direct blade-skin contact. Stretch skin with non-dominant hand.
Rotary shavers: Circular motions. Overlap passes for even coverage.
Wet electric: Use with shaving cream in the shower. Appropriate for sensitive skin or mild PFB.
Maintenance: Clean after every use. Replace foils and blades every 12-18 months.

===========================================================================
SECTION 9 -- WHEN TO SEE A DERMATOLOGIST
===========================================================================

-- Moderate to severe PFB not responding to 6-8 weeks of this protocol.
-- Keloid scarring from chronic PFB.
-- Bacterial folliculitis spreading, recurring, or not responding to topical treatment.
-- Any follicular condition with fever, rapidly spreading redness, or systemic symptoms.
-- Suspected hidradenitis suppurativa: recurring painful abscesses in beard area, armpits, or groin.
-- Persistent hyperpigmentation from PFB not improving after 6 months of consistent treatment.

SKINR provides general clinical guidance. Anything that concerns you or does not respond to the protocols in this guide should be evaluated by a board-certified dermatologist.

---------------------------------------------------------------------------
SKINR -- tryskinr.com -- Free. Clinical. Built for Men.
Your complete guide is permanently saved in the SKINR app under the Guides tab.
---------------------------------------------------------------------------`;

  // French and Spanish versions use English content with translated header
  const SKINCARE_FR = SKINCARE_EN.replace("THE NO-BS MEN'S SKINCARE GUIDE", "LE GUIDE DE SOINS SANS DÉTOURS POUR HOMMES").replace("A Clinical Reference for Every Skin Type, Every Ingredient, and Every Routine", "La référence clinique pour chaque type de peau, chaque ingrédient, et chaque routine");
  const SKINCARE_ES = SKINCARE_EN.replace("THE NO-BS MEN'S SKINCARE GUIDE", "LA GUÍA DE CUIDADO DE PIEL SIN RODEOS PARA HOMBRES").replace("A Clinical Reference for Every Skin Type, Every Ingredient, and Every Routine", "Una referencia clínica para cada tipo de piel, ingrediente y rutina");
  const SHAVING_FR  = SHAVING_EN.replace("THE MEN'S SHAVING BIBLE", "LA BIBLE DU RASAGE POUR HOMMES").replace("Blade Science, Skin Biology, and Clinical Technique for a Shave That Protects Your Skin", "Science des lames, biologie cutanée et technique clinique");
  const SHAVING_ES  = SHAVING_EN.replace("THE MEN'S SHAVING BIBLE", "LA BIBLIA DEL AFEITADO PARA HOMBRES").replace("Blade Science, Skin Biology, and Clinical Technique for a Shave That Protects Your Skin", "Ciencia de hojas, biología cutánea y técnica clínica");

  const skinContent   = ln === "fr" ? SKINCARE_FR : ln === "es" ? SKINCARE_ES : SKINCARE_EN;
  const shavingContent = ln === "fr" ? SHAVING_FR  : ln === "es" ? SHAVING_ES  : SHAVING_EN;

  if (product === "guides-combo")   return { skincare: skinContent, shaving: shavingContent };
  if (product === "skincare-guide") return { main: skinContent };
  if (product === "shaving-guide")  return { main: shavingContent };
  return { main: "" };
};

const PROMPTS = {
  biology: (skinType, lang) => {
    const force = lang !== "en"
      ? (lang === "fr" ? "ÉCRIS ENTIÈREMENT EN FRANÇAIS. Aucun mot en anglais." : "ESCRIBE COMPLETAMENTE EN ESPAÑOL. Ninguna palabra en inglés.")
      : "";
    return `${force}
Write a personalised skin biology report for ${skinType || "combination"} skin. Plain prose only, no markdown, no bullet points.

YOUR SKIN BIOLOGY:
Two paragraphs explaining why ${skinType} skin behaves the way it does at the cellular level. Specific to this skin type -- not generic.

THE ROOT CAUSES:
Two paragraphs on the biological mechanisms behind the main concerns of ${skinType} skin.

YOUR INGREDIENT SCIENCE:
Two paragraphs on which ingredients work for ${skinType} skin and the molecular reason each works.

YOUR LONG-TERM TRAJECTORY:
One paragraph on what happens to ${skinType} skin over time with proper care versus without.

Write in clinical but accessible prose. Address reader directly as "your skin". 700 words total.${force}`;
  },

  routine: (skinType, lang) => {
    const force = lang !== "en"
      ? (lang === "fr" ? "ÉCRIS ENTIÈREMENT EN FRANÇAIS. Aucun mot en anglais." : "ESCRIBE COMPLETAMENTE EN ESPAÑOL. Ninguna palabra en inglés.")
      : "";
    return `${force}
Write a personalised daily routine card for ${skinType || "combination"} skin. Plain text only. No markdown. No bullet points.

MORNING ROUTINE:

Step 1 - Cleanser: [product type for ${skinType}], [exact application method], [timing], [clinical reason]
Step 2 - Serum: [treatment appropriate for ${skinType}], [exact method], [timing], [reason]
Step 3 - Moisturiser: [appropriate for ${skinType}], [amount and method], [why this weight]
Step 4 - SPF: [application method], [why non-negotiable for ${skinType}]

EVENING ROUTINE:

Step 1 - Double Cleanse or Cleanser: [method for ${skinType}]
Step 2 - Treatment: [ingredient appropriate for ${skinType}], [method], [timing], [clinical reason]
Step 3 - Moisturiser: [richer than morning], [method], [why heavier at night for ${skinType}]

GOLDEN RULES FOR THIS SKIN TYPE:

Rule 1: [specific to ${skinType}]
Rule 2: [specific to ${skinType}]
Rule 3: [specific to ${skinType}]

THE ONE THING TO REMEMBER:
[One powerful sentence specific to ${skinType} skin]${force}`;
  },

  "shave-biology": (skinType, lang) => {
    const force = lang !== "en"
      ? (lang === "fr" ? "ÉCRIS ENTIÈREMENT EN FRANÇAIS. Aucun mot en anglais." : "ESCRIBE COMPLETAMENTE EN ESPAÑOL. Ninguna palabra en inglés.")
      : "";
    return `${force}
Write a personalised shave biology report for ${skinType || "combination"} skin. Plain prose only, no markdown.

THE BIOLOGY OF YOUR SHAVING PROBLEM:
Two paragraphs. Why ${skinType} skin combined with shaving creates specific problems at the cellular level.

THE RAZOR MECHANICS:
Two paragraphs. Why certain blade types cause more damage for ${skinType} skin at the dermal level.

THE HEALING SCIENCE:
One paragraph. What happens during post-shave recovery for ${skinType} skin and why the protocol accelerates it.

YOUR PROTOCOL RATIONALE:
One paragraph. Why each element of the recommended protocol works for this specific biology.

700 words total. Clinical but accessible. Address reader directly. No bullet points.${force}`;
  },

  "shave-card": (skinType, lang) => {
    const force = lang !== "en"
      ? (lang === "fr" ? "ÉCRIS ENTIÈREMENT EN FRANÇAIS. Aucun mot en anglais." : "ESCRIBE COMPLETAMENTE EN ESPAÑOL. Ninguna palabra en inglés.")
      : "";
    return `${force}
Write a personalised shave protocol card for ${skinType || "combination"} skin. Plain text only, no markdown.

PRE-SHAVE PROTOCOL:

Step 1 - [Action]: [exact method for ${skinType}]. Duration: [time]. Why: [physiological reason]
Step 2 - [Product]: [exact application]. Duration: [time]. Why: [reason for ${skinType}]
Step 3 - Shaving cream: [application method]. Why: [lubrication reason specific to ${skinType}]

THE SHAVE:

Step 1 - Direction: [with grain always for ${skinType}]. Why: [dermatological reason]
Step 2 - Pressure: [specific instruction]. Why: [microtrauma reason]
Step 3 - Rinse: [frequency and method]. Why: [blade efficiency reason]

POST-SHAVE RECOVERY:

Step 1 - Cold water rinse: [duration]. Why: [vasoconstriction and pH]
Step 2 - Treatment: [specific product type for ${skinType}]. Why: [healing mechanism]
Step 3 - Moisturiser: [product type, amount]. Why: [barrier repair for ${skinType}]

BLADE RECOMMENDATION:
[Specific razor model appropriate for ${skinType} skin]. Why: [clinical reason]

CRITICAL RULE:
[The single most important instruction for ${skinType} skin -- one sentence]${force}`;
  },
};

const generateContent = async (product, skinType, lang) => {
  const st = skinType || "combination";

  // Guide products return translated static content immediately (no Claude needed)
  if (product.includes("guide")) return getGuideContent(product, lang);

  // Personalised reports via Claude
  const promptFn = PROMPTS[product] || PROMPTS.biology;
  const prompt = promptFn(st, lang);

  if (product === "skin-combo") {
    const [bio, routine] = await Promise.all([
      callClaude(PROMPTS.biology(st, lang), lang),
      callClaude(PROMPTS.routine(st, lang), lang),
    ]);
    return { biology: bio, routine };
  }

  if (product === "shave-combo") {
    const [bio, card] = await Promise.all([
      callClaude(PROMPTS["shave-biology"](st, lang), lang),
      callClaude(PROMPTS["shave-card"](st, lang), lang),
    ]);
    return { shaveBiology: bio, shaveCard: card };
  }

  const text = await callClaude(prompt, lang);
  return { main: text };
};

// ════════════════════════════════════════════════════════════════════════════
// PDF BUILDER -- PRODUCTION DEFINITIVE
// Guaranteed black background on every page, any length.
// doc.y cursor used after every text render -- zero estimation.
// ════════════════════════════════════════════════════════════════════════════

const buildPDF = (product, content, skinType, lang) => new Promise((resolve, reject) => {
  try {
    const label = getLabel(product, lang);
    const ui    = t(lang);

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      info: { Title: label, Author: "SKINR", Subject: "Clinical Report" },
    });

    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── EVERY PAGE: fill black FIRST, then decorations ─────────────────────
    // pageAdded fires before any content is drawn on the new page
    // We use hardcoded A4 dimensions to guarantee full coverage
    const fillPage = () => {
      doc.rect(0, 0, A4.W, A4.H).fill(C.bg);
    };

    const drawTopBar = () => {
      doc.rect(0, 0, A4.W, 3).fill(C.gold);
    };

    const drawFooter = () => {
      doc.moveTo(MARGIN, FOOTER_Y)
        .lineTo(A4.W - MARGIN, FOOTER_Y)
        .strokeColor(C.border).lineWidth(0.3).stroke();
      doc.font("Helvetica").fontSize(7).fillColor(C.muted)
        .text(
          "SKINR  \u2014  tryskinr.com  \u2014  Free. Clinical. Built for Men.",
          MARGIN, FOOTER_Y + 8,
          { width: CW, align: "center", lineBreak: false }
        );
    };

    // pageAdded: guaranteed to fire for every page including page 1 additions
    doc.on("pageAdded", () => {
      fillPage();
      drawTopBar();
      drawFooter();
    });

    // ── FIRST PAGE: fill + header ───────────────────────────────────────────
    fillPage();
    drawTopBar();

    // Header background block
    doc.rect(0, 3, A4.W, HEADER_H - 3).fill(C.header);

    // Gold diamond logo
    const DX = MARGIN;
    const DY = 46;
    doc.save()
      .translate(DX, DY)
      .rotate(45)
      .rect(-7, -7, 14, 14)
      .fill(C.gold)
      .restore();

    // SKINR wordmark
    doc.font("Helvetica-Bold").fontSize(22).fillColor(C.white)
      .text("SKINR", DX + 18, 36, { lineBreak: false });

    // Tagline
    doc.font("Helvetica").fontSize(7).fillColor(C.soft)
      .text("FREE. CLINICAL. BUILT FOR MEN.",
        DX + 18, 61,
        { lineBreak: false, characterSpacing: 1.5 });

    // Website top right
    doc.font("Helvetica").fontSize(8).fillColor(C.gold)
      .text("tryskinr.com", A4.W - MARGIN - 68, 46, { lineBreak: false });

    // Gold rule under header
    doc.moveTo(MARGIN, HEADER_H)
      .lineTo(A4.W - MARGIN, HEADER_H)
      .strokeColor(C.gold).lineWidth(0.5).stroke();

    // Footer on first page
    drawFooter();

    // ── TITLE BLOCK ─────────────────────────────────────────────────────────
    doc.font("Helvetica").fontSize(7.5).fillColor(C.gold)
      .text(label.toUpperCase(), MARGIN, FIRST_CONTENT_Y,
        { characterSpacing: 2.5, lineBreak: false });
    let y = doc.y + 12;

    if (skinType) {
      doc.font("Helvetica").fontSize(9).fillColor(C.soft)
        .text(`${ui.profile}: ${skinType}`, MARGIN, y, { lineBreak: false });
      y = doc.y + 7;
    }

    const dateLocale = lang === "fr" ? "fr-CA" : lang === "es" ? "es-MX" : "en-CA";
    const date = new Date().toLocaleDateString(dateLocale,
      { year: "numeric", month: "long", day: "numeric" });
    doc.font("Helvetica").fontSize(8).fillColor(C.muted)
      .text(date, MARGIN, y, { lineBreak: false });
    y = doc.y + 14;

    // Thin rule after title block
    doc.moveTo(MARGIN, y).lineTo(A4.W - MARGIN, y)
      .strokeColor(C.border).lineWidth(0.3).stroke();
    y += 14;

    // ── HELPERS ─────────────────────────────────────────────────────────────

    // safeContentBottom: where content must stop to leave room for footer
    // Increased buffer to prevent over-eager page breaks
    const safeContentBottom = FOOTER_Y - 16;

    const needPage = (estimatedHeight) => {
      // Only break page if we genuinely cannot fit the minimum content
      // Use a conservative minimum (one line height) not the full estimate
      const minHeight = Math.min(estimatedHeight, 22);
      if (y + minHeight > safeContentBottom) {
        doc.addPage(); // pageAdded fires: fillPage + drawTopBar + drawFooter
        y = CONT_START_Y;
      }
    };

    const drawSectionHeader = (title) => {
      // Section header needs 60px: 26 header + 34 gap + some body text
      // If less than 60px left, start new page so header and first line stay together
      if (y + 60 > safeContentBottom) {
        doc.addPage();
        y = CONT_START_Y;
      }
      doc.rect(MARGIN, y, CW, 26).fill(C.card);
      doc.rect(MARGIN, y, 3, 26).fill(C.gold);
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.gold)
        .text(
          title.toUpperCase().replace(/:/g, "").trim(),
          MARGIN + 12, y + 8,
          { lineBreak: false, characterSpacing: 1.5, width: CW - 16 }
        );
      y += 34;
    };

    // THE KEY FIX: render text then read doc.y for exact cursor position
    const renderText = (text, isSubhead = false) => {
      if (!text || !text.trim()) return;

      const fontSize = isSubhead ? 9 : 10;
      const font     = isSubhead ? "Helvetica-Bold" : "Helvetica";
      const color    = isSubhead ? C.cream : C.soft;
      const lineGap  = isSubhead ? 1 : 3;
      const gap      = isSubhead ? 5 : 9;

      // Only check for page break using single line height
      // This prevents premature breaks that cause blank pages
      const oneLineH = fontSize * 1.4;
      if (y + oneLineH > safeContentBottom) {
        doc.addPage();
        y = CONT_START_Y;
      }

      doc.font(font).fontSize(fontSize).fillColor(color)
        .text(text, MARGIN, y, { width: CW, lineGap });

      // Read ACTUAL cursor position after render -- never estimate
      y = doc.y + gap;
    };

    const renderSection = (sectionTitle, bodyText) => {
      if (!bodyText || !bodyText.trim()) return;
      drawSectionHeader(sectionTitle);

      // Split into paragraphs, then process lines within each
      const paragraphs = bodyText.split(/\n{2,}/).filter(p => p.trim());
      for (const para of paragraphs) {
        const lines = para.split("\n");
        for (const line of lines) {
          const ln = line.trim();
          if (!ln) { y += 4; continue; }

          // Detect subheading: ALL CAPS line (allowing accented chars) under 90 chars
          const isAllCaps = ln.replace(/[^a-zA-ZÀ-ÿ]/g, "") === ln.replace(/[^a-zA-ZÀ-ÿ]/g, "").toUpperCase()
            && ln.replace(/[^a-zA-ZÀ-ÿ]/g, "").length > 2
            && ln.length < 90;

          renderText(ln, isAllCaps);
        }
        y += 3; // extra paragraph gap
      }
      y += 8;
    };

    // ── SECTION TITLE LOOKUP ─────────────────────────────────────────────────
    const ST = {
      en: {
        biology:     "Skin Biology Report",
        routine:     "Your Daily Routine Card",
        shaveBiology:"Shave Biology Report",
        shaveCard:   "Your Shave Protocol Card",
        skincare:    "Men's Skincare Guide",
        shaving:     "Men's Shaving Bible",
        main:        label,
      },
      fr: {
        biology:     "Rapport de Biologie Cutanée",
        routine:     "Votre Carte de Routine",
        shaveBiology:"Rapport de Biologie du Rasage",
        shaveCard:   "Votre Carte de Protocole de Rasage",
        skincare:    "Guide de Soins pour Hommes",
        shaving:     "Bible du Rasage pour Hommes",
        main:        label,
      },
      es: {
        biology:     "Informe de Biología Cutánea",
        routine:     "Tu Tarjeta de Rutina",
        shaveBiology:"Informe de Biología del Afeitado",
        shaveCard:   "Tu Tarjeta de Protocolo de Afeitado",
        skincare:    "Guía de Cuidado de Piel",
        shaving:     "Biblia del Afeitado",
        main:        label,
      },
    };
    const S = ST[lang] || ST.en;

    // ── RENDER CONTENT (all 9 products handled) ──────────────────────────────
    if (content.biology)      renderSection(S.biology,     content.biology);
    if (content.routine)      renderSection(S.routine,     content.routine);
    if (content.shaveBiology) renderSection(S.shaveBiology,content.shaveBiology);
    if (content.shaveCard)    renderSection(S.shaveCard,   content.shaveCard);
    if (content.skincare)     renderSection(S.skincare,    content.skincare);
    if (content.shaving)      renderSection(S.shaving,     content.shaving);
    if (content.main)         renderSection(S.main,        content.main);

    // ── DISCLAIMER BOX ───────────────────────────────────────────────────────
    needPage(80);
    y += 8;

    const disH = 64;
    doc.rect(MARGIN, y, CW, disH).fill(C.card);
    doc.rect(MARGIN, y, CW, disH).stroke(C.border);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(C.gold)
      .text(ui.disclaimer, MARGIN + 12, y + 10,
        { characterSpacing: 1.5, lineBreak: false });
    doc.font("Helvetica").fontSize(7.5).fillColor(C.muted)
      .text(ui.disclaimerText, MARGIN + 12, y + 24,
        { width: CW - 24, lineGap: 2 });
    y += disH + 14;

    // ── FOOTER TEXT ──────────────────────────────────────────────────────────
    needPage(48);
    doc.moveTo(MARGIN, y).lineTo(A4.W - MARGIN, y)
      .strokeColor(C.border).lineWidth(0.3).stroke();
    y += 10;

    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.gold)
      .text("SKINR", MARGIN, y, { continued: true, lineBreak: false });
    doc.font("Helvetica").fontSize(9).fillColor(C.muted)
      .text("  \u2014  Free. Clinical. Built for Men.  \u2014  tryskinr.com");
    y = doc.y + 8;

    doc.font("Helvetica").fontSize(7.5).fillColor(C.muted)
      .text(ui.affiliate, MARGIN, y, { width: CW, lineGap: 2 });

    doc.end();

  } catch (err) {
    reject(err);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// EMAIL HTML -- ALL 3 LANGUAGES
// ════════════════════════════════════════════════════════════════════════════

const buildEmailHtml = (label, skinType, lang, product) => {
  const ui = t(lang);
  const isGuide = product && product.includes("guide");

  // Skin-type specific week expectations (static, no Claude needed)
  const getExpectations = (skin, lng) => {
    const base = {
      en: [
        { week: "Week 1-2", text: "Your skin begins adapting. You may notice minor texture changes as dead cell buildup clears. Stay consistent — this is the system working." },
        { week: "Week 3-4", text: "Barrier function improves. Oiliness or dryness starts to balance. Morning and evening protocols should feel natural by now." },
        { week: "Week 6-8", text: "Visible changes in skin clarity and tone. Ingredients like niacinamide and retinol show measurable results at this stage." },
        { week: "Week 12+", text: "Full protocol results. Clinical studies measure ingredient efficacy at 12 weeks. Your skin is operating on the correct protocol." },
      ],
      fr: [
        { week: "Semaines 1-2", text: "Ta peau commence à s'adapter. Des changements mineurs de texture peuvent apparaître. Reste constant — c'est le système qui fonctionne." },
        { week: "Semaines 3-4", text: "La fonction barrière s'améliore. L'excès de sébum ou la sécheresse commence à s'équilibrer." },
        { week: "Semaines 6-8", text: "Changements visibles dans la clarté et le teint. La niacinamide et le rétinol montrent des résultats mesurables à ce stade." },
        { week: "Semaine 12+", text: "Résultats complets du protocole. Les études cliniques mesurent l'efficacité des ingrédients à 12 semaines." },
      ],
      es: [
        { week: "Semanas 1-2", text: "Tu piel comienza a adaptarse. Pueden aparecer cambios menores de textura. Mantén la constancia — el sistema está funcionando." },
        { week: "Semanas 3-4", text: "La función barrera mejora. El exceso de sebo o la sequedad comienza a equilibrarse." },
        { week: "Semanas 6-8", text: "Cambios visibles en claridad y tono. La niacinamida y el retinol muestran resultados medibles en esta etapa." },
        { week: "Semana 12+", text: "Resultados completos del protocolo. Los estudios clínicos miden la eficacia de los ingredientes a las 12 semanas." },
      ],
    };
    return (base[lng] || base.en);
  };

  const expectations = !isGuide && skinType ? getExpectations(skinType, lang) : null;
  const appUrl = "https://www.tryskinr.com";

  const weekCard = (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1E1A14;vertical-align:top;">
        <div style="font-size:8px;letter-spacing:2px;color:#B8972A;text-transform:uppercase;margin-bottom:3px;">${item.week}</div>
        <div style="font-size:13px;color:#B8AEA6;line-height:1.7;">${item.text}</div>
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SKINR</title></head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#050505;border:1px solid #1E1A14;">

  <!-- Gold top bar -->
  <div style="height:3px;background:linear-gradient(90deg,#B8972A,#D4AF50,#B8972A);"></div>

  <!-- Header -->
  <div style="padding:28px 40px 22px;border-bottom:1px solid #1E1A14;text-align:center;">
    <div style="display:inline-flex;align-items:center;gap:10px;">
      <div style="width:10px;height:10px;background:#B8972A;transform:rotate(45deg);"></div>
      <span style="font-size:22px;font-weight:700;color:#F2EEE6;letter-spacing:5px;">SKINR</span>
    </div>
    <div style="font-size:8px;letter-spacing:2.5px;color:#B8AEA6;margin-top:5px;text-transform:uppercase;">Free. Clinical. Built for Men.</div>
  </div>

  <!-- Body -->
  <div style="padding:36px 40px 28px;">

    <!-- Label -->
    <div style="font-size:9px;letter-spacing:4px;color:#B8972A;text-transform:uppercase;margin-bottom:12px;">${ui.emailReady}</div>
    <h1 style="font-size:22px;color:#F2EEE6;font-weight:700;margin:0 0 22px;line-height:1.3;">${label}</h1>

    <!-- Profile card (personalised reports only) -->
    ${skinType && !isGuide ? `
    <div style="background:#0D0D0D;border:1px solid #1E1A14;border-left:3px solid #B8972A;padding:14px 18px;margin-bottom:24px;">
      <div style="font-size:8px;letter-spacing:2.5px;color:#B8972A;text-transform:uppercase;margin-bottom:6px;">${ui.profile}</div>
      <div style="font-size:16px;color:#F2EEE6;font-weight:700;">${skinType}</div>
      <div style="font-size:12px;color:#B8AEA6;margin-top:3px;">
        ${lang === "fr" ? "Rapport généré spécifiquement pour ta biologie cutanée."
          : lang === "es" ? "Informe generado específicamente para tu biología cutánea."
          : "Report generated specifically for your skin biology."}
      </div>
    </div>` : ""}

    <!-- Main message -->
    <p style="font-size:14px;color:#D8D2C8;line-height:1.85;margin:0 0 14px;">${ui.emailBody}</p>
    <p style="font-size:14px;color:#D8D2C8;line-height:1.85;margin:0 0 28px;">
      ${lang === "fr"
        ? "Ton profil est sauvegardé dans le navigateur où tu as effectué ton achat. Pour y accéder sur un autre appareil, fais une nouvelle analyse — elle prend 60 secondes."
        : lang === "es"
        ? "Tu perfil está guardado en el navegador donde realizaste tu compra. Para acceder desde otro dispositivo, haz un nuevo análisis — toma 60 segundos."
        : "Your profile is saved in the browser where you made your purchase. To access on another device, run a new analysis — it takes 60 seconds."}
    </p>

    <!-- CTA -->
    <div style="text-align:center;margin:28px 0 32px;">
      <a href="${appUrl}" style="background:#B8972A;color:#050505;padding:14px 36px;
        text-decoration:none;font-size:9px;letter-spacing:3px;text-transform:uppercase;
        font-weight:700;display:inline-block;">${ui.emailBtn}</a>
    </div>

    <!-- Week-by-week expectations (personalised reports only) -->
    ${expectations ? `
    <div style="border-top:1px solid #1E1A14;padding-top:24px;margin-top:8px;">
      <div style="font-size:9px;letter-spacing:3px;color:#B8972A;text-transform:uppercase;margin-bottom:16px;">
        ${lang === "fr" ? "Ce à quoi t'attendre" : lang === "es" ? "Qué esperar" : "What to Expect"}
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${expectations.map(weekCard).join("")}
      </table>
    </div>` : ""}

    <!-- PDF instructions -->
    <div style="background:#0D0D0D;border:1px solid #1E1A14;padding:16px 18px;margin-top:28px;">
      <div style="font-size:9px;letter-spacing:2px;color:#B8972A;text-transform:uppercase;margin-bottom:6px;">
        ${lang === "fr" ? "Votre PDF" : lang === "es" ? "Tu PDF" : "Your PDF"}
      </div>
      <div style="font-size:13px;color:#B8AEA6;line-height:1.7;">
        ${lang === "fr"
          ? "Ton rapport est joint en tant que pièce jointe PDF. Sauvegarde-le dans iCloud Drive, Google Drive ou tes fichiers locaux pour un accès permanent."
          : lang === "es"
          ? "Tu informe está adjunto como PDF. Guárdalo en iCloud Drive, Google Drive o tus archivos locales para acceso permanente."
          : "Your report is attached as a PDF. Save it to iCloud Drive, Google Drive, or your local files for permanent access on any device."}
      </div>
    </div>

    <!-- PDF attachment callout — prominent, cannot be missed -->
    <div style="background:#1a1500;border:2px solid #B8972A;padding:16px 20px;margin:0 0 24px;text-align:center;">
      <div style="font-size:16px;margin-bottom:6px;">📎</div>
      <div style="font-size:11px;font-weight:700;color:#F2EEE6;letter-spacing:1px;margin-bottom:4px;">
        ${lang === "fr" ? "VOTRE RAPPORT EST EN PIÈCE JOINTE" : lang === "es" ? "TU INFORME ESTÁ ADJUNTO" : "YOUR REPORT IS ATTACHED BELOW"}
      </div>
      <div style="font-size:11px;color:#B8AEA6;line-height:1.6;">
        ${lang === "fr"
          ? "Faites défiler jusqu'en bas de cet e-mail pour trouver le fichier PDF joint."
          : lang === "es"
          ? "Desplázate hasta la parte inferior de este correo para encontrar el archivo PDF adjunto."
          : "Scroll to the bottom of this email to find your PDF file. On mobile, tap the attachment icon at the bottom of the email."}
      </div>
    </div>

    <!-- Week 1 Actionable Tips -->
    ${!isGuide ? `
    <div style="border-top:1px solid #1E1A14;padding-top:24px;margin-top:28px;">
      <div style="font-size:9px;letter-spacing:3px;color:#B8972A;text-transform:uppercase;margin-bottom:14px;">
        ${lang === "fr" ? "Tes 3 Actions Semaine 1" : lang === "es" ? "Tus 3 Acciones Semana 1" : "Your 3 Week 1 Actions"}
      </div>
      ${(product && (product.includes("shave") || product === "shave-combo")) ? `
      <div style="margin-bottom:12px;padding:12px 0;border-bottom:1px solid #1E1A14;">
        <div style="font-size:8px;letter-spacing:2px;color:#B8972A;text-transform:uppercase;margin-bottom:4px;">01</div>
        <div style="font-size:13px;color:#D8D2C8;line-height:1.7;">
          ${lang === "fr"
            ? "Si tu utilises encore des rasoirs multi-lames, passe à un rasoir simple lame cette semaine. C'est le changement le plus impactant que tu puisses faire."
            : lang === "es"
            ? "Si aún usas maquinillas de varias hojas, cambia a una de hoja simple esta semana. Es el cambio más impactante que puedes hacer."
            : "If you are still using a multi-blade cartridge razor, switch to a single-blade safety razor this week. This is the highest-impact change you can make."}
        </div>
      </div>
      <div style="margin-bottom:12px;padding:12px 0;border-bottom:1px solid #1E1A14;">
        <div style="font-size:8px;letter-spacing:2px;color:#B8972A;text-transform:uppercase;margin-bottom:4px;">02</div>
        <div style="font-size:13px;color:#D8D2C8;line-height:1.7;">
          ${lang === "fr"
            ? "Avant chaque rasage cette semaine : 90 secondes d'eau tiède sur la zone de rasage. Pas négociable. L'eau hydrate le poil et réduit la force de coupe de 70%."
            : lang === "es"
            ? "Antes de cada afeitado esta semana: 90 segundos de agua tibia en la zona de afeitado. No negociable. El agua hidrata el vello y reduce la fuerza de corte en 70%."
            : "Before every shave this week: 90 seconds of warm water on the shave area. Non-negotiable. Water hydrates the hair shaft and reduces cutting force by 70%."}
        </div>
      </div>
      <div style="padding:12px 0;">
        <div style="font-size:8px;letter-spacing:2px;color:#B8972A;text-transform:uppercase;margin-bottom:4px;">03</div>
        <div style="font-size:13px;color:#D8D2C8;line-height:1.7;">
          ${lang === "fr"
            ? "Après chaque rasage : eau froide pendant 30 secondes, puis ton traitement post-rasage. L'eau froide provoque une vasoconstriction qui réduit l'inflammation avant qu'elle ne commence."
            : lang === "es"
            ? "Después de cada afeitado: agua fría durante 30 segundos, luego tu tratamiento post-afeitado. El agua fría provoca vasoconstricción que reduce la inflamación antes de que empiece."
            : "After every shave: cold water for 30 seconds, then your post-shave treatment. Cold water causes vasoconstriction that reduces inflammation before it starts."}
        </div>
      </div>` : `
      <div style="margin-bottom:12px;padding:12px 0;border-bottom:1px solid #1E1A14;">
        <div style="font-size:8px;letter-spacing:2px;color:#B8972A;text-transform:uppercase;margin-bottom:4px;">01</div>
        <div style="font-size:13px;color:#D8D2C8;line-height:1.7;">
          ${lang === "fr"
            ? "Cette semaine : implante uniquement la routine du matin. Ne changes rien d'autre. Ajoute la routine du soir en semaine 2 quand le matin est naturel."
            : lang === "es"
            ? "Esta semana: implementa solo la rutina de mañana. No cambies nada más. Agrega la rutina de noche en la semana 2 cuando la mañana sea natural."
            : "This week: implement the morning routine only. Change nothing else. Add the evening routine in week 2 once the morning feels natural."}
        </div>
      </div>
      <div style="margin-bottom:12px;padding:12px 0;border-bottom:1px solid #1E1A14;">
        <div style="font-size:8px;letter-spacing:2px;color:#B8972A;text-transform:uppercase;margin-bottom:4px;">02</div>
        <div style="font-size:13px;color:#D8D2C8;line-height:1.7;">
          ${lang === "fr"
            ? "Le SPF est non négociable, même en hiver, même par temps nuageux. L'exposition UV quotidienne accumule les dommages sur des années. Commence aujourd'hui."
            : lang === "es"
            ? "El FPS es no negociable, incluso en invierno, incluso en días nublados. La exposición UV diaria acumula daño durante años. Empieza hoy."
            : "SPF is non-negotiable, even in winter, even on cloudy days. Incidental daily UV exposure accumulates damage over years. Start today."}
        </div>
      </div>
      <div style="padding:12px 0;">
        <div style="font-size:8px;letter-spacing:2px;color:#B8972A;text-transform:uppercase;margin-bottom:4px;">03</div>
        <div style="font-size:13px;color:#D8D2C8;line-height:1.7;">
          ${lang === "fr"
            ? "N'introduis pas d'autres nouveaux produits cette semaine. Si ta peau réagit, tu dois savoir exactement quel produit en est la cause. Un produit à la fois."
            : lang === "es"
            ? "No introduzcas otros productos nuevos esta semana. Si tu piel reacciona, necesitas saber exactamente qué producto es la causa. Un producto a la vez."
            : "Do not introduce any other new products this week. If your skin reacts, you need to know exactly which product caused it. One product at a time."}
        </div>
      </div>`}
    </div>` : ""}

    <!-- Support -->
    <div style="background:#0A0A0A;border:1px solid #1E1A14;padding:14px 18px;margin-top:24px;text-align:center;">
      <div style="font-size:12px;color:#B8AEA6;line-height:1.7;">
        ${lang === "fr"
          ? "Questions? Email non reçu? Nous répondons en moins de 24h."
          : lang === "es"
          ? "¿Preguntas? ¿Email no recibido? Respondemos en menos de 24h."
          : "Questions? Email not received? We respond within 24 hours."}
        <br>
        <a href="mailto:hello@tryskinr.com" style="color:#B8972A;text-decoration:none;font-weight:700;">hello@tryskinr.com</a>
      </div>
    </div>

  </div>

  <!-- Divider -->
  <div style="height:1px;background:#1E1A14;margin:0 40px;"></div>

  <!-- Footer -->
  <div style="padding:20px 40px 22px;text-align:center;">
    <p style="font-size:10px;color:#4E4844;margin:0 0 6px;">SKINR &mdash; tryskinr.com &mdash; hello@tryskinr.com</p>
    <p style="font-size:10px;color:#4E4844;margin:0;line-height:1.65;">${ui.emailFooter}</p>
    <p style="font-size:9px;color:#3A3634;margin:8px 0 0;">
      ${lang === "fr"
        ? "Tu reçois cet email car tu as effectué un achat sur SKINR."
        : lang === "es"
        ? "Recibes este email porque realizaste una compra en SKINR."
        : "You received this email because you made a purchase on SKINR."}
    </p>
  </div>

  <!-- Gold bottom bar -->
  <div style="height:2px;background:linear-gradient(90deg,#B8972A,#D4AF50,#B8972A);"></div>

</div>
</body></html>`;
};

// ════════════════════════════════════════════════════════════════════════════
// EMAIL DELIVERY
// ════════════════════════════════════════════════════════════════════════════

const sendMail = async (to, subject, html, pdfBuffer, filename) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASS },
  });
  return transporter.sendMail({
    from:        `SKINR <${process.env.GMAIL_USER}>`,
    replyTo:     `SKINR <hello@tryskinr.com>`,
    to, subject, html,
    attachments: [{ filename, content: pdfBuffer, contentType: "application/pdf" }],
  });
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ════════════════════════════════════════════════════════════════════════════

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Verify Stripe signature
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig    = event.headers["stripe-signature"];
  if (secret && sig) {
    if (!verifyStripe(event.body, sig, secret)) {
      console.error("SKINR webhook: signature verification failed");
      return { statusCode: 400, body: "Invalid signature" };
    }
  }

  let parsedEvent;
  try {
    parsedEvent = JSON.parse(event.body);
  } catch (_) {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  // Always return 200 first for payment_failed (no delivery needed)
  if (parsedEvent.type === "payment_intent.payment_failed") {
    const intent = parsedEvent.data.object;
    console.error(`SKINR payment failed: ${intent.id} -- ${intent.last_payment_error?.message}`);
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  }

  if (parsedEvent.type !== "payment_intent.succeeded") {
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  }

  // Payment succeeded -- process delivery
  const intent  = parsedEvent.data.object;
  const { product, skinType, lang = "en" } = intent.metadata;
  const amount  = (intent.amount / 100).toFixed(2);
  const label   = getLabel(product, lang);
  const safeName = label.replace(/[^a-zA-Z0-9\-]/g, "-").replace(/-+/g, "-");
  const filename = `SKINR-${safeName}.pdf`;

  // Email resolution — priority order:
  // 1. intent.metadata.email (set by stripe.js for card payments where user typed email)
  // 2. intent.receipt_email  (Stripe auto-sets when receipt_email passed at creation)
  // 3. Retrieve charges from Stripe API → billing_details.email (Apple Pay / Google Pay)
  const metaEmail    = intent.metadata?.email;
  const receiptEmail = intent.receipt_email;
  let   chargeEmail  = null;

  // For Apple Pay/Google Pay the email lives in charge billing_details
  // Fetch expanded payment intent from Stripe to get it
  if (!metaEmail && !receiptEmail && process.env.STRIPE_SECRET_KEY) {
    try {
      const resp = await fetch(
        `https://api.stripe.com/v1/payment_intents/${intent.id}?expand[]=charges`,
        { headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` } }
      );
      const expanded = await resp.json();
      chargeEmail = expanded.charges?.data?.[0]?.billing_details?.email || null;
    } catch(_) {}
  }

  const email = metaEmail || receiptEmail || chargeEmail || null;

  const emailSource = metaEmail ? "metadata" : receiptEmail ? "receipt" : chargeEmail ? "charge" : "none";
  console.log(`SKINR sale: ${intent.id} | ${product} | $${amount} | lang=${lang} | ${email || "no-email"} (${emailSource})`);

  // ── ANALYSIS EMAIL DELIVERY ($1) ─────────────────────────────────────────────
  // No PDF. Reconstructs the customer's actual analysis from Stripe metadata
  // and sends as clickable HTML email — exactly what they saw on the results page.
  if (product === "analysis-email") {
    if (email && process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
      try {
        const m   = intent.metadata;
        const isShave = (m.analysisType === "shave");
        const isCA    = (m.userCountry === "CA");
        const tagUS   = "skinr07-20";
        const tagCA   = "Skinr-20";
        const affBase = isCA ? "https://www.amazon.ca/s?k=" : "https://www.amazon.com/s?k=";
        const affTag  = isCA ? tagCA : tagUS;

        // Helper: parse a step from compact JSON metadata
        const parseStep = (raw) => {
          if (!raw) return null;
          try { return JSON.parse(raw); } catch(_) { return null; }
        };

        // Helper: build a clickable Amazon URL from the search term
        const amzLink = (search) => search
          ? affBase + encodeURIComponent(search) + "&tag=" + affTag
          : (isCA ? "https://www.amazon.ca?tag=" + tagCA : "https://www.amazon.com?tag=" + tagUS);

        // Helper: render one step card row as HTML
        const stepHTML = (step, num) => {
          if (!step || !step.p) return "";
          const link = amzLink(step.a || step.p);
          return `
            <div style="padding:14px 0;border-bottom:1px solid #1E1A14;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                <div style="flex:1;">
                  <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;color:#B8972A;text-transform:uppercase;margin-bottom:3px;">Step ${num}</div>
                  <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#F2EEE6;margin-bottom:3px;">${step.p}</div>
                  ${step.b ? `<div style="font-family:Arial,sans-serif;font-size:11px;color:#B8AEA6;margin-bottom:5px;">${step.b}${step.e ? " &mdash; " + step.e : ""}</div>` : ""}
                  ${step.i ? `<div style="font-family:Arial,sans-serif;font-size:11px;color:#B8AEA6;line-height:1.6;font-style:italic;">${step.i}</div>` : ""}
                </div>
                <a href="${link}" target="_blank" style="flex-shrink:0;font-family:Arial,sans-serif;font-size:8px;letter-spacing:2px;color:#050505;background:#B8972A;text-decoration:none;padding:8px 14px;font-weight:700;text-transform:uppercase;white-space:nowrap;display:inline-block;margin-top:4px;">Amazon &rarr;</a>
              </div>
            </div>`;
        };

        // Helper: render a period section header
        const sectionHeader = (label) => `
          <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:4px;color:#B8972A;text-transform:uppercase;margin:24px 0 4px;padding-bottom:8px;border-bottom:2px solid #1E1A14;">${label}</div>`;

        // ── Build content based on skin vs shave ──────────────────────────────
        let bodyHTML = "";
        let summaryHTML = "";

        if (isShave) {
          // Shave analysis
          const shaveType = skinType || "standard";

          if (m.clinicalFinding) {
            summaryHTML += `
              <div style="background:#0D0D0D;border-left:3px solid #B8972A;padding:12px 16px;margin-bottom:10px;">
                <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;color:#B8972A;text-transform:uppercase;margin-bottom:4px;">Clinical Finding</div>
                <div style="font-family:Arial,sans-serif;font-size:13px;color:#F2EEE6;line-height:1.7;">${m.clinicalFinding}</div>
              </div>`;
          }
          if (m.criticalRule) {
            summaryHTML += `
              <div style="background:#0D0D0D;border-left:3px solid #D4AF50;padding:12px 16px;margin-bottom:10px;">
                <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;color:#D4AF50;text-transform:uppercase;margin-bottom:4px;">Critical Rule</div>
                <div style="font-family:Arial,sans-serif;font-size:13px;color:#F2EEE6;line-height:1.7;">${m.criticalRule}</div>
              </div>`;
          }

          // Pre-shave steps
          const preSteps = ["ps0","ps1","ps2","ps3"].map(k=>parseStep(m[k])).filter(Boolean);
          if (preSteps.length) {
            bodyHTML += sectionHeader(lang==="fr"?"Pré-Rasage":lang==="es"?"Pre-Afeitado":"Pre-Shave");
            preSteps.forEach((s,i) => { bodyHTML += stepHTML(s, i+1); });
          }

          // During shave steps
          const duringSteps = ["d0","d1","d2","d3"].map(k=>parseStep(m[k])).filter(Boolean);
          if (duringSteps.length) {
            bodyHTML += sectionHeader(lang==="fr"?"Le Rasage":lang==="es"?"El Afeitado":"The Shave");
            duringSteps.forEach((s,i) => { bodyHTML += stepHTML(s, i+1); });
          }

          // Post-shave steps
          const postSteps = ["po0","po1","po2","po3","po4"].map(k=>parseStep(m[k])).filter(Boolean);
          if (postSteps.length) {
            bodyHTML += sectionHeader(lang==="fr"?"Post-Rasage":lang==="es"?"Post-Afeitado":"Post-Shave");
            postSteps.forEach((s,i) => { bodyHTML += stepHTML(s, i+1); });
          }

          if (m.expectedImprovement) {
            bodyHTML += `
              <div style="background:#0D0D0D;border-left:3px solid #1E6B4A;padding:12px 16px;margin-top:20px;">
                <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;color:#3DBE7A;text-transform:uppercase;margin-bottom:4px;">${lang==="fr"?"Amélioration Attendue":lang==="es"?"Mejora Esperada":"Expected Improvement"}</div>
                <div style="font-family:Arial,sans-serif;font-size:12px;color:#B8AEA6;line-height:1.7;font-style:italic;">${m.expectedImprovement}</div>
              </div>`;
          }

        } else {
          // Skin analysis
          if (m.headline) {
            summaryHTML = `<div style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#F2EEE6;margin-bottom:8px;">${m.headline}</div>`;
          }

          // Morning routine
          const morningSteps = ["m0","m1","m2","m3","m4","m5"].map(k=>parseStep(m[k])).filter(Boolean);
          if (morningSteps.length) {
            bodyHTML += sectionHeader(lang==="fr"?"Routine du Matin":lang==="es"?"Rutina de Mañana":"Morning Routine");
            morningSteps.forEach((s,i) => { bodyHTML += stepHTML(s, i+1); });
          }

          // Evening routine
          const eveningSteps = ["e0","e1","e2","e3","e4"].map(k=>parseStep(m[k])).filter(Boolean);
          if (eveningSteps.length) {
            bodyHTML += sectionHeader(lang==="fr"?"Routine du Soir":lang==="es"?"Rutina de Noche":"Evening Routine");
            eveningSteps.forEach((s,i) => { bodyHTML += stepHTML(s, i+1); });
          }

          // Avoid + Pro Tip
          if (m.avoid) {
            bodyHTML += `
              <div style="background:#0D0D0D;border-left:3px solid #8B3A3A;padding:12px 16px;margin-top:20px;">
                <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;color:#E07070;text-transform:uppercase;margin-bottom:4px;">${lang==="fr"?"À Éviter":lang==="es"?"Evitar":"Avoid"}</div>
                <div style="font-family:Arial,sans-serif;font-size:12px;color:#B8AEA6;line-height:1.7;">${m.avoid}</div>
              </div>`;
          }
          if (m.proTip) {
            bodyHTML += `
              <div style="background:#0D0D0D;border-left:3px solid #1E6B4A;padding:12px 16px;margin-top:10px;">
                <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;color:#3DBE7A;text-transform:uppercase;margin-bottom:4px;">${lang==="fr"?"Conseil Expert":lang==="es"?"Consejo Experto":"Expert Insight"}</div>
                <div style="font-family:Arial,sans-serif;font-size:12px;color:#B8AEA6;line-height:1.7;font-style:italic;">${m.proTip}</div>
              </div>`;
          }
        }

        // ── Upsell section ────────────────────────────────────────────────────
        const upsellLabel = isShave
          ? (lang==="fr"?"Rapport de Biologie du Rasage":lang==="es"?"Informe de Biología del Afeitado":"Shave Biology Report")
          : (lang==="fr"?"Rapport de Biologie Cutanée":lang==="es"?"Informe de Biología Cutánea":"Skin Biology Report");
        const upsellPrice = 15;
        const analysisTypeLabel = isShave
          ? (lang==="fr"?"Protocole de Rasage":lang==="es"?"Protocolo de Afeitado":"Shave Protocol")
          : (lang==="fr"?"Analyse de Peau":lang==="es"?"Análisis de Piel":"Skin Analysis");

        const subjectLine = lang==="fr"
          ? `Votre ${analysisTypeLabel} SKINR — Sauvegardé`
          : lang==="es"
          ? `Tu ${analysisTypeLabel} SKINR — Guardado`
          : `Your SKINR ${analysisTypeLabel} — Saved to Your Inbox`;

        const emailHtml = `<!DOCTYPE html><html lang="${lang||"en"}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subjectLine}</title></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;">
<tr><td align="center" style="padding:32px 16px 40px;">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- Gold top bar -->
  <tr><td style="background:#B8972A;height:3px;"></td></tr>

  <!-- Header -->
  <tr><td style="background:#080808;padding:22px 32px;border-bottom:1px solid #1E1A14;text-align:center;">
    <div style="font-size:18px;font-weight:700;color:#F2EEE6;letter-spacing:5px;">&#9670; SKINR</div>
    <div style="font-size:8px;letter-spacing:2px;color:#B8AEA6;text-transform:uppercase;margin-top:4px;">Free. Clinical. Built for Men.</div>
  </td></tr>

  <!-- Analysis label + headline -->
  <tr><td style="padding:24px 32px 0;background:#050505;">
    <div style="font-size:9px;letter-spacing:4px;color:#B8972A;text-transform:uppercase;margin-bottom:10px;">${analysisTypeLabel}</div>
    ${summaryHTML}
    <div style="font-size:13px;color:#B8AEA6;line-height:1.7;margin-bottom:6px;">
      ${lang==="fr"?"Tes recommandations personnalisées sont sauvegardées ci-dessous. Clique sur un lien Amazon pour commander directement le bon produit.":lang==="es"?"Tus recomendaciones personalizadas están guardadas abajo. Haz clic en un enlace de Amazon para pedir el producto correcto directamente.":"Your personalised recommendations are saved below. Click any Amazon link to order the exact right product directly."}
    </div>
    <div style="border-top:1px solid #1E1A14;margin-top:8px;"></div>
  </td></tr>

  <!-- Steps content -->
  <tr><td style="padding:0 32px 24px;background:#050505;">
    ${bodyHTML || '<div style="font-family:Arial,sans-serif;font-size:13px;color:#B8AEA6;padding:20px 0;">Return to tryskinr.com to view your full analysis.</div>'}
  </td></tr>

  <!-- Upsell banner -->
  <tr><td style="background:#0D0D0D;border:1px solid #B8972A;padding:18px 32px;text-align:center;">
    <div style="font-size:9px;letter-spacing:3px;color:#B8972A;text-transform:uppercase;margin-bottom:8px;">
      ${lang==="fr"?"Aller Plus Loin":lang==="es"?"Ir Más Profundo":"Go Deeper"}
    </div>
    <div style="font-size:12px;color:#B8AEA6;line-height:1.65;margin-bottom:14px;">
      ${lang==="fr"?"Débloquez votre rapport complet — l'analyse clinique de votre biologie cutanée spécifique. Ce qui est listé ci-dessus, et pourquoi chaque ingrédient fonctionne pour vous.":lang==="es"?"Desbloquea tu informe completo — el análisis clínico de tu biología cutánea específica.":"Unlock your full report — the clinical analysis of your specific skin biology. Everything above, and the science behind why each ingredient works for you."}
    </div>
    <a href="https://tryskinr.com" style="display:inline-block;background:#B8972A;color:#050505;text-decoration:none;font-size:9px;letter-spacing:3px;font-weight:700;text-transform:uppercase;padding:12px 28px;">
      ${lang==="fr"?`Débloquer — $${upsellPrice}`:lang==="es"?`Desbloquear — $${upsellPrice}`:`Unlock ${upsellLabel} — $${upsellPrice}`}
    </a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:14px 32px;background:#0D0D0D;border-top:1px solid #1E1A14;text-align:center;">
    <div style="font-size:10px;color:#4E4844;">SKINR &mdash; tryskinr.com &mdash; hello@tryskinr.com</div>
    <div style="font-size:9px;color:#3A3634;margin-top:4px;">You received this because you purchased the Analysis Email Delivery at tryskinr.com.</div>
  </td></tr>

  <!-- Gold bottom bar -->
  <tr><td style="background:#B8972A;height:2px;"></td></tr>

</table>
</td></tr>
</table>
</body></html>`;

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASS },
        });
        await transporter.sendMail({
          from:    `SKINR <${process.env.GMAIL_USER}>`,
          replyTo: `SKINR <hello@tryskinr.com>`,
          to:      email,
          subject: subjectLine,
          html:    emailHtml,
        });

        const stepCount = Object.keys(m).filter(k => /^(m|e|ps|d|po)\d+$/.test(k)).length;
        console.log(`Analysis email delivered to ${email} (${isShave?"shave":"skin"}, ${stepCount} steps)`);
        addToLoops(email, product, skinType, lang).catch(()=>{});

      } catch(err) {
        console.error("Analysis email error:", err.message);
      }
    }
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ received: true }) };
  }

    // Deliver to customer if we have their email and Gmail credentials
  if (email && process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
    try {
      // 1. Generate content
      console.log(`Generating content: ${product} in ${lang}...`);
      const content = await generateContent(product, skinType, lang);

      // 2. Build PDF(s)
      console.log("Building PDF...");
      let attachments = [];

      if (product === "skin-combo" && content.biology !== undefined) {
        const pdf1 = await buildPDF("biology",  content.biology,  skinType, lang);
        const pdf2 = await buildPDF("routine",  content.routine,  skinType, lang);
        attachments = [
          { filename: `SKINR-Skin-Biology-Report.pdf`,      content: pdf1, contentType: "application/pdf" },
          { filename: `SKINR-Personalised-Routine-Card.pdf`, content: pdf2, contentType: "application/pdf" },
        ];
      } else if (product === "shave-combo" && content.shaveBiology !== undefined) {
        const pdf1 = await buildPDF("shave-biology", content.shaveBiology, skinType, lang);
        const pdf2 = await buildPDF("shave-card",    content.shaveCard,    skinType, lang);
        attachments = [
          { filename: `SKINR-Shave-Biology-Report.pdf`,  content: pdf1, contentType: "application/pdf" },
          { filename: `SKINR-Shave-Protocol-Card.pdf`,   content: pdf2, contentType: "application/pdf" },
        ];
      } else if (product === "guides-combo") {
        const pdf1 = await buildPDF("skincare-guide", content.skincare, skinType, lang);
        const pdf2 = await buildPDF("shaving-guide",  content.shaving,  skinType, lang);
        attachments = [
          { filename: `SKINR-Skincare-Guide.pdf`, content: pdf1, contentType: "application/pdf" },
          { filename: `SKINR-Shaving-Guide.pdf`,  content: pdf2, contentType: "application/pdf" },
        ];
      } else {
        // Single product — one PDF
        const pdf = await buildPDF(product, content, skinType, lang);
        attachments = [{ filename, content: pdf, contentType: "application/pdf" }];
      }

      // 3. Build email subject
      const subject = lang === "fr"
        ? `Votre ${label} SKINR`
        : lang === "es"
        ? `Tu ${label} SKINR`
        : `Your SKINR ${label}`;

      // 4. Send to customer with correct attachments
      const html = buildEmailHtml(label, skinType, lang, product);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASS },
      });
      await transporter.sendMail({
        from:        `SKINR <${process.env.GMAIL_USER}>`,
        replyTo:     `SKINR <hello@tryskinr.com>`,
        to:          email,
        subject,
        html,
        attachments,
      });
      console.log(`Delivered to ${email} (${attachments.length} attachment${attachments.length>1?"s":""})`);

      // 5. Add to Loops
      addToLoops(email, product, skinType, lang).catch(()=>{});

      // 5. Owner notification (plain, no attachment)
      const owner = process.env.GMAIL_USER;
      await nodemailer.createTransport({
        service: "gmail",
        auth: { user: owner, pass: process.env.GMAIL_APP_PASS },
      }).sendMail({
        from:    `SKINR <${process.env.GMAIL_USER}>`,
            replyTo: `SKINR <hello@tryskinr.com>`,
        to:      owner,
        subject: `[SKINR Sale] ${label} \u2014 $${amount} \u2014 ${email}`,
        html: `<div style="font-family:Arial;font-size:14px;line-height:2;color:#333;">
          <strong>New SKINR sale</strong><br>
          Product: <strong>${label}</strong><br>
          Amount: <strong>$${amount} USD</strong><br>
          Customer: <strong>${email}</strong><br>
          Language: ${lang}<br>
          Skin type: ${skinType || "not provided"}<br>
          Payment ID: <code>${intent.id}</code><br>
          Time: ${new Date().toISOString()}
        </div>`,
      });
      console.log("Owner notified");

    } catch (err) {
      // Log error but return 200 -- returning non-200 causes Stripe to retry
      // which would send duplicate emails on the retry
      console.error("SKINR delivery error:", err.message, err.stack?.split("\n")[1] || "");
    }
  } else {
    console.log("No email or Gmail credentials -- skipping delivery");
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};

// ════════════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════════════
// LOOPS.SO -- POST-PURCHASE EMAIL SEQUENCE
// Free up to 2,000 contacts. No step limits.
// Triggers automated Day 3 and Day 14 sequences per product.
// Requires: LOOPS_API_KEY in Netlify environment variables.
// ════════════════════════════════════════════════════════════════════════════

const addToLoops = async (email, product, skinType, lang) => {
  const apiKey = process.env.LOOPS_API_KEY;
  if (!apiKey || !email) return;

  try {
    // Step 1 -- Create contact, if duplicate update instead
    const contactRes = await fetch("https://app.loops.so/api/v1/contacts/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        email,
        source:       "SKINR Purchase",
        userGroup:    product,
        skinType:     skinType || "",
        product:      getLabel(product, lang),
        lang,
        purchaseDate: new Date().toISOString().split("T")[0],
      }),
    });

    const contactData = await contactRes.json();
    // If contact already exists, update it instead of erroring
    if (!contactData.success && contactData.message?.includes("already")) {
      await fetch("https://app.loops.so/api/v1/contacts/update", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email, skinType: skinType || "", product: getLabel(product, lang), lang }),
      });
    } else if (!contactData.success) {
      console.error("Loops contact error:", JSON.stringify(contactData));
    }

    // Step 2 -- Fire event that triggers the journey for this product
    const eventRes = await fetch("https://app.loops.so/api/v1/events/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        email,
        eventName: "skinrPurchaseCompleted",
        eventProperties: {
          product,
          productLabel: getLabel(product, lang),
          skinType:     skinType || "",
          lang,
        },
      }),
    });

    if (!eventRes.ok) {
      const err = await eventRes.text();
      console.error("Loops event error:", err);
      return;
    }

    console.log(`Loops: contact added and event fired for ${email} — ${product}`);
  } catch (err) {
    // Never let Loops failure affect delivery
    console.error("Loops error (non-critical):", err.message);
  }
};
