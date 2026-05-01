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
    access:      "Your full content is also accessible in the SKINR app at skinrfinal.netlify.app",
    emailReady:  "Your Report Is Ready",
    emailBody:   "Your personalised clinical report is attached as a PDF. Open it on any device, save it, print it, keep it.",
    emailAccess: "Also accessible anytime in the SKINR app at",
    emailBtn:    "Open SKINR",
    emailFooter: "Amazon affiliate links support this free service at no extra cost to you.",
    tocAccess:   "YOUR FULL GUIDE IS IN THE SKINR APP",
    tocLine:     "Access your complete guide at skinrfinal.netlify.app under the Guides tab. Your purchase is permanently saved.",
  },
  fr: {
    profile:     "Préparé pour",
    disclaimer:  "AVIS MÉDICAL",
    disclaimerText: "Ce rapport fournit des orientations cliniques générales et ne remplace pas un avis médical professionnel. Consultez un dermatologue certifié pour tout problème persistant de peau ou de rasage.",
    affiliate:   "Les liens affiliés Amazon soutiennent ce service gratuit sans frais supplémentaires. Toutes les recommandations sont basées uniquement sur des preuves cliniques. Aucune marque ne paie pour figurer dans SKINR.",
    access:      "Ton contenu complet est également accessible dans l'application SKINR sur skinrfinal.netlify.app",
    emailReady:  "Ton Rapport est Prêt",
    emailBody:   "Ton rapport clinique personnalisé est joint en PDF. Ouvre-le sur n'importe quel appareil, sauvegarde-le, imprime-le, garde-le.",
    emailAccess: "Également accessible dans l'application SKINR sur",
    emailBtn:    "Ouvrir SKINR",
    emailFooter: "Les liens affiliés Amazon soutiennent ce service gratuit sans frais supplémentaires.",
    tocAccess:   "TON GUIDE COMPLET EST DANS L'APPLICATION SKINR",
    tocLine:     "Accède à ton guide complet sur skinrfinal.netlify.app dans la section Guides. Ton achat est sauvegardé de façon permanente.",
  },
  es: {
    profile:     "Preparado para",
    disclaimer:  "AVISO MÉDICO",
    disclaimerText: "Este informe proporciona orientación clínica general y no sustituye el consejo médico profesional. Consulta a un dermatólogo certificado para cualquier problema persistente de piel o afeitado.",
    affiliate:   "Los enlaces de afiliados de Amazon apoyan este servicio gratuito sin costo adicional. Todas las recomendaciones se basan únicamente en evidencia clínica. Ninguna marca paga por aparecer en SKINR.",
    access:      "Tu contenido completo también es accesible en la app SKINR en skinrfinal.netlify.app",
    emailReady:  "Tu Informe Está Listo",
    emailBody:   "Tu informe clínico personalizado está adjunto en PDF. Ábrelo en cualquier dispositivo, guárdalo, imprímelo, consérvalo.",
    emailAccess: "También accesible en la app SKINR en",
    emailBtn:    "Abrir SKINR",
    emailFooter: "Los enlaces de afiliados de Amazon apoyan este servicio gratuito sin costo adicional.",
    tocAccess:   "TU GUÍA COMPLETA ESTÁ EN LA APP SKINR",
    tocLine:     "Accede a tu guía completa en skinrfinal.netlify.app en la sección Guías. Tu compra está guardada de forma permanente.",
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
  const ui = t(lang);
  const ln = lang === "fr" ? "fr" : lang === "es" ? "es" : "en";

  const SKINCARE_TOC = {
    en: `THE NO-BS MEN'S SKINCARE GUIDE
A Clinical Reference for Every Skin Type, Every Ingredient, and Every Routine.

TABLE OF CONTENTS:

SECTION 1 - WHY MOST MEN'S SKIN ROUTINES FAIL
Understanding why the industry fails you and what actually works.

SECTION 2 - THE BIOLOGY YOU NEED TO KNOW
The Skin Barrier, Sebum and Oil Production, Cellular Turnover, The pH Factor.

SECTION 3 - SKIN TYPES: CLINICAL DEFINITIONS
Dry, Oily, Combination, Sensitive, Acne-Prone -- each defined clinically with specific protocols.

SECTION 4 - THE INGREDIENT GUIDE: WHAT ACTUALLY WORKS
Niacinamide -- effective concentrations and conflicts.
Retinol -- introduction protocol, conflicts, expected results.
Salicylic Acid -- why it works inside follicles.
Hyaluronic Acid -- the humidity limitation nobody tells you.
Vitamin C -- why morning use under SPF multiplies protection.
Ceramides -- the 3:1:1 ratio that repairs your barrier.
AHAs (Glycolic and Lactic Acid) -- how to exfoliate without damage.
Benzoyl Peroxide -- why 2.5% equals 10% with less irritation.
SPF -- the only truly non-negotiable step.

SECTION 5 - BUILDING YOUR ROUTINE
Complete morning routine with exact application order.
Complete evening routine step by step.
The 12-week starter protocol for men beginning from nothing.
Seasonal adjustments for winter and summer.

SECTION 6 - HOW TO READ A PRODUCT LABEL
INCI names, red flags, and marketing language that means nothing.

SECTION 7 - THE MOST COMMON MISTAKES MEN MAKE
Eight specific mistakes explained with the biological reason each causes problems.

SECTION 8 - HYPERPIGMENTATION AND DARK SPOTS
Post-inflammatory hyperpigmentation, treatment hierarchy, realistic timelines.

SECTION 9 - WHEN TO SEE A DERMATOLOGIST
Clinical warning signs that require professional evaluation.`,

    fr: `LE GUIDE DE SOINS SANS DÉTOURS POUR HOMMES
La référence clinique pour chaque type de peau, chaque ingrédient, et chaque routine.

TABLE DES MATIÈRES:

SECTION 1 - POURQUOI LA PLUPART DES ROUTINES ÉCHOUENT
Comprendre pourquoi l'industrie te fait défaut et ce qui fonctionne vraiment.

SECTION 2 - LA BIOLOGIE QUE TU DOIS CONNAÎTRE
La barrière cutanée, la production de sébum, le renouvellement cellulaire, le facteur pH.

SECTION 3 - TYPES DE PEAU: DÉFINITIONS CLINIQUES
Sèche, grasse, mixte, sensible, sujette à l'acné -- chacun défini cliniquement.

SECTION 4 - GUIDE DES INGRÉDIENTS: CE QUI FONCTIONNE VRAIMENT
Niacinamide, Rétinol, Acide salicylique, Acide hyaluronique, Vitamine C,
Céramides, AHAs, Peroxyde de benzoyle, FPS.

SECTION 5 - CONSTRUIRE TA ROUTINE
Routine du matin et du soir complètes. Protocole de démarrage sur 12 semaines.

SECTION 6 - COMMENT LIRE UNE ÉTIQUETTE DE PRODUIT
Noms INCI, signaux d'alarme et jargon marketing sans signification.

SECTION 7 - LES ERREURS LES PLUS COURANTES
Huit erreurs spécifiques avec l'explication biologique de chacune.

SECTION 8 - HYPERPIGMENTATION ET TACHES SOMBRES
Hiérarchie de traitement et chronologie réaliste.

SECTION 9 - QUAND CONSULTER UN DERMATOLOGUE
Signes cliniques nécessitant une évaluation professionnelle.`,

    es: `LA GUÍA DE CUIDADO DE PIEL SIN RODEOS PARA HOMBRES
Una referencia clínica para cada tipo de piel, ingrediente y rutina.

TABLA DE CONTENIDOS:

SECCIÓN 1 - POR QUÉ FALLAN LA MAYORÍA DE LAS RUTINAS
Entendiendo por qué la industria falla y qué funciona realmente.

SECCIÓN 2 - LA BIOLOGÍA QUE NECESITAS SABER
La barrera cutánea, producción de sebo, renovación celular, el factor pH.

SECCIÓN 3 - TIPOS DE PIEL: DEFINICIONES CLÍNICAS
Seca, grasa, mixta, sensible, propensa al acné -- cada una definida clínicamente.

SECCIÓN 4 - GUÍA DE INGREDIENTES: LO QUE REALMENTE FUNCIONA
Niacinamida, Retinol, Ácido salicílico, Ácido hialurónico, Vitamina C,
Ceramidas, AHAs, Peróxido de benzoilo, FPS.

SECCIÓN 5 - CONSTRUYENDO TU RUTINA
Rutinas completas de mañana y noche. Protocolo de inicio de 12 semanas.

SECCIÓN 6 - CÓMO LEER UNA ETIQUETA DE PRODUCTO
Nombres INCI, señales de alerta y jerga de marketing sin significado.

SECCIÓN 7 - LOS ERRORES MÁS COMUNES
Ocho errores específicos con la razón biológica de cada uno.

SECCIÓN 8 - HIPERPIGMENTACIÓN Y MANCHAS OSCURAS
Jerarquía de tratamiento y plazos realistas.

SECCIÓN 9 - CUÁNDO VER A UN DERMATÓLOGO
Señales clínicas que requieren evaluación profesional.`,
  };

  const SHAVING_TOC = {
    en: `THE MEN'S SHAVING BIBLE
Blade Science, Skin Biology, and Clinical Technique for a Shave That Protects Your Skin.

TABLE OF CONTENTS:

SECTION 1 - WHY YOUR SHAVE IS FAILING
The marketing lie about more blades and what actually causes shaving damage.

SECTION 2 - WHAT SHAVING DOES TO YOUR SKIN
The Mechanics of the Cut -- what happens at the cellular level.
Pseudofolliculitis Barbae -- affects 45-83% of Black men who shave. Full clinical biology.
The Acid Mantle -- why shaving disrupts your pH and why alcohol aftershave makes it worse.
Folliculitis vs Razor Bumps -- the clinical difference and different treatments.

SECTION 3 - RAZOR SCIENCE: EVERY TYPE EXPLAINED
Multi-Blade Cartridge -- lift-and-cut mechanics and who should avoid them.
Safety DE Razor -- blade gap science from mild (Merkur 34C) to aggressive (Muhle R41).
Electric Foil (Braun) vs Rotary (Philips) -- who each works for.
Straight Razor -- skill ceiling and why not for PFB sufferers.
OneBlade and Leaf -- the transitional tools.

SECTION 4 - CLINICAL SHAVING TECHNIQUE: PHASE BY PHASE
Pre-Shave -- why 60-90 seconds of warm water reduces cutting force by 70%.
The Shave -- grain direction, the 30-degree angle, why pressure is the most common mistake.
Post-Shave -- cold water vasoconstriction, pH restoration, barrier repair protocol.

SECTION 5 - TECHNIQUE BY BEARD TYPE
Fine Straight, Medium, Coarse Straight, Coarse Curly, Patchy -- specific protocol for each.

SECTION 6 - TREATING ACTIVE RAZOR BUMPS
Four-phase clinical protocol. Realistic timeline: month 3-6 for full resolution.

SECTION 7 - PRODUCTS THAT WORK: INGREDIENT-LED RECOMMENDATIONS
Pre-shave, shaving creams, post-shave treatment, blade recommendations by beard type.

SECTION 8 - ELECTRIC SHAVER OPTIMISATION
Foil vs rotary technique, wet shaving with electric, maintenance schedule.

SECTION 9 - WHEN TO SEE A DERMATOLOGIST
PFB unresponsive to protocol, keloid scarring, bacterial folliculitis, hidradenitis.`,

    fr: `LA BIBLE DU RASAGE POUR HOMMES
Science des lames, biologie cutanée et technique clinique.

TABLE DES MATIÈRES:

SECTION 1 - POURQUOI TON RASAGE ÉCHOUE
Le mensonge marketing sur les lames multiples et ce qui cause vraiment les dommages.

SECTION 2 - CE QUE LE RASAGE FAIT À TA PEAU
La mécanique de la coupe au niveau cellulaire.
Pseudofolliculite de la barbe -- touche 45-83% des hommes noirs qui se rasent.
Le manteau acide -- pourquoi le rasage perturbe ton pH.
Folliculite vs boutons de rasoir -- la différence clinique.

SECTION 3 - SCIENCE DES RASOIRS: CHAQUE TYPE EXPLIQUÉ
Cartouche multi-lames, Rasoir de sûreté DE, Électrique à grille vs rotatif, Rasoir droit.

SECTION 4 - TECHNIQUE CLINIQUE DE RASAGE: PHASE PAR PHASE
Pré-rasage, Le rasage, Récupération post-rasage.

SECTION 5 - TECHNIQUE SELON LE TYPE DE BARBE
Fine droite, Moyenne, Épaisse droite, Épaisse bouclée, Inégale.

SECTION 6 - TRAITER LES BOUTONS DE RASOIR ACTIFS
Protocole clinique en quatre phases. Chronologie réaliste.

SECTION 7 - PRODUITS QUI FONCTIONNENT
Recommandations par ingrédient pour chaque étape.

SECTION 8 - OPTIMISATION DU RASOIR ÉLECTRIQUE
Technique grille vs rotatif, rasage humide électrique, entretien.

SECTION 9 - QUAND CONSULTER UN DERMATOLOGUE
PFB résistant, cicatrices chéloïdes, folliculite bactérienne.`,

    es: `LA BIBLIA DEL AFEITADO PARA HOMBRES
Ciencia de hojas, biología cutánea y técnica clínica.

TABLA DE CONTENIDOS:

SECCIÓN 1 - POR QUÉ TU AFEITADO FALLA
La mentira del marketing sobre más hojas y qué causa realmente el daño.

SECCIÓN 2 - LO QUE EL AFEITADO HACE A TU PIEL
La mecánica del corte a nivel celular.
Pseudofoliculitis barbae -- afecta al 45-83% de los hombres negros que se afeitan.
El manto ácido -- por qué el afeitado altera tu pH.
Foliculitis vs granos de afeitar -- la diferencia clínica.

SECCIÓN 3 - CIENCIA DE MAQUINILLAS: CADA TIPO EXPLICADO
Cartucho multi-hoja, Maquinilla DE de seguridad, Eléctrica de lámina vs rotatoria, Navaja.

SECCIÓN 4 - TÉCNICA CLÍNICA DE AFEITADO: FASE POR FASE
Pre-afeitado, El afeitado, Recuperación post-afeitado.

SECCIÓN 5 - TÉCNICA SEGÚN EL TIPO DE BARBA
Fina recta, Media, Gruesa recta, Gruesa rizada, Irregular.

SECCIÓN 6 - TRATAR LOS GRANOS DE AFEITAR ACTIVOS
Protocolo clínico de cuatro fases. Cronología realista.

SECCIÓN 7 - PRODUCTOS QUE FUNCIONAN
Recomendaciones por ingrediente para cada paso.

SECCIÓN 8 - OPTIMIZACIÓN DE LA AFEITADORA ELÉCTRICA
Técnica lámina vs rotatoria, afeitado húmedo eléctrico, mantenimiento.

SECCIÓN 9 - CUÁNDO VER A UN DERMATÓLOGO
PFB resistente, cicatrices queloides, foliculitis bacteriana.`,
  };

  const skinContent = `${SKINCARE_TOC[ln] || SKINCARE_TOC.en}

─────────────────────────────────────────────────────────────
${ui.tocAccess}
${ui.tocLine}
─────────────────────────────────────────────────────────────`;

  const shavingContent = `${SHAVING_TOC[ln] || SHAVING_TOC.en}

─────────────────────────────────────────────────────────────
${ui.tocAccess}
${ui.tocLine}
─────────────────────────────────────────────────────────────`;

  if (product === "guides-combo") return { skincare: skinContent, shaving: shavingContent };
  if (product === "skincare-guide") return { main: skinContent };
  if (product === "shaving-guide") return { main: shavingContent };
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
          "SKINR  \u2014  skinrfinal.netlify.app  \u2014  Free. Clinical. Built for Men.",
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
      .text("getskinr.com", A4.W - MARGIN - 68, 46, { lineBreak: false });

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

    const safeContentBottom = FOOTER_Y - 28;

    const needPage = (estimatedHeight) => {
      if (y + estimatedHeight > safeContentBottom) {
        doc.addPage(); // pageAdded fires: fillPage + drawTopBar + drawFooter
        y = CONT_START_Y;
      }
    };

    const drawSectionHeader = (title) => {
      needPage(40);
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

      // Estimate: 2 lines minimum for page-break check
      needPage(fontSize * 1.5 * 2);

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
      .text("  \u2014  Free. Clinical. Built for Men.  \u2014  getskinr.com");
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
  const appUrl = "https://skinrfinal.netlify.app";

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
        <a href="mailto:hello@getskinr.com" style="color:#B8972A;text-decoration:none;font-weight:700;">hello@getskinr.com</a>
      </div>
    </div>

  </div>

  <!-- Divider -->
  <div style="height:1px;background:#1E1A14;margin:0 40px;"></div>

  <!-- Footer -->
  <div style="padding:20px 40px 22px;text-align:center;">
    <p style="font-size:10px;color:#4E4844;margin:0 0 6px;">SKINR &mdash; getskinr.com &mdash; hello@getskinr.com</p>
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
    to, subject, html,
    attachments: [{ filename, content: pdfBuffer, contentType: "application/pdf" }],
  });
};

// ════════════════════════════════════════════════════════════════════════════
// MAILCHIMP -- POST-PURCHASE EMAIL SEQUENCE
// Adds customer to audience with product tags so Day 3 and Day 14
// automated sequences fire automatically in Mailchimp.
// Requires: MAILCHIMP_API_KEY and MAILCHIMP_AUDIENCE_ID in Netlify env vars.
// ════════════════════════════════════════════════════════════════════════════

const addToMailchimp = async (email, product, skinType, lang) => {
  const apiKey    = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  if (!apiKey || !audienceId) return; // Silent skip if not configured

  try {
    const dc  = apiKey.split("-").pop(); // e.g. us21
    const md5 = crypto.createHash("md5").update(email.toLowerCase()).digest("hex");
    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members/${md5}`;

    const isGuide = product.includes("guide");
    const tags = [
      `product-${product}`,
      `lang-${lang}`,
      isGuide ? "purchased-guide" : "purchased-report",
      skinType ? `skin-${skinType.toLowerCase().replace(/\s+/g, "-").substring(0, 20)}` : "no-profile",
    ];

    const payload = {
      email_address: email,
      status_if_new: "subscribed",
      status:        "subscribed",
      tags,
      merge_fields: {
        PRODUCT:   getLabel(product, lang),
        SKINTYPE:  skinType || "",
        LANGUAGE:  lang,
        PURCHDATE: new Date().toISOString().split("T")[0],
      },
    };

    await fetch(url, {
      method:  "PUT",
      headers: {
        "Authorization": `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`Mailchimp: ${email} added to audience with tags [${tags.join(", ")}]`);
  } catch (err) {
    // Never let Mailchimp failure affect delivery
    console.error("Mailchimp error (non-critical):", err.message);
  }
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
  const { product, email, skinType, lang = "en" } = intent.metadata;
  const amount  = (intent.amount / 100).toFixed(2);
  const label   = getLabel(product, lang);
  const safeName = label.replace(/[^a-zA-Z0-9\-]/g, "-").replace(/-+/g, "-");
  const filename = `SKINR-${safeName}.pdf`;

  console.log(`SKINR sale: ${intent.id} | ${product} | $${amount} | lang=${lang} | ${email || "no-email"}`);

  // Deliver to customer if we have their email and Gmail credentials
  if (email && process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
    try {
      // 1. Generate content (Claude for reports, static for guides)
      console.log(`Generating content: ${product} in ${lang}...`);
      const content = await generateContent(product, skinType, lang);

      // 2. Build branded PDF
      console.log("Building PDF...");
      const pdf = await buildPDF(product, content, skinType, lang);

      // 3. Build email subject in customer language
      const subject = lang === "fr"
        ? `Votre ${label} SKINR`
        : lang === "es"
        ? `Tu ${label} SKINR`
        : `Your SKINR ${label}`;

      // 4. Send to customer
      const html = buildEmailHtml(label, skinType, lang, product);
      await sendMail(email, subject, html, pdf, filename);
      console.log(`Delivered to ${email}`);

          // Add to Mailchimp for automated Day 3 and Day 14 follow-up sequences
          addToMailchimp(email, product, skinType, lang).catch(()=>{});

      // 5. Owner notification (plain, no attachment)
      const owner = process.env.GMAIL_USER;
      await nodemailer.createTransport({
        service: "gmail",
        auth: { user: owner, pass: process.env.GMAIL_APP_PASS },
      }).sendMail({
        from:    `SKINR <${owner}>`,
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
// (Mailchimp integration is defined above near the main handler)
