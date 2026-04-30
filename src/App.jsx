import { useState, useEffect, useRef, useCallback } from “react”;
// – SKINCARE GUIDE (inline) –
/**

- SKINR — The Men’s Skincare Guide
- src/guides/skincareGuide.js
- 
- Professional clinical reference guide.
- $9 product — also sold on Etsy as PDF.
- Displayed in-app after purchase. Emailed as PDF after PDF system is live.
  */

const SKINCARE_GUIDE = {
title: “The No-BS Men’s Skincare Guide”,
subtitle: “A Clinical Reference for Every Skin Type, Every Ingredient, and Every Routine”,
version: “1.0”,
sections: [

```
{
  id: "intro",
  title: "Why Most Men's Skin Routines Fail",
  content: `Most men who struggle with their skin are not using the wrong products. They are using the right products in the wrong order, at the wrong time, in the wrong amounts, or in combinations that actively cancel each other out.
```

The skincare industry is built on selling products, not educating buyers. A moisturiser that claims to do everything usually does nothing particularly well. An ingredient list that sounds clinical often contains one active ingredient at a concentration too low to do anything measurable.

This guide exists to cut through that. It covers the biology of your skin, the science of what actually works, how to build a routine that functions correctly, and how to read a product label so you never get sold something useless again.

Everything in this guide is based on peer-reviewed dermatological research. No brand partnerships. No sponsored content. The product recommendations that appear throughout reflect clinical evidence only.`
},

```
{
  id: "biology",
  title: "The Biology You Actually Need to Know",
  subsections: [
    {
      title: "The Skin Barrier",
      content: `Your skin is not a passive covering. It is an active organ with a primary job: keep things out. The outermost layer — the stratum corneum — is made of flattened dead skin cells (corneocytes) held together by a lipid matrix of ceramides, cholesterol, and fatty acids.
```

When this barrier is intact, it keeps moisture in and irritants out. When it is damaged — by over-washing, harsh surfactants, UV exposure, or the wrong skincare ingredients — moisture escapes (transepidermal water loss increases) and irritants enter. Every skin problem you have is either caused by a damaged barrier or made worse by one.

The most important thing you can do for your skin is protect this barrier. Everything else is secondary.`}, { title: "Sebum — Your Skin's Natural Oil", content:`Sebaceous glands produce sebum — an oily substance that naturally lubricates your skin and has mild antimicrobial properties. The problem is not sebum itself. The problem is the rate of production and what happens when sebum mixes with dead skin cells inside a follicle.

Excess sebum + dead skin cells = blocked follicle = comedone (blackhead or whitehead). If bacteria (Cutibacterium acnes) colonise that blocked follicle = inflammatory acne.

Sebum production is primarily driven by androgens — which is why oily skin and acne are most severe in the teens and twenties when testosterone is highest, and why men generally have oilier skin than women throughout their lives.`}, { title: "Cellular Turnover", content:`Your skin replaces itself approximately every 28 days. New keratinocytes form at the base of the epidermis and migrate to the surface, dying and flattening as they go. By the time they reach the surface they are dead cells — but they are still doing an important job as part of your barrier.

When this turnover process slows (as it does with age, stress, and sun damage) dead cells accumulate on the surface, creating dull, uneven texture and blocking follicles. Exfoliation — both chemical and physical — speeds this process.

When turnover is disrupted by certain ingredients (like retinoids, which accelerate it dramatically) you get the initial “purging” period where blocked follicles are cleared rapidly, temporarily causing what looks like a breakout. This is not your skin reacting badly — it is the system working.`}, { title: "The pH Factor", content:`Healthy skin has a slightly acidic pH of around 4.5 to 5.5. This acidity maintains the barrier, supports the skin’s natural microbiome, and keeps enzymes that break down dead skin cells functioning correctly.

Many soap bars have a pH of 9 to 11 — highly alkaline. Using them on your face temporarily destroys the acid mantle, disrupts the microbiome, and triggers reactive oil production. This is why your face feels tight after washing with body soap and then oily an hour later. The oiliness is your skin compensating for barrier disruption.

Proper cleansers for the face are pH-balanced, usually between 4.5 and 6.5.`
}
]
},

```
{
  id: "skin-types",
  title: "Skin Types — Clinical Definitions",
  subsections: [
    {
      title: "Dry Skin",
      content: `Clinically defined as skin with impaired barrier function leading to increased transepidermal water loss. The skin does not lack oil — it lacks the ability to retain moisture.
```

Characteristics: tight sensation after washing, visible flaking or rough texture, fine lines appearing more prominent (dehydration makes them more visible), occasional redness.

What it needs: occlusive and humectant moisturisers to trap and draw moisture, gentle non-foaming cleansers that do not strip the barrier, ceramide-based products to repair the lipid matrix.

What to avoid: alcohol-based toners, foaming cleansers with sodium lauryl sulphate, exfoliating too frequently, salicylic acid as a primary treatment (it is lipid-soluble and removes oils from the skin surface).`}, { title: "Oily Skin", content:`Clinically characterised by overactive sebaceous glands producing more sebum than the skin needs. Often genetic. Androgen sensitivity plays a significant role.

Characteristics: visible shine within 1-2 hours of washing, enlarged pores (stretched by excess sebum), frequent blackheads and breakouts, skin that feels thick or congested.

What it needs: non-comedogenic lightweight moisturisers (oily skin still needs hydration — skipping it causes reactive oil production), niacinamide to regulate sebum, salicylic acid to clear follicles, SPF formulated for oily skin (mattifying or gel formulations).

What to avoid: heavy occlusive creams, coconut oil (highly comedogenic), over-washing (triggers more oil production), alcohol-heavy toners that create a strip-then-compensate cycle.`}, { title: "Combination Skin", content:`The most common skin type in adult men. Oily in the T-zone (forehead, nose, chin) where sebaceous gland density is highest, normal to dry on the cheeks and jaw where gland density is lower.

Characteristics: shine concentrated on the nose and forehead, occasional breakouts in the T-zone, cheeks that feel comfortable or slightly dry, pores visibly larger on the nose than the cheeks.

What it needs: lightweight balanced moisturiser, targeted treatments (niacinamide across the whole face, salicylic acid spot treatments or a T-zone-only application), gel or lotion SPF rather than cream.

The mistake most people with combination skin make: treating the entire face like oily skin (causes cheek dryness) or treating it entirely like dry skin (causes T-zone congestion).`}, { title: "Sensitive Skin", content:`Not a skin type in the traditional sense — more accurately a skin condition characterised by heightened reactivity. Can overlap with any of the above types.

Characteristics: redness, stinging, or burning after applying products, frequent reactions to fragrances or active ingredients, skin that flushes easily, sometimes associated with rosacea or eczema.

What it needs: minimal ingredient lists (the fewer ingredients, the fewer potential triggers), fragrance-free formulations, barrier-repairing ingredients (ceramides, niacinamide at lower concentrations), patch testing any new product on the jaw or inner arm before applying to the face.

What to avoid: fragrance (the number one cause of contact dermatitis in skincare), essential oils (common sensitisers despite being “natural”), high-concentration actives without gradual introduction.`}, { title: "Acne-Prone Skin", content:`Acne is not a skin type — it is a skin condition that can affect any skin type. However, oily and combination skin are disproportionately affected due to higher sebum production.

Acne has four causes working simultaneously: excess sebum, hyperkeratinisation (dead cells not shedding properly), Cutibacterium acnes bacteria, and inflammation. Effective treatment addresses all four — not just bacteria (the antibiotics mistake) or just oil (the drying mistake).

Grade I (comedones only): salicylic acid, niacinamide, consistent routine.
Grade II (papules and pustules): add benzoyl peroxide, consider retinol.
Grade III (nodular acne): see a dermatologist. Over-the-counter products will not resolve this.
Grade IV (cystic acne): requires prescription treatment — isotretinoin or prescription topicals. Do not delay.`
}
]
},

```
{
  id: "ingredients",
  title: "The Ingredient Guide — What Actually Works",
  intro: `This section covers every major skincare ingredient, what it does at a biological level, the concentration that has clinical evidence behind it, what it conflicts with, and what skin types it is appropriate for.`,
  subsections: [
    {
      title: "Niacinamide (Vitamin B3)",
      content: `What it does: Regulates sebum production by inhibiting the transfer of melanosomes (reduces hyperpigmentation), strengthens the skin barrier by stimulating ceramide synthesis, reduces inflammation, minimises pore appearance.
```

Effective concentration: 2% to 10%. 5% is the sweet spot — evidence for all benefits without irritation risk. Higher concentrations (above 10%) can cause flushing in some people.

Conflicts with: Vitamin C (ascorbic acid) — they form niacin together and can cause temporary flushing. Use them at different times of day (Vitamin C in the morning, niacinamide at night) or use them 30 minutes apart. This conflict is overstated — both at typical concentrations are fine together.

Best for: All skin types. Particularly valuable for oily, acne-prone, and hyperpigmentation-prone skin. Safe for sensitive skin at 2-4%.

Products with good concentrations: The Ordinary Niacinamide 10% + Zinc 1% (budget), Paula’s Choice 10% Niacinamide (mid-range).`}, { title: "Retinol / Retinoids", content:`What it does: The most evidence-backed anti-ageing ingredient in existence. Accelerates cell turnover, stimulates collagen production, clears blocked follicles, reduces fine lines, evens skin tone. A derivative of Vitamin A — tretinoin (prescription) is the strongest form; retinol, retinaldehyde, and retinyl palmitate are progressively weaker over-the-counter versions.

Effective concentration: 0.025% to start, increasing over months to 0.1% and then to 0.3% or higher depending on tolerance. Prescription tretinoin starts at 0.025% and goes to 0.1%.

Introduction protocol: Start with 0.025% applied two nights per week for the first month. Increase to three nights, then every other night, then nightly over three months. Purging (increased breakouts) is normal in weeks 2-6 and resolves.

Conflicts with: Benzoyl peroxide (deactivates retinol — do not use together), AHAs/BHAs on the same application (too irritating — alternate nights), Vitamin C (use C in the morning, retinol at night).

What to avoid while using retinol: Waxing or laser treatments on the face (skin is thinner and more sensitive), excessive sun exposure without SPF (retinol increases photosensitivity).

Best for: All skin types over 25. Sensitive skin should start with retinaldehyde — gentler than retinol, more effective than retinyl palmitate.`}, { title: "Salicylic Acid (BHA)", content:`What it does: A beta-hydroxy acid (BHA) that is oil-soluble — meaning it can penetrate into the sebaceous follicle and dissolve the mix of oil and dead skin cells that causes blackheads and blocked pores. Also has anti-inflammatory properties.

Effective concentration: 0.5% to 2%. 2% is the maximum allowed in over-the-counter products in most countries. Higher concentrations are used in professional chemical peels.

How to use: Apply after cleansing, before moisturiser. Can be used as a toner, serum, or leave-on treatment. Rinse-off formulations (cleansers) are less effective because contact time is too short.

Conflicts with: Retinol (do not use on the same night — too much exfoliation, barrier damage). Benzoyl peroxide (can be used together but increases dryness — use moisturiser).

Best for: Oily skin, acne-prone skin, skin with blackheads and enlarged pores, combination skin (T-zone only). Not recommended for dry or sensitive skin as primary treatment.`}, { title: "Hyaluronic Acid", content:`What it does: A humectant — it draws water from the environment and from deeper skin layers to the surface, temporarily plumping and hydrating the skin. Can hold up to 1,000 times its weight in water.

Important limitation: It draws moisture from wherever it can find it. In low-humidity environments (winter, air conditioning, flights) it pulls moisture from deeper in your skin and actually increases dryness. Always apply hyaluronic acid to damp skin and immediately seal with a moisturiser.

Effective concentration: 0.1% to 2%. Molecular weight matters — low-molecular-weight hyaluronic acid penetrates deeper; high-molecular-weight stays on the surface and provides immediate plumping. Products with both are most effective.

Conflicts with: None significant. Pairs well with everything. Apply before moisturiser, after serums.

Best for: All skin types, particularly dehydrated skin (which is different from dry skin — even oily skin can be dehydrated).`}, { title: "Vitamin C (L-Ascorbic Acid)", content:`What it does: Potent antioxidant that neutralises free radicals from UV exposure, pollution, and environmental stress. Inhibits melanin synthesis (reduces dark spots and hyperpigmentation). Stimulates collagen synthesis. Best used in the morning under SPF — the combination of Vitamin C and SPF provides significantly better UV protection than SPF alone.

Effective concentration: 10% to 20%. Below 10% has limited evidence. L-Ascorbic acid is the most effective but also most unstable form — it oxidises and becomes ineffective when exposed to air and light. Store in a dark bottle, replace every 3 months.

Stable alternatives: Ascorbyl glucoside, sodium ascorbyl phosphate — less effective than L-ascorbic acid but significantly more stable. Good budget option.

Conflicts with: Niacinamide (see niacinamide section — conflict overstated). Benzoyl peroxide (can be used but requires separation). Retinol (use C in the morning, retinol at night).

Best for: All skin types. Particularly valuable for skin with sun damage, hyperpigmentation, and dullness.`}, { title: "Ceramides", content:`What they do: Ceramides are lipids that make up approximately 50% of your skin barrier’s lipid matrix. They are the cement between the bricks of your skin cells. When ceramide levels are depleted (by ageing, UV damage, harsh cleansers, over-exfoliation) the barrier breaks down — moisture escapes, irritants enter, and skin becomes dry, reactive, and prone to eczema.

Ceramide products replenish this lipid matrix directly.

Effective use: In moisturisers and barrier repair creams. Look for products containing ceramides alongside cholesterol and fatty acids — the natural ratio of these three components is approximately 3:1:1 and products that replicate this ratio repair the barrier most effectively.

Conflicts with: None. Ceramides are compatible with all other ingredients and are the base of any well-formulated moisturiser.

Best for: Dry skin, sensitive skin, skin with eczema or rosacea, any skin type recovering from over-exfoliation or retinol introduction. CeraVe and Vanicream use this technology at very accessible price points.`}, { title: "AHAs (Glycolic and Lactic Acid)", content:`What they do: Alpha-hydroxy acids are water-soluble chemical exfoliants that break the bonds between dead skin cells, accelerating their shedding from the surface. Unlike scrubs, they do not physically abrade the skin.

Glycolic acid: Smallest molecule, deepest penetration, most effective, most irritating. 5-10% is appropriate for at-home use.

Lactic acid: Larger molecule, gentler, also has humectant properties. Better for sensitive and dry skin. 5-12% at home.

Effective use: Apply after cleansing, before moisturiser, at night only (AHAs increase photosensitivity significantly — never skip SPF the following morning). Start with 1-2 times per week and increase based on tolerance.

Conflicts with: Retinol (do not use on the same night — alternate), BHAs (can combine at low concentrations, but use caution with sensitive skin), Vitamin C (can combine in a morning routine at low concentrations — watch for irritation).

Best for: Dull skin, uneven texture, hyperpigmentation, ageing skin. Not recommended for sensitive skin or active inflammatory acne.`}, { title: "Benzoyl Peroxide", content:`What it does: Kills Cutibacterium acnes bacteria directly (one of the four causes of acne). Available in concentrations from 2.5% to 10%. Critical finding from research: 2.5% is as effective as 10% at killing bacteria — but significantly less irritating and drying. There is no reason to use above 2.5%.

How to use: Spot treatment on active breakouts, or thin layer across acne-prone areas. Apply after toner, before moisturiser.

Important: Benzoyl peroxide bleaches fabric. Your pillow case, towels, and shirt collar will be permanently bleached. Use white linens or apply and let dry completely before contact with fabric.

Conflicts with: Retinol (deactivates it — use on different nights), Vitamin C (oxidises it — use on different nights), AHAs/BHAs (excessive irritation — alternate nights or use different areas).

Best for: Active inflammatory acne (papules and pustules). Does not address blackheads or non-inflammatory acne (use BHA for those).`}, { title: "SPF — The Only Non-Negotiable", content:`UV radiation is responsible for approximately 80% of visible skin ageing. It causes direct DNA damage, breaks down collagen, creates free radicals that damage cell membranes, and is the primary driver of hyperpigmentation. No anti-ageing product — not retinol, not peptides, not anything — produces results if you are not wearing SPF every morning.

SPF 30 blocks approximately 97% of UVB rays. SPF 50 blocks approximately 98%. The difference is marginal — consistent daily application of SPF 30 is significantly more protective than occasional application of SPF 50.

Mineral (physical) SPF: Contains zinc oxide or titanium dioxide. Sits on top of skin, reflects UV. Better for sensitive skin. Can leave white cast — improved formulations have largely eliminated this.

Chemical SPF: Absorbs UV and converts it to heat. More cosmetically elegant, no white cast. Some chemical filters cause irritation in sensitive skin. Avoid oxybenzone if you have sensitive or reactive skin.

Application: One full teaspoon for the face and neck. Most men apply too little. Re-apply every two hours in direct sun.

For men who “do not wear sunscreen”: if you drive to work, you are getting UV through the car window. If you sit near a window, you are getting UV. Incidental daily UV exposure accumulates over years. SPF is not optional.`
}
]
},

```
{
  id: "routines",
  title: "Building Your Routine — The Complete Protocol",
  intro: `The order of application matters as much as the products you use. The general rule is thinnest to thickest — applying a thick cream before a thin serum prevents the serum from penetrating. The correct order ensures each ingredient reaches the depth and surface it needs to be effective.`,
  subsections: [
    {
      title: "The Morning Routine",
      content: `Step 1 — Cleanser
```

Apply to damp skin, massage for 30-45 seconds, rinse with lukewarm water. Pat dry — never rub.
Skin type guide: Oily or acne-prone: gel cleanser with salicylic acid. Dry or sensitive: cream or milk cleanser, no SLS. Combination: balanced gel-cream cleanser.

Step 2 — Toner (optional but effective)
Apply to cotton pad or pat directly onto skin. Purpose: restore pH after cleansing, provide additional hydration, prep skin for serums.
Skip if: your cleanser is pH-balanced and your skin feels comfortable after washing.

Step 3 — Vitamin C Serum
Apply 4-5 drops, press into skin, allow to absorb for 60 seconds.
Why morning: Vitamin C is an antioxidant that neutralises UV-induced free radicals — it needs to be in place before sun exposure to be effective.

Step 4 — Treatment Serum (niacinamide, hyaluronic acid)
Apply after Vitamin C has absorbed. Niacinamide regulates oil and strengthens barrier throughout the day.

Step 5 — Moisturiser
Even oily skin needs moisturiser. Skipping it causes reactive sebum production. For oily skin use gel or fluid texture. For dry skin use cream. For combination, a lightweight lotion works for the whole face.

Step 6 — SPF (non-negotiable)
Apply last, generously. Wait 5 minutes before going outside. This is your morning routine’s most important step — everything before it protects your skin better if SPF is on top.

Total time: 3-5 minutes.`}, { title: "The Evening Routine", content:`Step 1 — Double Cleanse (if you wore SPF)
First cleanse: Oil cleanser or micellar water to remove SPF and sunscreen. SPF is specifically designed to resist washing off — a single cleanser often does not remove it fully.
Second cleanse: Your regular face wash to clean the skin itself.
If you did not wear SPF or makeup: single cleanse is sufficient.

Step 2 — Exfoliant (2-3 nights per week maximum)
AHA for texture and brightness. BHA for blocked pores and oiliness. Never both on the same night. Never with retinol on the same night.

Step 3 — Treatment (retinol or prescription retinoid)
Apply to completely dry skin — moisture increases penetration and can cause irritation. Start with a pea-sized amount for the entire face. Applying more does not increase effectiveness.
Wait 10-20 minutes after washing before applying if you are prone to irritation.

Step 4 — Niacinamide serum (on non-retinol nights)
On nights you use retinol, skip additional actives. Let retinol work alone.

Step 5 — Eye cream (optional)
The skin around the eyes is thinner than the rest of the face and has fewer sebaceous glands. If you use retinol on the face, do not apply it to the immediate eye area until you have built tolerance.

Step 6 — Moisturiser
Apply last. At night, slightly richer formulations are appropriate — your skin repairs itself during sleep and benefits from occlusion. For dry or compromised skin, add a facial oil before moisturiser.

Total time: 4-6 minutes.`}, { title: "The Starter Routine — For Men Starting From Nothing", content:`If you currently wash your face with body soap and apply nothing else, start here. Do not attempt the full routine immediately.

Week 1-4: Just three steps.
Morning: Gentle cleanser, moisturiser, SPF.
Evening: Gentle cleanser, moisturiser.

Week 5-8: Add one active.
Morning: Add niacinamide serum between cleanser and moisturiser.
This alone will produce visible improvement in oiliness and skin tone.

Week 9-12: Add the second active.
Evening (two nights per week): Add retinol.
Introduce slowly. Expect mild irritation and possibly temporary purging.

Week 13+: You have a complete, functional routine. Now optimise.

The instinct to buy everything at once and start an elaborate routine from day one almost always results in skin reactivity, inability to identify what is causing problems, and abandonment. Build slowly. Give each addition four weeks before assessing.`}, { title: "Seasonal Adjustments", content:`Your skin changes significantly with the seasons. A routine that works perfectly in summer may be insufficient in winter.

Winter adjustments:
Barrier function degrades in cold, dry conditions. Increase moisturiser richness. Add facial oil if skin feels tight. Reduce exfoliation frequency (once per week instead of twice). Switch from gel cleanser to cream cleanser if dryness is significant.

Summer adjustments:
Heat increases sebum production. Switch to lighter moisturiser and gel SPF. Consider adding BHA if summer brings more congestion. Vitamin C becomes more important — UV exposure is higher.

Post-flight:
Cabin air is at approximately 10-20% humidity (desert levels). Apply hyaluronic acid and a rich moisturiser before boarding and during a long flight. Drink more water. Avoid alcohol on the flight.

Tip: Do not dramatically change your routine with every seasonal shift. Make incremental adjustments — swap one product at a time and assess over two weeks.`
}
]
},

```
{
  id: "labels",
  title: "How to Read a Product Label",
  content: `Ingredients are listed in descending order of concentration — the first ingredient is present in the highest amount, the last in the smallest. Water (aqua) is almost always first.
```

Active ingredients: Listed by their International Nomenclature Cosmetic Ingredient (INCI) names. Key ones to know:
— Niacinamide (Vitamin B3)
— Retinol / Retinyl Palmitate / Retinaldehyde (Vitamin A derivatives)
— Ascorbic Acid / Ascorbyl Glucoside (Vitamin C)
— Salicylic Acid (BHA)
— Glycolic Acid / Lactic Acid (AHAs)
— Ceramide NP / Ceramide AP / Ceramide EOP (barrier lipids)
— Hyaluronic Acid / Sodium Hyaluronate (humectant)
— Zinc Oxide / Titanium Dioxide (mineral SPF)

Red flags on a label:
— Fragrance / Parfum: the single most common cause of contact dermatitis. Not necessary for any skincare function. Present entirely for marketing.
— Denatured Alcohol (Alcohol Denat.): in the first five ingredients, it indicates a drying formulation. Small amounts as a solvent are acceptable.
— PEG compounds in sensitive skin products: can penetrate compromised barriers.

Marketing language that means nothing:
“Dermatologist tested” — means one dermatologist looked at it. Not a clinical trial.
“Hypoallergenic” — not a regulated term. Means nothing.
“Natural” — not regulated. Poison ivy is natural.
“Clinical strength” — marketing copy, not a regulatory designation.
“Pore-minimising” — pores do not physically shrink. Products can make them appear smaller by keeping them clear.`
},

```
{
  id: "common-mistakes",
  title: "The Most Common Mistakes Men Make",
  content: `Washing the face with body soap or shower gel.
```

Body washes are formulated for a skin surface with far less sensitivity than the face. pH values are wrong, surfactants are too harsh, and the result is barrier disruption, reactive oiliness, and dryness. Use a face-specific cleanser.

Over-washing.
Washing your face more than twice daily strips the barrier and increases oil production. If your skin is oily by midday it is not because you have not washed — it is because your barrier is damaged and compensating.

Skipping moisturiser because skin is oily.
Oily skin needs hydration. Sebum is not the same as moisture. Skipping moisturiser on oily skin causes the skin to produce more sebum to compensate. Use a lightweight, non-comedogenic gel moisturiser.

Using too much of everything.
A pea-sized amount of retinol is the clinically appropriate dose for the entire face. Using more does not increase effectiveness — it increases irritation. The same applies to most actives.

Expecting results in one week.
Cell turnover takes 28 days. Most clinical trials measure results at 12 weeks. Give any new product a minimum of 6-8 weeks before assessing its effect. The one exception is moisturiser — you will feel a difference in 24-48 hours.

Introducing too many new products at once.
If you introduce five new products simultaneously and your skin reacts, you cannot identify the cause. Introduce one new product every four weeks.

Applying retinol to wet skin.
Moisture increases retinol penetration dramatically, increasing irritation. Apply retinol to dry skin — wait 10-20 minutes after washing and drying.

Not wearing SPF.
Every anti-ageing product you use is partially or completely undone by UV exposure without SPF. There is no rational argument for using retinol, Vitamin C, or niacinamide while skipping sunscreen.`
},

```
{
  id: "hyperpigmentation",
  title: "Hyperpigmentation and Dark Spots",
  content: `Hyperpigmentation — darkened patches of skin — is one of the most common and persistent skin concerns in men, particularly affecting men with deeper skin tones where the contrast between affected and unaffected skin is most visible.
```

Causes:
Post-inflammatory hyperpigmentation (PIH): the most common type. Occurs when skin inflammation (from acne, razor bumps, cuts, or any injury) triggers melanin production as part of the healing response. The inflammation resolves but the excess melanin remains. Very common in men with Fitzpatrick skin types IV-VI (brown and dark skin tones).

Sun-induced hyperpigmentation: UV exposure stimulates melanocytes to produce melanin unevenly, creating sunspots and age spots. Prevention (SPF) is dramatically more effective than treatment.

Treatment hierarchy:

1. SPF every morning — non-negotiable. UV exposure darkens existing hyperpigmentation and creates new spots.
1. Niacinamide (5%): inhibits melanin transfer from melanocytes to skin cells. Gradual improvement over 8-12 weeks.
1. Vitamin C (10-20%): inhibits melanin synthesis at the enzyme level. Use in the morning.
1. Alpha Arbutin (2%): inhibits tyrosinase, the enzyme required for melanin production. Evidence is strong.
1. Azelaic Acid (10-20%): effective for PIH, also treats acne. Prescription strength (20%) for significant hyperpigmentation.
1. Kojic Acid (1-2%): derived from fungi, inhibits tyrosinase. Effective but can cause irritation.

Timeline: Realistic improvement in PIH takes 3-6 months of consistent treatment. Products that claim to “fade dark spots in 7 days” are making unsubstantiated claims.`
},

```
{
  id: "when-to-see-derm",
  title: "When to See a Dermatologist",
  content: `Over-the-counter skincare handles the majority of common skin concerns in healthy adults. These situations require professional evaluation:
```

Acne that has not responded to 3 months of consistent over-the-counter treatment — particularly nodular or cystic acne (deep, painful, under-the-skin lumps). Waiting to see a dermatologist causes scarring that is far more difficult to treat than the acne itself.

Any mole or skin lesion that changes in size, shape, or colour, bleeds without injury, has irregular borders, or has multiple colours within it. The ABCDE rule: Asymmetry, Border irregularity, Colour variation, Diameter greater than 6mm, Evolution (change over time). Any of these warrants immediate evaluation.

Rosacea that is not controlled by gentle products. Prescription topicals (metronidazole, azelaic acid, ivermectin) and laser treatments are significantly more effective than anything available over the counter.

Persistent eczema or psoriasis. These are chronic inflammatory conditions with genetic components that benefit from targeted prescription treatments — topical corticosteroids for flares, calcineurin inhibitors for maintenance.

Sudden severe acne in adulthood with no previous history — this can indicate an underlying hormonal condition that warrants investigation.

Skin infections that are spreading, are accompanied by fever, or are not resolving with over-the-counter treatment.

SKINR provides general clinical guidance. It is not a substitute for professional medical evaluation.`
}
]
};

// – SHAVING GUIDE (inline) –
/**

- SKINR — The Men’s Shaving Guide
- src/guides/shavingGuide.js
- 
- Professional clinical reference guide.
- $9 product — also sold on Etsy as PDF.
- Displayed in-app after purchase. Emailed as PDF after PDF system is live.
  */

const SHAVING_GUIDE = {
title: “The Men’s Shaving Bible”,
subtitle: “Blade Science, Skin Biology, and Clinical Technique for a Shave That Does Not Damage Your Skin”,
version: “1.0”,
sections: [

```
{
  id: "intro",
  title: "Why Your Shave Is Failing",
  content: `Every man who shaves regularly is performing a surgical procedure on his face twice a week or more. A blade passes within microns of living skin, cutting through hair at the surface. Done correctly, it leaves the skin intact, smooth, and undamaged. Done incorrectly — which describes the majority of men who shave — it leaves behind microtrauma, barrier disruption, ingrown hairs, inflammation, and over time, permanent scarring.
```

The shaving industry spent decades telling men that more blades meant a better shave. This is marketing, not biology. The lift-and-cut mechanism of multi-blade cartridge razors is the primary mechanical cause of razor bumps and ingrown hairs — particularly in men with coarse or curly hair.

This guide covers the dermatological science of what happens to skin during shaving, why certain razors cause damage, how beard and hair type determines your ideal technique, and the exact pre-shave, shave, and post-shave protocol that prevents and treats the most common shaving problems.

Everything in this guide is based on clinical research published in peer-reviewed dermatology journals. The product recommendations throughout reflect evidence and independent assessment — no commercial partnerships.`
},

```
{
  id: "biology",
  title: "What Shaving Actually Does to Your Skin",
  subsections: [
    {
      title: "The Mechanics of the Cut",
      content: `A razor blade does not simply cut hair at the skin surface. At the microscopic level, the blade compresses and then cuts through the hair shaft. The compression phase — which happens before the cut — applies mechanical force to the follicle and the surrounding skin.
```

Multi-blade cartridges are designed around a mechanism called lift-and-cut: the first blade lifts the hair above the skin surface, the second (and subsequent) blades cut it below the skin line. This produces a closer shave in the short term. It also means the cut hair retracts beneath the skin surface immediately after cutting.

For men with straight hair, this is generally not a problem. For men with curly or coarse hair, the curl in the hair causes it to curl back toward the skin as it grows — and a hair that was cut below the skin surface and must now grow back up through two layers of skin has a significantly higher probability of growing sideways and becoming trapped. This is the biological mechanism behind pseudofolliculitis barbae (razor bumps).`}, { title: "Pseudofolliculitis Barbae — The Dermatological Facts", content:`Pseudofolliculitis barbae (PFB) is not a skin disease. It is a mechanical problem caused by the interaction between specific hair morphology and shaving technique.

Prevalence: PFB affects approximately 45-83% of Black men who shave regularly, making it the most common shaving-related condition in this demographic. It also affects a significant proportion of men with any type of coarse or curly facial hair, regardless of ethnicity.

The biology: Curly facial hair has an asymmetric distribution of a structural protein called cortex — more cortex on the inner curve of the curl than the outer. This asymmetry is what creates the curl. After shaving, as the hair begins to regrow, this asymmetry causes the hair to curve. If the cut end is below the skin surface, it curves back into the dermis rather than emerging through the follicle opening, causing a foreign body inflammatory reaction — the painful, papular “bump.”

Two mechanisms create the injury:
Transfollicular penetration: The cut hair tip, sharp from having been freshly cut, pierces back through the follicle wall as it curves. Creates a deep inflammatory papule.
Extrafollicular penetration: The hair grows out of the follicle but curves back and penetrates the skin surface adjacent to the follicle. Creates a raised, itchy bump at the skin surface.

Both are treated by the same protocol: reducing how deep the blade cuts (single blade rather than multi-blade lift-and-cut), shaving with the grain to reduce hair retraction below the skin, and chemical exfoliation to prevent the hair tip from being blocked at the skin surface.`}, { title: "The Acid Mantle and Shaving", content:`The skin’s natural pH is 4.5 to 5.5 — slightly acidic. Shaving disrupts this acid mantle through three mechanisms: the physical abrasion of the blade, the alkalinity of most traditional shaving soaps and creams, and the alcohol in most aftershaves.

When the acid mantle is disrupted:
— Antimicrobial protection is reduced (the acid environment inhibits bacterial growth)
— Enzyme activity that supports barrier repair is impaired
— The skin becomes temporarily more permeable to irritants
— Trans-epidermal water loss increases

Post-shave products that are alcohol-based (most traditional aftershaves) make this worse. The stinging sensation of alcohol on freshly shaved skin is not “refreshing.” It is your pain receptors responding to ethanol penetrating a compromised barrier.

Restoring pH after shaving — with a witch hazel toner (naturally slightly acidic), an aloe vera gel, or a ceramide-based balm — is the first step in post-shave recovery.`}, { title: "Folliculitis vs Razor Bumps — The Clinical Difference", content:`These two conditions look similar but have different causes and different treatments.

Pseudofolliculitis barbae (razor bumps): Mechanical. Caused by ingrown hairs as described above. Papules are firm, round, often with a visible hair inside or visible curved hair at the skin surface. Treatment: change shaving method, chemical exfoliation, topical retinoids.

Bacterial folliculitis: Infectious. Caused by Staphylococcus aureus colonising follicles that have been damaged by shaving. Papules are softer, more pustular (filled with pus), often clustered. Can spread. Treatment: topical or oral antibiotics, rigorous hygiene of shaving equipment.

Distinguishing them: Razor bumps tend to be in a clear pattern following the direction of hair growth and shaving strokes. Bacterial folliculitis is more randomly distributed and tends to spread.

If you are unsure which you have, see a dermatologist. Treating bacterial folliculitis with the wrong approach (exfoliation and no antibiotics) will worsen it.`
}
]
},

```
{
  id: "razors",
  title: "Razor Science — Every Type Explained",
  intro: `The single most impactful change most men with shaving problems can make is switching razor type. Understanding why requires understanding the mechanical differences between them.`,
  subsections: [
    {
      title: "Multi-Blade Cartridge Razors (2-5 blades)",
      content: `Examples: Gillette Fusion (5 blades), Mach3 (3 blades), Dollar Shave Club.
```

Mechanism: Lift-and-cut. First blade lifts hair, subsequent blades cut it progressively lower. Engineered for the closest possible shave with minimum passes.

Blade gap: Very small. Blades are packed closely together and recessed into the cartridge. Minimal exposure angle.

Who it works for: Men with straight, medium hair who do not experience razor bumps or significant irritation. The convenience and low technique requirement make them appropriate for men whose hair morphology does not predispose them to PFB.

Who should avoid them: Men with coarse or curly hair (particularly men with PFB or any history of razor bumps). The lift-and-cut mechanism is the primary mechanical cause of PFB.

Common problems: Cartridge clogging reduces blade efficiency rapidly — a clogged cartridge drags and increases microtrauma. Replace cartridges more frequently than feels economical (every 5-7 shaves). Rinsing under hot running water and shaking dry significantly extends effective life.`}, { title: "Safety / Double-Edge (DE) Razors", content:`Examples: Merkur 34C (mild), Merkur 38C (moderate), Henson AL13 (adjustable), Rockwell 6S (adjustable), Muhle R41 (aggressive).

Mechanism: Single blade, no lift-and-cut. The blade is exposed at an angle determined by the head geometry. You must maintain this angle actively during shaving (roughly 30 degrees from the face) — this is the technique requirement that makes safety razors less forgiving than cartridges but more effective for men with PFB.

Blade gap: Varies significantly between models and is the most important specification for matching razor to beard type. Mild blade gap (Merkur 34C): appropriate for fine to medium hair and sensitive or reactive skin. Moderate blade gap: most adult men. Aggressive blade gap (Muhle R41, Merkur 37C): coarse, dense beard — used only when mild razor has been mastered.

Blade types: The handle and head are reusable. The double-edge blade is replaceable and costs approximately $0.10 to $0.50 per blade. Feather blades (Japanese) are the sharpest and most aggressive. Astra (Indian) and Gillette Silver Blue are mid-range with excellent quality-to-cost ratio. Derby blades are mild. A sharper blade requires fewer passes and produces less microtrauma — provided technique is correct.

Who it works for: Men with PFB, men with medium to coarse hair, men who want precise technique control, men who want significantly lower long-term cost ($20-40 razor handle used for years; blades at a fraction of cartridge cost).

Technique requirement: Higher than cartridges. Requires 2-3 weeks of practice to develop consistent angle and pressure. The most common mistake is applying pressure — safety razors require the weight of the head only, no added pressure.`}, { title: "Electric Razors — Foil vs Rotary", content:`Foil shavers (Braun Series 9, Panasonic Arc series):
Mechanism: Oscillating blades move side to side beneath a thin metal foil with holes. Hair enters the holes and is cut by the oscillating blade beneath. The foil prevents direct blade contact with skin.

Who it works for: Men with active, moderate-to-severe PFB who need to continue shaving, men with very sensitive skin, men who need speed and convenience above closeness. The foil barrier means the blade never directly contacts skin — dramatically reducing irritation and lift-and-cut ingrown hair formation.

Limitation: Less close than wet shaving. Hair must be dry for optimal results. Initial cost is high ($150-350 for a quality unit).

Rotary shavers (Philips Norelco):
Mechanism: Three (or four) rotating circular cutting heads that spin against a guard. Particularly effective for longer stubble and for men who do not shave daily.

Who it works for: Men who maintain longer stubble rather than close-shaving, men who shave every 3-4 days. Less effective than foil for daily close shaving.

Important note for PFB sufferers: Even foil shavers can exacerbate PFB if used incorrectly. For men with severe PFB, allowing stubble to grow 1-2mm before shaving (rather than shaving against completely clean skin) reduces the probability of hair being cut below the skin line.`}, { title: "Straight Razors", content:`The highest skill ceiling. A single fixed blade with no guard — every parameter (angle, pressure, direction) is entirely manual. When done correctly, produces the closest possible shave with the least number of passes and minimal microtrauma. The technique requirement is significant — mastery takes months.

Not recommended as a starting point for men with PFB. The potential for error is high during the learning phase, and errors with a straight razor mean cuts and irritation during a period when the skin is most vulnerable.

For experienced shavers who have resolved their PFB and want to pursue the closest wet shave, a straight razor with proper instruction is a legitimate option.

Maintenance: Straight razors require stropping before every use (realigns the blade edge) and honing every 6-18 months depending on use frequency (removes metal to sharpen the edge). A poorly maintained straight razor is more damaging than a well-maintained cartridge.`}, { title: "OneBlade and Leaf Razors", content:`These occupy a middle ground: single-blade shaving with the convenience of a pivoting head (like a cartridge) and a blade replacement system.

OneBlade: Uses Feather FHS blades. The pivoting head reduces technique requirement versus a traditional DE razor while maintaining single-blade mechanics. Appropriate for men transitioning from cartridges who want to reduce PFB without a steep learning curve.

Leaf Razor: Takes standard DE blades but has a pivoting, cartridge-like head. Can be loaded with 1, 2, or 3 blade halves. Using a single blade provides DE-level results with significantly improved technique tolerance.

Both are valid transitional tools for men with PFB moving away from multi-blade cartridges.`
}
]
},

```
{
  id: "technique",
  title: "Clinical Shaving Technique — Phase by Phase",
  subsections: [
    {
      title: "Pre-Shave — The Preparation Your Skin Needs",
      content: `The purpose of pre-shave preparation is to:
```

1. Hydrate the hair shaft so it is softer and easier to cut (requires less blade force, reducing microtrauma)
1. Lift the hair away from the skin surface so the blade can cut it cleanly
1. Protect the skin surface during the blade pass

Step 1 — Warm water application (60-90 seconds minimum)
Run warm (not hot) water over the shaving area for at least 60 seconds. The goal is to hydrate the hair shaft — which absorbs water and swells, becoming significantly easier to cut. Studies show that fully hydrated facial hair requires approximately 70% less force to cut than dry hair. Less force required = less blade pressure = less microtrauma.

Shower before shaving, or apply a warm damp towel for 60-90 seconds. This step is the single most underrated part of shaving technique.

Step 2 — Pre-shave oil or treatment (for men with PFB or coarse hair)
Apply a thin layer of pre-shave oil or glycerine-based treatment before the shaving cream. This adds a lubrication layer between the blade and skin and helps hair stand away from the skin surface. Not necessary for all men — if you do not experience PFB or significant irritation, this step is optional.

Step 3 — Apply shaving cream, foam, or soap
Correct application: Work product into the hair with a brush or fingers to lift hairs away from skin and coat every hair shaft. The purpose is lubrication, not foam volume. Many aerosol shaving creams produce large volumes of foam with minimal lubrication — a proper glycerine-based cream or soap applied with a brush provides dramatically better protection.

Product hierarchy:
Best: Glycerine-based shaving cream applied with a brush (Taylor of Old Bond Street, Proraso, Cremo Cream)
Good: Quality canned shaving gel (not foam) with aloe or glycerine
Acceptable: Canned shaving foam
Inadequate: Soap bar, shower gel, or shampoo`}, { title: "The Shave — Blade Mechanics", content:`Direction: Always shave with the grain (in the direction the hair grows) on your first pass. The grain direction varies across the face — most commonly down on the cheeks, down on the upper lip, and down and inward on the neck. Map your own grain by running a finger across your stubble — the direction of least resistance is with the grain.

For men without PFB who want a closer shave: A second pass across the grain (perpendicular to hair growth) after a first with-grain pass is acceptable. Never against the grain for men with PFB or sensitive skin.

For men with PFB: With-grain only. Always. The additional closeness of across-grain or against-grain is not worth the mechanical damage for men predisposed to ingrown hairs.

Pressure: The blade should glide under its own weight. Do not apply downward pressure. This is the most common technique error and the primary cause of microtrauma. The handle weight provides sufficient force for an effective cut.

For safety razors: Maintain approximately 30 degrees between the blade and skin surface. The common error is holding the razor too flat (too close to the skin) or too steep (too far) — both change the effective blade gap and blade angle.

Passes: Fewer passes = less inflammation. One thorough, well-prepared pass is better than three hasty passes on under-prepared skin. A second pass should only be applied with fresh lather — never dragging a blade over bare, unlubricated skin.

Rinsing the blade: Rinse under running water every 2-3 strokes for multi-blade cartridges, every 1-2 strokes for DE razors. Clogged blades drag and tear rather than cut.`}, { title: "Post-Shave — The Recovery Protocol", content:`Post-shave care is not optional. Shaving reliably disrupts the skin barrier — the speed and quality of recovery determines whether you experience ongoing irritation, ingrown hairs, and dryness or whether your skin returns to baseline quickly.

Step 1 — Cold water rinse (30 seconds)
Rinse the shaved area with cold water. Cold causes vasoconstriction (narrowing of blood vessels), reducing post-shave redness and inflammation. It also closes follicle openings slightly, reducing the window during which bacteria can enter.

Avoid hot water post-shave — it increases inflammation and keeps pores open.

Step 2 — Pat dry
Pat the face dry with a clean towel — do not rub. A clean towel matters: a damp, previously-used towel harbours bacteria that can colonise freshly opened follicles. Consider a dedicated small face towel changed daily.

Step 3 — Witch hazel or alcohol-free toner (30 seconds)
Witch hazel is naturally slightly acidic and has mild anti-inflammatory and astringent properties. It begins restoring the skin’s acid mantle disrupted by shaving without the additional barrier damage of ethanol.

Apply to the shaved area on a cotton pad. Allow to dry completely before the next step.

Avoid: Alcohol-based aftershaves applied to freshly shaved skin. The stinging sensation is barrier damage, not efficacy.

Step 4 — Active treatment (for men with PFB or bumps)
For men with active razor bumps: Apply salicylic acid (2%) to the affected area. BHA penetrates the follicle and exfoliates inside — preventing hairs from becoming blocked at the skin surface.

For men with post-inflammatory hyperpigmentation from previous bumps: Apply azelaic acid (10-20%) — it simultaneously treats residual inflammation, prevents new PFB, and addresses pigmentation.

Step 5 — Post-shave balm or moisturiser
Apply a moisturiser specifically formulated for post-shave use — or any fragrance-free moisturiser that your skin tolerates. Key ingredients to look for: glycerine (humectant), aloe vera (soothing), ceramides (barrier repair), centella asiatica (anti-inflammatory).

Products to avoid as post-shave care: Traditional alcohol-based aftershave splash, fragranced balms (fragrance on compromised barrier causes sensitisation over time), heavy occlusive creams that block follicles on acne-prone skin.`
}
]
},

```
{
  id: "beard-types",
  title: "Technique by Beard Type",
  subsections: [
    {
      title: "Fine, Straight Hair",
      content: `Hair characteristics: Low cutting resistance, lies flat against skin, does not tend to curl back after cutting.
```

Razor recommendation: Most razors work. Mild to moderate safety razor, cartridge razor. No specific constraints.

Key considerations: Fine hair is easily cut but fine hair follicles can still be irritated by harsh technique. Primary concern is skin sensitivity rather than ingrown hairs. Focus on pre-shave preparation quality and fragrance-free post-shave products.

PFB risk: Low. The straight growth pattern makes transfollicular or extrafollicular penetration unlikely.`}, { title: "Medium Hair", content:`The most common category. Average cutting resistance, average density, slight curl potential in some individuals.

Razor recommendation: All razor types appropriate. Safety razor with mild-to-moderate blade gap provides the best balance of effectiveness and technique tolerance. Cartridge razors work well if PFB is not a concern.

Key considerations: Establish consistent grain-mapping so first passes always go with the grain. If across-grain passes are desired for closeness, ensure skin is well-prepared and lubricated for the second pass.

PFB risk: Low to moderate depending on the degree of curl. Monitor for early signs of ingrown hairs at the neck — this is the most common site.`}, { title: "Coarse, Straight Hair", content:`Hair characteristics: High cutting resistance. Dense and thick. Creates significant blade drag if hair is not well-hydrated.

Razor recommendation: Moderate to aggressive safety razor or straight razor. Multi-blade cartridges clog rapidly with dense hair and require frequent rinsing.

Key considerations: Pre-shave hydration is critical — coarse hair benefits most from the 70% force-reduction of hydrated versus dry cutting. Extend warm water preparation to 90-120 seconds. Blade sharpness matters more than for fine hair — a sharp DE blade requires less force.

PFB risk: Moderate. Coarse hair has more cutting resistance, increasing microtrauma if technique is imperfect. Focus on with-grain shaving and adequate lubrication.`}, { title: "Coarse, Curly Hair", content:`The highest-risk profile for PFB. Coarse hair combined with tight curl pattern means the hair, once cut below the skin surface by multi-blade lift-and-cut, has a high probability of curling back into the dermis.

Razor recommendation: Single-blade safety razor (mild blade gap) or electric foil razor. These are the only two razor types that do not use lift-and-cut mechanics. Multi-blade cartridges should be avoided until PFB is fully resolved.

Technique protocol (strict):
— Never shave against the grain
— Single pass with the grain only
— No second passes until skin has recovered from PFB
— Prep time: minimum 90 seconds warm water
— Apply pre-shave oil before shaving cream
— Use a glycerine-rich shaving cream applied with a brush
— Post-shave: salicylic acid toner, allow to dry, then gentle moisturiser

Additional consideration: Allow 48 hours between shaves during active PFB. Shaving over active inflammation damages the skin further and allows bacteria to penetrate inflamed follicles.

PFB risk: High. Requires the full protocol described throughout this guide.`}, { title: "Patchy Hair", content:`Characteristics: Uneven density across the face. Areas of dense growth alongside areas of sparse or absent growth.

Razor recommendation: Pivoting-head razors (cartridge or OneBlade) navigate uneven terrain better than fixed-head safety razors. If safety razor is preferred, a mild model with a pivoting head (several exist) is appropriate.

Key considerations: Different blade pressure is naturally applied to dense versus sparse areas during a single stroke — be mindful of applying more force in sparse areas where skin is less protected by hair. Light, consistent pressure throughout.

Common mistake: Attempting to achieve even stubble across both dense and sparse areas by shaving patchy areas multiple times. Accept the natural growth pattern or consult a barber for contouring.`
}
]
},

```
{
  id: "pfb-treatment",
  title: "Treating Active Razor Bumps — Clinical Protocol",
  content: `If you currently have active razor bumps, treatment comes before prevention. Continuing to shave over active PFB with the wrong technique perpetuates the cycle.
```

Phase 1 — Allow the skin to rest (3-7 days)
If possible, allow the beard to grow for 3-7 days without shaving. This allows active inflammation to subside and allows trapped hairs to grow out of the skin naturally. If you cannot avoid shaving for professional reasons, switch to an electric foil razor immediately and do not shave over active bumps.

Phase 2 — Release visible trapped hairs
Use a sterile needle or fine-tipped tweezers to gently lift (not pull) the curved hair end that is visible at the skin surface or just beneath a thin skin layer. Do not dig or squeeze. Release the tip only — do not remove the hair from the follicle. This releases the mechanical irritant without creating a wound.

Do not attempt to release hairs that are deep beneath the skin with no visible tip — this causes more damage than it resolves.

Phase 3 — Chemical exfoliation
Apply salicylic acid (2%) to affected areas once daily. This dissolves dead skin cells at the follicle opening, preventing new hairs from becoming blocked. Allow 2-3 minutes of contact before rinsing or following with other products.

For severe or scarring PFB: Azelaic acid (15-20%, prescription in most countries) treats inflammation, PFB, and post-inflammatory hyperpigmentation simultaneously. See a dermatologist for a prescription.

Phase 4 — Topical retinoid
Retinoids accelerate cell turnover, preventing dead cell accumulation at follicle openings. Start with a low-concentration retinol (0.025%) three nights per week after salicylic acid. This is the most effective long-term prevention for PFB in men who have resolved acute inflammation.

Timeline for improvement:
Week 1-2: Active inflammation begins to subside
Week 2-4: New bumps reduce in frequency with correct shaving technique
Month 2-3: Significant improvement in texture and reduction in PIH with consistent chemical exfoliation
Month 3-6: Full resolution possible with strict protocol adherence

When to see a dermatologist: Moderate to severe PFB that has not responded to 6-8 weeks of the above protocol, any PFB with spreading pustules (bacterial folliculitis), PFB with keloid scarring.`
},

```
{
  id: "products",
  title: "Products That Work — Ingredient-Led Recommendations",
  subsections: [
    {
      title: "Pre-Shave Products",
      content: `What you need: Glycerine content, emollient oils, no fragrance.
```

Budget tier:
— Hair conditioner applied to the beard before shaving (genuinely effective and underrated) — $5
— Simple glycerine available at pharmacies — $4

Mid-range tier:
— Cremo Original Shave Cream: glycerine-based, lubricates exceptionally well — $10
— Proraso Pre-Shave Cream (Green): eucalyptus and menthol, antimicrobial — $12

Premium tier:
— The Art of Shaving Pre-Shave Oil: squalane-based, excellent for coarse hair — $25
— Bulldog Sensitive Pre-Shave Face Scrub: mild exfoliation before shaving — $8

What to avoid: Anything with menthol as a primary ingredient (numbs skin, masking irritation signals), fragranced oils (sensitisation risk on pre-shave use).`}, { title: "Shaving Creams and Soaps", content:`The ideal shaving product is glycerine-rich, fragrance-free or lightly fragranced, and designed to be applied to wet hair.

Budget tier:
— Cremo Original Shave Cream: the best budget shaving cream available. Uses glycerine and silica to reduce blade friction dramatically — $12
— Nivea Men Sensitive Shave Cream: fragrance-free, effective — $8
— Alba Botanica Very Emollient Shave Cream: glycerine-based, fragrance-free — $9

Mid-range tier:
— Proraso Sensitive (white): oat protein and green tea, designed for sensitive skin — $14
— Proraso Green: eucalyptus and menthol (not for sensitive skin, excellent antimicrobial for normal skin) — $12
— Jack Black Supreme Cream Shave: outstanding lubrication, Macadamia oil base — $22
— Baxter of California Shave Cream: glycerine-based, sophisticated formula — $20

Premium tier:
— Taylor of Old Bond Street Sandalwood or Avocado: traditional British formulation, exceptional brush performance — $18-22
— Castle Forbes Lavender: outstanding barrier protection, suitable for PFB — $35

Avoid: Aerosol shaving foam (low glycerine content, produces volume not lubrication), products with alcohol high in the ingredient list.`}, { title: "Post-Shave Treatment", content:`The first priority after shaving is barrier repair. The second is anti-inflammatory treatment.

Budget tier (excellent value):
— Witch Hazel (unscented): Thayers Alcohol-Free Witch Hazel Rose Water Toner — first application post-shave, restores pH — $12
— CeraVe Moisturizing Cream: ceramide-based barrier repair, applies to face and neck post-shave — $18
— The Ordinary Niacinamide 10%: applied after witch hazel for ongoing sebum regulation — $7

Mid-range tier:
— Paula’s Choice Calm Nourishing Cleanser: also works as a post-shave rinse on sensitive skin — $22
— First Aid Beauty Ultra Repair Cream: intensive barrier repair for men who experience significant post-shave dryness — $28

For men with PFB (essential):
— Stridex Maximum Strength Pads (salicylic acid 2%): applied immediately post-shave to follicle openings — $10
— Tend Skin Solution: contains salicylic acid and isopropyl alcohol — highly effective for PFB, slightly irritating due to alcohol — use sparingly — $16
— Bump Patrol Aftershave Treatment: fragrance-free, salicylic acid, designed specifically for PFB — $13
— PFB Vanish + Chromabright: treats both active bumps and PIH — $28

Premium tier:
— Kiehl’s Facial Fuel Energizing Moisture Treatment: lightweight, appropriate for all skin types post-shave — $34
— Anthony Ingrown Hair Treatment: high-concentration glycolic acid plus salicylic acid for persistent PFB — $26

What to avoid: Alcohol-based aftershave splash (Old Spice, Brut) on sensitive skin. Fine for men without PFB or sensitivity but directly harmful for those who have either.`}, { title: "Blades — The Most Important and Most Neglected Variable", content:`Most men use the same blade for far too long. A blade that requires more force to cut is causing more microtrauma on every stroke. The cost of replacing blades more frequently is trivially small compared to the skin damage of using dull blades.

Cartridge replacement guideline: Every 5-7 shaves for multi-blade cartridges. Rinse and shake dry after each use. Store outside the shower — constant humidity accelerates corrosion.

DE blade recommendations by beard type:
Fine hair: Feather Hi-Stainless (sharpest, most aggressive — appropriate for fine hair that offers low resistance) — $25 per 100 blades
Medium hair: Astra Superior Platinum or Gillette Silver Blue — excellent quality and consistency — $12-15 per 100 blades
Coarse, dense hair: Feather or Polsilver Super Iridium — handle the higher cutting resistance — $20-25 per 100 blades
Sensitive skin / PFB: Derby Extra or Shark Super Stainless — milder edge, less aggressive for skin in recovery — $10-12 per 100 blades

The one rule: Replace DE blades every 3-5 shaves. At $0.15 per blade, using each blade for 5 shaves costs approximately $11 per year. The cost of dull-blade microtrauma on skin — in ongoing inflammation, PIH, scarring — is immeasurably higher.

Blade break-in: New DE blades are occasionally too sharp for their first shave — the edge is at its absolute sharpest and some men find the second shave with a given blade is smoother than the first. This varies by blade brand and individual skin type.`
}
]
},

```
{
  id: "electric",
  title: "Electric Shaver Optimisation",
  content: `Electric shavers require a different technique than wet shaving. The most common error is applying pressure — electric shavers should glide on the skin surface, not press into it. Pressing causes the foil or rotary guards to compress against skin, allowing blades to contact skin more directly and increasing irritation.
```

For foil shavers: Use straight, overlapping strokes rather than circular motions. Stretch the skin slightly with the non-dominant hand to create a flat surface. For the neck, tilt the head back to stretch skin. Shave against the grain — this is appropriate for foil shavers because the foil guard prevents direct blade contact with skin.

For rotary shavers: Circular motions are designed into the product. Overlap passes to ensure even coverage.

Pre-shave for electric: Dry shaving requires a clean, dry beard — moisture causes the foil to slip over hair rather than capturing it. Electric pre-shave lotions (Lectric Shave, Proraso) reduce skin friction and slightly dry the hair for better capture.

Wet electric shaving: Most modern foil shavers are waterproof and can be used with shaving cream in the shower. This combines electric shaving’s reduced skin contact with wet shaving’s hydration benefits. Appropriate for men with sensitive skin or mild PFB who cannot achieve acceptable results with dry electric shaving alone.

Maintenance: Clean the shaving head after every use. Replace foils and blades every 12-18 months — a degraded foil is perforated in patterns that can catch and pull rather than cut hairs. The replacement cost ($30-60 per head) is part of the true cost of electric shaving.`
},

```
{
  id: "when-to-see-derm",
  title: "When to See a Dermatologist",
  content: `Shaving-related conditions that require professional evaluation:
```

Moderate to severe PFB that has not responded to 6-8 weeks of the protocol in this guide. Prescription options — topical retinoids, topical antibiotics, prescription-strength azelaic acid — are significantly more effective than over-the-counter alternatives.

Keloid scarring from chronic PFB. Keloids are overgrown scar tissue that extends beyond the original wound site. They require targeted treatment — corticosteroid injections, laser therapy, or surgical excision — and cannot be resolved with skincare products.

Bacterial folliculitis that is spreading, recurring, or not responding to topical treatment. Oral antibiotics may be required.

Any follicular condition accompanied by fever, rapidly spreading redness, or systemic symptoms. This may indicate a deeper skin infection (cellulitis) requiring urgent medical treatment.

Suspected hidradenitis suppurativa (HS): A condition characterised by recurring, painful abscesses in the beard area, armpits, and groin. Often misdiagnosed as severe folliculitis. Requires dermatological management.

Persistent hyperpigmentation from healed PFB that has not improved after 6 months of consistent treatment with niacinamide, Vitamin C, and azelaic acid. Prescription-strength hydroquinone or advanced laser procedures may be appropriate.

SKINR provides general clinical guidance. Anything that concerns you, worsens, or does not respond to the protocols in this guide should be evaluated by a board-certified dermatologist.`
}
]
};

// – GA4 EVENT TRACKING —————————————————––
const track = (eventName, params = {}) => {
try { if(window.gtag) window.gtag(“event”, eventName, params); } catch(_) {}
};

// //==========================================================================
// //  SKINR v3 – EDITABLE CONFIGURATION                                       //
// //  Edit this section freely. Do not edit below the closing === line.       //
// //==========================================================================
const CONFIG = {
business: {
domain:            “https://www.getskinr.com”,
affiliateTag:      “skinr07-20”,
amazonBase:        “https://www.amazon.com”,
formspree:         “261158684435060”,
twitterHandle:     “@getskinr”,
// – SKIN ANALYSIS REPORTS –––––––––––––––––––
stripeBiologyPriceId:      “price_1TRbMlCi5YWsRAVAIq1CPgvG”,
stripeRoutinePriceId:      “price_1TRbOsCi5YWsRAVAH72I6TS1”,
stripeSkinComboPriceId:    “price_1TRbQgCi5YWsRAVAFDHlX0LM”,
biologyReportPrice:        15,
routineCardPrice:          12,
skinComboPrice:            22,
// – SHAVE PROTOCOL REPORTS ———————————––
stripeShaveBiologyPriceId: “price_1TRf10Ci5YWsRAVARhNuKC4u”,
stripeShaveCardPriceId:    “price_1TRf3hCi5YWsRAVA4oNz5i34”,
stripeShaveComboPriceId:   “price_1TRf5hCi5YWsRAVAmZpTERl9”,
shaveBiologyPrice:         15,
shaveCardPrice:            12,
shaveComboPrice:           22,
// – GUIDES ––––––––––––––––––––––––––
stripeSkincareGuidePriceId:“price_1TRfOLCi5YWsRAVAezkOgVmT”,
stripeShavingGuidePriceId: “price_1TRfPyCi5YWsRAVAwIFSPFyN”,
stripeGuidesComboPriceId:  “price_1TRfRMCi5YWsRAVA3sIcGC6I”,
skincareGuidePrice:        9,
shavingGuidePrice:         9,
guideComboPrice:           15,
},
// Skincare brands by budget tier
skinBrandsByTier: {
budget:  [“The Ordinary”,“CeraVe”,“Neutrogena”,“Vanicream”,“Differin”],
mid:     [“La Roche-Posay”,“Paula’s Choice”,“EltaMD”,“First Aid Beauty”,“Cetaphil”],
premium: [“Kiehl’s”,“Clinique for Men”,“Peter Thomas Roth”,“Murad”,“Vichy”],
luxury:  [“SkinCeuticals”,“Drunk Elephant”,“Sunday Riley”,“Augustinus Bader”,“Tom Ford Beauty”],
},
// Shaving product brands by budget tier
shaveBrandsByTier: {
budget:  [“Cremo”,“Nivea Men”,“Barbasol”,“Dollar Shave Club”,“Gillette”,“Edge”],
mid:     [“Proraso”,“Art of Shaving”,“Kiehl’s Men”,“Jack Black”,“Baxter of California”,“Anthony”],
premium: [“Taylor of Old Bond Street”,“D.R. Harris”,“Penhaligon’s”,“Truefitt & Hill”,“Castle Forbes”],
luxury:  [“Geo. F. Trumper”,“Czech & Speake”,“Acqua di Parma”,“Floris”,“St. James of London”],
},
// Razor recommendations by skin profile – the AI uses these as a reference
bladeScience: {
cartridge_bumps:  “Multi-blade cartridges use a lift-and-cut mechanism that severs hair below the skin surface, dramatically increasing pseudofolliculitis barbae risk. Clinical recommendation: transition to single-blade immediately.”,
safety_mild:      “The Merkur 34C and Edwin Jagger DE89 have blade gaps of approximately 0.68mm – classified as mild/medium aggressive. Ideal for sensitive or reactive skin beginning safety razor use.”,
safety_standard:  “The Parker 99R and Muhle R89 offer standard aggression with excellent blade exposure. Suitable for most skin types once technique is established.”,
foil_electric:    “Foil electric shavers (Braun Series 9, Panasonic Arc5) use a thin foil membrane that prevents blade-to-skin contact, making them the least irritating electric option for sensitive skin.”,
rotary_electric:  “Rotary shavers (Philips Norelco 9000 series) use circular cutting heads suited for longer, coarser stubble but can pull finer or curly hair, increasing irritation risk.”,
oneblade:         “The Philips OneBlade and Leaf Razor use a single-blade pivoting head – the only cartridge-style razor that does not use multi-blade lift-and-cut, making it suitable for bump-prone skin.”,
},
};

// //==========================================================================
// //  DO NOT EDIT BELOW THIS LINE                                              //
// //==========================================================================

// – STORAGE – localStorage (production-safe) ––––––––––––––––
const LS = {
get: (key)       => { try { const v=localStorage.getItem(key); return v?JSON.parse(v):null; } catch(*){ return null; } },
set: (key, val)  => { try { localStorage.setItem(key, JSON.stringify(val)); } catch(*){} },
del: (key)       => { try { localStorage.removeItem(key); } catch(_){} },
};
const SK = {
profile:“skinr2:profile”, checkins:“skinr2:checkins”,
lang:“skinr2:lang”, shave:“skinr2:shave”, email:“skinr2:email”,
chat:“skinr2:chat”,
};

// – API – calls Netlify Function proxy (key never in browser) —————
// – GUIDE READER COMPONENT ––––––––––––––––––––––––––
const GuideReader = ({ guide, lang }) => {
const [openSection, setOpenSection] = useState(null);
if (!guide) return null;
return (
<div style={{marginTop:20}}>
<div style={{borderBottom:“1px solid var(–goldb)”,paddingBottom:20,marginBottom:24}}>
<div style={{fontFamily:“var(–fm)”,fontSize:8,letterSpacing:4,color:“var(–gold)”,textTransform:“uppercase”,marginBottom:8}}>SKINR Clinical Guide</div>
<div style={{fontFamily:“var(–fh)”,fontSize:22,fontWeight:700,fontStyle:“italic”,color:“var(–white)”,marginBottom:8}}>{guide.title}</div>
<div style={{fontFamily:“var(–fc)”,fontSize:14,color:“var(–soft)”,fontStyle:“italic”,lineHeight:1.7}}>{guide.subtitle}</div>
</div>
{guide.sections.map((section,si)=>(
<div key={section.id} style={{marginBottom:2,background:“var(–card)”,border:“1px solid var(–border)”}}>
<button onClick={()=>setOpenSection(openSection===section.id?null:section.id)}
style={{width:“100%”,background:“none”,border:“none”,padding:“16px 18px”,
display:“flex”,justifyContent:“space-between”,alignItems:“center”,
cursor:“pointer”,textAlign:“left”,gap:12}}>
<div>
<div style={{fontFamily:“var(–fm)”,fontSize:8,letterSpacing:3,color:“var(–gold)”,textTransform:“uppercase”,marginBottom:3}}>Section {si+1}</div>
<div style={{fontFamily:“var(–fh)”,fontSize:16,fontWeight:700,fontStyle:“italic”,color:“var(–white)”}}>{section.title}</div>
</div>
<div style={{color:“var(–gold)”,fontSize:12,flexShrink:0,transform:openSection===section.id?“rotate(180deg)”:“none”,transition:“transform .2s”}}>v</div>
</button>
{openSection===section.id&&(
<div style={{padding:“0 18px 20px”}}>
{section.content&&<div style={{fontFamily:“var(–fc)”,fontSize:15,color:“var(–cream)”,lineHeight:1.9,fontStyle:“normal”,whiteSpace:“pre-line”,marginBottom:section.subsections?16:0}}>{section.content}</div>}
{section.intro&&<div style={{fontFamily:“var(–fc)”,fontSize:14,color:“var(–cream)”,lineHeight:1.85,fontStyle:“italic”,marginBottom:16,borderLeft:“2px solid var(–goldb)”,paddingLeft:12}}>{section.intro}</div>}
{section.subsections?.map((sub,ssi)=>(
<div key={ssi} style={{marginBottom:20,borderTop:ssi>0?“1px solid var(–border)”:“none”,paddingTop:ssi>0?20:0}}>
<div style={{fontFamily:“var(–fh)”,fontSize:15,fontWeight:700,fontStyle:“italic”,color:“var(–gold)”,marginBottom:10}}>{sub.title}</div>
<div style={{fontFamily:“var(–fc)”,fontSize:15,color:“var(–cream)”,lineHeight:1.9,fontStyle:“normal”,whiteSpace:“pre-line”}}>{sub.content}</div>
</div>
))}
</div>
)}
</div>
))}
<div style={{fontFamily:“var(–fc)”,fontSize:11,color:“var(–muted)”,fontStyle:“italic”,marginTop:16,textAlign:“center”,lineHeight:1.7}}>
{lang===“fr”?“Ce guide fournit des orientations cliniques générales. Consultez un dermatologue pour tout problème de santé cutanée.”:lang===“es”?“Esta guía proporciona orientación clínica general.”:“This guide provides general clinical guidance. Consult a dermatologist for any skin health concerns.”}
</div>
</div>
);
};

const callAI = async (messages, system=””, maxTokens=1500) => {
try {
const res = await fetch(”/.netlify/functions/claude”, {
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({ messages, system, maxTokens }),
});
if(!res.ok){
console.error(“callAI HTTP error:”, res.status, res.statusText);
return “”;
}
const data = await res.json();
const text = data.content?.map(c => c.text||””).join(””) || “”;
if(!text) console.error(“callAI: empty response”, JSON.stringify(data).slice(0,200));
return text;
} catch(err){
console.error(“callAI exception:”, err.message);
return “”;
}
};

const parseJSON = (raw) => {
try {
// Strip markdown code blocks – Haiku sometimes wraps JSON despite instructions
const cleaned = raw
.replace(/^`json\s*/i, '') .replace(/^`\s*/i, ‘’)
.replace(/```\s*$/i, ‘’)
.trim();
return JSON.parse(cleaned);
} catch(*){
// Try to find JSON object in the response
try {
const match = raw.match(/{[\s\S]*}/);
if(match) return JSON.parse(match[0]);
} catch(*){}
return null;
}
};

// – TRANSLATIONS ———————————————————––
// – LANGUAGE CONFIG ———————————————————–
const LANGUAGES = [
{ code:“en”, label:“English”,        native:“English”,  dir:“ltr” },
{ code:“fr”, label:“Quebec French”,  native:“Français”, dir:“ltr” },
{ code:“es”, label:“Spanish”,        native:“Español”,  dir:“ltr” },
];

// CAD conversion for Quebec users – shown alongside USD prices
const USD_TO_CAD = 1.36;
const showPrice = (usdStr, lang) => {
if (lang !== “fr” || !usdStr) return usdStr;
const m = usdStr.match(/$(\d+(?:.\d+)?)/);
if (!m) return usdStr;
const cad = Math.round(parseFloat(m[1]) * USD_TO_CAD);
return `${usdStr} (~$${cad} CAD)`;
};

// – BASE TRANSLATIONS (English) ———————————————–
// All other languages are generated from this via AI and cached in localStorage.
// To update any string: edit it here. On next visit in a non-English language,
// the AI will retranslate automatically.
const BASE_T = {
appName:“SKINR”,
badge:“Free. Clinical. Built for Men.”,
heroTitle:“Your Skin. Your Shave.”, heroTitle2:“Finally, Understood.”,
heroBody:“Most men have no idea what their skin actually needs. They grab whatever looks right, apply it in the wrong order, and wonder why nothing changes. SKINR ends that. Six honest questions. A clinical skin profile, a personalised morning and evening routine, and the exact products that work for your biology and your budget. No appointments. No guesswork. Sixty seconds.”,
pathTitle:“Two Problems. One Platform.”,
pathSub:“Clinical shaving science and personalised skincare – both free, both built for men.”,
skinCardTitle:“Skin Analysis”,
skinCardDesc:“Six questions. A clinical skin type profile. A personalised morning and evening routine with exact application instructions. Budget-matched product recommendations from leading brands – with the scientific reason behind every single one.”,
skinCardPills:[“6 Questions”,“Clinical Profile”,“Budget-Matched”,“Ingredient Science”],
skinCardBtn:“Analyse My Skin”,
shaveCardTitle:“Shaving Protocol”,
shaveCardDesc:“Seven questions – blade type, beard characteristics, active bumps, shaving frequency. The exact biological reason your shave is failing identified. A clinical three-phase protocol and budget-matched products to fix it permanently.”,
shaveCardPills:[“7 Questions”,“Blade Science”,“Prevention + Treatment”,“Clinical Protocol”],
shaveCardBtn:“Build My Protocol”,
back:”<- Back”, next:“Continue”, analyze:“Analyse My Skin”,
analyzing:“ANALYSING”,
loadSteps:[“Reading your profile…”,“Analysing skin chemistry…”,“Matching products to your budget…”,“Checking ingredient compatibility…”,“Finalising your protocol…”],
q_feel:“One hour after washing – no products – how does your face feel?”,
q_breakouts:“How frequently do you experience breakouts?”,
q_sensitivity:“How does your skin respond to new products or shaving?”,
q_age:“What is your age range?”,
q_concern:“What is your primary skin concern?”,
q_budget:“What is your monthly skincare budget?”,
opts_feel:[“Tight, dry, possibly flaking”,“Comfortable and balanced”,“Visibly oily across the entire face”,“Oily T-zone, dry cheeks”],
opts_breakouts:[“Rarely, if ever”,“Once or twice monthly”,“Several times per week”,“Persistently – always present”],
opts_sensitivity:[“No reaction. Highly resilient.”,“Occasional mild redness”,“Frequent irritation or stinging”,“Near-constant reactivity or rosacea”],
opts_age:[“Under 25”,“25 – 35”,“36 – 50”,“50+”],
opts_concern:[“Dryness and rough texture”,“Excess oil and shine”,“Acne and breakouts”,“Ageing – lines and dullness”,“Redness and irritation”,“Hyperpigmentation and dark spots”],
opts_budget:[“Budget – Under $35”,“Mid-Range – $35–$80”,“Premium – $80–$150”,“Luxury – $150+”],
quizHints:[
“Be precise. No one is watching.”,
“Any breakout – pimples, cysts, whiteheads, blackheads.”,
“Redness, burning, stinging, or itching after application.”,
“Skin needs change significantly by decade.”,
“Select the concern that bothers you most right now.”,
“This determines which brands and products we recommend.”,
],
analysisComplete:“Analysis Complete”,
yourProtocol:“Your Daily Protocol”,
morning:“Morning”, evening:“Evening”,
whyThisWorks:“Why these products work together ->”,
hideScience:“Close ^”,
findProduct:“Find on Amazon >”,
findSephora:“Find on Sephora >”,
ingredientWarning:“Ingredient Conflict Warning”,
emailTitle:“Get Your Protocol as a PDF”,
emailDesc:“We will email you your complete morning and evening routine, your product list with direct links, and weekly skin tips. One email. No spam.”,
emailBtn:“Send My Protocol”,
emailSkip:“No thanks”,
emailSuccess:“Check your inbox – your protocol is on its way.”,
emailPlaceholder:“your@email.com”,
coachTitle:“Ask the Coach Anything.”,
coachSub:“Your AI coach has reviewed your full profile and budget. Ask about products, ingredients, timing, or anything your protocol does not cover.”,
coachOnline:“Coach Available”,
suggestions:[“Why am I still breaking out?”,“Can I add retinol to my routine?”,“What order do I apply my products?”,“How long until I see real results?”,“Is my routine right for summer?”],
youLabel:“You”, coachLabel:“Coach”,
inputPlaceholder:“Ask anything about your skin or protocol…”,
checkinTitle:“How Is the Protocol Working?”,
checkinSub:“A 30-second check-in refines your protocol based on real results. The AI adapts its advice to what your skin is actually telling you.”,
todayStatus:“Current Status”,
submitCheckin:“Submit Check-In”,
submitting:“Processing…”,
progressHistory:“Progress Log”,
noHistory:“Your progress log will appear after your first check-in.”,
moods:[
{v:“excellent”,emoji:”*”,label:“Excellent”,    desc:“Skin is clear, hydrated, performing well”},
{v:“improving”,emoji:”^”,label:“Improving”,    desc:“Visible positive changes this week”},
{v:“stable”,   emoji:”-”,label:“Stable”,       desc:“No change – neither better nor worse”},
{v:“worse”,    emoji:“v”,label:“Declining”,    desc:“Something is irritating or breaking out”},
],
shaveTitle:“Shaving Protocol”,
shaveSub:“A clinical 7-question analysis – blade type, beard characteristics, skin type, and active problems all analysed together. The most precise shaving tool ever built for men.”,
shaveQ1:“What is your current primary shaving method?”,
shaveOpts1:[{v:“cartridge”,label:“Cartridge Razor (2–5 blades)”},{v:“safety”,label:“Safety / Double-Edge Razor (single blade)”},{v:“electric_foil”,label:“Electric Foil Shaver (Braun, Panasonic)”},{v:“electric_rotary”,label:“Electric Rotary Shaver (Philips Norelco)”},{v:“straight”,label:“Straight Razor”},{v:“oneblade”,label:“OneBlade / Leaf Razor (single blade pivot)”},{v:“beard”,label:“I maintain a beard – no close shaving”}],
shaveQ2:“How would you describe your beard hair?”,
shaveOpts2:[{v:“fine_straight”,label:“Fine and straight – grows soft, little resistance”},{v:“medium”,label:“Medium – average thickness and density”},{v:“coarse_straight”,label:“Coarse and straight – thick, heavy stubble”},{v:“coarse_curly”,label:“Coarse and curly – tight curls, waves, or coils”},{v:“patchy”,label:“Patchy – uneven density across the face”}],
shaveQ3:“What is your primary shaving problem?”,
shaveOpts3:[{v:“bumps”,label:“Razor Bumps & Ingrown Hairs”},{v:“redness”,label:“Redness, Burning & Irritation”},{v:“dryness”,label:“Post-Shave Dryness & Tightness”},{v:“cuts”,label:“Frequent Nicks & Cuts”},{v:“none”,label:“No significant problems – just optimising”}],
shaveQ4:“Do you currently have active razor bumps on your face or neck?”,
shaveOpts4:[{v:“none”,label:“None – no current bumps”},{v:“mild”,label:“Mild – a few occasional bumps”},{v:“moderate”,label:“Moderate – several bumps, some inflamed”},{v:“severe”,label:“Severe – widespread, painful, or causing scarring”}],
shaveQ5:“What razor or blade are you currently using?”,
shaveOpts5:[{v:“gillette”,label:“Gillette Fusion, Mach3, or similar cartridge”},{v:“dollar_shave”,label:“Dollar Shave Club or subscription cartridge”},{v:“merkur”,label:“Merkur safety razor”},{v:“feather”,label:“Feather or Japanese safety razor”},{v:“braun”,label:“Braun electric shaver”},{v:“philips”,label:“Philips Norelco electric”},{v:“other”,label:“Different brand or not sure”},{v:“none_currently”,label:“Not currently shaving regularly”}],
shaveQ6:“How frequently do you shave?”,
shaveOpts6:[{v:“daily”,label:“Daily”},{v:“every_other”,label:“Every other day”},{v:“twice_week”,label:“Twice a week”},{v:“weekly”,label:“Once a week or less”}],
shaveQ7:“What is your monthly shaving budget?”,
shaveOpts7:[{v:“budget”,label:“Budget – Under $20/month”},{v:“mid”,label:“Mid-Range – $20–$50/month”},{v:“premium”,label:“Premium – $50–$100/month”},{v:“luxury”,label:“Luxury – $100+/month”}],
analyzeShave:“Generate My Clinical Protocol”,
shaveAnalyzing:“Analysing your shave profile…”,
shaveResult:“Your Clinical Shaving Protocol”,
bladeSection:“Blade & Razor Recommendation”,
preShave:“Pre-Shave Preparation”,
duringShave:“The Shave”,
postShave:“Post-Shave Treatment”,
preventionProducts:“Prevention Products”,
treatmentProducts:“Active Bump Treatment”,
shaveCritical:“Clinical Finding”,
medDisclaimer:“This protocol provides general clinical guidance. Pseudofolliculitis barbae (razor bumps), persistent irritation, or suspected skin conditions should be evaluated by a board-certified dermatologist. This is not a substitute for professional medical advice.”,
optionalTitle:“Unlock Your Complete Analysis”,
optionalSub:“Two optional reports generated specifically from your results. Not generic guides – built from your exact profile.”,
biologyTitle:“Know Your Skin Biology”,
biologyDesc:“The complete cellular explanation of why your skin behaves exactly the way it does. The biological mechanism of every ingredient in your protocol. Your long-term skin trajectory and what happens at the dermal level when you follow – or ignore – the protocol.”,
routineCardTitle:“Personalized Daily Routine Card”,
routineCardDesc:“Your exact products, in your exact order, with your exact application instructions – formatted as a print-ready card for your bathroom wall. Generated from your specific analysis.”,
comboTitle:“Both Reports – Best Value”,
unlockBtn:“Unlock – $10”,
comboBtn:“Get Both – $15”,
alreadyUnlocked:”* Reports Unlocked”,
nav:{home:“Home”,analysis:“Analysis”,coach:“Coach”,checkin:“Progress”,shave:“Shave”,guides:“Guides”,community:“Community”},
// Community
communityTitle:“The SKINR Community”,
communitySub:“Real men. Real results. Real skin types. Share your progress and read what is actually working for men with your exact profile.”,
communityPost:“Share My Progress”,
communityFeed:“Progress Feed”,
communityEmpty:“No updates yet. Be the first to share your progress.”,
communityShareTitle:“Share Your Update”,
communityShareSub:“Anonymous by default. Your skin type and update are visible – your name is not.”,
communitySharePlaceholder:“What has changed since you started your protocol? What is working? What are you struggling with?”,
communityShareBtn:“Post My Update”,
communityCancel:“Cancel”,
communityPosted:“Your update has been shared.”,
communityLike:”* Helpful”,
skinTypeLabel:“Skin Type”,
weekLabel:“Week”,
discordTitle:“Join the Conversation”,
discordSub:“For real-time discussion, questions, and before/after sharing – join the SKINR Discord community.”,
discordBtn:“Join SKINR Discord”,
guidesTitle:“The SKINR Guides”,
guidesSub:“The complete written reference for everything the quiz covers – and everything it cannot fit in 60 seconds.”,
skincareGuideTitle:“The No-BS Men’s Skincare Guide”,
skincareGuideDesc:“Your skin type protocol in full. Product scorecards. Ingredient conflict cheat sheet. Seasonal adjustments. Printable routine cards.”,
shavingGuideTitle:“The Shaving Bible”,
shavingGuideDesc:“The complete clinical guide to a perfect shave. Blade mechanics and selection science. Pre-shave protocol. Post-shave treatment for every skin and beard type.”,
guidePrice:”$9 USD”,
guideBuyBtn:“Get the Guide”,
guideComingSoon:“Coming Soon”,
welcomeBack:“Good to Have You Back.”,
continueJourney:“Your protocol is waiting.”,
lastAnalyzed:“Last analysed”,
viewProtocol:“View Protocol”,
consultCoach:“Consult Coach”,
newAnalysis:“New Analysis”,
newShave:“New Shave Analysis”,
disclaimer:“Amazon affiliate links support this free service at no extra cost to you. All recommendations are based solely on your skin profile and budget.”,
of:”/”,
translating:“Setting up your language…”,
// Founder story – translatable
storyLabel:“The Story Behind SKINR”,
storyTitle:“Why I Built This”,
storyP1:“As a man who shaves every day, I had no idea what my blade was actually doing to my skin. Every morning – the same routine, the same razor, the same result. Razor bumps. Redness. Irritation that stayed for days. I went to barbers who made it worse. I changed products constantly – one after another, hoping something would work, never understanding why nothing did.”,
storyP2:“The answer, it turned out, was not in a better product. It was in understanding my skin. Once I learned my skin type, why my specific blade was causing bumps, which ingredients actually work for my biology, and how to build a routine in the right order – everything changed. Fewer bumps. Less redness. Better skin. And for the first time, genuine confidence about how I looked.”,
storyP3:“That is why SKINR exists. A single platform where every man – regardless of age, skin type, or budget – can understand his skin biology, make informed decisions about what goes on his face, and build a routine that actually works. Not someone else’s routine. His.”,
missionLabel:“Our Mission”,
missionText:“To be the one-stop platform where every man discovers his skin biology, makes the right decisions, and takes care of his skin – at every age.”,
copyright:“All rights reserved.”,
skinScore:“Skin Score”,
consistencyRating:“Consistency Rating”,
weekOneLabel:“Week One Protocol”,
expectedTimeline:“Expected Timeline”,
whenDermatologist:“When to See a Dermatologist”,
criticalRuleLabel:“Critical Rule”,
clinicalAssessmentLabel:“Clinical Assessment”,
techniqueLabel:“Technique”,
transitionLabel:“Transition Note”,
recommendedBladesLabel:“Recommended Blades”,
avoidLabel:“Avoid”,
expertInsight:“Expert Insight”,
keyIngredientLabel:“Key Ingredient”,
activeIngredientLabel:“Active Ingredient”,
treatmentProtocolLabel:“Treatment Protocol”,
treatmentBadge:“Treatment”,
medDisclaimerLabel:“Medical Disclaimer”,
loadingProtocol:“Loading full protocol…”,
stepLabel:“Step”,
generatingLabel:“Generating…”,
generateReport:“Generate Report”,
generateCard:“Generate Card”,
comingSoon:“Coming Soon”,
// Currency note for Quebec users
currencyNote:“Prices in USD. Approx. CAD shown.”,
};

// – STATIC TRANSLATIONS —————————————————––
// Pre-translated permanently – zero API calls, instant switching.
// FR = Quebec French (Canadian). ES = Latin American Spanish.
// To add a string: add to BASE_T, then add the translation in FR_T and ES_T.
// Only translates ~20 essential visible strings – small enough to complete
// reliably within Netlify function timeout. Quiz protocols are already
// generated in the user’s language by Claude so quiz options can stay in English.

const SUPPORTED_LANGS = [“en”, “fr”, “es”];

// – QUÉBEC FRENCH (fr) ––––––––––––––––––––––––––––
const FR_T = {
appName:“SKINR”,
badge:“Gratuit. Clinique. Fait pour les Hommes.”,
heroTitle:“Ta Peau. Ton Rasage.”, heroTitle2:“Enfin Compris.”,
heroBody:“La plupart des gars ont aucune idée de ce que leur peau a vraiment besoin. Ils prennent ce qui a l’air correct, l’appliquent dans le mauvais ordre, puis se demandent pourquoi rien change. SKINR règle ça. Six questions honnêtes. Un profil cutané clinique, une routine personnalisée matin et soir, et les produits exacts qui marchent pour ta biologie et ton budget. Sans rendez-vous. Sans devinettes. En soixante secondes.”,
pathTitle:“Deux Problèmes. Une Plateforme.”,
pathSub:“Science clinique du rasage et soins personnalisés – les deux gratuits, les deux faits pour les hommes.”,
skinCardTitle:“Analyse de Peau”,
skinCardDesc:“Six questions. Un profil cutané clinique. Une routine personnalisée matin et soir avec instructions précises. Recommandations de produits adaptées à ton budget – avec la raison scientifique derrière chacun.”,
skinCardPills:[“6 Questions”,“Profil Clinique”,“Adapté au Budget”,“Science des Ingrédients”],
skinCardBtn:“Analyser Ma Peau”,
shaveCardTitle:“Protocole de Rasage”,
shaveCardDesc:“Sept questions – type de lame, caractéristiques de la barbe, boutons actifs, fréquence de rasage. La raison biologique exacte de l’échec de ton rasage identifiée. Un protocole clinique en trois phases et des produits adaptés à ton budget pour corriger ça de façon permanente.”,
shaveCardPills:[“7 Questions”,“Science des Lames”,“Prévention + Traitement”,“Protocole Clinique”],
shaveCardBtn:“Construire Mon Protocole”,
back:”<- Retour”, next:“Continuer”, analyze:“Analyser Ma Peau”,
analyzing:“ANALYSE EN COURS”,
loadSteps:[“Lecture de ton profil…”,“Analyse de la chimie cutanée…”,“Correspondance produits-budget…”,“Vérification de la compatibilité…”,“Finalisation du protocole…”],
q_feel:“Une heure après le lavage – sans produits – comment ton visage se sent?”,
q_breakouts:“À quelle fréquence t’as des boutons?”,
q_sensitivity:“Comment ta peau réagit aux nouveaux produits ou au rasage?”,
q_age:“Dans quelle tranche d’âge t’es?”,
q_concern:“C’est quoi ta principale préoccupation cutanée?”,
q_budget:“C’est quoi ton budget mensuel pour les soins de la peau?”,
opts_feel:[“Tendue, sèche, qui squame peut-être”,“Confortable et équilibrée”,“Visiblement grasse sur tout le visage”,“Grasse en zone T, sèche sur les joues”],
opts_breakouts:[“Rarement, si jamais”,“Une ou deux fois par mois”,“Plusieurs fois par semaine”,“En permanence – toujours là”],
opts_sensitivity:[“Aucune réaction. Très résistante.”,“Légère rougeur occasionnelle”,“Irritation fréquente ou picotements”,“Réactivité quasi-constante ou rosacée”],
opts_age:[“Moins de 25”,“25 – 35”,“36 – 50”,“50+”],
opts_concern:[“Sécheresse et texture rugueuse”,“Excès de sébum et brillance”,“Acné et boutons”,“Vieillissement – rides et teint terne”,“Rougeurs et irritation”,“Hyperpigmentation et taches”],
opts_budget:[“Budget – Moins de 35 $”,“Milieu de gamme – 35 $–80 $”,“Premium – 80 $–150 $”,“Luxe – 150 $+”],
quizHints:[
“Sois précis. Personne te regarde.”,
“Tout bouton – papules, kystes, points blancs, points noirs.”,
“Rougeurs, brûlures, picotements ou démangeaisons après application.”,
“Les besoins cutanés changent significativement par décennie.”,
“Choisir la préoccupation qui te dérange le plus en ce moment.”,
“Ça détermine quelles marques et produits on recommande.”,
],
analysisComplete:“Analyse Terminée”,
yourProtocol:“Ton Protocole Quotidien”,
morning:“Routine du Matin”, evening:“Routine du Soir”,
whyThisWorks:“Pourquoi ces produits fonctionnent ensemble ->”,
hideScience:“Fermer ^”,
findProduct:“Trouver sur Amazon >”,
findSephora:“Trouver sur Sephora >”,
ingredientWarning:“Avertissement – Conflit d’Ingrédients”,
emailTitle:“Recevoir Ton Protocole en PDF”,
emailDesc:“On t’envoie ta routine complète matin et soir, ta liste de produits avec liens directs, et des conseils cutanés hebdomadaires. Un seul courriel. Zéro spam.”,
emailBtn:“Envoyer Mon Protocole”,
emailSkip:“Non merci”,
emailSuccess:“Vérifie tes courriels – ton protocole s’en vient.”,
emailPlaceholder:“ton@courriel.com”,
coachTitle:“Pose n’importe quelle question au Coach.”,
coachSub:“Ton coach IA a passé en revue ton profil complet et ton budget. Pose des questions sur les produits, les ingrédients, le timing, ou tout ce que le protocole couvre pas.”,
coachOnline:“Coach Disponible”,
suggestions:[“Pourquoi j’ai encore des boutons?”,“Peut-on ajouter du rétinol à ma routine?”,“Dans quel ordre j’applique mes produits?”,“Combien de temps avant de voir des vrais résultats?”,“Ma routine est-elle adaptée pour l’été?”],
youLabel:“Toi”, coachLabel:“Coach”,
inputPlaceholder:“Pose n’importe quelle question sur ta peau ou ton protocole…”,
checkinTitle:“Comment le Protocole Avance?”,
checkinSub:“Un suivi de 30 secondes affine ton protocole selon les vrais résultats. L’IA adapte ses conseils à ce que ta peau dit vraiment.”,
todayStatus:“Statut Actuel”,
submitCheckin:“Soumettre le Suivi”,
submitting:“Traitement…”,
progressHistory:“Journal de Progrès”,
noHistory:“Ton journal apparaîtra après ton premier suivi.”,
moods:[
{v:“excellent”,emoji:”*”,label:“Excellent”,    desc:“Peau claire, hydratée, performante”},
{v:“improving”,emoji:”^”,label:“En Amélioration”,desc:“Changements positifs visibles cette semaine”},
{v:“stable”,   emoji:”-”,label:“Stable”,       desc:“Pas de changement – ni mieux ni pire”},
{v:“worse”,    emoji:“v”,label:“En Déclin”,    desc:“Quelque chose irrite ou provoque des boutons”},
],
shaveTitle:“Protocole de Rasage”,
shaveSub:“Une analyse clinique en 7 questions – type de lame, caractéristiques de la barbe, type de peau, et problèmes actifs analysés ensemble. L’outil de rasage le plus précis jamais construit pour les hommes.”,
shaveQ1:“C’est quoi ta méthode de rasage principale en ce moment?”,
shaveOpts1:[{v:“cartridge”,label:“Rasoir cartouche (2–5 lames)”},{v:“safety”,label:“Rasoir de sûreté / double-tranchant (lame unique)”},{v:“electric_foil”,label:“Rasoir électrique à grille (Braun, Panasonic)”},{v:“electric_rotary”,label:“Rasoir électrique rotatif (Philips Norelco)”},{v:“straight”,label:“Rasoir droit”},{v:“oneblade”,label:“OneBlade / Leaf Razor (pivot lame unique)”},{v:“beard”,label:“J’entretiens une barbe – pas de rasage de près”}],
shaveQ2:“Comment tu décrirais ta barbe?”,
shaveOpts2:[{v:“fine_straight”,label:“Fine et droite – pousse douce, peu de résistance”},{v:“medium”,label:“Moyenne – épaisseur et densité normales”},{v:“coarse_straight”,label:“Épaisse et droite – chaume lourd et dense”},{v:“coarse_curly”,label:“Épaisse et bouclée – boucles serrées, vagues ou coils”},{v:“patchy”,label:“Inégale – densité variable sur le visage”}],
shaveQ3:“C’est quoi ton principal problème de rasage?”,
shaveOpts3:[{v:“bumps”,label:“Boutons de rasoir et poils incarnés”},{v:“redness”,label:“Rougeurs, brûlures et irritation”},{v:“dryness”,label:“Sécheresse et tiraillement post-rasage”},{v:“cuts”,label:“Coupures et entailles fréquentes”},{v:“none”,label:“Aucun problème majeur – juste optimiser”}],
shaveQ4:“T’as présentement des boutons de rasoir actifs sur le visage ou le cou?”,
shaveOpts4:[{v:“none”,label:“Aucun – pas de boutons en ce moment”},{v:“mild”,label:“Légers – quelques boutons occasionnels”},{v:“moderate”,label:“Modérés – plusieurs boutons, certains enflammés”},{v:“severe”,label:“Sévères – répandus, douloureux, ou causant des cicatrices”}],
shaveQ5:“Quel rasoir ou quelle lame t’utilises en ce moment?”,
shaveOpts5:[{v:“gillette”,label:“Gillette Fusion, Mach3, ou cartouche similaire”},{v:“dollar_shave”,label:“Dollar Shave Club ou abonnement cartouche”},{v:“merkur”,label:“Rasoir de sûreté Merkur”},{v:“feather”,label:“Lame Feather ou rasoir japonais”},{v:“braun”,label:“Rasoir électrique Braun”},{v:“philips”,label:“Rasoir électrique Philips Norelco”},{v:“other”,label:“Autre marque ou pas sûr”},{v:“none_currently”,label:“Je rase pas régulièrement en ce moment”}],
shaveQ6:“À quelle fréquence tu te rases?”,
shaveOpts6:[{v:“daily”,label:“Tous les jours”},{v:“every_other”,label:“Un jour sur deux”},{v:“twice_week”,label:“Deux fois par semaine”},{v:“weekly”,label:“Une fois par semaine ou moins”}],
shaveQ7:“C’est quoi ton budget mensuel pour le rasage?”,
shaveOpts7:[{v:“budget”,label:“Budget – Moins de 20 $/mois”},{v:“mid”,label:“Milieu de gamme – 20 $–50 $/mois”},{v:“premium”,label:“Premium – 50 $–100 $/mois”},{v:“luxury”,label:“Luxe – 100 $+/mois”}],
analyzeShave:“Générer Mon Protocole Clinique”,
shaveAnalyzing:“Analyse de ton profil de rasage…”,
shaveResult:“Ton Protocole de Rasage Clinique”,
bladeSection:“Recommandation de Lame et Rasoir”,
preShave:“Préparation Avant Rasage”,
duringShave:“Le Rasage”,
postShave:“Traitement Post-Rasage”,
preventionProducts:“Produits de Prévention”,
treatmentProducts:“Traitement des Boutons Actifs”,
shaveCritical:“Constat Clinique”,
medDisclaimer:“Ce protocole fournit des orientations cliniques générales. La pseudofolliculite de la barbe (boutons de rasoir), l’irritation persistante ou les affections cutanées suspectées devraient être évaluées par un dermatologue certifié. Ce n’est pas un substitut aux conseils médicaux professionnels.”,
optionalTitle:“Déverrouille Ton Analyse Complète”,
optionalSub:“Deux rapports optionnels générés spécifiquement à partir de tes résultats. Pas des guides génériques – construits à partir de ton profil exact.”,
biologyTitle:“Connais la Biologie de Ta Peau”,
biologyDesc:“L’explication cellulaire complète de pourquoi ta peau se comporte exactement comme elle le fait. Le mécanisme biologique de chaque ingrédient dans ton protocole. Ta trajectoire cutanée à long terme.”,
routineCardTitle:“Carte de Routine Quotidienne Personnalisée”,
routineCardDesc:“Tes produits exacts, dans ton ordre exact, avec tes instructions d’application exactes – formaté comme une carte prête à imprimer pour le mur de ta salle de bain.”,
comboTitle:“Les Deux Rapports – Meilleure Valeur”,
unlockBtn:“Déverrouiller – 10 $”,
comboBtn:“Obtenir les Deux – 15 $”,
alreadyUnlocked:”* Rapports Déverrouillés”,
nav:{home:“Accueil”,analysis:“Analyse”,coach:“Coach”,checkin:“Progrès”,shave:“Rasage”,guides:“Guides”,community:“Communauté”},
communityTitle:“La Communauté SKINR”,
communitySub:“De vrais gars. De vrais résultats. De vrais types de peau. Partagez vos progrès et lisez ce qui marche vraiment pour les hommes avec votre profil exact.”,
communityPost:“Partager Mes Progrès”,
communityFeed:“Fil des Progrès”,
communityEmpty:“Aucune mise à jour pour l’instant. Soyez le premier à partager vos progrès.”,
communityShareTitle:“Partager Votre Mise à Jour”,
communityShareSub:“Anonyme par défaut. Votre type de peau et mise à jour sont visibles – pas votre nom.”,
communitySharePlaceholder:“Qu’est-ce qui a changé depuis le début de votre protocole? Qu’est-ce qui marche? Qu’est-ce qui est difficile?”,
communityShareBtn:“Publier Ma Mise à Jour”,
communityCancel:“Annuler”,
communityPosted:“Ta mise à jour a été partagée.”,
communityLike:”* Utile”,
skinTypeLabel:“Type de Peau”,
weekLabel:“Semaine”,
discordTitle:“Rejoins la Conversation”,
discordSub:“Pour des discussions en temps réel, questions, et partage avant/après – rejoins la communauté Discord SKINR.”,
discordBtn:“Rejoindre SKINR Discord”,
guidesTitle:“Les Guides SKINR”,
guidesSub:“La référence écrite complète pour tout ce que le quiz couvre – et tout ce qu’il peut pas couvrir en 60 secondes.”,
skincareGuideTitle:“Le Guide de Soins Sans Bullshit pour Hommes”,
skincareGuideDesc:“Ton protocole cutané complet. Fiches de notation de produits. Antisèche des conflits d’ingrédients. Ajustements saisonniers. Cartes de routine imprimables.”,
shavingGuideTitle:“La Bible du Rasage”,
shavingGuideDesc:“Le guide clinique complet pour un rasage parfait. Mécanique des lames et science de sélection. Protocole pré-rasage. Traitement post-rasage pour chaque type de peau et de barbe.”,
guidePrice:“9 $ USD (~12 $ CAD)”,
guideBuyBtn:“Obtenir le Guide”,
guideComingSoon:“Bientôt Disponible”,
welcomeBack:“Content de te Revoir.”,
continueJourney:“Ton protocole t’attend.”,
lastAnalyzed:“Dernière analyse”,
viewProtocol:“Voir le Protocole”,
consultCoach:“Consulter le Coach”,
newAnalysis:“Nouvelle Analyse”,
newShave:“Nouvelle Analyse de Rasage”,
disclaimer:“Les liens affiliés Amazon soutiennent ce service gratuit sans coût supplémentaire pour toi. Toutes les recommandations sont basées uniquement sur ton profil cutané et ton budget.”,
of:”/”,
translating:“Configuration de ta langue…”,
storyLabel:“L’Histoire Derrière SKINR”,
storyTitle:“Pourquoi J’ai Créé Ça”,
storyP1:“En tant qu’gars qui se rase tous les jours, j’avais aucune idée de ce que ma lame faisait vraiment à ma peau. Chaque matin – la même routine, le même rasoir, le même résultat. Des boutons de rasoir. Des rougeurs. Une irritation qui durait des jours. J’allais chez des barbiers qui empiraient les choses. Je changeais de produits constamment – l’un après l’autre, en espérant que quelque chose marche, sans jamais comprendre pourquoi rien fonctionnait.”,
storyP2:“La réponse, il s’est avéré, était pas dans un meilleur produit. C’était dans la compréhension de ma peau. Une fois que j’ai appris mon type de peau, pourquoi ma lame spécifique causait des boutons, quels ingrédients marchent vraiment pour ma biologie, et comment construire une routine dans le bon ordre – tout a changé. Moins de boutons. Moins de rougeurs. Meilleure peau. Et pour la première fois, une vraie confiance en mon apparence.”,
storyP3:“C’est pourquoi SKINR existe. Une seule plateforme où chaque homme – peu importe son âge, son type de peau ou son budget – peut comprendre sa biologie cutanée, prendre les bonnes décisions sur ce qu’il met sur son visage, et construire une routine qui marche vraiment. Pas la routine de quelqu’un d’autre. La sienne.”,
missionLabel:“Notre Mission”,
missionText:“Être la plateforme unique où chaque homme découvre sa biologie cutanée, prend les bonnes décisions et prend soin de sa peau – à tout âge.”,
copyright:“Tous droits réservés.”,
skinScore:“Score de Peau”,
consistencyRating:“Indice de Régularité”,
weekOneLabel:“Protocole Semaine Un”,
expectedTimeline:“Chronologie Prévue”,
whenDermatologist:“Quand Consulter un Dermatologue”,
criticalRuleLabel:“Règle Critique”,
clinicalAssessmentLabel:“Évaluation Clinique”,
techniqueLabel:“Technique”,
transitionLabel:“Note de Transition”,
recommendedBladesLabel:“Lames Recommandées”,
avoidLabel:“À Éviter”,
expertInsight:“Conseil d’Expert”,
keyIngredientLabel:“Ingrédient Clé”,
activeIngredientLabel:“Ingrédient Actif”,
treatmentProtocolLabel:“Protocole de Traitement”,
treatmentBadge:“Traitement”,
medDisclaimerLabel:“Avis Médical”,
loadingProtocol:“Chargement du protocole complet…”,
stepLabel:“Étape”,
generatingLabel:“Génération…”,
generateReport:“Générer le Rapport”,
generateCard:“Générer la Carte”,
comingSoon:“Bientôt Disponible”,
currencyNote:“Prix en USD. Équivalent CAD affiché.”,
};

// – LATIN AMERICAN SPANISH (es) ———————————————–
const ES_T = {
appName:“SKINR”,
badge:“Gratis. Clínico. Hecho para Hombres.”,
heroTitle:“Tu Piel. Tu Afeitado.”, heroTitle2:“Por Fin, Comprendidos.”,
heroBody:“La mayoría de los hombres no tienen idea de lo que su piel realmente necesita. Agarran lo que parece correcto, lo aplican en el orden equivocado, y se preguntan por qué nada cambia. SKINR acaba con eso. Seis preguntas honestas. Un perfil clínico de piel, una rutina personalizada de mañana y noche, y los productos exactos que funcionan para tu biología y tu presupuesto. Sin citas. Sin adivinanzas. En sesenta segundos.”,
pathTitle:“Dos Problemas. Una Plataforma.”,
pathSub:“Ciencia clínica del afeitado y cuidado personalizado – ambos gratis, ambos hechos para hombres.”,
skinCardTitle:“Análisis de Piel”,
skinCardDesc:“Seis preguntas. Un perfil clínico de tipo de piel. Una rutina personalizada de mañana y noche con instrucciones precisas de aplicación. Recomendaciones de productos adaptadas a tu presupuesto – con la razón científica detrás de cada una.”,
skinCardPills:[“6 Preguntas”,“Perfil Clínico”,“Según Presupuesto”,“Ciencia de Ingredientes”],
skinCardBtn:“Analizar Mi Piel”,
shaveCardTitle:“Protocolo de Afeitado”,
shaveCardDesc:“Siete preguntas – tipo de hoja, características de la barba, granos activos, frecuencia de afeitado. La razón biológica exacta del fallo de tu afeitado identificada. Un protocolo clínico de tres fases y productos adaptados a tu presupuesto para corregirlo permanentemente.”,
shaveCardPills:[“7 Preguntas”,“Ciencia de Hojas”,“Prevención + Tratamiento”,“Protocolo Clínico”],
shaveCardBtn:“Crear Mi Protocolo”,
back:”<- Atrás”, next:“Continuar”, analyze:“Analizar Mi Piel”,
analyzing:“ANALIZANDO”,
loadSteps:[“Leyendo tu perfil…”,“Analizando la química cutánea…”,“Combinando productos con el presupuesto…”,“Verificando compatibilidad de ingredientes…”,“Finalizando tu protocolo…”],
q_feel:“Una hora después de lavarte – sin productos – ¿cómo se siente tu cara?”,
q_breakouts:”¿Con qué frecuencia tienes granos?”,
q_sensitivity:”¿Cómo responde tu piel a productos nuevos o al afeitado?”,
q_age:”¿Cuál es tu rango de edad?”,
q_concern:”¿Cuál es tu principal preocupación de piel?”,
q_budget:”¿Cuál es tu presupuesto mensual para el cuidado de la piel?”,
opts_feel:[“Tensa, seca, posiblemente descamando”,“Cómoda y equilibrada”,“Visiblemente grasa en toda la cara”,“Grasa en zona T, seca en mejillas”],
opts_breakouts:[“Raramente, si acaso”,“Una o dos veces al mes”,“Varias veces a la semana”,“Persistentemente – siempre presente”],
opts_sensitivity:[“Sin reacción. Muy resistente.”,“Leve rojez ocasional”,“Irritación frecuente o picazón”,“Reactividad casi constante o rosácea”],
opts_age:[“Menos de 25”,“25 – 35”,“36 – 50”,“50+”],
opts_concern:[“Sequedad y textura áspera”,“Exceso de grasa y brillos”,“Acné y granos”,“Envejecimiento – líneas y opacidad”,“Rojez e irritación”,“Hiperpigmentación y manchas”],
opts_budget:[“Económico – Menos de $35”,“Gama Media – $35–$80”,“Premium – $80–$150”,“Lujo – $150+”],
quizHints:[
“Sé preciso. Nadie te está viendo.”,
“Cualquier grano – pápulas, quistes, puntos blancos, puntos negros.”,
“Rojez, ardor, picazón o comezón después de aplicar.”,
“Las necesidades de la piel cambian significativamente por década.”,
“Selecciona la preocupación que más te molesta en este momento.”,
“Esto determina qué marcas y productos recomendamos.”,
],
analysisComplete:“Análisis Completo”,
yourProtocol:“Tu Protocolo Diario”,
morning:“Rutina de Mañana”, evening:“Rutina de Noche”,
whyThisWorks:“Por qué estos productos funcionan juntos ->”,
hideScience:“Cerrar ^”,
findProduct:“Buscar en Amazon >”,
findSephora:“Buscar en Sephora >”,
ingredientWarning:“Advertencia – Conflicto de Ingredientes”,
emailTitle:“Recibe Tu Protocolo en PDF”,
emailDesc:“Te enviaremos tu rutina completa de mañana y noche, tu lista de productos con enlaces directos, y consejos de piel semanales. Un solo correo. Cero spam.”,
emailBtn:“Enviar Mi Protocolo”,
emailSkip:“No gracias”,
emailSuccess:“Revisa tu correo – tu protocolo está en camino.”,
emailPlaceholder:“tu@correo.com”,
coachTitle:“Pregunta Cualquier Cosa al Coach.”,
coachSub:“Tu coach de IA ha revisado tu perfil completo y tu presupuesto. Pregunta sobre productos, ingredientes, tiempos o cualquier cosa que el protocolo no cubra.”,
coachOnline:“Coach Disponible”,
suggestions:[”¿Por qué sigo teniendo granos?”,”¿Puedo agregar retinol a mi rutina?”,”¿En qué orden aplico mis productos?”,”¿Cuánto tiempo hasta ver resultados reales?”,”¿Es mi rutina adecuada para el verano?”],
youLabel:“Tú”, coachLabel:“Coach”,
inputPlaceholder:“Pregunta cualquier cosa sobre tu piel o protocolo…”,
checkinTitle:”¿Cómo Está Funcionando el Protocolo?”,
checkinSub:“Un seguimiento de 30 segundos refina tu protocolo según resultados reales. La IA adapta sus consejos a lo que tu piel realmente está diciendo.”,
todayStatus:“Estado Actual”,
submitCheckin:“Enviar Seguimiento”,
submitting:“Procesando…”,
progressHistory:“Registro de Progreso”,
noHistory:“Tu registro aparecerá después de tu primer seguimiento.”,
moods:[
{v:“excellent”,emoji:”*”,label:“Excelente”,    desc:“Piel clara, hidratada, funcionando bien”},
{v:“improving”,emoji:”^”,label:“Mejorando”,    desc:“Cambios positivos visibles esta semana”},
{v:“stable”,   emoji:”-”,label:“Estable”,      desc:“Sin cambio – ni mejor ni peor”},
{v:“worse”,    emoji:“v”,label:“Declinando”,   desc:“Algo irrita o está causando granos”},
],
shaveTitle:“Protocolo de Afeitado”,
shaveSub:“Un análisis clínico de 7 preguntas – tipo de hoja, características de la barba, tipo de piel y problemas activos analizados juntos. La herramienta de afeitado más precisa jamás construida para hombres.”,
shaveQ1:”¿Cuál es tu método de afeitado principal actualmente?”,
shaveOpts1:[{v:“cartridge”,label:“Maquinilla de cartucho (2–5 hojas)”},{v:“safety”,label:“Maquinilla de seguridad / doble filo (hoja única)”},{v:“electric_foil”,label:“Afeitadora eléctrica de lámina (Braun, Panasonic)”},{v:“electric_rotary”,label:“Afeitadora eléctrica rotatoria (Philips Norelco)”},{v:“straight”,label:“Navaja de afeitar”},{v:“oneblade”,label:“OneBlade / Leaf Razor (pivote hoja única)”},{v:“beard”,label:“Mantengo barba – sin afeitado al ras”}],
shaveQ2:”¿Cómo describirías tu barba?”,
shaveOpts2:[{v:“fine_straight”,label:“Fina y recta – crece suave, poca resistencia”},{v:“medium”,label:“Media – grosor y densidad promedio”},{v:“coarse_straight”,label:“Gruesa y recta – barba densa y pesada”},{v:“coarse_curly”,label:“Gruesa y rizada – rizos apretados, ondas o coils”},{v:“patchy”,label:“Irregular – densidad variable en la cara”}],
shaveQ3:”¿Cuál es tu principal problema al afeitarte?”,
shaveOpts3:[{v:“bumps”,label:“Granos de afeitar y pelos encarnados”},{v:“redness”,label:“Rojez, ardor e irritación”},{v:“dryness”,label:“Sequedad y tirante post-afeitado”},{v:“cuts”,label:“Cortes y heridas frecuentes”},{v:“none”,label:“Sin problemas significativos – solo optimizar”}],
shaveQ4:”¿Tienes actualmente granos de afeitar activos en la cara o el cuello?”,
shaveOpts4:[{v:“none”,label:“Ninguno – sin granos en este momento”},{v:“mild”,label:“Leves – algunos granos ocasionales”},{v:“moderate”,label:“Moderados – varios granos, algunos inflamados”},{v:“severe”,label:“Severos – generalizados, dolorosos o causando cicatrices”}],
shaveQ5:”¿Qué maquinilla o hoja estás usando actualmente?”,
shaveOpts5:[{v:“gillette”,label:“Gillette Fusion, Mach3 o cartucho similar”},{v:“dollar_shave”,label:“Dollar Shave Club o cartucho por suscripción”},{v:“merkur”,label:“Maquinilla de seguridad Merkur”},{v:“feather”,label:“Hoja Feather o maquinilla japonesa”},{v:“braun”,label:“Afeitadora eléctrica Braun”},{v:“philips”,label:“Philips Norelco eléctrica”},{v:“other”,label:“Otra marca o no estoy seguro”},{v:“none_currently”,label:“No me afeito regularmente en este momento”}],
shaveQ6:”¿Con qué frecuencia te afeitas?”,
shaveOpts6:[{v:“daily”,label:“Todos los días”},{v:“every_other”,label:“Un día de por medio”},{v:“twice_week”,label:“Dos veces a la semana”},{v:“weekly”,label:“Una vez a la semana o menos”}],
shaveQ7:”¿Cuál es tu presupuesto mensual para el afeitado?”,
shaveOpts7:[{v:“budget”,label:“Económico – Menos de $20/mes”},{v:“mid”,label:“Gama Media – $20–$50/mes”},{v:“premium”,label:“Premium – $50–$100/mes”},{v:“luxury”,label:“Lujo – $100+/mes”}],
analyzeShave:“Generar Mi Protocolo Clínico”,
shaveAnalyzing:“Analizando tu perfil de afeitado…”,
shaveResult:“Tu Protocolo Clínico de Afeitado”,
bladeSection:“Recomendación de Hoja y Maquinilla”,
preShave:“Preparación Pre-Afeitado”,
duringShave:“El Afeitado”,
postShave:“Tratamiento Post-Afeitado”,
preventionProducts:“Productos de Prevención”,
treatmentProducts:“Tratamiento de Granos Activos”,
shaveCritical:“Hallazgo Clínico”,
medDisclaimer:“Este protocolo proporciona orientación clínica general. La pseudofoliculitis de la barba (granos de afeitar), irritación persistente o condiciones cutáneas sospechadas deben ser evaluadas por un dermatólogo certificado. Esto no es sustituto del consejo médico profesional.”,
optionalTitle:“Desbloquea Tu Análisis Completo”,
optionalSub:“Dos informes opcionales generados específicamente de tus resultados. No guías genéricas – construidos desde tu perfil exacto.”,
biologyTitle:“Conoce la Biología de Tu Piel”,
biologyDesc:“La explicación celular completa de por qué tu piel se comporta exactamente como lo hace. El mecanismo biológico de cada ingrediente en tu protocolo. Tu trayectoria cutánea a largo plazo.”,
routineCardTitle:“Tarjeta de Rutina Diaria Personalizada”,
routineCardDesc:“Tus productos exactos, en tu orden exacto, con tus instrucciones exactas de aplicación – formateado como una tarjeta lista para imprimir para la pared de tu baño.”,
comboTitle:“Ambos Informes – Mejor Valor”,
unlockBtn:“Desbloquear – $10”,
comboBtn:“Obtener Ambos – $15”,
alreadyUnlocked:”* Informes Desbloqueados”,
nav:{home:“Inicio”,analysis:“Análisis”,coach:“Coach”,checkin:“Progreso”,shave:“Afeitado”,guides:“Guías”,community:“Comunidad”},
communityTitle:“La Comunidad SKINR”,
communitySub:“Hombres reales. Resultados reales. Tipos de piel reales. Comparte tu progreso y lee lo que realmente funciona para hombres con tu perfil exacto.”,
communityPost:“Compartir Mi Progreso”,
communityFeed:“Hilo de Progreso”,
communityEmpty:“Sin actualizaciones aún. Sé el primero en compartir tu progreso.”,
communityShareTitle:“Compartir Tu Actualización”,
communityShareSub:“Anónimo por defecto. Tu tipo de piel y actualización son visibles – tu nombre no.”,
communitySharePlaceholder:”¿Qué ha cambiado desde que empezaste tu protocolo? ¿Qué funciona? ¿Con qué luchas?”,
communityShareBtn:“Publicar Mi Actualización”,
communityCancel:“Cancelar”,
communityPosted:“Tu actualización ha sido compartida.”,
communityLike:”* Útil”,
skinTypeLabel:“Tipo de Piel”,
weekLabel:“Semana”,
discordTitle:“Únete a la Conversación”,
discordSub:“Para discusión en tiempo real, preguntas, y compartir antes/después – únete a la comunidad Discord de SKINR.”,
discordBtn:“Unirse a SKINR Discord”,
guidesTitle:“Las Guías SKINR”,
guidesSub:“La referencia escrita completa para todo lo que cubre el quiz – y todo lo que no puede cubrir en 60 segundos.”,
skincareGuideTitle:“La Guía Sin Rodeos de Cuidado de Piel para Hombres”,
skincareGuideDesc:“Tu protocolo cutáneo completo. Fichas de puntuación de productos. Hoja de trucos de conflictos de ingredientes. Ajustes estacionales. Tarjetas de rutina imprimibles.”,
shavingGuideTitle:“La Biblia del Afeitado”,
shavingGuideDesc:“La guía clínica completa para un afeitado perfecto. Mecánica de hojas y ciencia de selección. Protocolo pre-afeitado. Tratamiento post-afeitado para cada tipo de piel y barba.”,
guidePrice:”$9 USD”,
guideBuyBtn:“Obtener la Guía”,
guideComingSoon:“Próximamente”,
welcomeBack:“Bienvenido de Vuelta.”,
continueJourney:“Tu protocolo te espera.”,
lastAnalyzed:“Último análisis”,
viewProtocol:“Ver Protocolo”,
consultCoach:“Consultar Coach”,
newAnalysis:“Nuevo Análisis”,
newShave:“Nuevo Análisis de Afeitado”,
disclaimer:“Los enlaces de afiliados de Amazon apoyan este servicio gratuito sin costo adicional para ti. Todas las recomendaciones se basan únicamente en tu perfil de piel y presupuesto.”,
of:”/”,
translating:“Configurando tu idioma…”,
storyLabel:“La Historia Detrás de SKINR”,
storyTitle:“Por Qué Lo Construí”,
storyP1:“Como hombre que se afeita todos los días, no tenía idea de lo que mi hoja estaba haciendo realmente a mi piel. Cada mañana – la misma rutina, la misma maquinilla, el mismo resultado. Granos de afeitar. Rojez. Irritación que duraba días. Iba a barberías que lo empeoraban. Cambiaba de productos constantemente – uno tras otro, esperando que algo funcionara, sin entender nunca por qué nada lo hacía.”,
storyP2:“La respuesta, resultó, no estaba en un mejor producto. Estaba en entender mi piel. Una vez que aprendí mi tipo de piel, por qué mi hoja específica causaba granos, qué ingredientes funcionan para mi biología, y cómo construir una rutina en el orden correcto – todo cambió. Menos granos. Menos rojez. Mejor piel. Y por primera vez, verdadera confianza en mi apariencia.”,
storyP3:“Por eso existe SKINR. Una sola plataforma donde cada hombre – sin importar su edad, tipo de piel o presupuesto – puede entender su biología cutánea, tomar las decisiones correctas sobre lo que pone en su cara, y construir una rutina que realmente funcione. No la rutina de otra persona. La suya.”,
missionLabel:“Nuestra Misión”,
missionText:“Ser la plataforma única donde cada hombre descubre su biología cutánea, toma las decisiones correctas y cuida su piel – a cualquier edad.”,
copyright:“Todos los derechos reservados.”,
skinScore:“Puntuación de Piel”,
consistencyRating:“Índice de Consistencia”,
weekOneLabel:“Protocolo Semana Uno”,
expectedTimeline:“Cronología Esperada”,
whenDermatologist:“Cuándo Ver a un Dermatólogo”,
criticalRuleLabel:“Regla Crítica”,
clinicalAssessmentLabel:“Evaluación Clínica”,
techniqueLabel:“Técnica”,
transitionLabel:“Nota de Transición”,
recommendedBladesLabel:“Hojas Recomendadas”,
avoidLabel:“Evitar”,
expertInsight:“Consejo de Experto”,
keyIngredientLabel:“Ingrediente Clave”,
activeIngredientLabel:“Ingrediente Activo”,
treatmentProtocolLabel:“Protocolo de Tratamiento”,
treatmentBadge:“Tratamiento”,
medDisclaimerLabel:“Aviso Médico”,
loadingProtocol:“Cargando protocolo completo…”,
stepLabel:“Paso”,
generatingLabel:“Generando…”,
generateReport:“Generar Informe”,
generateCard:“Generar Tarjeta”,
comingSoon:“Próximamente”,
currencyNote:“Precios en USD.”,
};

// – GET TRANSLATION – instant, zero API calls ———————————
const getT = (langCode) => {
if (langCode === “fr”) return {…BASE_T, …FR_T};
if (langCode === “es”) return {…BASE_T, …ES_T};
return BASE_T;
};

// Detect browser language on first visit – returns “en”, “fr”, or “es” only
const detectBrowserLang = () => {
const browser = (navigator.language || navigator.languages?.[0] || “en”).slice(0,2).toLowerCase();
return SUPPORTED_LANGS.includes(browser) ? browser : “en”;
};

// – SKIN QUIZ QUESTIONS —————————————————––
const getSkinQs = (t, lang) => [
{ id:“feel”,      q:t.q_feel,      opts:t.opts_feel.map((o,i)=>({v:[“dry”,“normal”,“oily”,“combo”][i],label:o}))      },
{ id:“breakouts”, q:t.q_breakouts, opts:t.opts_breakouts.map((o,i)=>({v:[“never”,“sometimes”,“often”,“always”][i],label:o})) },
{ id:“sensitivity”,q:t.q_sensitivity,opts:t.opts_sensitivity.map((o,i)=>({v:[“none”,“mild”,“moderate”,“severe”][i],label:o})) },
{ id:“age”,       q:t.q_age,       opts:t.opts_age.map((o,i)=>({v:[“under25”,“25to35”,“36to50”,“50plus”][i],label:o})) },
{ id:“concern”,   q:t.q_concern,   opts:t.opts_concern.map((o,i)=>({v:[“dryness”,“oiliness”,“acne”,“aging”,“redness”,“pigmentation”][i],label:o})) },
{ id:“budget”,    q:t.q_budget,    opts:t.opts_budget.map((o,i)=>({v:[“budget”,“mid”,“premium”,“luxury”][i],label:o})) },
];

// – AI PROMPTS ––––––––––––––––––––––––––––––––
const buildSkinPrompt = (answers, lang) => {
const ln = (LANGUAGES.find(l=>l.code===lang)?.label || “English”);
const tier = answers.budget || “mid”;
const brands = CONFIG.skinBrandsByTier[tier]?.join(”, “) || “The Ordinary, CeraVe”;
return `You are a dermatologist. Respond ONLY in ${ln}. Return ONLY valid compact JSON – no markdown, no extra whitespace.

Patient: feel=${answers.feel}, breakouts=${answers.breakouts}, sensitivity=${answers.sensitivity}, age=${answers.age}, concern=${answers.concern}, budget=${tier}
Brands: ${brands}

Return this JSON (keep all string values short – max 20 words each):
{“skinType”:“2-3 word type”,“code”:“TYPE-CODE”,“headline”:“one clinical sentence”,“summary”:“two sentences why and what needed”,“morning”:[{“step”:1,“product”:“exact name”,“brand”:“brand”,“category”:“cleanser|toner|serum|moisturizer|spf|treatment”,“estimatedPrice”:”$X”,“keyIngredient”:“ingredient”,“instruction”:“exact instruction”,“why”:“clinical reason”,“clinicalMechanism”:“mechanism”,“knownRating”:“X/5 Amazon”,“amazonSearch”:“search term”}],“evening”:[same structure max 3 products no SPF],“ingredientConflicts”:[],“avoid”:“ingredient to avoid and why”,“timeToResults”:“week 2 week 4 week 12”,“proTip”:“non-obvious insight”,“coachIntro”:“two sentence welcome”,“skinBiologyTeaser”:“two sentences biology teaser”}

Rules: morning 3-4 products ending with SPF, evening 2-3 products no SPF, all on Amazon within ${tier} budget using brands: ${brands}.`;
};

// – SHAVE PROMPT 1: Diagnosis + Blade (~500 output tokens, always completes) –
const buildShavePrompt1 = (answers, skinProfile, lang) => {
const ln = LANGUAGES.find(l => l.code === lang)?.label || “English”;
const tier = answers.budget || “mid”;
const brands = CONFIG.shaveBrandsByTier[tier]?.slice(0, 3).join(”, “) || “Cremo, Proraso, Nivea Men”;
const skin = skinProfile?.skinType || “combination”;
const bumps = answers.activeBumps || “none”;
return `Shaving dermatologist. Language: ${ln}. CRITICAL: Return ONLY compact single-line JSON with NO whitespace, no newlines, no markdown, no code fences. Start with { end with }. Profile: method=${answers.method||"cartridge"},beard=${answers.beard||"medium"},problem=${answers.problem||"redness"},bumps=${bumps},blade=${answers.currentBlade||"unknown"},freq=${answers.frequency||"daily"},budget=${tier},skin=${skin}. Brands:${brands}. Fill this schema with real clinical values (keep strings under 15 words): {"clinicalFinding":"","severityAssessment":"","criticalRule":"","bladeRecommendation":{"recommendedType":"","specificModel":"","whyThisRazor":"","bladeGap":"","techniqueAdjustment":"","transitionNote":"","recommendedBlades":[{"name":"","estimatedPrice":"","why":"","rating":"","amazonSearch":""}]}}`;
};

// – SHAVE PROMPT 2: Protocol + Products (~900 output tokens, loads lazily) ––
const buildShavePrompt2 = (answers, diagnosis, lang) => {
const ln = LANGUAGES.find(l => l.code === lang)?.label || “English”;
const tier = answers.budget || “mid”;
const brands = CONFIG.shaveBrandsByTier[tier]?.slice(0, 3).join(”, “) || “Cremo, Proraso, Nivea Men”;
const bumps = answers.activeBumps || “none”;
const hasBumps = bumps !== “none”;
const bumpExtra = hasBumps
? `,"treatmentProducts":[{"name":"","brand":"","category":"bump-treatment","estimatedPrice":"","keyIngredient":"Salicylic Acid 2%","use":"","clinicalMechanism":"","knownRating":"","amazonSearch":"","expectedTimeline":""}],"treatmentProtocol":""`
: ``;
return `Shaving dermatologist. Language: ${ln}. CRITICAL: Return ONLY compact single-line JSON with NO whitespace, no newlines, no markdown, no code fences. Start with { end with }. Diagnosis:${diagnosis||"shaving irritation"}. Profile: method=${answers.method||"cartridge"},beard=${answers.beard||"medium"},bumps=${bumps},budget=${tier}. Brands:${brands}. Fill this schema with real clinical values (keep strings under 15 words): {"preShave":[{"step":1,"title":"","instruction":"","duration":"","why":""},{"step":2,"title":"","instruction":"","duration":"","why":""},{"step":3,"title":"","instruction":"","duration":"","why":""}],"shaveProtocol":[{"step":1,"title":"","instruction":"","why":""},{"step":2,"title":"","instruction":"","why":""},{"step":3,"title":"","instruction":"","why":""}],"postShave":[{"step":1,"title":"","instruction":"","why":""},{"step":2,"title":"","instruction":"","why":""},{"step":3,"title":"","instruction":"","why":""}],"preventionProducts":[{"name":"","brand":"","category":"shave-cream","estimatedPrice":"","keyIngredient":"","use":"","clinicalMechanism":"","knownRating":"","amazonSearch":"","priority":"essential"},{"name":"","brand":"","category":"post-shave-balm","estimatedPrice":"","keyIngredient":"","use":"","clinicalMechanism":"","knownRating":"","amazonSearch":"","priority":"essential"}]${bumpExtra},"weekOneProtocol":"","expectedImprovement":"","whenToSeeDoctor":"","skinBiologyTeaser":""}`;
};

const buildCheckinPrompt = (mood, profile, history, lang) => {
const ln = (LANGUAGES.find(l=>l.code===lang)?.label || “English”);
return `Respond ONLY in ${ln}. You are a clinical skincare coach reviewing a check-in. Patient skin type: ${profile?.skinType || "unknown"} Current status reported: ${mood} Protocol they are following: ${profile?.headline || "standard protocol"} Recent history: ${history?.slice(0,3).map(h=>h.mood).join(", ") || "first check-in"} Return ONE sentence of precise, actionable clinical advice specific to this status and skin type. No generic advice.`;
};

// – HELPERS —————————————————————––
const getAffLink = (search) =>
`https://www.amazon.com/s?k=${encodeURIComponent(search)}&tag=${CONFIG.business.affiliateTag}&linkCode=ur2`;

const calcScore = (profile, checkins=[]) => {
if(!profile) return 0;
let s = 20;
s += Math.min(checkins.length * 5, 35);
s += checkins.slice(0,5).filter(c=>c.mood===“excellent”||c.mood===“improving”).length * 7;
if(checkins.length >= 7) s += 10;
return Math.min(s, 100);
};

// – CSS ———————————————————————–
const CSS = `
@import url(‘https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Josefin+Sans:wght@300;400;600&family=DM+Mono:wght@300;400&display=swap’);

*{box-sizing:border-box;margin:0;padding:0;}
:root{
–bg:#050505; –s:#0C0C0C; –card:#101010; –card2:#161616;
–border:#1E1E1E; –border2:#2C2C2C;
–gold:#B8972A; –gold2:#D4AF50; –gold3:rgba(184,151,42,0.08);
–goldb:rgba(184,151,42,0.22); –goldbr:rgba(184,151,42,0.45);
–white:#F2EEE6; –cream:#D8D2C8; –soft:#A09890; –muted:#4E4844;
–red:#9E2B2B; –green:#2E6B46; –amber:#B87820; –purple:#7254B8;
–fh:‘Playfair Display’,serif; –fc:‘Cormorant Garamond’,serif;
–fb:‘Josefin Sans’,sans-serif; –fm:‘DM Mono’,monospace;
}
html,body{height:100%;background:var(–bg);}
.app{min-height:100vh;background:var(–bg);color:var(–white);font-family:var(–fb);
display:flex;flex-direction:column;align-items:center;padding:0 0 120px;
position:relative;overflow-x:hidden;}
.app::before{content:’’;position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.018;
background-image:url(“data:image/svg+xml,%3Csvg viewBox=‘0 0 256 256’ xmlns=‘http://www.w3.org/2000/svg’%3E%3Cfilter id=‘n’%3E%3CfeTurbulence type=‘fractalNoise’ baseFrequency=‘0.9’ numOctaves=‘4’ stitchTiles=‘stitch’/%3E%3C/filter%3E%3Crect width=‘100%25’ height=‘100%25’ filter=‘url(%23n)’/%3E%3C/svg%3E”);
background-size:200px 200px;}
.bg-vig{position:fixed;inset:0;pointer-events:none;z-index:0;
background:radial-gradient(ellipse 130% 70% at 50% 0%,rgba(184,151,42,0.03),transparent 55%),
radial-gradient(ellipse 100% 100% at 50% 100%,rgba(0,0,0,0.5),transparent 70%);}

/* NAV */
.nav{width:100%;max-width:920px;padding:0 20px;display:flex;align-items:stretch;
justify-content:space-between;border-bottom:1px solid var(–border);position:sticky;top:0;
background:rgba(6,6,6,0.97);backdrop-filter:blur(24px);z-index:100;gap:12px;min-height:54px;}
.logo{font-family:var(–fh);font-size:15px;font-weight:900;color:var(–white);
display:flex;align-items:center;gap:9px;letter-spacing:3px;flex-shrink:0;
text-transform:uppercase;cursor:pointer;border:none;background:none;}
.logo:focus-visible{outline:2px solid var(–gold);outline-offset:3px;}
.logo-m{width:17px;height:17px;border:1px solid var(–gold);display:flex;align-items:center;
justify-content:center;font-size:7px;color:var(–gold);}
.logo-m::after{content:’*’;}
.nav-c{display:flex;gap:0;overflow-x:auto;scrollbar-width:none;flex:1;justify-content:center;}
.nav-c::-webkit-scrollbar{display:none;}
.ntab{background:none;border:none;border-bottom:2px solid transparent;padding:0 12px;
font-family:var(–fc);font-size:13px;letter-spacing:2px;color:var(–soft);
cursor:pointer;transition:all .3s;text-transform:uppercase;white-space:nowrap;
display:flex;align-items:center;min-height:54px;}
.ntab:hover{color:var(–cream);}
.ntab.active{color:var(–gold);border-bottom-color:var(–gold);}
.ntab:focus-visible{outline:2px solid var(–gold);outline-offset:-2px;}
.lang-r{display:flex;gap:3px;align-items:center;flex-shrink:0;}
.lbtn{background:none;border:none;color:var(–soft);padding:4px 6px;
font-family:var(–fm);font-size:9px;letter-spacing:2px;cursor:pointer;
transition:all .25s;text-transform:uppercase;border-bottom:1px solid transparent;}
.lbtn:hover{color:var(–cream);}
.lbtn.active{color:var(–gold);border-bottom-color:var(–gold);}

/* MOBILE TICKER */
.nav-ticker-wrap{display:none;flex:1;overflow:hidden;position:relative;align-items:center;
mask-image:linear-gradient(90deg,transparent,black 10%,black 90%,transparent);
-webkit-mask-image:linear-gradient(90deg,transparent,black 10%,black 90%,transparent);}
.nav-ticker{display:flex;gap:0;white-space:nowrap;animation:ticker 20s linear infinite;}
.nav-ticker:hover{animation-play-state:paused;}
@keyframes ticker{0%{transform:translateX(0%)}100%{transform:translateX(-50%)}}
.ticker-tab{background:none;border:none;border-bottom:2px solid transparent;
padding:0 14px;font-family:var(–fc);font-size:13px;letter-spacing:2px;
color:var(–soft);cursor:pointer;transition:color .25s;text-transform:uppercase;
white-space:nowrap;display:inline-flex;align-items:center;min-height:54px;}
.ticker-tab:hover{color:var(–cream);}
.ticker-tab.active{color:var(–gold);border-bottom-color:var(–gold);}
.ticker-sep{color:var(–border2);font-size:8px;padding:0 4px;display:inline-flex;align-items:center;min-height:54px;}

/* SKIP LINK */
.skip-link{position:absolute;top:-100px;left:20px;background:var(–gold);color:#060606;
padding:8px 16px;font-family:var(–fc);font-size:14px;font-weight:700;z-index:999;transition:top .2s;}
.skip-link:focus{top:8px;}

/* WRAP */
.wrap{width:100%;max-width:920px;padding:0 20px 48px;position:relative;z-index:1;}
.fade-in{animation:fadeUp .5s cubic-bezier(.2,0,.1,1) forwards;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

/* HERO */
.hero{padding:52px 0 44px;border-bottom:1px solid var(–border);}
.hero-badge{display:inline-flex;align-items:center;gap:9px;font-family:var(–fc);font-size:13px;letter-spacing:4px;color:var(–soft);text-transform:uppercase;margin-bottom:24px;font-style:italic;}
.hero-badge::before{content:’*’;color:var(–gold);font-size:8px;}
.hero-h{font-family:var(–fh);font-size:clamp(34px,6vw,60px);font-weight:900;line-height:.95;letter-spacing:-1px;font-style:italic;}
.hero-h2{font-family:var(–fh);font-size:clamp(34px,6vw,60px);font-weight:900;line-height:.95;letter-spacing:-1px;color:var(–gold);margin-bottom:16px;}
.hero-rule{width:44px;height:1px;background:var(–gold);margin:18px 0;}
.hero-body{font-family:var(–fc);font-size:17px;line-height:1.85;color:var(–soft);font-weight:400;max-width:600px;font-style:italic;}

/* PATH CARDS */
.path-sec{padding:44px 0 36px;}
.path-title{font-family:var(–fh);font-size:clamp(20px,3vw,30px);font-weight:700;font-style:italic;margin-bottom:6px;}
.path-sub{font-family:var(–fc);font-size:15px;color:var(–soft);font-style:italic;margin-bottom:28px;}
.path-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px;background:var(–border);}
.path-card{background:var(–card);padding:32px 28px;cursor:pointer;transition:background .3s;
position:relative;overflow:hidden;display:flex;flex-direction:column;}
.path-card::before{content:’’;position:absolute;top:0;left:0;right:0;height:2px;background:var(–border);transition:background .3s;}
.path-card:hover,.path-card:focus{background:var(–card2);outline:none;}
.path-card:hover::before,.path-card:focus::before{background:var(–gold);}
.p-inner{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;}
.p-num{font-family:var(–fh);font-size:64px;font-weight:900;font-style:italic;
color:rgba(197,160,40,0.07);line-height:1;margin-bottom:-6px;transition:color .3s;}
.path-card:hover .p-num{color:rgba(197,160,40,0.13);}
.p-tag{display:inline-flex;align-items:center;gap:5px;border:1px solid var(–goldb);
color:var(–gold);padding:2px 9px;font-family:var(–fm);font-size:8px;letter-spacing:2px;
text-transform:uppercase;margin-bottom:12px;width:fit-content;}
.p-title{font-family:var(–fh);font-size:24px;font-weight:900;font-style:italic;margin-bottom:12px;line-height:1.1;}
.p-desc{font-family:var(–fc);font-size:15px;line-height:1.78;color:var(–soft);font-style:italic;margin-bottom:18px;flex:1;}
.p-pills{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:20px;}
.p-pill{border:1px solid var(–border2);color:var(–muted);padding:3px 9px;
font-family:var(–fc);font-size:10px;letter-spacing:1px;font-style:italic;transition:all .3s;}
.path-card:hover .p-pill{border-color:var(–goldb);color:var(–soft);}
.p-btn{display:inline-flex;align-items:center;gap:9px;background:none;border:1px solid var(–border2);
color:var(–soft);padding:13px 18px;font-family:var(–fc);font-size:13px;letter-spacing:2px;
text-transform:uppercase;font-style:italic;cursor:pointer;transition:all .3s;width:100%;justify-content:space-between;}
.p-btn::after{content:’->’;font-family:var(–fh);font-size:16px;font-style:normal;transition:transform .3s;}
.path-card:hover .p-btn{background:var(–gold);border-color:var(–gold);color:#060606;}
.path-card:hover .p-btn::after{transform:translateX(4px);}

/* RETURNING USER */
.ret-sec{padding:28px 0 0;border-top:1px solid var(–border);}
.ret-lbl{font-family:var(–fc);font-size:8px;letter-spacing:4px;color:var(–gold);text-transform:uppercase;margin-bottom:3px;font-style:italic;}
.ret-title{font-family:var(–fh);font-size:18px;font-weight:700;font-style:italic;margin-bottom:18px;}
.score-w{border:1px solid var(–border);padding:20px;margin-bottom:14px;
display:flex;align-items:center;gap:20px;position:relative;overflow:hidden;}
.score-w::before{content:’’;position:absolute;top:0;left:0;bottom:0;width:2px;background:var(–gold);}
.s-arc{position:relative;width:70px;height:70px;flex-shrink:0;}
.s-arc svg{transform:rotate(-90deg);}
.arc-bg{fill:none;stroke:var(–border2);stroke-width:3;}
.arc-fill{fill:none;stroke:var(–gold);stroke-width:3;stroke-linecap:butt;transition:stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1);}
.arc-n{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.arc-v{font-family:var(–fh);font-size:19px;font-weight:700;color:var(–white);line-height:1;}
.arc-mx{font-family:var(–fm);font-size:7px;color:var(–soft);letter-spacing:1px;}
.s-info .s-title{font-family:var(–fh);font-size:15px;font-weight:600;margin-bottom:3px;}
.s-info .s-sub{font-family:var(–fc);font-size:12px;color:var(–soft);font-style:italic;}
.s-bar{height:1px;background:var(–border2);margin-top:8px;}
.s-bar-f{height:100%;background:var(–gold);transition:width 1.2s ease;}
.prof-strip{border:1px solid var(–border);padding:20px 22px;display:flex;
align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;
position:relative;overflow:hidden;margin-bottom:8px;}
.prof-strip::after{content:’’;position:absolute;top:0;left:0;right:0;height:1px;
background:linear-gradient(90deg,var(–gold),transparent);}
.ps-lbl{font-family:var(–fc);font-size:8px;letter-spacing:4px;color:var(–gold);
text-transform:uppercase;font-style:italic;margin-bottom:5px;}
.ps-type{font-family:var(–fh);font-size:22px;font-weight:900;font-style:italic;margin-bottom:3px;}
.ps-sub{font-family:var(–fc);font-size:11px;color:var(–soft);font-style:italic;}
.ps-btns{display:flex;gap:8px;flex-wrap:wrap;}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;
padding:12px 24px;border:none;font-family:var(–fc);font-size:12px;font-weight:600;
cursor:pointer;transition:all .3s;letter-spacing:2px;text-transform:uppercase;font-style:italic;}
.btn-p{background:var(–gold);color:#060606;}
.btn-p:hover{background:var(–gold2);box-shadow:0 0 32px rgba(197,160,40,0.2);}
.btn-p:disabled{opacity:.25;cursor:not-allowed;box-shadow:none;}
.btn-g{background:none;border:1px solid var(–border2);color:var(–soft);}
.btn-g:hover{border-color:var(–goldb);color:var(–gold);}
button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible{
outline:2px solid var(–gold);outline-offset:2px;}

/* QUIZ */
.quiz-wrap{padding:44px 0 0;}
.quiz-hdr{display:flex;align-items:center;gap:16px;margin-bottom:32px;}
.back-btn{background:none;border:1px solid var(–border);color:var(–soft);
padding:8px 14px;font-family:var(–fc);font-size:11px;letter-spacing:2px;
cursor:pointer;transition:all .25s;font-style:italic;flex-shrink:0;}
.back-btn:hover{border-color:var(–goldb);color:var(–gold);}
.back-btn:disabled{opacity:.2;cursor:not-allowed;}
.prog-track{flex:1;height:1px;background:var(–border);}
.prog-fill{height:100%;background:var(–gold);transition:width .5s cubic-bezier(.4,0,.2,1);}
.q-num{font-family:var(–fh);font-size:64px;font-weight:900;font-style:italic;
color:rgba(197,160,40,0.06);line-height:1;margin-bottom:-12px;}
.q-meta{font-family:var(–fm);font-size:9px;letter-spacing:3px;color:var(–soft);
text-transform:uppercase;margin-bottom:9px;}
.q-text{font-family:var(–fh);font-size:clamp(18px,3vw,27px);font-weight:700;
line-height:1.25;margin-bottom:7px;font-style:italic;}
.q-hint{font-family:var(–fc);font-size:13px;color:var(–soft);margin-bottom:22px;font-style:italic;}
.opts{display:grid;gap:6px;margin-bottom:24px;}
.opt{display:flex;align-items:center;gap:12px;border:1px solid var(–border);
padding:13px 16px;cursor:pointer;transition:all .25s;text-align:left;
width:100%;background:transparent;color:var(–white);}
.opt:hover{border-color:var(–goldb);background:var(–gold3);}
.opt.sel{border-color:var(–gold);background:var(–gold3);}
.opt-m{width:15px;height:15px;border:1px solid var(–border2);flex-shrink:0;
display:flex;align-items:center;justify-content:center;transition:all .25s;}
.opt.sel .opt-m{border-color:var(–gold);background:var(–gold);}
.opt.sel .opt-m::after{content:’*’;font-size:6px;color:#060606;}
.opt-lbl{font-family:var(–fc);font-size:15px;color:var(–soft);transition:color .25s;font-style:italic;}
.opt.sel .opt-lbl{color:var(–white);}
.q-foot{display:flex;align-items:center;justify-content:space-between;}
.q-count{font-family:var(–fm);font-size:9px;color:var(–soft);letter-spacing:2px;}

/* LOADING */
.load-wrap{display:flex;flex-direction:column;align-items:center;text-align:center;padding:72px 0;gap:24px;}
.load-svg{animation:spin 3s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.load-h{font-family:var(–fh);font-size:26px;font-weight:900;font-style:italic;letter-spacing:2px;}
.load-step{font-family:var(–fc);font-size:11px;letter-spacing:3px;color:var(–soft);
text-transform:uppercase;font-style:italic;}
.load-line{width:110px;height:1px;background:var(–border2);position:relative;overflow:hidden;}
.load-line::after{content:’’;position:absolute;top:0;left:-100%;width:100%;height:100%;
background:var(–gold);animation:slide 1.5s ease-in-out infinite;}
@keyframes slide{0%{left:-100%}100%{left:100%}}

/* EMAIL MODAL */
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:200;
display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeUp .3s ease;}
.modal{background:var(–card);border:1px solid var(–border);max-width:460px;
width:100%;position:relative;overflow:hidden;}
.modal::before{content:’’;position:absolute;top:0;left:0;right:0;height:2px;
background:linear-gradient(90deg,var(–gold),var(–gold2),var(–gold));}
.modal-inner{padding:32px;}
.modal-h{font-family:var(–fh);font-size:24px;font-weight:900;font-style:italic;margin-bottom:6px;}
.modal-s{font-family:var(–fc);font-size:14px;color:var(–soft);font-style:italic;margin-bottom:22px;line-height:1.7;}
.email-in{width:100%;background:var(–s);border:1px solid var(–border);
padding:12px 16px;font-family:var(–fc);font-size:14px;color:var(–white);
outline:none;margin-bottom:10px;font-style:italic;}
.email-in:focus{border-color:var(–goldb);}
.email-in::placeholder{color:var(–soft);}
.email-skip{background:none;border:none;color:var(–soft);font-family:var(–fc);
font-size:12px;cursor:pointer;padding:8px 0;font-style:italic;width:100%;text-align:center;}
.email-skip:hover{color:var(–cream);}
.modal-success{text-align:center;padding:8px 0;}
.modal-success-icon{font-family:var(–fh);font-size:28px;color:var(–green);margin-bottom:10px;}
.modal-success-h{font-family:var(–fh);font-size:18px;font-weight:700;font-style:italic;margin-bottom:6px;}
.modal-success-s{font-family:var(–fc);font-size:13px;color:var(–soft);font-style:italic;}

/* RESULTS */
.res-wrap{padding-top:32px;}
.prof-banner{border:1px solid var(–border);padding:28px;margin-bottom:16px;position:relative;overflow:hidden;}
.prof-banner::before{content:’’;position:absolute;top:0;left:0;right:0;height:1px;
background:linear-gradient(90deg,var(–gold),rgba(197,160,40,0.2),transparent);}
.p-code{font-family:var(–fm);font-size:8px;letter-spacing:5px;color:var(–gold);
text-transform:uppercase;margin-bottom:8px;}
.p-type{font-family:var(–fh);font-size:clamp(26px,4.5vw,42px);font-weight:900;
font-style:italic;line-height:1;margin-bottom:8px;}
.p-hl{font-family:var(–fc);font-size:16px;color:var(–gold);margin-bottom:10px;font-style:italic;}
.p-sum{font-family:var(–fc);font-size:14px;line-height:1.8;color:var(–soft);font-style:italic;}

/* PROTOCOL CARDS */
.period-hdr{font-family:var(–fc);font-size:9px;letter-spacing:4px;text-transform:uppercase;
color:var(–gold);margin-bottom:12px;display:flex;align-items:center;gap:10px;font-style:italic;}
.period-hdr::after{content:’’;flex:1;height:1px;background:var(–border);}
.step-card{border:1px solid var(–border);margin-bottom:8px;position:relative;overflow:hidden;transition:border-color .25s;}
.step-card:hover{border-color:var(–goldb);}
.step-card::before{content:’’;position:absolute;left:0;top:0;bottom:0;width:0;
background:var(–gold);transition:width .3s;}
.step-card:hover::before{width:2px;}
.step-inner{padding:16px;}
.step-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:4px;}
.step-num{font-family:var(–fc);font-size:9px;color:var(–gold);letter-spacing:2px;font-style:italic;flex-shrink:0;margin-top:2px;}
.step-name{font-family:var(–fh);font-size:15px;font-weight:700;line-height:1.2;flex:1;}
.step-price{font-family:var(–fh);font-size:14px;color:var(–gold);white-space:nowrap;font-style:italic;}
.step-brand{font-family:var(–fc);font-size:9px;letter-spacing:2px;color:var(–soft);text-transform:uppercase;font-style:italic;margin-bottom:8px;}
.step-key{display:inline-flex;align-items:center;gap:3px;border:1px solid var(–goldb);
color:var(–gold);padding:2px 8px;font-family:var(–fm);font-size:8px;
letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
.step-instruction{font-family:var(–fc);font-size:14px;line-height:1.65;color:var(–cream);margin-bottom:6px;}
.step-why{font-family:var(–fc);font-size:13px;line-height:1.65;color:var(–soft);font-style:italic;margin-bottom:10px;}
.step-links{display:flex;gap:8px;flex-wrap:wrap;}
.step-link{display:inline-flex;align-items:center;gap:4px;border:1px solid var(–goldb);
color:var(–gold);text-decoration:none;padding:5px 11px;font-family:var(–fc);
font-size:9px;letter-spacing:2px;text-transform:uppercase;transition:all .25s;
cursor:pointer;font-style:italic;}
.step-link:hover{background:var(–gold3);border-color:var(–goldbr);}
.sci-tog{background:none;border:none;color:var(–soft);font-family:var(–fm);
font-size:8px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;
padding:5px 0;transition:color .25s;display:flex;align-items:center;gap:3px;margin-top:4px;}
.sci-tog:hover{color:var(–gold);}
.sci-box{border-left:1px solid var(–goldb);padding:11px 14px;margin-top:9px;animation:fadeUp .3s ease;}
.sci-text{font-family:var(–fc);font-size:13px;line-height:1.75;color:var(–soft);font-style:italic;}

/* CONFLICT WARNING */
.conflict-box{border:1px solid rgba(168,48,48,0.25);border-left:2px solid var(–red);
padding:14px 16px;margin:12px 0;}
.conflict-lbl{font-family:var(–fc);font-size:8px;letter-spacing:4px;text-transform:uppercase;
color:var(–red);margin-bottom:5px;font-style:italic;}
.conflict-text{font-family:var(–fc);font-size:13px;color:var(–soft);font-style:italic;line-height:1.65;}

/* INSIGHTS */
.ins-box{padding:14px 18px;margin-bottom:12px;}
.ins-box.warn{border:1px solid rgba(168,48,48,0.2);border-left:2px solid var(–red);}
.ins-box.tip{border:1px solid var(–goldb);border-left:2px solid var(–gold);}
.ins-lbl{font-family:var(–fc);font-size:8px;letter-spacing:4px;text-transform:uppercase;margin-bottom:5px;font-style:italic;}
.ins-box.warn .ins-lbl{color:var(–red);}
.ins-box.tip .ins-lbl{color:var(–gold);}
.ins-text{font-family:var(–fc);font-size:14px;line-height:1.75;color:var(–soft);font-style:italic;}

/* COACH */
.coach-top{padding-top:32px;margin-bottom:20px;}
.coach-status{display:inline-flex;align-items:center;gap:7px;font-family:var(–fc);
font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(–soft);
font-style:italic;margin-bottom:7px;}
.coach-status::before{content:’*’;font-size:7px;color:var(–green);animation:pulse-g 2s infinite;}
@keyframes pulse-g{0%,100%{opacity:.4}50%{opacity:1}}
.coach-h{font-family:var(–fh);font-size:24px;font-weight:900;font-style:italic;margin-bottom:5px;}
.coach-s{font-family:var(–fc);font-size:14px;color:var(–soft);font-style:italic;}
.sug-row{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;}
.sug-btn{background:none;border:1px solid var(–border);padding:5px 12px;
font-family:var(–fc);font-size:11px;color:var(–soft);cursor:pointer;
transition:all .25s;font-style:italic;}
.sug-btn:hover{border-color:var(–goldb);color:var(–gold);}
.chat-win{border:1px solid var(–border);min-height:340px;max-height:420px;
overflow-y:auto;padding:16px;margin-bottom:11px;display:flex;flex-direction:column;
gap:12px;scroll-behavior:smooth;background:var(–s);}
.chat-win::-webkit-scrollbar{width:2px;}
.chat-win::-webkit-scrollbar-thumb{background:var(–border2);}
.msg{display:flex;flex-direction:column;max-width:84%;}
.msg.user{align-self:flex-end;align-items:flex-end;}
.msg.ai{align-self:flex-start;}
.msg-role{font-family:var(–fc);font-size:7px;letter-spacing:3px;text-transform:uppercase;
color:var(–soft);margin-bottom:3px;font-style:italic;}
.msg-bubble{padding:10px 14px;font-family:var(–fc);font-size:14px;line-height:1.65;font-style:italic;}
.msg.user .msg-bubble{background:var(–gold);color:#060606;}
.msg.ai .msg-bubble{border:1px solid var(–border);color:var(–cream);}
.msg.typing .msg-bubble{display:flex;gap:4px;align-items:center;}
.chat-row{display:flex;gap:7px;}
.chat-in{flex:1;background:var(–s);border:1px solid var(–border);padding:11px 14px;
font-family:var(–fc);font-size:14px;color:var(–white);outline:none;
transition:border-color .25s;resize:none;font-style:italic;}
.chat-in::placeholder{color:var(–soft);}
.chat-in:focus{border-color:var(–goldb);}
.chat-send{background:var(–gold);border:none;padding:11px 16px;color:#060606;
cursor:pointer;font-size:14px;transition:all .25s;flex-shrink:0;
font-family:var(–fh);font-weight:700;}
.chat-send:hover{background:var(–gold2);}
.chat-send:disabled{opacity:.25;cursor:not-allowed;}

/* CHECKIN */
.ci-wrap{padding-top:32px;}
.streak-b{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(197,160,40,0.2);
padding:4px 12px;font-family:var(–fc);font-size:9px;color:var(–gold);
letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;font-style:italic;}
.ci-h{font-family:var(–fh);font-size:24px;font-weight:900;font-style:italic;margin-bottom:5px;}
.ci-s{font-family:var(–fc);font-size:14px;color:var(–soft);font-style:italic;margin-bottom:22px;}
.mood-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-bottom:20px;}
.mood-opt{border:1px solid var(–border);padding:16px;cursor:pointer;
transition:all .25s;text-align:left;background:transparent;}
.mood-opt:hover{border-color:var(–goldb);}
.mood-opt.sel{border-color:var(–gold);background:var(–gold3);}
.mood-e{font-family:var(–fh);font-size:16px;margin-bottom:7px;color:var(–gold);}
.mood-l{font-family:var(–fh);font-size:13px;font-weight:700;margin-bottom:2px;font-style:italic;}
.mood-d{font-family:var(–fc);font-size:11px;color:var(–soft);font-style:italic;}
.hist-list{display:flex;flex-direction:column;gap:1px;background:var(–border);}
.hist-item{background:var(–card);padding:12px 16px;display:flex;gap:14px;transition:background .25s;}
.hist-item:hover{background:var(–card2);}
.hist-date{font-family:var(–fm);font-size:8px;color:var(–soft);min-width:60px;letter-spacing:1px;padding-top:2px;}
.hist-text{font-family:var(–fc);font-size:13px;color:var(–soft);line-height:1.6;font-style:italic;}

/* SHAVE */
.shave-wrap{padding-top:32px;}
.shave-h{font-family:var(–fh);font-size:24px;font-weight:900;font-style:italic;margin-bottom:5px;}
.shave-s{font-family:var(–fc);font-size:14px;color:var(–soft);font-style:italic;margin-bottom:26px;}
.shave-finding{border:1px solid var(–goldb);border-left:2px solid var(–gold);
padding:14px 18px;margin-bottom:16px;}
.shave-finding-lbl{font-family:var(–fc);font-size:8px;letter-spacing:4px;
text-transform:uppercase;color:var(–gold);margin-bottom:5px;font-style:italic;}
.shave-finding-text{font-family:var(–fc);font-size:14px;color:var(–cream);font-style:italic;line-height:1.7;}
.shave-severity{border:1px solid var(–border);padding:12px 16px;margin-bottom:16px;}
.shave-severity-lbl{font-family:var(–fc);font-size:8px;letter-spacing:4px;
text-transform:uppercase;color:var(–amber);margin-bottom:4px;font-style:italic;}
.shave-severity-text{font-family:var(–fc);font-size:13px;color:var(–soft);font-style:italic;line-height:1.65;}
.phase-block{border:1px solid var(–border);margin-bottom:10px;position:relative;}
.phase-block::before{content:’’;position:absolute;top:0;left:0;bottom:0;width:2px;}
.phase-block.pre::before{background:var(–gold);}
.phase-block.during::before{background:var(–amber);}
.phase-block.post::before{background:var(–green);}
.phase-hdr{font-family:var(–fc);font-size:9px;letter-spacing:4px;text-transform:uppercase;
padding:12px 16px 0 18px;font-style:italic;}
.phase-block.pre .phase-hdr{color:var(–gold);}
.phase-block.during .phase-hdr{color:var(–amber);}
.phase-block.post .phase-hdr{color:var(–green);}
.phase-steps{padding:10px 16px 14px 18px;display:flex;flex-direction:column;gap:14px;}
.phase-step{display:flex;gap:12px;}
.phase-step-n{font-family:var(–fm);font-size:9px;color:var(–gold);min-width:16px;padding-top:2px;flex-shrink:0;}
.phase-step-body{}
.phase-step-title{font-family:var(–fh);font-size:14px;font-weight:700;font-style:italic;margin-bottom:2px;}
.phase-step-inst{font-family:var(–fc);font-size:13px;color:var(–cream);line-height:1.6;margin-bottom:3px;}
.phase-step-why{font-family:var(–fc);font-size:12px;color:var(–soft);font-style:italic;line-height:1.55;}
.crit-box{border:1px solid rgba(168,48,48,0.2);border-left:2px solid var(–red);
padding:14px 18px;margin-bottom:16px;}
.crit-lbl{font-family:var(–fc);font-size:8px;letter-spacing:4px;
text-transform:uppercase;color:var(–red);margin-bottom:5px;font-style:italic;}
.crit-text{font-family:var(–fc);font-size:14px;color:var(–white);font-style:italic;line-height:1.7;}
.shave-prod-card{border:1px solid var(–border);padding:16px;margin-bottom:8px;
position:relative;overflow:hidden;transition:border-color .25s;}
.shave-prod-card:hover{border-color:var(–goldb);}
.shave-prod-card::before{content:’’;position:absolute;left:0;top:0;bottom:0;
width:0;background:var(–gold);transition:width .3s;}
.shave-prod-card:hover::before{width:2px;}
.prod-priority{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;
font-family:var(–fm);font-size:7px;letter-spacing:2px;text-transform:uppercase;
margin-bottom:8px;}
.prod-priority.essential{border:1px solid var(–goldb);color:var(–gold);}
.prod-priority.recommended{border:1px solid var(–border2);color:var(–soft);}
.prod-priority.optional{border:1px solid var(–border2);color:var(–muted);}
.med-disclaimer{border:1px solid rgba(168,48,48,0.1);background:rgba(168,48,48,0.04);
padding:14px 18px;margin-top:20px;}
.med-disclaimer-lbl{font-family:var(–fc);font-size:8px;letter-spacing:4px;
text-transform:uppercase;color:var(–red);margin-bottom:5px;font-style:italic;}
.med-disclaimer-text{font-family:var(–fc);font-size:12px;color:var(–soft);
font-style:italic;line-height:1.65;}

/* GUIDES */
.guides-wrap{padding-top:32px;}
.guides-h{font-family:var(–fh);font-size:26px;font-weight:900;font-style:italic;margin-bottom:6px;}
.guides-s{font-family:var(–fc);font-size:14px;color:var(–soft);font-style:italic;margin-bottom:28px;}
.guide-card{border:1px solid var(–border);padding:28px;margin-bottom:12px;
position:relative;overflow:hidden;}
.guide-card::after{content:’’;position:absolute;top:0;left:0;right:0;height:1px;
background:linear-gradient(90deg,var(–gold),transparent);}
.guide-h{font-family:var(–fh);font-size:20px;font-weight:700;font-style:italic;margin-bottom:8px;}
.guide-s{font-family:var(–fc);font-size:14px;color:var(–soft);font-style:italic;
line-height:1.75;margin-bottom:18px;}
.guide-price{font-family:var(–fh);font-size:24px;color:var(–gold);font-style:italic;margin-bottom:14px;}
.guide-soon{font-family:var(–fc);font-size:11px;color:var(–soft);font-style:italic;margin-top:8px;text-align:center;}

/* MISC */
.sec-h{font-family:var(–fc);font-size:9px;letter-spacing:4px;text-transform:uppercase;
color:var(–soft);margin-bottom:14px;display:flex;align-items:center;gap:9px;font-style:italic;}
.sec-h::after{content:’’;flex:1;height:1px;background:var(–border);}
.sec-mark{color:var(–gold);}
.div-orn{display:flex;align-items:center;gap:10px;margin:18px 0;}
.div-orn::before,.div-orn::after{content:’’;flex:1;height:1px;background:var(–border);}
.div-orn-dot{color:var(–gold);font-size:7px;}
.disc{font-family:var(–fc);font-size:10px;color:var(–soft);text-align:center;
margin-top:12px;line-height:1.7;font-style:italic;}
.empty{text-align:center;padding:40px 20px;color:var(–soft);}
.empty-mark{font-family:var(–fh);font-size:28px;color:var(–goldb);margin-bottom:10px;font-style:italic;}
.empty-text{font-family:var(–fc);font-size:14px;font-style:italic;}
.dots{display:flex;gap:4px;}
.dot{width:4px;height:4px;background:var(–border2);border-radius:50%;}
.dot:nth-child(1){animation:blink 1.5s .0s infinite}
.dot:nth-child(2){animation:blink 1.5s .25s infinite}
.dot:nth-child(3){animation:blink 1.5s .5s infinite}
@keyframes blink{0%,100%{opacity:.2;background:var(–border2)}50%{opacity:1;background:var(–gold)}}

/* SEO METADATA injected via JS */

/* COMMUNITY */
.comm-wrap{padding-top:32px;}
.comm-h{font-family:var(–fh);font-size:24px;font-weight:900;font-style:italic;margin-bottom:5px;}
.comm-s{font-family:var(–fc);font-size:14px;color:var(–soft);font-style:italic;margin-bottom:22px;line-height:1.7;}
.post-card{border:1px solid var(–border);padding:20px;margin-bottom:8px;
position:relative;overflow:hidden;transition:border-color .25s;}
.post-card:hover{border-color:var(–goldb);}
.post-card::before{content:’’;position:absolute;top:0;left:0;right:0;height:1px;
background:linear-gradient(90deg,var(–gold),transparent);opacity:0;transition:opacity .3s;}
.post-card:hover::before{opacity:1;}
.post-meta{display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;}
.post-type{display:inline-flex;align-items:center;gap:4px;border:1px solid var(–goldb);
color:var(–gold);padding:2px 9px;font-family:var(–fm);font-size:8px;
letter-spacing:2px;text-transform:uppercase;}
.post-week{font-family:var(–fm);font-size:8px;color:var(–soft);letter-spacing:1px;}
.post-date{font-family:var(–fm);font-size:8px;color:var(–muted);margin-left:auto;}
.post-text{font-family:var(–fc);font-size:14px;line-height:1.8;color:var(–cream);
font-style:italic;margin-bottom:12px;}
.post-actions{display:flex;align-items:center;gap:12px;}
.post-like{background:none;border:1px solid var(–border);color:var(–soft);
padding:4px 12px;font-family:var(–fc);font-size:11px;cursor:pointer;
transition:all .25s;font-style:italic;display:flex;align-items:center;gap:4px;}
.post-like:hover{border-color:var(–goldb);color:var(–gold);}
.post-like-count{font-family:var(–fm);font-size:9px;color:var(–soft);letter-spacing:1px;}
.share-modal{border:1px solid var(–goldb);padding:24px;margin-bottom:16px;
position:relative;overflow:hidden;animation:fadeUp .3s ease;}
.share-modal::before{content:’’;position:absolute;top:0;left:0;right:0;height:2px;
background:linear-gradient(90deg,var(–gold),var(–gold2),transparent);}
.share-ta{width:100%;background:var(–s);border:1px solid var(–border);
padding:12px 14px;font-family:var(–fc);font-size:14px;color:var(–white);
outline:none;resize:none;font-style:italic;line-height:1.7;margin-bottom:10px;}
.share-ta::placeholder{color:var(–soft);}
.share-ta:focus{border-color:var(–goldb);}
.discord-cta{border:1px solid var(–border);padding:20px;margin-top:16px;
display:flex;align-items:center;justify-content:space-between;gap:14px;
background:var(–s);flex-wrap:wrap;}
.discord-icon{width:32px;height:32px;flex-shrink:0;}
.comm-posted{display:inline-flex;align-items:center;gap:6px;
font-family:var(–fc);font-size:12px;color:var(–green);font-style:italic;}

/* PRODUCT CARD ICON */
.prod-icon-wrap{width:56px;height:56px;border:1px solid var(–border);
display:flex;align-items:center;justify-content:center;flex-shrink:0;
background:var(–s);margin-bottom:10px;}

/* RTL support for Arabic */
[dir=“rtl”] .nav{flex-direction:row-reverse;}
[dir=“rtl”] .hero-body,[dir=“rtl”] .p-desc,[dir=“rtl”] .step-instruction,
[dir=“rtl”] .sci-text,[dir=“rtl”] .ins-text,[dir=“rtl”] .phase-step-inst{
text-align:right;direction:rtl;}
[dir=“rtl”] .period-hdr,[dir=“rtl”] .sec-h{flex-direction:row-reverse;}
[dir=“rtl”] .step-top{flex-direction:row-reverse;}
[dir=“rtl”] .step-links{flex-direction:row-reverse;}
[dir=“rtl”] .prof-strip{flex-direction:row-reverse;}
[dir=“rtl”] .ps-btns{flex-direction:row-reverse;}

/* Translation loading overlay */
.t-loading{position:fixed;inset:0;background:rgba(6,6,6,0.88);z-index:300;
display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;}
.t-loading-ring{width:36px;height:36px;border:1px solid var(–border2);
border-top-color:var(–gold);border-radius:50%;animation:rs 1.5s linear infinite;}
@keyframes rs{to{transform:rotate(360deg)}}
.t-loading-text{font-family:var(–fc);font-size:13px;color:var(–soft);font-style:italic;letter-spacing:2px;}

/* HAMBURGER MENU – hidden by default on desktop, shown on mobile */
.hamburger-btn{display:none;flex-direction:column;justify-content:center;
align-items:center;gap:5px;width:40px;height:40px;background:none;
border:1px solid var(–border);cursor:pointer;padding:0;flex-shrink:0;
transition:border-color .25s;}
.hamburger-btn:hover{border-color:var(–goldb);}
.hb-line{display:block;width:18px;height:1.5px;background:var(–soft);
transition:all .3s;transform-origin:center;}
.hb-line.open:nth-child(1){transform:translateY(6.5px) rotate(45deg);background:var(–gold);}
.hb-line.open:nth-child(2){opacity:0;transform:scaleX(0);}
.hb-line.open:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);background:var(–gold);}

@media(prefers-color-scheme:dark){:root{–soft:#B0A898;–cream:#E0DAD0;–white:#F5F0E8;}}
@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;}}
@media(forced-colors:active){.btn-p{background:Highlight;color:HighlightText;}.opt.sel{border-color:Highlight;}}

/* Mobile breakpoint – hamburger:flex comes AFTER display:none above so it wins */
@media(max-width:640px){
.path-grid{grid-template-columns:1fr;}
.mood-grid{grid-template-columns:1fr;}
.wrap{padding:0 14px 48px;}
.nav{padding:0 12px;gap:8px;}
.nav-c{display:none;}
.hamburger-btn{display:flex !important;}
}

/* Mobile full-width nav dropdown */
.mobile-menu{
position:fixed;top:54px;left:0;right:0;
background:var(–card);border-bottom:1px solid var(–goldb);
z-index:500;box-shadow:0 16px 48px rgba(0,0,0,0.8);
animation:slideDown .2s ease;}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.mobile-menu-item{
display:flex;align-items:center;gap:12px;
width:100%;background:none;
border:none;border-bottom:1px solid var(–border);
padding:16px 20px;font-family:var(–fh);font-size:17px;font-weight:600;
color:var(–soft);cursor:pointer;text-align:left;font-style:italic;
transition:background .15s,color .15s;}
.mobile-menu-item:hover{background:var(–gold3);color:var(–cream);}
.mobile-menu-item.active{background:var(–gold3);color:var(–gold);}
.mobile-menu-item:last-child{border-bottom:none;}
.mobile-menu-overlay{
position:fixed;inset:0;top:54px;background:rgba(0,0,0,0.5);
z-index:499;animation:fadeIn .2s ease;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}

/* OLIVE color override for success/positive states */
:root{–green:#5C6B3A;–green-light:rgba(92,107,58,0.15);}

/* – READABILITY UPGRADES —————————————————–
Three tiers:
Critical (16px)  – clinical finding, critical rule, product instructions
Reading  (15px)  – step instructions, summaries, week one, timeline
Support  (14px)  – why, clinical mechanism, severity, supporting text
Minimum  (13px)  – labels, badges, mood descriptions (nothing below this)
Cormorant Garamond reads optically smaller than its point size – all sizes
set 1-2px larger than equivalent sans-serif for equivalent perceived weight.
—————————————————————————— */

/* Body text */
.hero-body{font-size:17px;line-height:1.95;color:var(–cream);font-style:normal;}
.p-desc{font-size:16px;line-height:1.85;color:var(–cream);font-style:normal;}

/* Quiz */
.q-text{font-size:clamp(19px,3.2vw,28px);line-height:1.3;}
.q-hint{font-size:15px;color:var(–cream);font-style:normal;margin-bottom:22px;}
.opt-lbl{font-size:16px;color:var(–cream);font-style:normal;font-weight:500;}
.opt.sel .opt-lbl{color:var(–white);}
.opt{min-height:52px;padding:14px 16px;}

/* – SKIN ANALYSIS RESULTS ———————————— */
/* Profile banner */
.p-hl{font-size:17px;color:var(–gold);line-height:1.5;margin-bottom:10px;}
.p-sum{font-size:16px;line-height:1.9;color:var(–cream);font-style:normal;}

/* Product cards – skin routine */
.step-name{font-size:16px;}
.step-instruction{font-size:16px;line-height:1.8;color:var(–white);font-style:normal;}
.step-why{font-size:15px;line-height:1.8;color:var(–cream);font-style:normal;}
.sci-text{font-size:15px;line-height:1.85;color:var(–cream);font-style:normal;}

/* – SHAVE PROTOCOL RESULTS ———————————– */
/* Top findings – most critical text, largest size */
.shave-finding-text{font-size:16px;line-height:1.85;color:var(–white);font-style:normal;}
.shave-severity-text{font-size:15px;line-height:1.8;color:var(–cream);font-style:normal;}
.crit-text{font-size:16px;line-height:1.85;color:var(–white);font-style:normal;}

/* Three-phase steps (pre / during / post shave) */
.phase-step-title{font-size:15px;}
.phase-step-inst{font-size:15px;line-height:1.8;color:var(–white);font-style:normal;}
.phase-step-why{font-size:14px;line-height:1.75;color:var(–cream);font-style:normal;}

/* Insight boxes (week one, timeline, doctor warning) */
.ins-text{font-size:16px;line-height:1.85;color:var(–cream);font-style:normal;}
.ins-lbl{font-size:9px;letter-spacing:4px;}

/* Prevention and treatment product cards */
.step-instruction{font-size:16px;line-height:1.8;color:var(–white);font-style:normal;}
.step-why{font-size:15px;line-height:1.8;color:var(–cream);font-style:normal;}

/* – SHARED ACROSS BOTH PROTOCOLS —————————– */
/* Chat and community */
.msg.ai .msg-bubble{font-size:15px;line-height:1.8;color:var(–white);}
.post-text{font-size:15px;line-height:1.85;color:var(–cream);font-style:normal;}
.hist-text{font-size:15px;line-height:1.75;color:var(–cream);font-style:normal;}
.comm-s,.shave-s,.ci-s{font-size:15px;line-height:1.8;color:var(–cream);font-style:normal;}

/* Moods */
.mood-d{font-size:14px;color:var(–cream);font-style:normal;}
.mood-l{font-size:15px;}

/* Touch targets */
.btn{min-height:44px;font-size:13px;}
.mood-opt{min-height:72px;}

/* Soft text contrast */
:root{–soft:#B8AEA6;}

/* Focus rings */
button:focus-visible,a:focus-visible,input:focus-visible,
textarea:focus-visible,select:focus-visible{
outline:2px solid var(–gold);outline-offset:3px;border-radius:2px;}
`;

// – SEO INJECTION ———————————————————––
const injectSEO = (lang) => {
const titles = {
en:“SKINR – AI Skincare & Shaving Protocol for Men | getskinr.com”,
fr:“SKINR – Intelligence Cutanée et Rasage IA pour Hommes | getskinr.com”,
es:“SKINR – Análisis de Piel y Afeitado IA para Hombres | getskinr.com”,
};
const descs = {
en:“SKINR is the only free AI-powered skincare and shaving platform built exclusively for men. Answer 6 questions. Get a clinical skin profile, budget-matched product recommendations from multiple brands, and a personalised shaving protocol. Free. No appointments.”,
fr:“SKINR est la seule plateforme IA gratuite de soins de la peau et de rasage conçue exclusivement pour les hommes. 6 questions. Profil clinique. Produits adaptés à votre budget. Gratuit.”,
es:“SKINR es la única plataforma de IA gratuita para el cuidado de la piel y afeitado diseñada exclusivamente para hombres. 6 preguntas. Perfil clínico. Productos adaptados a tu presupuesto. Gratis.”,
};
const setMeta = (n, c, p=false) => {
const sel = p ? `meta[property="${n}"]` : `meta[name="${n}"]`;
let el = document.querySelector(sel);
if(!el){el=document.createElement(“meta”);p?el.setAttribute(“property”,n):el.setAttribute(“name”,n);document.head.appendChild(el);}
el.setAttribute(“content”,c);
};
const setLink = (rel, href) => {
let el=document.querySelector(`link[rel="${rel}"]`);
if(!el){el=document.createElement(“link”);el.setAttribute(“rel”,rel);document.head.appendChild(el);}
el.setAttribute(“href”,href);
};
document.title = titles[lang]||titles.en;
setMeta(“description”,descs[lang]||descs.en);
setMeta(“keywords”,“men skincare routine, best moisturizer men, razor bumps treatment, men oily skin, men dry skin, skincare quiz men, shaving protocol men, The Ordinary men, CeraVe men”);
setMeta(“robots”,“index, follow”);
setMeta(“og:title”,titles[lang]||titles.en,true);
setMeta(“og:description”,descs[lang]||descs.en,true);
setMeta(“og:type”,“website”,true);
setMeta(“og:url”,“https://www.getskinr.com”,true);
setMeta(“og:image”,“https://www.getskinr.com/og-image.jpg”,true);
setMeta(“twitter:card”,“summary_large_image”);
setMeta(“twitter:title”,titles[lang]||titles.en);
setMeta(“twitter:description”,descs[lang]||descs.en);
setMeta(“twitter:site”,”@getskinr”);
setLink(“canonical”,“https://www.getskinr.com”);
// JSON-LD
document.querySelectorAll(‘script[data-skinr]’).forEach(s=>s.remove());
const ld = (d) => {
const s=document.createElement(“script”);
s.type=“application/ld+json”;
s.setAttribute(“data-skinr”,“true”);
s.textContent=JSON.stringify(d);
document.head.appendChild(s);
};
ld({”@context”:“https://schema.org”,”@type”:“SoftwareApplication”,“name”:“SKINR”,“applicationCategory”:“HealthApplication”,“operatingSystem”:“Web”,“description”:descs.en,“url”:“https://www.getskinr.com”,“inLanguage”:[“en”,“fr”,“es”],“isAccessibleForFree”:true,“offers”:{”@type”:“Offer”,“price”:“0”,“priceCurrency”:“USD”},“featureList”:[“AI clinical skin analysis”,“Budget-matched product recommendations”,“Multi-brand product catalog”,“AI shaving protocol”,“Personalised daily routine”,“AI coaching”,“Progress tracking”],“audience”:{”@type”:“Audience”,“audienceType”:“Men aged 18–65”}});
ld({”@context”:“https://schema.org”,”@type”:“FAQPage”,“mainEntity”:[
{”@type”:“Question”,“name”:“What skincare products do men actually need?”,“acceptedAnswer”:{”@type”:“Answer”,“text”:“Men need a cleanser, a moisturiser, and SPF 30+. The specific products depend on your skin type. SKINR’s free analysis at getskinr.com recommends exact products from brands matched to your budget – from The Ordinary and CeraVe for budget tiers to Kiehl’s and SkinCeuticals for premium budgets.”}},
{”@type”:“Question”,“name”:“How do I get rid of razor bumps?”,“acceptedAnswer”:{”@type”:“Answer”,“text”:“Razor bumps are caused by curled hairs re-entering the skin. The most effective interventions are switching to a single-blade safety razor, applying adequate lubrication before shaving, and shaving with the grain only. SKINR’s shaving protocol at getskinr.com provides a personalised clinical protocol based on your specific method and skin type.”}},
{”@type”:“Question”,“name”:“What is the best skincare routine for oily skin men?”,“acceptedAnswer”:{”@type”:“Answer”,“text”:“For oily skin, men need a salicylic acid cleanser, a lightweight serum to regulate sebum (such as niacinamide or NAG), a lightweight oil-free moisturiser, and a non-comedogenic SPF. SKINR at getskinr.com provides a personalised oily skin protocol with exact products matched to your budget.”}},
{”@type”:“Question”,“name”:“Is SKINR free?”,“acceptedAnswer”:{”@type”:“Answer”,“text”:“Yes. The skin analysis, shaving protocol, product recommendations, and AI coach are all completely free at getskinr.com. Available in English, French, and Spanish.”}},
{”@type”:“Question”,“name”:“What is the correct order to apply skincare products?”,“acceptedAnswer”:{”@type”:“Answer”,“text”:“Apply skincare from thinnest to thickest texture. The correct order is: cleanser, toner or serum, moisturiser, then SPF in the morning. In the evening, omit SPF and add targeted treatments like retinol after serums. SKINR’s protocol at getskinr.com shows the exact application order for your specific products.”}},
]});
ld({”@context”:“https://schema.org”,”@type”:“Organization”,“name”:“SKINR”,“url”:“https://www.getskinr.com”,“description”:“AI-powered skincare and shaving protocol platform for men.”});
};

// – MAIN COMPONENT ————————————————————
export default function SkinrApp() {
const [lang, setLang]         = useState(“en”);
const [t, setT]               = useState(BASE_T);

const [langOpen, setLangOpen] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);
const [view, setView]         = useState(“home”);
const [profile, setProfile]   = useState(null);
const [answers, setAnswers]   = useState({});
const [currentQ, setCurrentQ] = useState(0);
const [selected, setSelected] = useState(null);
const [prevStack, setPrevStack]= useState([]); // back button history
const [anim, setAnim]         = useState(false);
const [loadStep, setLoadStep] = useState(0);
const [messages, setMessages] = useState([]);
const [inputVal, setInputVal] = useState(””);
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
const [shaveError, setShaveError]=useState(false);
const [savedShave, setSavedShave]=useState(null);
// email
const [showEmail, setShowEmail]=useState(false);
const [emailVal, setEmailVal] = useState(””);
const [emailDone, setEmailDone]=useState(false);
const [showPrivacy, setShowPrivacy]=useState(false);
const [showTerms, setShowTerms]=useState(false);
// Payment state
const [payModal, setPayModal]             = useState(null); // null | “biology” | “routine” | “combo”
const [payLoading, setPayLoading]         = useState(false);
const [payError, setPayError]             = useState(””);
const [paySuccess, setPaySuccess]         = useState(false);
const [stripeLoaded, setStripeLoaded]     = useState(false);
const [stripeObj, setStripeObj]           = useState(null);
const [cardElement, setCardElement]       = useState(null);
const [clientSecret, setClientSecret]     = useState(””);
const [emailSaved, setEmailSaved]=useState(null);
// community
const [communityPosts, setCommunityPosts] = useState([]);
const [showShare, setShowShare]           = useState(false);
const [shareText, setShareText]           = useState(””);
const [sharePosted, setSharePosted]       = useState(false);
const [postLikes, setPostLikes]           = useState({});
// User-submitted reviews
const [reviews, setReviews]               = useState([]);
const [reviewText, setReviewText]         = useState(””);
const [reviewName, setReviewName]         = useState(””);
const [reviewPosted, setReviewPosted]     = useState(false);
const [unlocked, setUnlocked]               = useState(false);
const [biologyUnlocked, setBiologyUnlocked]     = useState(false);
const [routineUnlocked, setRoutineUnlocked]     = useState(false);
const [shaveBioUnlocked, setShaveBioUnlocked]   = useState(false);
const [shaveCardUnlocked, setShaveCardUnlocked] = useState(false);
const [skincareGuideUnlocked, setSkincareGuideUnlocked] = useState(false);
const [shavingGuideUnlocked, setShavingGuideUnlocked]   = useState(false);
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
document.addEventListener(“mousedown”, handler);
return ()=>document.removeEventListener(“mousedown”, handler);
},[]);
const skinQs = getSkinQs(t, lang);
const shaveQs = [
{id:“method”,      q:t.shaveQ1, opts:t.shaveOpts1},
{id:“beard”,       q:t.shaveQ2, opts:t.shaveOpts2},
{id:“problem”,     q:t.shaveQ3, opts:t.shaveOpts3},
{id:“activeBumps”, q:t.shaveQ4, opts:t.shaveOpts4},
{id:“currentBlade”,q:t.shaveQ5, opts:t.shaveOpts5},
{id:“frequency”,   q:t.shaveQ6, opts:t.shaveOpts6},
{id:“budget”,      q:t.shaveQ7, opts:t.shaveOpts7},
];

// – CORE NAVIGATION & LANGUAGE (defined before useEffects that call them) –
const go = (v) => { setAnim(true); setTimeout(()=>{setView(v);setAnim(false);},220); };

// Language switching is now instant – no API calls, no spinner
const switchLang = (l) => {
setLang(l);
LS.set(SK.lang, l);
setLangOpen(false);
setT(getT(l));
document.documentElement.dir = LANGUAGES.find(x=>x.code===l)?.dir || “ltr”;
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
if(LS.get(“skinr2:unlocked”)) setUnlocked(true);
if(LS.get(“skinr2:biologyUnlocked”)) setBiologyUnlocked(true);
if(LS.get(“skinr2:routineUnlocked”)) setRoutineUnlocked(true);
if(LS.get(“skinr2:shaveBioUnlocked”)) setShaveBioUnlocked(true);
if(LS.get(“skinr2:shaveCardUnlocked”)) setShaveCardUnlocked(true);
if(LS.get(“skinr2:skincareGuideUnlocked”)) setSkincareGuideUnlocked(true);
if(LS.get(“skinr2:shavingGuideUnlocked”)) setShavingGuideUnlocked(true);
setCommunityPosts(LS.get(“skinr2:community”)||[]);
setPostLikes(LS.get(“skinr2:likes”)||{});
setReviews(LS.get(“skinr2:reviews”)||[]);
setLang(initialLang);
// Instant – static pre-translated files, zero API calls, zero delay
setT(getT(initialLang));
if(initialLang !== “en”){
document.documentElement.dir = LANGUAGES.find(x=>x.code===initialLang)?.dir || “ltr”;
}
setReady(true);
// eslint-disable-next-line react-hooks/exhaustive-deps
},[]);

useEffect(()=>{ injectSEO(lang); },[lang]);
useEffect(()=>{
if(view!==“analyzing”&&view!==“shave_loading”) return;
const iv=setInterval(()=>setLoadStep(p=>Math.min(p+1,t.loadSteps.length-1)),900);
return()=>clearInterval(iv);
},[view,lang]);
useEffect(()=>{chatRef.current?.scrollTo({top:chatRef.current.scrollHeight,behavior:“smooth”});},[messages]);

// Load Stripe.js once on mount – non-blocking, only when needed
// Publishable key is hardcoded – safe by design, Stripe built it to be public
const STRIPE_PK = “pk_live_51RNjveCi5YWsRAVAPPi9HGHutU3PY6bxnE1r5ty317sVlilm5eRH07ivsLnuddSNc9ydpNqQv280yfuwPuvBBtbt00t0MNZPwi”;
useEffect(()=>{
if(window.Stripe){ setStripeLoaded(true); setStripeObj(window.Stripe(STRIPE_PK)); return; }
const script = document.createElement(“script”);
script.src = “https://js.stripe.com/v3/”;
script.async = true;
script.onload = () => {
setStripeLoaded(true);
setStripeObj(window.Stripe(STRIPE_PK));
};
document.head.appendChild(script);
},[]);

// Open payment modal – fetch clientSecret from our Netlify function
const openPayment = async (product) => {
setPayModal(product);
setPayError(””);
setPaySuccess(false);
setPayLoading(true);
track(“begin_checkout”, {product, currency:“USD”});
try {
const res = await fetch(”/.netlify/functions/stripe”, {
method:“POST”,
headers:{“Content-Type”:“application/json”},
body: JSON.stringify({
product,
email: emailSaved || “”,
skinType: profile?.skinType || “”,
}),
});
const data = await res.json();
if(!res.ok || data.error) throw new Error(data.error || “Payment setup failed”);
setClientSecret(data.clientSecret);
} catch(e) {
setPayError(e.message);
}
setPayLoading(false);
};

// Payment Request Button state – handles Apple Pay + Google Pay
const [paymentRequest, setPaymentRequest] = useState(null);
const [prButtonAvailable, setPrButtonAvailable] = useState(false);

// Mount Stripe Card Element and Payment Request Button after clientSecret is ready
useEffect(()=>{
if(!clientSecret || !stripeObj || !payModal) return;

```
// -- PAYMENT REQUEST BUTTON (Apple Pay / Google Pay) --
const AMOUNTS = {
  "biology":1500,"routine":1200,"skin-combo":2200,
  "shave-biology":1500,"shave-card":1200,"shave-combo":2200,
  "skincare-guide":900,"shaving-guide":900,"guides-combo":1500,
};
const LABELS = {
  "biology":"SKINR Skin Biology Report","routine":"SKINR Routine Card","skin-combo":"SKINR Skin Bundle",
  "shave-biology":"SKINR Shave Biology Report","shave-card":"SKINR Shave Protocol Card","shave-combo":"SKINR Shave Bundle",
  "skincare-guide":"SKINR Skincare Guide","shaving-guide":"SKINR Shaving Guide","guides-combo":"SKINR Both Guides",
};
const amount = AMOUNTS[payModal] || 1500;
const label  = LABELS[payModal]  || "SKINR Report";

const pr = stripeObj.paymentRequest({
  country: "CA",
  currency: "usd",
  total: { label, amount },
  requestPayerEmail: true,
  requestPayerName: false,
});

pr.canMakePayment().then(result => {
  if(result) {
    setPrButtonAvailable(true);
    setPaymentRequest(pr);
    // Mount the button
    setTimeout(() => {
      const prContainer = document.getElementById("skinr-pr-button");
      if(!prContainer || prContainer.children.length > 0) return;
      const elements = stripeObj.elements();
      const prButton = elements.create("paymentRequestButton", {
        paymentRequest: pr,
        style: { paymentRequestButton: { theme:"dark", height:"48px" } },
      });
      prButton.mount("#skinr-pr-button");
    }, 100);
  }
});

pr.on("paymentmethod", async (ev) => {
  const { error: confirmError } = await stripeObj.confirmCardPayment(
    clientSecret,
    { payment_method: ev.paymentMethod.id },
    { handleActions: false }
  );
  if(confirmError) {
    ev.complete("fail");
    setPayError(confirmError.message);
  } else {
    ev.complete("success");
    // Unlock purchased product -- Apple Pay path
    const p = payModal;
    if(p==="biology"    || p==="skin-combo") { setBiologyUnlocked(true);     LS.set("skinr2:biologyUnlocked",true); }
    if(p==="routine"    || p==="skin-combo") { setRoutineUnlocked(true);     LS.set("skinr2:routineUnlocked",true); }
    if(p==="shave-biology"||p==="shave-combo"){ setShaveBioUnlocked(true);  LS.set("skinr2:shaveBioUnlocked",true); }
    if(p==="shave-card" || p==="shave-combo") { setShaveCardUnlocked(true);  LS.set("skinr2:shaveCardUnlocked",true); }
    if(p==="skincare-guide"||p==="guides-combo"){ setSkincareGuideUnlocked(true); LS.set("skinr2:skincareGuideUnlocked",true); }
    if(p==="shaving-guide" ||p==="guides-combo"){ setShavingGuideUnlocked(true);  LS.set("skinr2:shavingGuideUnlocked",true); }
    if(ev.payerEmail) setEmailSaved(ev.payerEmail);
    LS.set("skinr2:purchasedProduct", payModal);
    setPaySuccess(true);
    setTimeout(()=>{ setPayModal(null); setPaySuccess(false); setCardElement(null); setClientSecret(""); setPaymentRequest(null); setPrButtonAvailable(false); }, 3500);
  }
});

// -- CARD ELEMENT --
const container = document.getElementById("skinr-card-element");
if(!container || container.children.length > 0) return;
const elements = stripeObj.elements();
const card = elements.create("card", {
  style:{
    base:{
      color:"#F2EEE6", fontFamily:"'Josefin Sans', sans-serif",
      fontSize:"15px", "::placeholder":{color:"#4E4844"},
      iconColor:"#B8972A",
    },
    invalid:{color:"#9E2B2B"},
  },
});
card.mount("#skinr-card-element");
setCardElement(card);
return ()=>{
  try{ card.destroy(); }catch(_){}
  setPaymentRequest(null);
  setPrButtonAvailable(false);
};
```

},[clientSecret, stripeObj, payModal]); // eslint-disable-line

// Confirm payment – card data goes directly to Stripe, never to our server
const confirmPayment = async () => {
if(!stripeObj || !cardElement || !clientSecret) return;
setPayLoading(true);
setPayError(””);
try {
const result = await stripeObj.confirmCardPayment(clientSecret, {
payment_method:{
card: cardElement,
billing_details:{ email: emailSaved || undefined },
},
});
if(result.error) {
throw new Error(result.error.message);
}
if(result.paymentIntent?.status === “succeeded”) {
// Unlock only what was purchased
const p = payModal;
if(p===“biology”    || p===“skin-combo”) { setBiologyUnlocked(true);     LS.set(“skinr2:biologyUnlocked”,true); }
if(p===“routine”    || p===“skin-combo”) { setRoutineUnlocked(true);     LS.set(“skinr2:routineUnlocked”,true); }
if(p===“shave-biology”|| p===“shave-combo”){ setShaveBioUnlocked(true); LS.set(“skinr2:shaveBioUnlocked”,true); }
if(p===“shave-card” || p===“shave-combo”) { setShaveCardUnlocked(true);  LS.set(“skinr2:shaveCardUnlocked”,true); }
if(p===“skincare-guide”||p===“guides-combo”){ setSkincareGuideUnlocked(true); LS.set(“skinr2:skincareGuideUnlocked”,true); }
if(p===“shaving-guide” ||p===“guides-combo”){ setShavingGuideUnlocked(true);  LS.set(“skinr2:shavingGuideUnlocked”,true); }
LS.set(“skinr2:purchasedProduct”, p);
track(“purchase”, {
transaction_id: result.paymentIntent.id,
value: result.paymentIntent.amount / 100,
currency: “USD”,
items: [{item_id: p, item_name: p}],
});
setPaySuccess(true);
// Send purchase confirmation email
const purchasedEmail = emailSaved || “”;
if(purchasedEmail) {
try {
await fetch(“https://formspree.io/f/261158684435060”, {
method:“POST”,
headers:{“Content-Type”:“application/json”},
body: JSON.stringify({
*subject:“SKINR Purchase Confirmed”,
email: purchasedEmail,
product: payModal,
skinType: profile?.skinType || “Not analysed”,
source:“SKINR Payment Confirmation”,
}),
});
} catch(*) {}
}
setTimeout(()=>{ setPayModal(null); setPaySuccess(false); setCardElement(null); setClientSecret(””); }, 3500);
}
} catch(e) {
setPayError(e.message);
}
setPayLoading(false);
};

const saveChat = useCallback((m)=>{ LS.set(SK.chat, m.slice(-30)); },[]);
const toggleSci = (id) => setExpanded(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
const has = !!profile;
const hasShave = !!savedShave;

// – SKIN QUIZ –
const startSkinQuiz = () => {
setAnswers({}); setCurrentQ(0); setSelected(null); setPrevStack([]); go(“quiz”);
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
setPrevStack(p=>[…p,{selected,answers:{…answers}}]);
const next = {…answers,[skinQs[currentQ].id]:selected};
setAnswers(next);
if(currentQ < skinQs.length-1){
setAnim(true); setTimeout(()=>{setCurrentQ(p=>p+1);setSelected(null);setAnim(false);},220);
} else {
setView(“analyzing”); setLoadStep(0); runSkinAnalysis(next);
}
};

const runSkinAnalysis = async (ans) => {
try {
const prompt = buildSkinPrompt(ans, lang);
const raw = await callAI([{role:“user”,content:prompt}]);
console.log(“Skin raw response length:”, raw.length, “preview:”, raw.slice(0,100));
const parsed = parseJSON(raw);
if(!parsed){
console.error(“Skin JSON parse failed. Raw:”, raw.slice(0,300));
throw new Error(“Parse failed”);
}
const full = {…parsed, answers:ans, createdAt:Date.now(), lang};
setProfile(full);
LS.set(SK.profile, full);
track(“skin_analysis_complete”, {skin_type: parsed.skinType, lang});
const intro = [{role:“ai”,text:parsed.coachIntro||“Your analysis is complete. How can I help you?”}];
setMessages(intro); saveChat(intro);
setTimeout(()=>{ setView(“results”); setShowEmail(!LS.get(SK.email)); },600);
} catch(e) {
setView(“home”);
}
};

// – SHAVE QUIZ –
const startShaveQuiz = () => {
setShaveStep(0); setShaveAns({}); setShaveSel(null);
setShaveResult(null); setShavePrev([]); setShaveError(false);
go(“shave”);
};

// On mount – if savedShave exists, populate shaveResult so returning users
// see their protocol immediately without regenerating
useEffect(() => {
if (savedShave && !shaveResult) {
setShaveResult(savedShave);
}
}, [savedShave]); // eslint-disable-line
const handleShaveBack = () => {
if(shavePrev.length===0) return;
const prev = shavePrev[shavePrev.length-1];
setShaveStep(p=>p-1); setShaveSel(prev.sel); setShaveAns(prev.ans); setShavePrev(p=>p.slice(0,-1));
};
const handleShaveNext = async () => {
if (!shaveSel) return;
setShavePrev(p => […p, { sel: shaveSel, ans: { …shaveAns } }]);
const next = { …shaveAns, [shaveQs[shaveStep].id]: shaveSel };
setShaveAns(next);
if (shaveStep < shaveQs.length - 1) {
setShaveStep(p => p + 1);
setShaveSel(null);
} else {
setShaveError(false);
setShaveLoad(true);
await runShaveAnalysis(next);
setShaveLoad(false);
}
};
const runShaveAnalysis = async (ans) => {
// – STAGE 1: Diagnosis + Blade (fast, ~3-5 seconds) –––––––––––
let diagnosis = null;
for (let attempt = 1; attempt <= 3; attempt++) {
try {
console.log(`Shave stage 1, attempt ${attempt}/3`);
const raw = await callAI([{ role: “user”, content: buildShavePrompt1(ans, profile, lang) }], “”, 800);
console.log(`Stage 1 attempt ${attempt} -> length=${raw.length}`);
if (!raw || raw.length < 30) { console.warn(“Stage 1 empty – retry”); continue; }
const parsed = parseJSON(raw);
if (!parsed?.clinicalFinding) { console.warn(“Stage 1 parse failed:”, raw.slice(0, 100)); continue; }
diagnosis = parsed;
break;
} catch (e) { console.error(`Stage 1 attempt ${attempt}:`, e.message); }
}

```
if (!diagnosis) {
  console.error("Stage 1 failed -- all attempts exhausted");
  setShaveError(true);
  return;
}

// Show partial results immediately -- user can read while stage 2 loads
setShaveResult(diagnosis);

// -- STAGE 2: Protocol + Products (loads progressively while user reads) --
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    console.log(`Shave stage 2, attempt ${attempt}/3`);
    const raw = await callAI([{ role: "user", content: buildShavePrompt2(ans, diagnosis.clinicalFinding, lang) }], "", 1200);
    console.log(`Stage 2 attempt ${attempt} -> length=${raw.length}`);
    if (!raw || raw.length < 30) { console.warn("Stage 2 empty -- retry"); continue; }
    const parsed = parseJSON(raw);
    if (!parsed?.preShave) { console.warn("Stage 2 parse failed:", raw.slice(0, 100)); continue; }
    // Merge stage 2 into the already-displayed stage 1 result
    const full = { ...diagnosis, ...parsed };
    setShaveResult(full);
    setSavedShave({ ...full, answers: ans });
    LS.set(SK.shave, { ...full, answers: ans });
    track("shave_protocol_complete", {bumps: ans.activeBumps, method: ans.method, lang});
    if (!LS.get(SK.email)) setShowEmail(true);
    return;
  } catch (e) { console.error(`Stage 2 attempt ${attempt}:`, e.message); }
}
// Stage 2 failed but stage 1 succeeded -- save partial result, still useful
console.warn("Stage 2 failed -- saving partial result from stage 1");
setSavedShave({ ...diagnosis, answers: ans });
LS.set(SK.shave, { ...diagnosis, answers: ans });
if (!LS.get(SK.email)) setShowEmail(true);
```

};

// – COACH –
const sendMsg = async () => {
const text = inputVal.trim(); if(!text||coachLoad) return;
setInputVal(””); const upd=[…messages,{role:“user”,text}]; setMessages(upd); setCoachLoad(true);
const ln=(LANGUAGES.find(l=>l.code===lang)?.label || “English”);
const sys=`You are a precise clinical skincare coach for men. Respond ONLY in ${ln}. Profile: ${JSON.stringify(profile||{})}. Be direct, specific, and clinical. Maximum 3 sentences. No generic advice.`;
try {
const r = await callAI(upd.map(m=>({role:m.role===“ai”?“assistant”:“user”,content:m.text})),sys);
const f=[…upd,{role:“ai”,text:r}]; setMessages(f); saveChat(f);
} catch(_){ setMessages([…upd,{role:“ai”,text:“An error occurred. Please try again.”}]); }
setCoachLoad(false);
};

// – CHECKIN –
const submitCheckin = async () => {
if(!checkinMood||ciLoad) return; setCiLoad(true);
try {
const advice = await callAI([{role:“user”,content:buildCheckinPrompt(checkinMood,profile,checkins,lang)}]);
const entry = {
date: new Date().toLocaleDateString(lang===“fr”?“fr-FR”:lang===“es”?“es-ES”:“en-GB”,{month:“short”,day:“numeric”}),
mood: checkinMood, advice:advice.trim(), ts:Date.now()
};
const upd=[entry,…checkins].slice(0,20); setCheckins(upd); LS.set(SK.checkins,upd); setCheckinMood(null);
} catch(_){}
setCiLoad(false);
};

// – BIOLOGY REPORT GENERATION –
const generateBioReport = async () => {
if(!profile||bioLoad) return;
setBioLoad(true);
const ln=(LANGUAGES.find(l=>l.code===lang)?.label || “English”);
const prompt = `You are a dermatologist and cell biologist. Write a complete, detailed skin biology report for this man in ${ln}. This is a paid report – it must be comprehensive, precise, and genuinely educational.

Patient profile: ${JSON.stringify(profile)}
Skin type: ${profile.skinType}
Answers: ${JSON.stringify(profile.answers)}

Write in flowing prose (no bullet points). Cover:

1. WHAT YOUR SKIN TYPE MEANS AT A CELLULAR LEVEL – explain the sebaceous gland activity, keratinocyte behaviour, and barrier function specific to this skin type
1. WHY YOUR SKIN BEHAVES THIS WAY – genetic and environmental factors that determine this skin type
1. THE MECHANISM OF ACTION OF YOUR RECOMMENDED INGREDIENTS – for each key ingredient in their protocol, explain precisely how it works at a molecular level
1. YOUR LONG-TERM SKIN TRAJECTORY – what happens to this skin type over time, how it changes by decade, what to expect
1. WHAT HAPPENS IF YOU FOLLOW THE PROTOCOL – specific physiological changes in the first 4 weeks, 3 months, and 6 months
1. WHAT HAPPENS IF YOU DON’T – specific long-term consequences of neglecting this skin type
1. SEASONAL ADJUSTMENTS – specific protocol changes for winter and summer
1. THE FIVE INGREDIENTS YOU MUST NEVER USE – specific to this skin type and why at a chemical level

Write at the level of a highly educated non-specialist. Precise but accessible. Approximately 800-1000 words total.`;
try {
const text = await callAI([{role:“user”,content:prompt}], “”, 4000);
setBioReport(text);
// Send biology report to email
if(emailSaved && text) {
try {
await fetch(“https://formspree.io/f/261158684435060”, {
method:“POST”, headers:{“Content-Type”:“application/json”},
body: JSON.stringify({
*subject:“Your SKINR Biology Report”,
email: emailSaved,
skinType: profile.skinType,
biologyReport: text,
source:“SKINR Biology Report Delivery”,
}),
});
} catch(*) {}
}
} catch(_){}
setBioLoad(false);
};

// – ROUTINE CARD GENERATION –
const generateRoutineCard = async () => {
if(!profile||cardLoad) return;
setCardLoad(true);
const ln=(LANGUAGES.find(l=>l.code===lang)?.label || “English”);
const prompt = `You are a clinical dermatologist creating a premium personalised routine card in ${ln}. Return ONLY valid JSON – no markdown.

Patient: skinType=${profile.skinType}, concern=${profile.answers?.concern||“general”}, age=${profile.answers?.age||“adult”}, sensitivity=${profile.answers?.sensitivity||“normal”}, budget=${profile.answers?.budget||“mid”}
Morning products: ${profile.morning?.map(p=>p.product+” (”+p.brand+”)”).join(”, “)||“from profile”}
Evening products: ${profile.evening?.map(p=>p.product+” (”+p.brand+”)”).join(”, “)||“from profile”}

Return this exact JSON:
{
“title”: “Personalised ${profile.skinType} Routine Card”,
“morning”: [
{
“step”: 1,
“product”: “exact product name”,
“brand”: “brand name”,
“instruction”: “Precise how-to: amount, technique, direction. E.g. Wet face. Dispense 2 pumps. Massage 45 seconds in circular motions. Rinse with cool water.”,
“timing”: “e.g. 30 seconds”,
“why”: “Clinical reason this step matters for this specific skin type – one sentence”
}
],
“evening”: [same structure, 2-3 steps, no SPF],
“goldenRules”: [
“Most important rule specific to this skin type – max 12 words”,
“Second rule”,
“Third rule”
],
“weeklyAdd”: “One weekly treatment specifically for this skin type – product and method”,
“rememberLine”: “The single most powerful thing to remember about this skin – one sentence”
}

Rules:

- Morning: 3-4 steps ending with SPF. First step is always cleanser.
- Evening: 2-3 steps. Never include SPF. Last step is always moisturiser.
- instruction must be specific: exact ml/drops/pumps, exact technique, exact duration
- why must explain the clinical mechanism for THIS skin type specifically
- goldenRules must be personalised – not generic advice any person could give`;
  try {
  const raw = await callAI([{role:“user”,content:prompt}], “”, 2000);
  const parsed = parseJSON(raw);
  if(parsed) {
  setCardReport(parsed);
  // Auto-send routine card to email if we have it
  if(emailSaved) {
  try {
  await fetch(“https://formspree.io/f/261158684435060”, {
  method:“POST”, headers:{“Content-Type”:“application/json”},
  body: JSON.stringify({
  *subject:“Your SKINR Routine Card”,
  email: emailSaved,
  skinType: profile.skinType,
  routineCard: JSON.stringify(parsed, null, 2),
  source:“SKINR Routine Card Delivery”,
  }),
  });
  } catch(*) {}
  }
  }
  } catch(_){}
  setCardLoad(false);
  };
  
  // – EMAIL CAPTURE –
  const submitEmail = async () => {
  if(!emailVal.trim()) return;
  LS.set(SK.email, emailVal.trim());
  setEmailSaved(emailVal.trim());
  track(“email_capture”, {source: “modal”});
  setEmailDone(true);
  // Send to Formspree – sign up free at formspree.io and replace YOUR_FORM_ID
  try {
  await fetch(“https://formspree.io/f/261158684435060”, {
  method: “POST”,
  headers: {“Content-Type”:“application/json”},
  body: JSON.stringify({
  email: emailVal.trim(),
  skinType: profile?.skinType || “Not analysed”,
  shaveProblem: savedShave?.answers?.problem || “Not analysed”,
  source: “SKINR Protocol Capture”,
  _subject: “New SKINR Protocol Request”,
  }),
  });
  } catch(e) { /* Formspree will retry – do not show error to user */ }
  setTimeout(()=>{ setShowEmail(false); setEmailDone(false); }, 2500);
  };
  
  // – COMMUNITY –
  const submitPost = () => {
  if(!shareText.trim()) return;
  const skinW = profile?.checkins?.length || checkins.length;
  const post = {
  id: Date.now().toString(),
  skinType: profile?.skinType || “SKINR Member”,
  shaveType: savedShave?.answers?.problem || null,
  week: Math.max(1, Math.ceil(checkins.length / 1)),
  text: shareText.trim(),
  date: new Date().toLocaleDateString(“en-GB”,{day:“numeric”,month:“short”}),
  ts: Date.now(),
  };
  const updated = [post,…communityPosts].slice(0,50);
  setCommunityPosts(updated);
  LS.set(“skinr2:community”, updated);
  setShareText(””); setShowShare(false); setSharePosted(true);
  setTimeout(()=>setSharePosted(false),3000);
  };
  
  const likePost = (id) => {
  const updated = {…postLikes,[id]:(postLikes[id]||0)+1};
  setPostLikes(updated); LS.set(“skinr2:likes”,updated);
  };
  
  const submitReview = async () => {
  if (!reviewText.trim()) return;
  const review = {
  id: Date.now().toString(),
  name: reviewName.trim() || (lang===“fr”?“Anonyme”:lang===“es”?“Anónimo”:“Anonymous”),
  text: reviewText.trim(),
  skinType: profile?.skinType || null,
  date: new Date().toLocaleDateString(lang===“fr”?“fr-CA”:lang===“es”?“es”:“en-CA”,{month:“short”,day:“numeric”,year:“numeric”}),
  };
  const updated = [review, …reviews].slice(0, 50);
  setReviews(updated); LS.set(“skinr2:reviews”, updated);
  try {
  await fetch(“https://formspree.io/f/261158684435060”, {
  method:“POST”, headers:{“Content-Type”:“application/json”},
  body: JSON.stringify({*subject:“New SKINR Review”, name:review.name, review:review.text, skinType:review.skinType||“Not analysed”}),
  });
  } catch(*) {}
  setReviewText(””); setReviewName(””); setReviewPosted(true);
  setTimeout(()=>setReviewPosted(false), 4000);
  };
  
  // – PRODUCT CATEGORY ICON –
  // Shows a category-specific SVG icon when no product image is available
  const ProductIcon = ({category}) => {
  const icons = {
  cleanser:    “M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z”,
  moisturizer: “M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z”,
  spf:         “M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z”,
  serum:       “M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z”,
  toner:       “M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z”,
  treatment:   “M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z”,
  “pre-shave”: “M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64z”,
  “shave-cream”:“M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64z”,
  razor:       “M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64z”,
  “post-shave”:“M7 11H1v2h6v-2zm1.17-3.24L6.75 6.34 5.34 7.75l1.41 1.41 1.42-1.42zM13 1h-2v6h2V1zm5.66 6.75l-1.41-1.41-1.42 1.42 1.41 1.41 1.42-1.42zM23 11h-6v2h6v-2zm-8 2.54V19H9v-5.46C7.21 12.6 6 10.44 6 8c0-3.31 2.69-6 6-6s6 2.69 6 6c0 2.44-1.21 4.6-3 5.54z”,
  treatment:   “M20 6h-2.18c.07-.44.18-.86.18-1.3C18 2.57 15.43 0 12.3 0c-1.7 0-3.2.8-4.2 2.04L7 3l-1.1-1C4.9.8 3.4 0 1.7 0-1.43 0-4 2.57-4 5.7c0 .44.11.86.18 1.3H-4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h24c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z”,
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
  
  // Nav items – only show sections relevant to the user’s progress
  // Home and Guides always visible. Others appear after completing analysis.
  // NAV_ITEMS – shown in desktop tab bar and mobile dropdown
  // HOME is placed next to the logo separately in JSX
  // GUIDES only shows after at least one protocol is completed
  const NAV_ITEMS = [
  …(has ? [{id:“results”,   l:t.nav.analysis}] : []),
  …(has ? [{id:“coach”,     l:t.nav.coach}]    : []),
  …(has ? [{id:“checkin”,   l:t.nav.checkin}]  : []),
  …(hasShave ? [{id:“shave”,l:t.nav.shave}]    : []),
  …((has||hasShave) ? [{id:“community”,l:t.nav.community}] : []),
  {id:“guides”, l:t.nav.guides}, // Always visible – guides are generic, no analysis needed
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
  
  ```
  {/* NAV */}
  <nav className="nav" role="navigation" aria-label="Main navigation">
  
    {/* Left -- logo + HOME immediately after */}
    <div style={{display:"flex",alignItems:"stretch",flexShrink:0}}>
      <button className="logo" onClick={()=>{go("home");setMenuOpen(false);}} aria-label="SKINR -- Home">
        <div className="logo-m" aria-hidden="true"/>{t.appName}
      </button>
      <button className={`ntab${view==="home"?" active":""}`}
        onClick={()=>go("home")} style={{paddingLeft:8,paddingRight:16}}
        aria-current={view==="home"?"page":undefined}>
        {t.nav.home}
      </button>
    </div>
  
    {/* Centre -- remaining nav tabs (desktop only) */}
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
  
    {/* Right -- hamburger (mobile) + language */}
    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
  
      {/* Hamburger -- mobile only */}
      <div ref={menuRef} style={{position:"relative"}}>
        <button className="hamburger-btn"
          onClick={()=>setMenuOpen(p=>!p)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}>
          <span className={`hb-line${menuOpen?" open":""}`}/>
          <span className={`hb-line${menuOpen?" open":""}`}/>
          <span className={`hb-line${menuOpen?" open":""}`}/>
        </button>
        {menuOpen&&(
          <>
            {/* Dimmed overlay -- tap to close */}
            <div className="mobile-menu-overlay" onClick={()=>setMenuOpen(false)}/>
            <div className="mobile-menu" role="menu">
              <button role="menuitem"
                className={`mobile-menu-item${view==="home"?" active":""}`}
                onClick={()=>{go("home");setMenuOpen(false);}}>
                <span style={{color:"var(--gold)",fontSize:8,opacity:view==="home"?1:0}}>*</span>
                {t.nav.home}
              </button>
              {NAV_ITEMS.map(tb=>(
                <button key={tb.id} role="menuitem"
                  className={`mobile-menu-item${view===tb.id?" active":""}`}
                  onClick={()=>{go(tb.id);setMenuOpen(false);}}>
                  <span style={{color:"var(--gold)",fontSize:8,opacity:view===tb.id?1:0}}>*</span>
                  {tb.l}
                </button>
              ))}
            </div>
          </>
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
          {LANGUAGES.find(l=>l.code===lang)?.native||"EN"}
          <span style={{fontSize:7,opacity:.6}}>{langOpen?"^":"v"}</span>
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
                {lang===l.code&&<span style={{color:"var(--gold)",fontSize:8}}>*</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  </nav>
  
  <div id="main-content" style={{width:"100%",display:"contents"}}>
  
  {/* -- HOME -- */}
  {view==="home"&&<div className="wrap fade-in">
    <div className="hero">
      <div className="hero-badge">{t.badge}</div>
      <div className="hero-h">{t.heroTitle}</div>
      <div className="hero-h2">{t.heroTitle2}</div>
      <div className="hero-rule"/>
      <p className="hero-body">{t.heroBody}</p>
  
      {/* Independence statement */}
      <div style={{
        display:"flex",alignItems:"flex-start",gap:14,
        border:"1px solid var(--border)",borderLeft:"3px solid var(--gold)",
        padding:"14px 18px",marginTop:28,background:"rgba(184,151,42,0.04)"
      }}>
        <div style={{color:"var(--gold)",fontSize:14,flexShrink:0,marginTop:1}}>*</div>
        <div>
          <div style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:3,
            color:"var(--gold)",textTransform:"uppercase",marginBottom:5}}>
            {lang==="fr"?"Indépendance Totale":lang==="es"?"Independencia Total":"Fully Independent"}
          </div>
          <div style={{fontFamily:"var(--fc)",fontSize:15,color:"var(--cream)",
            lineHeight:1.75,fontStyle:"normal"}}>
            {lang==="fr"
              ? "Aucune marque ne paie pour apparaître dans SKINR. Nos recommandations sont basées uniquement sur les preuves cliniques et ton profil cutané exact. Si un produit à 12 $ surpasse un produit à 80 $ pour ta biologie, c'est ce qu'on recommande."
              : lang==="es"
              ? "Ninguna marca paga para aparecer en SKINR. Nuestras recomendaciones se basan únicamente en evidencia clínica y tu perfil de piel exacto. Si un producto de $12 supera a uno de $80 para tu biología, eso es lo que recomendamos."
              : "No brand pays to appear in SKINR. Our recommendations are driven entirely by clinical evidence and your exact skin profile. If a $12 drugstore product outperforms an $80 premium one for your biology, that is what we recommend. Always."
            }
          </div>
        </div>
      </div>
    </div>
  
    <div className="path-sec">
      <div className="path-title">{t.pathTitle}</div>
      <div className="path-sub">{t.pathSub}</div>
      <div className="path-grid">
        {/* SHAVE CARD -- moved to position I (all men shave) */}
        <div className="path-card" onClick={startShaveQuiz} tabIndex={0} role="button"
          onKeyDown={e=>(e.key==="Enter"||e.key===" ")&&startShaveQuiz()}
          aria-label={`Start shave protocol: ${t.shaveCardTitle}`}>
          <div className="p-inner">
            <div className="p-num">I</div>
            <div className="p-tag">* {t.shaveCardTitle}</div>
            <div className="p-title">{t.shaveCardTitle}</div>
            <div className="p-desc">{t.shaveCardDesc}</div>
            <div className="p-pills">{t.shaveCardPills.map(p=><span key={p} className="p-pill">{p}</span>)}</div>
            <button className="p-btn">{t.shaveCardBtn}</button>
          </div>
        </div>
        {/* SKIN ANALYSIS CARD -- position II */}
        <div className="path-card" onClick={startSkinQuiz} tabIndex={0} role="button"
          onKeyDown={e=>(e.key==="Enter"||e.key===" ")&&startSkinQuiz()}
          aria-label={`Start skin analysis: ${t.skinCardTitle}`}>
          <div className="p-inner">
            <div className="p-num">II</div>
            <div className="p-tag">* {t.skinCardTitle}</div>
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
  
    {/* -- FOUNDER STORY FOOTER -- */}
    <footer style={{borderTop:"1px solid var(--border)",marginTop:52,paddingTop:40,paddingBottom:32,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(90deg,transparent,var(--gold),transparent)"}}/>
  
      {/* -- REVIEWS -- */}
      <div style={{marginBottom:48}}>
        <div style={{fontFamily:"var(--fm)",fontSize:8,letterSpacing:4,color:"var(--gold)",
          textTransform:"uppercase",marginBottom:6}}>
          {lang==="fr"?"Ce Que Les Hommes Disent":lang==="es"?"Lo Que Dicen Los Hombres":"What Men Are Saying"}
        </div>
        <div style={{fontFamily:"var(--fh)",fontSize:20,fontWeight:700,fontStyle:"italic",
          color:"var(--white)",marginBottom:24}}>
          {lang==="fr"?"De vrais résultats, de vrais hommes.":lang==="es"?"Resultados reales. Hombres reales.":"Real results. Real men."}
        </div>
  
        {/* Review submission form */}
        <div style={{border:"1px solid var(--border)",padding:"24px 20px",background:"var(--s)"}}>
          <div style={{fontFamily:"var(--fm)",fontSize:8,letterSpacing:4,color:"var(--gold)",
            textTransform:"uppercase",marginBottom:6}}>
            {lang==="fr"?"Partagez Votre Expérience":lang==="es"?"Comparte Tu Experiencia":"Share Your Experience"}
          </div>
          <div style={{fontFamily:"var(--fh)",fontSize:17,fontWeight:700,fontStyle:"italic",
            color:"var(--white)",marginBottom:8}}>
            {lang==="fr"?"Comment SKINR a changé ta routine?":lang==="es"?"¿Cómo cambió SKINR tu rutina?":"How has SKINR changed your routine?"}
          </div>
          <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",
            marginBottom:16,lineHeight:1.7}}>
            {lang==="fr"?"Ton retour aide les autres hommes à prendre de meilleures décisions pour leur peau.":lang==="es"?"Tu opinión ayuda a otros hombres a tomar mejores decisiones para su piel.":"Your experience helps other men make better decisions about their skin."}
          </div>
          {reviewPosted?(
            <div style={{fontFamily:"var(--fc)",fontSize:15,color:"var(--gold)",fontStyle:"italic",
              padding:"16px",border:"1px solid var(--goldb)",textAlign:"center"}}>
              * {lang==="fr"?"Merci -- on a bien reçu ton avis.":lang==="es"?"Gracias -- hemos recibido tu reseña.":"Thank you -- your review has been received."}
            </div>
          ):(
            <>
              <input
                style={{width:"100%",background:"var(--bg)",border:"1px solid var(--border)",
                  padding:"10px 14px",fontFamily:"var(--fc)",fontSize:14,color:"var(--white)",
                  marginBottom:10,outline:"none",fontStyle:"italic"}}
                placeholder={lang==="fr"?"Ton prénom (optionnel)":lang==="es"?"Tu nombre (opcional)":"Your first name (optional)"}
                value={reviewName} onChange={e=>setReviewName(e.target.value)}/>
              <textarea rows={4}
                style={{width:"100%",background:"var(--bg)",border:"1px solid var(--border)",
                  padding:"10px 14px",fontFamily:"var(--fc)",fontSize:14,color:"var(--white)",
                  resize:"vertical",outline:"none",fontStyle:"italic",marginBottom:12}}
                placeholder={lang==="fr"?"Ton type de peau, ce que tu as essayé, et ce qui a changé...":lang==="es"?"Tu tipo de piel, lo que intentaste, y lo que cambió...":"Your skin type, what you tried, and what changed for you..."}
                value={reviewText} onChange={e=>setReviewText(e.target.value)}/>
              <button className="btn btn-p" style={{width:"100%"}}
                onClick={submitReview} disabled={!reviewText.trim()}>
                {lang==="fr"?"Soumettre Mon Avis":lang==="es"?"Enviar Mi Reseña":"Submit My Review"}
              </button>
              <div style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--muted)",
                fontStyle:"italic",marginTop:8,textAlign:"center"}}>
                {lang==="fr"?"Les avis sont vérifiés avant publication. Tes données ne sont jamais vendues.":lang==="es"?"Las reseñas se verifican antes de publicarse. Tus datos nunca se venden.":"Reviews are verified before publishing. Your data is never sold."}
              </div>
            </>
          )}
  
          {/* Show real user-submitted reviews only */}
          {reviews.length>0&&(
            <div style={{marginTop:24,borderTop:"1px solid var(--border)",paddingTop:20}}>
              {reviews.slice(0,5).map((r,i)=>(
                <div key={r.id||i} style={{marginBottom:16,paddingBottom:16,
                  borderBottom:i<Math.min(reviews.length,5)-1?"1px solid var(--border)":"none"}}>
                  <div style={{fontFamily:"var(--fc)",fontSize:14,color:"var(--cream)",
                    fontStyle:"italic",lineHeight:1.8,marginBottom:8}}>&ldquo;{r.text}&rdquo;</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontFamily:"var(--fh)",fontSize:13,fontWeight:700,color:"var(--white)"}}>
                      {r.name}
                      {r.skinType&&<span style={{color:"var(--soft)",fontWeight:400,marginLeft:6,fontSize:11}}>· {r.skinType}</span>}
                    </div>
                    <div style={{fontFamily:"var(--fm)",fontSize:8,color:"var(--muted)",letterSpacing:2}}>{r.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  
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
          <div style={{width:14,height:14,border:"1px solid var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:6,color:"var(--gold)"}}>*</div>
          <span style={{fontFamily:"var(--fh)",fontSize:13,fontWeight:900,letterSpacing:3,color:"var(--white)",textTransform:"uppercase"}}>SKINR</span>
          <span style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--soft)",fontStyle:"italic"}}>-- getskinr.com</span>
        </div>
        <div style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--muted)",fontStyle:"italic",textAlign:"right",lineHeight:1.7}}>
          <div>Free. Clinical. Built for Men.</div>
          <div style={{marginTop:3}}>Amazon affiliate links support this free service at no extra cost to you.</div>
          <div style={{marginTop:3}}>© {new Date().getFullYear()} SKINR. {t.copyright}</div>
          <div style={{marginTop:8,display:"flex",gap:16,justifyContent:"flex-end",flexWrap:"wrap"}}>
            <button onClick={()=>setShowPrivacy(true)}
              style={{background:"none",border:"none",fontFamily:"var(--fc)",fontSize:11,
                color:"var(--muted)",fontStyle:"italic",cursor:"pointer",padding:0,
                textDecoration:"underline",textDecorationColor:"var(--border)"}}>
              Privacy Policy
            </button>
            <button onClick={()=>setShowTerms(true)}
              style={{background:"none",border:"none",fontFamily:"var(--fc)",fontSize:11,
                color:"var(--muted)",fontStyle:"italic",cursor:"pointer",padding:0,
                textDecoration:"underline",textDecorationColor:"var(--border)"}}>
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  
  </div>}
  
  {/* -- SKIN QUIZ -- */}
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
  
  {/* -- ANALYZING -- */}
  {view==="analyzing"&&<div className="wrap fade-in"><div className="load-wrap">
    <svg className="load-svg" width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="32" fill="none" stroke="#1A1A1A" strokeWidth="1"/>
      <circle cx="36" cy="36" r="32" fill="none" stroke="#C5A028" strokeWidth="1" strokeDasharray="18 183"/>
    </svg>
    <div className="load-h">{t.analyzing}</div>
    <div className="load-step">{t.loadSteps[loadStep]}</div>
    <div className="load-line"/>
  </div></div>}
  
  {/* -- RESULTS -- */}
  {view==="results"&&profile&&<div className="wrap fade-in">
    <div className="res-wrap">
      {/* Language mismatch -- results were generated in a different language */}
      {profile.lang && profile.lang !== lang && (
        <div style={{
          border:"2px solid var(--gold)",background:"var(--gold3)",
          padding:"16px 20px",marginBottom:16,position:"relative",overflow:"hidden"
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,
            background:"linear-gradient(90deg,var(--gold),var(--gold2),transparent)"}}/>
          <div style={{fontFamily:"var(--fm)",fontSize:8,letterSpacing:4,
            color:"var(--gold)",textTransform:"uppercase",marginBottom:6}}>
            Language Notice
          </div>
          <div style={{fontFamily:"var(--fc)",fontSize:15,color:"var(--white)",
            marginBottom:14,lineHeight:1.65}}>
            Your analysis was generated in English. Retake the 6-question quiz to get your
            full protocol in <strong>{LANGUAGES.find(l=>l.code===lang)?.native}</strong>.
            It only takes 60 seconds.
          </div>
          <button className="btn btn-p" onClick={startSkinQuiz}
            style={{width:"100%",fontSize:13}}>
            Retake in {LANGUAGES.find(l=>l.code===lang)?.native} -- 60 seconds
          </button>
        </div>
      )}
  
      <div className="prof-banner">
        <div className="p-code">{t.analysisComplete} -- {profile.code}</div>
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
      <div className="period-hdr"><span className="sec-mark">*</span> {t.morning}</div>
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
              <div className="step-price">{showPrice(step.estimatedPrice, lang)}</div>
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
      <div className="period-hdr" style={{marginTop:20}}><span className="sec-mark">*</span> {t.evening}</div>
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
              <div className="step-price">{showPrice(step.estimatedPrice, lang)}</div>
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
        <div className="ins-box warn"><div className="ins-lbl">{t.avoidLabel}</div><div className="ins-text">{profile.avoid}</div></div>
        <div className="ins-box tip"><div className="ins-lbl">{t.expertInsight}</div><div className="ins-text">{profile.proTip}</div></div>
        {profile.timeToResults&&<div className="ins-box tip"><div className="ins-lbl">{t.expectedTimeline}</div><div className="ins-text">{profile.timeToResults}</div></div>}
      </div>
  
      {/* Optional reports panel -- shown after skin analysis too */}
      {profile&&(
        <div style={{border:"1px solid var(--goldb)",marginTop:20,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,var(--gold),var(--gold2),transparent)"}}/>
          <div style={{padding:"18px 18px 0"}}>
            <div style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:3,color:"var(--gold)",textTransform:"uppercase",fontStyle:"italic",marginBottom:6}}>{t.optionalTitle}</div>
            <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",lineHeight:1.7,marginBottom:14}}>{t.optionalSub}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,background:"var(--border)",margin:"0 0 2px"}}>
            {/* Biology Report */}
            <div style={{background:"var(--card)",padding:"16px 18px"}}>
              <div style={{fontFamily:"var(--fh)",fontSize:15,fontWeight:700,fontStyle:"italic",marginBottom:6}}>{t.biologyTitle}</div>
              <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--soft)",fontStyle:"italic",lineHeight:1.65,marginBottom:12}}>{t.biologyDesc}</div>
              {biologyUnlocked?(
                bioReport?(
                  <div>
                    <div style={{fontFamily:"var(--fc)",fontSize:14,color:"var(--cream)",fontStyle:"normal",lineHeight:1.85,maxHeight:300,overflowY:"auto",marginBottom:12}}>{bioReport}</div>
                    {emailSaved&&(
                      <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--soft)",fontStyle:"italic",borderTop:"1px solid var(--border)",paddingTop:10,marginTop:10}}>
                        {lang==="fr"?"Ce rapport a été envoyé à ton courriel.":lang==="es"?"Este informe fue enviado a tu correo.":"This report has been sent to your email."}
                      </div>
                    )}
                  </div>
                ):(
                  <button className="btn btn-p" style={{width:"100%",fontSize:11}} onClick={generateBioReport} disabled={bioLoad}>{bioLoad?t.generatingLabel:t.generateReport}</button>
                )
              ):(
                <button className="btn btn-p" style={{width:"100%",fontSize:11}}
                  onClick={()=>openPayment("biology")}>
                  {t.unlockBtn} -- ${CONFIG.business.biologyReportPrice}
                </button>
              )}
            </div>
            {/* Routine Card */}
            <div style={{background:"var(--card)",padding:"16px 18px"}}>
              <div style={{fontFamily:"var(--fh)",fontSize:15,fontWeight:700,fontStyle:"italic",marginBottom:6}}>{t.routineCardTitle}</div>
              <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--soft)",fontStyle:"italic",lineHeight:1.65,marginBottom:12}}>{t.routineCardDesc}</div>
              {routineUnlocked?(
                cardReport?(
                  <div>
                    <div style={{fontFamily:"var(--fh)",fontSize:14,fontWeight:700,fontStyle:"italic",marginBottom:12,color:"var(--gold)"}}>{cardReport.title}</div>
                    {cardReport.morning?.length>0&&(
                      <div style={{marginBottom:14}}>
                        <div style={{fontFamily:"var(--fm)",fontSize:8,letterSpacing:3,color:"var(--gold)",textTransform:"uppercase",marginBottom:8}}> Morning</div>
                        {cardReport.morning.map((s,i)=>(
                          <div key={i} style={{marginBottom:10,paddingBottom:10,borderBottom:i<cardReport.morning.length-1?"1px solid var(--border)":"none"}}>
                            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                              <span style={{color:"var(--gold)",fontFamily:"var(--fm)",fontSize:10,flexShrink:0,marginTop:2}}>{i+1}.</span>
                              <div>
                                <div style={{fontFamily:"var(--fh)",fontSize:13,fontWeight:700,fontStyle:"italic",color:"var(--white)",marginBottom:2}}>{s.product}</div>
                                <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--cream)",fontStyle:"normal",lineHeight:1.65}}>{s.instruction}</div>
                                {s.timing&&<div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--soft)",letterSpacing:1,marginTop:3}}>{s.timing}</div>}
                                {s.why&&<div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--soft)",fontStyle:"italic",marginTop:3}}>{s.why}</div>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {cardReport.evening?.length>0&&(
                      <div style={{marginBottom:14}}>
                        <div style={{fontFamily:"var(--fm)",fontSize:8,letterSpacing:3,color:"var(--gold)",textTransform:"uppercase",marginBottom:8}}> Evening</div>
                        {cardReport.evening.map((s,i)=>(
                          <div key={i} style={{marginBottom:10,paddingBottom:10,borderBottom:i<cardReport.evening.length-1?"1px solid var(--border)":"none"}}>
                            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                              <span style={{color:"var(--gold)",fontFamily:"var(--fm)",fontSize:10,flexShrink:0,marginTop:2}}>{i+1}.</span>
                              <div>
                                <div style={{fontFamily:"var(--fh)",fontSize:13,fontWeight:700,fontStyle:"italic",color:"var(--white)",marginBottom:2}}>{s.product}</div>
                                <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--cream)",fontStyle:"normal",lineHeight:1.65}}>{s.instruction}</div>
                                {s.timing&&<div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--soft)",letterSpacing:1,marginTop:3}}>{s.timing}</div>}
                                {s.why&&<div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--soft)",fontStyle:"italic",marginTop:3}}>{s.why}</div>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {cardReport.goldenRules?.length>0&&(
                      <div style={{borderTop:"1px solid var(--border)",paddingTop:10,marginTop:4}}>
                        <div style={{fontFamily:"var(--fm)",fontSize:8,letterSpacing:3,color:"var(--gold)",textTransform:"uppercase",marginBottom:8}}>Golden Rules</div>
                        {cardReport.goldenRules.map((r,i)=>(
                          <div key={i} style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--cream)",fontStyle:"italic",marginBottom:4}}>* {r}</div>
                        ))}
                      </div>
                    )}
                    {cardReport.rememberLine&&(
                      <div style={{borderTop:"1px solid var(--border)",marginTop:10,paddingTop:10,color:"var(--gold)",fontStyle:"italic",fontSize:13,fontFamily:"var(--fc)"}}>{cardReport.rememberLine}</div>
                    )}
                  </div>
                ):(
                  <button className="btn btn-p" style={{width:"100%",fontSize:11}} onClick={generateRoutineCard} disabled={cardLoad}>{cardLoad?t.generatingLabel:t.generateCard}</button>
                )
              ):(
                <button className="btn btn-p" style={{width:"100%",fontSize:11}}
                  onClick={()=>openPayment("routine")}>
                  {t.unlockBtn} -- ${CONFIG.business.routineCardPrice}
                </button>
              )}
            </div>
          </div>
          {/* Combo row */}
          <div style={{padding:"14px 18px",background:"var(--s)",borderTop:"1px solid var(--border)"}}>
            {(biologyUnlocked&&routineUnlocked)?(
              <div style={{textAlign:"center",fontFamily:"var(--fc)",fontSize:12,color:"var(--green)",fontStyle:"italic"}}>{t.alreadyUnlocked}</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <button className="btn btn-p" style={{width:"100%",fontSize:12}}
                  onClick={()=>openPayment("skin-combo")}>
                  * {t.comboBtn} -- ${CONFIG.business.skinComboPrice} {lang==="fr"?"(meilleure valeur)":lang==="es"?"(mejor valor)":"(best value)"}
                </button>
                <div style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--muted)",fontStyle:"italic",textAlign:"center"}}>
                  {lang==="fr"?"Paiement sécurisé via Stripe":lang==="es"?"Pago seguro via Stripe":"Secured by Stripe -- card data never stored on our servers"}
                </div>
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
            <button className="btn btn-p" style={{width:"100%"}}>{t.guideBuyBtn} -- {t.guidePrice}</button>
          </a>
        </div>
      )}
  
      <p className="disc" style={{marginTop:16}}>{t.disclaimer}</p>
    </div>
  </div>}
  
  {/* -- COACH -- */}
  {view==="coach"&&<div className="wrap fade-in">
    <div className="coach-top">
      <div className="coach-status">{t.coachOnline}</div>
      <div className="coach-h">{t.coachTitle}</div>
      <div style={{fontFamily:"var(--fc)",fontSize:14,color:"var(--soft)",fontStyle:"italic"}}>{t.coachSub}</div>
    </div>
    <div className="sug-row">{t.suggestions.map(s=><button key={s} className="sug-btn" onClick={()=>setInputVal(s)}>{s}</button>)}</div>
    <div className="chat-win" ref={chatRef}>
      {messages.length===0&&<div className="empty"><div className="empty-mark">*</div><div className="empty-text">Complete your skin analysis to unlock the coach.</div></div>}
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
      <button className="chat-send" onClick={sendMsg} disabled={!inputVal.trim()||coachLoad}>-></button>
    </div>
  </div>}
  
  {/* -- CHECKIN -- */}
  {view==="checkin"&&<div className="wrap fade-in">
    <div className="ci-wrap">
      <div><div className="streak-b">* {checkins.length} sessions</div></div>
      <div className="ci-h">{t.checkinTitle}</div>
      <div className="ci-s">{t.checkinSub}</div>
      <div className="sec-h"><span className="sec-mark">*</span> {t.todayStatus}</div>
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
          * Share My Progress with the Community
        </button>
      )}
      {checkins.length>0&&<>
        <div className="sec-h"><span className="sec-mark">*</span> {t.progressHistory}</div>
        <div className="hist-list">{checkins.map((c,i)=>(
          <div className="hist-item" key={i}><div className="hist-date">{c.date}</div><div className="hist-text">{c.advice}</div></div>
        ))}</div>
      </>}
      {checkins.length===0&&<div className="empty"><div className="empty-mark">*</div><div className="empty-text">{t.noHistory}</div></div>}
    </div>
  </div>}
  
  {/* -- SHAVE -- */}
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
          <circle cx="32" cy="32" r="28" fill="none" stroke="#B8972A" strokeWidth="1" strokeDasharray="16 160"/>
        </svg>
        <div className="load-h" style={{fontSize:20}}>Building your protocol</div>
        <div className="load-line"/>
      </div>}
  
      {/* Error state -- shown when all 3 attempts fail */}
      {shaveError&&!shaveLoad&&!shaveResult&&(
        <div style={{textAlign:"center",padding:"48px 0"}}>
          <div style={{fontFamily:"var(--fh)",fontSize:22,fontStyle:"italic",marginBottom:12,color:"var(--white)"}}>
            Analysis timed out
          </div>
          <div style={{fontFamily:"var(--fc)",fontSize:15,color:"var(--soft)",fontStyle:"italic",marginBottom:24,lineHeight:1.8}}>
            The server took too long to respond. This happens occasionally.<br/>
            Your answers are saved -- click below to try again.
          </div>
          <button className="btn btn-p" style={{width:"100%",maxWidth:320}}
            onClick={()=>{
              setShaveError(false);
              setShaveLoad(true);
              runShaveAnalysis(shaveAns).then(()=>setShaveLoad(false));
            }}>
            * Try Again
          </button>
          <button className="btn btn-g" style={{width:"100%",maxWidth:320,marginTop:10}}
            onClick={()=>{setShaveError(false);setShaveStep(0);setShaveAns({});setShaveSel(null);}}>
            Start Over
          </button>
        </div>
      )}
  
      {/* Results -- shown as soon as stage 1 completes */}
      {shaveResult&&<>
  
        {/* Stage 2 still loading indicator */}
        {shaveLoad&&(
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",
            border:"1px solid var(--goldb)",background:"var(--gold3)",marginBottom:12}}>
            <div style={{width:14,height:14,border:"1px solid var(--gold)",
              borderTopColor:"transparent",borderRadius:"50%",
              animation:"rs 1.2s linear infinite",flexShrink:0}}/>
            <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--gold)",fontStyle:"italic"}}>
              {t.loadingProtocol}
            </div>
          </div>
        )}
  
        {/* -- CLINICAL FINDING -- */}
        {shaveResult.clinicalFinding&&(
          <div className="shave-finding">
            <div className="shave-finding-lbl">{t.shaveCritical}</div>
            <div className="shave-finding-text">{shaveResult.clinicalFinding}</div>
          </div>
        )}
  
        {/* -- SEVERITY ASSESSMENT -- */}
        {shaveResult.severityAssessment&&(
          <div className="shave-severity">
            <div className="shave-severity-lbl">{t.clinicalAssessmentLabel}</div>
            <div className="shave-severity-text">{shaveResult.severityAssessment}</div>
          </div>
        )}
  
        {/* -- CRITICAL RULE -- */}
        {shaveResult.criticalRule&&(
          <div className="crit-box">
            <div className="crit-lbl">{t.criticalRuleLabel}</div>
            <div className="crit-text">{shaveResult.criticalRule}</div>
          </div>
        )}
  
        {/* -- BLADE & RAZOR RECOMMENDATION -- */}
        {shaveResult.bladeRecommendation&&(()=>{
          const br = shaveResult.bladeRecommendation;
          return(
          <div style={{border:"1px solid var(--goldb)",position:"relative",overflow:"hidden",marginBottom:12}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,var(--gold),var(--gold2),transparent)"}}/>
            <div style={{padding:"18px 18px 0"}}>
              <div className="sec-h"><span className="sec-mark">*</span> {t.bladeSection}</div>
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
                  <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",fontStyle:"italic",marginBottom:4}}>{t.techniqueLabel}</div>
                  <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",lineHeight:1.65}}>{br.techniqueAdjustment}</div>
                </div>
              )}
  
              {/* Recommended blades */}
              {br.recommendedBlades?.length>0&&<>
                <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",fontStyle:"italic",marginBottom:10}}>{t.recommendedBladesLabel}</div>
                {br.recommendedBlades.map((blade,i)=>(
                  <div key={i} style={{border:"1px solid var(--border)",padding:"12px 14px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:4}}>
                      <div style={{fontFamily:"var(--fh)",fontSize:14,fontWeight:600,fontStyle:"italic"}}>{blade.name}</div>
                      <div style={{fontFamily:"var(--fh)",fontSize:13,color:"var(--gold)",fontStyle:"italic",whiteSpace:"nowrap"}}>{showPrice(blade.estimatedPrice, lang)}</div>
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
                  <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--amber)",fontStyle:"italic",marginBottom:4}}>{t.transitionLabel}</div>
                  <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",lineHeight:1.6}}>{br.transitionNote}</div>
                </div>
              )}
            </div>
          </div>
        );})()}
  
        {/* -- THREE PHASES -- */}
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
  
        {/* -- PREVENTION PRODUCTS -- */}
        {shaveResult.preventionProducts?.length>0&&<>
          <div className="sec-h" style={{marginTop:20}}><span className="sec-mark">*</span> {t.preventionProducts}</div>
          {shaveResult.preventionProducts.map((p,i)=>(
            <div className="shave-prod-card" key={i}>
              <div className={`prod-priority ${p.priority||"recommended"}`}>
                * {(p.priority||"recommended").toUpperCase()}
              </div>
              <div className="step-top">
                <div className="step-name">{p.name}</div>
                <div className="step-price">{showPrice(p.estimatedPrice, lang)}</div>
              </div>
              <div className="step-brand">{p.brand}</div>
              {p.knownRating&&<div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--green)",letterSpacing:1,margin:"4px 0 8px"}}>★ {p.knownRating}</div>}
              <div style={{borderLeft:"2px solid var(--goldb)",paddingLeft:10,marginBottom:8}}>
                <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",fontStyle:"italic",marginBottom:3}}>{t.keyIngredientLabel}</div>
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
  
        {/* -- ACTIVE BUMP TREATMENT (only if bumps present) -- */}
        {shaveResult.treatmentProducts?.length>0&&<>
          <div className="sec-h" style={{marginTop:16}}>
            <span style={{color:"var(--red)"}}>*</span>
            <span style={{color:"var(--red)"}}> {t.treatmentProducts}</span>
            <div style={{flex:1,height:1,background:"rgba(168,48,48,0.3)"}}/>
          </div>
          {shaveResult.treatmentProtocol&&(
            <div style={{border:"1px solid rgba(168,48,48,0.2)",borderLeft:"2px solid var(--red)",padding:"12px 16px",marginBottom:12}}>
              <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:4,textTransform:"uppercase",color:"var(--red)",fontStyle:"italic",marginBottom:6}}>{t.treatmentProtocolLabel}</div>
              <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",lineHeight:1.7}}>{shaveResult.treatmentProtocol}</div>
            </div>
          )}
          {shaveResult.treatmentProducts.map((p,i)=>(
            <div className="shave-prod-card" key={i} style={{borderColor:"rgba(168,48,48,0.2)"}}>
              <div style={{display:"flex",gap:6,marginBottom:8}}>
                <div style={{border:"1px solid rgba(168,48,48,0.3)",color:"var(--red)",padding:"2px 8px",fontFamily:"var(--fm)",fontSize:8,letterSpacing:2,textTransform:"uppercase"}}>{t.treatmentBadge}</div>
              </div>
              <div className="step-top">
                <div className="step-name">{p.name}</div>
                <div className="step-price">{showPrice(p.estimatedPrice, lang)}</div>
              </div>
              <div className="step-brand">{p.brand}</div>
              {p.knownRating&&<div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--green)",letterSpacing:1,margin:"4px 0 8px"}}>★ {p.knownRating}</div>}
              <div style={{borderLeft:"2px solid rgba(168,48,48,0.4)",paddingLeft:10,marginBottom:8}}>
                <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--red)",fontStyle:"italic",marginBottom:3}}>{t.activeIngredientLabel}</div>
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
  
        {/* -- WEEK ONE / TIMELINE / DOCTOR -- */}
        {shaveResult.weekOneProtocol&&(
          <div className="ins-box tip" style={{marginTop:12}}>
            <div className="ins-lbl">{t.weekOneLabel}</div>
            <div className="ins-text">{shaveResult.weekOneProtocol}</div>
          </div>
        )}
        {shaveResult.expectedImprovement&&(
          <div className="ins-box tip">
            <div className="ins-lbl">{t.expectedTimeline}</div>
            <div className="ins-text">{shaveResult.expectedImprovement}</div>
          </div>
        )}
        {shaveResult.whenToSeeDoctor&&(
          <div className="ins-box warn">
            <div className="ins-lbl">{t.whenDermatologist}</div>
            <div className="ins-text">{shaveResult.whenToSeeDoctor}</div>
          </div>
        )}
  
        {/* -- SHAVE OPTIONAL REPORTS -- */}
        {shaveResult.skinBiologyTeaser&&(
          <div style={{border:"1px solid var(--goldb)",marginTop:20,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,var(--gold),var(--gold2),transparent)"}}/>
            <div style={{padding:"20px 20px 0"}}>
              <div style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:3,color:"var(--gold)",textTransform:"uppercase",fontStyle:"italic",marginBottom:6}}>{t.optionalTitle}</div>
              <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",lineHeight:1.7,marginBottom:14}}>{t.optionalSub}</div>
              <div style={{borderLeft:"2px solid var(--goldb)",paddingLeft:12,marginBottom:16}}>
                <div style={{fontFamily:"var(--fc)",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",fontStyle:"italic",marginBottom:4}}>Why this matters for you</div>
                <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--cream)",fontStyle:"italic",lineHeight:1.7}}>{shaveResult.skinBiologyTeaser}</div>
              </div>
            </div>
  
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,background:"var(--border)",margin:"0 0 2px"}}>
              {/* Shave Biology Report */}
              <div style={{background:"var(--card)",padding:"16px 18px"}}>
                <div style={{fontFamily:"var(--fh)",fontSize:15,fontWeight:700,fontStyle:"italic",marginBottom:6}}>
                  {lang==="fr"?"Rapport Biologie du Rasage":lang==="es"?"Informe Biología del Afeitado":"Shave Biology Report"}
                </div>
                <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--soft)",fontStyle:"italic",lineHeight:1.65,marginBottom:12}}>
                  {lang==="fr"?"Pourquoi ton type de barbe spécifique cause ces problèmes -- au niveau cellulaire.":lang==="es"?"Por qué tu tipo específico de barba causa estos problemas -- a nivel celular.":"The cellular reason your specific beard type and skin cause this exact problem."}
                </div>
                {shaveBioUnlocked?(
                  bioReport?(
                    <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--cream)",fontStyle:"normal",lineHeight:1.85,maxHeight:300,overflowY:"auto"}}>{bioReport}</div>
                  ):(
                    <button className="btn btn-p" style={{width:"100%",fontSize:11}} onClick={generateBioReport} disabled={bioLoad}>
                      {bioLoad?t.generatingLabel:t.generateReport}
                    </button>
                  )
                ):(
                  <button className="btn btn-p" style={{width:"100%",fontSize:11}} onClick={()=>openPayment("shave-biology")}>
                    {lang==="fr"?`Déverrouiller -- $${CONFIG.business.shaveBiologyPrice}`:lang==="es"?`Desbloquear -- $${CONFIG.business.shaveBiologyPrice}`:`Unlock -- $${CONFIG.business.shaveBiologyPrice}`}
                  </button>
                )}
              </div>
              {/* Shave Protocol Card */}
              <div style={{background:"var(--card)",padding:"16px 18px"}}>
                <div style={{fontFamily:"var(--fh)",fontSize:15,fontWeight:700,fontStyle:"italic",marginBottom:6}}>
                  {lang==="fr"?"Carte de Protocole de Rasage":lang==="es"?"Tarjeta de Protocolo de Afeitado":"Shave Protocol Card"}
                </div>
                <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--soft)",fontStyle:"italic",lineHeight:1.65,marginBottom:12}}>
                  {lang==="fr"?"Tes étapes exactes de rasage -- pré, pendant, post -- formatées pour le mur de ta salle de bain.":lang==="es"?"Tus pasos exactos de afeitado -- pre, durante, post -- formateados para la pared de tu baño.":"Your exact shaving steps -- pre, during, post -- formatted as a printable bathroom card."}
                </div>
                {shaveCardUnlocked?(
                  cardReport?(
                    <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--cream)",fontStyle:"normal",lineHeight:1.85}}>
                      {cardReport.preShave?.map((s,i)=><div key={i} style={{marginBottom:6}}><span style={{color:"var(--gold)"}}>{i+1}. </span><strong>{s.title}</strong> -- {s.instruction}</div>)}
                    </div>
                  ):(
                    <button className="btn btn-p" style={{width:"100%",fontSize:11}} onClick={generateRoutineCard} disabled={cardLoad}>
                      {cardLoad?t.generatingLabel:t.generateCard}
                    </button>
                  )
                ):(
                  <button className="btn btn-p" style={{width:"100%",fontSize:11}} onClick={()=>openPayment("shave-card")}>
                    {lang==="fr"?`Déverrouiller -- $${CONFIG.business.shaveCardPrice}`:lang==="es"?`Desbloquear -- $${CONFIG.business.shaveCardPrice}`:`Unlock -- $${CONFIG.business.shaveCardPrice}`}
                  </button>
                )}
              </div>
            </div>
            {/* Shave combo */}
            {!shaveBioUnlocked||!shaveCardUnlocked?(
              <div style={{padding:"14px 18px",background:"var(--s)",borderTop:"1px solid var(--border)"}}>
                <button className="btn btn-p" style={{width:"100%",fontSize:12}} onClick={()=>openPayment("shave-combo")}>
                  * {lang==="fr"?`Les Deux -- $${CONFIG.business.shaveComboPrice} (meilleure valeur)`:lang==="es"?`Ambos -- $${CONFIG.business.shaveComboPrice} (mejor valor)`:`Both -- $${CONFIG.business.shaveComboPrice} (best value)`}
                </button>
                <div style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--muted)",fontStyle:"italic",textAlign:"center",marginTop:8}}>
                  {lang==="fr"?"Paiement sécurisé via Stripe":lang==="es"?"Pago seguro via Stripe":"Secured by Stripe"}
                </div>
              </div>
            ):(
              <div style={{padding:"14px 18px",textAlign:"center",fontFamily:"var(--fc)",fontSize:12,color:"var(--green)",fontStyle:"italic"}}>* {t.alreadyUnlocked}</div>
            )}
          </div>
        )}
  
        {/* -- MEDICAL DISCLAIMER -- */}
        <div className="med-disclaimer" style={{marginTop:16}}>
          <div className="med-disclaimer-lbl">{t.medDisclaimerLabel}</div>
          <div className="med-disclaimer-text">{t.medDisclaimer}</div>
        </div>
  
        <button className="btn btn-g" style={{width:"100%",marginTop:12}} onClick={startShaveQuiz}>{t.newShave}</button>
        <p className="disc" style={{marginTop:12}}>{t.disclaimer}</p>
      </>}
    </div>
  </div>}
  
  {/* -- COMMUNITY -- */}
  {view==="community"&&<div className="wrap fade-in">
    <div className="comm-wrap">
      <div className="hero-badge" style={{marginBottom:14}}>{t.nav.community}</div>
      <div className="comm-h">{t.communityTitle}</div>
      <div className="comm-s">{t.communitySub}</div>
  
      {/* Share button */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        {(has||hasShave)&&(
          <button className="btn btn-p" onClick={()=>setShowShare(p=>!p)}>
            {showShare?"Cancel":"* "+t.communityPost}
          </button>
        )}
        {sharePosted&&<div className="comm-posted">* {t.communityPosted}</div>}
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
              <div className="post-type">* {profile.skinType}</div>
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
      <div className="sec-h"><span className="sec-mark">*</span> {t.communityFeed}</div>
  
      {communityPosts.length===0?(
        <div className="empty">
          <div className="empty-mark">*</div>
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
                <div className="post-type">* {post.skinType}</div>
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
  
  {/* -- GUIDES -- */}
  {view==="guides"&&<div className="wrap fade-in">
    <div className="guides-wrap">
      <div className="guides-h">{t.guidesTitle}</div>
      <div className="guides-s">{t.guidesSub}</div>
  
      {/* Personalised upsell -- shown only if they haven't done analysis yet */}
      {(!has&&!hasShave)&&(
        <div style={{border:"1px solid var(--goldb)",background:"rgba(184,151,42,0.05)",
          padding:"18px 20px",marginBottom:24,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,
            background:"linear-gradient(90deg,var(--gold),var(--gold2),transparent)"}}/>
          <div style={{fontFamily:"var(--fm)",fontSize:8,letterSpacing:4,color:"var(--gold)",
            textTransform:"uppercase",marginBottom:6}}>
            {lang==="fr"?"Envie d'un guide personnalisé?":lang==="es"?"¿Quieres una guía personalizada?":"Want something personalised?"}
          </div>
          <div style={{fontFamily:"var(--fc)",fontSize:15,color:"var(--cream)",fontStyle:"normal",
            lineHeight:1.8,marginBottom:14}}>
            {lang==="fr"
              ?"Les guides ci-dessous sont des références générales pour tous les types de peau. Si tu veux un protocole construit spécifiquement pour ta biologie cutanée -- ton type de peau exact, tes préoccupations, ton budget -- l'analyse gratuite prend 60 secondes."
              :lang==="es"
              ?"Las guías de abajo son referencias generales para todos los tipos de piel. Si quieres un protocolo construido específicamente para tu biología cutánea -- tu tipo de piel exacto, tus preocupaciones, tu presupuesto -- el análisis gratuito toma 60 segundos."
              :"The guides below are general references for all skin types. If you want a protocol built specifically for your skin biology -- your exact skin type, concerns, and budget -- the free analysis takes 60 seconds."}
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button className="btn btn-p" style={{flex:1,minWidth:140,fontSize:12}}
              onClick={()=>go("home")}>
              * {lang==="fr"?"Analyser Ma Peau -- Gratuit":lang==="es"?"Analizar Mi Piel -- Gratis":"Analyse My Skin -- Free"}
            </button>
            <button className="btn btn-g" style={{flex:1,minWidth:140,fontSize:12}}
              onClick={startShaveQuiz}>
              {lang==="fr"?"Protocole Rasage -- Gratuit":lang==="es"?"Protocolo Afeitado -- Gratis":"Shave Protocol -- Free"}
            </button>
          </div>
        </div>
      )}
  
      {/* Skincare Guide */}
      <div className="guide-card">
        <div className="guide-h">{t.skincareGuideTitle}</div>
        <div className="guide-s">{t.skincareGuideDesc}</div>
        <div className="guide-price">
          ${CONFIG.business.skincareGuidePrice} USD
          {lang==="fr"&&<span style={{color:"var(--soft)",fontSize:11,marginLeft:6}}>(~${Math.round(CONFIG.business.skincareGuidePrice*1.36)} CAD)</span>}
        </div>
        {skincareGuideUnlocked?(
          <div>
            <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--green)",fontStyle:"italic",padding:"10px 0 4px"}}>
              * {lang==="fr"?"Guide déverrouillé -- défiler pour lire":lang==="es"?"Guía desbloqueada -- desplaza para leer":"Guide Unlocked -- scroll to read"}
            </div>
            <GuideReader guide={SKINCARE_GUIDE} lang={lang}/>
          </div>
        ):(
          <button className="btn btn-p" style={{width:"100%"}} onClick={()=>openPayment("skincare-guide")}>
            {t.guideBuyBtn} -- ${CONFIG.business.skincareGuidePrice}
          </button>
        )}
      </div>
  
      {/* Shaving Guide */}
      <div className="guide-card">
        <div className="guide-h">{t.shavingGuideTitle}</div>
        <div className="guide-s">{t.shavingGuideDesc}</div>
        <div className="guide-price">
          ${CONFIG.business.shavingGuidePrice} USD
          {lang==="fr"&&<span style={{color:"var(--soft)",fontSize:11,marginLeft:6}}>(~${Math.round(CONFIG.business.shavingGuidePrice*1.36)} CAD)</span>}
        </div>
        {shavingGuideUnlocked?(
          <div>
            <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--green)",fontStyle:"italic",padding:"10px 0 4px"}}>
              * {lang==="fr"?"Guide déverrouillé -- défiler pour lire":lang==="es"?"Guía desbloqueada -- desplaza para leer":"Guide Unlocked -- scroll to read"}
            </div>
            <GuideReader guide={SHAVING_GUIDE} lang={lang}/>
          </div>
        ):(
          <button className="btn btn-p" style={{width:"100%"}} onClick={()=>openPayment("shaving-guide")}>
            {t.guideBuyBtn} -- ${CONFIG.business.shavingGuidePrice}
          </button>
        )}
      </div>
  
      {/* Both Guides Combo */}
      {(!skincareGuideUnlocked||!shavingGuideUnlocked)&&(
        <div style={{border:"1px solid var(--goldb)",padding:"20px",background:"rgba(184,151,42,0.04)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,var(--gold),transparent)"}}/>
          <div style={{fontFamily:"var(--fm)",fontSize:8,letterSpacing:4,color:"var(--gold)",textTransform:"uppercase",marginBottom:8}}>
            {lang==="fr"?"Meilleure Valeur":lang==="es"?"Mejor Valor":"Best Value"}
          </div>
          <div style={{fontFamily:"var(--fh)",fontSize:17,fontWeight:700,fontStyle:"italic",color:"var(--white)",marginBottom:6}}>
            {lang==="fr"?"Les Deux Guides -- $15":lang==="es"?"Ambas Guías -- $15":"Both Guides -- $15"}
          </div>
          <div style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic",marginBottom:14,lineHeight:1.65}}>
            {lang==="fr"?"La référence complète pour les soins de la peau et le rasage. Économise $3 en achetant les deux.":lang==="es"?"La referencia completa para cuidado de piel y afeitado. Ahorra $3 comprando ambas.":"The complete reference for skincare and shaving together. Save $3 buying both."}
          </div>
          <button className="btn btn-p" style={{width:"100%"}} onClick={()=>openPayment("guides-combo")}>
            * {lang==="fr"?"Obtenir les Deux -- $15":lang==="es"?"Obtener Ambas -- $15":"Get Both -- $15"}
          </button>
          <div style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--muted)",fontStyle:"italic",textAlign:"center",marginTop:8}}>
            {lang==="fr"?"Paiement sécurisé via Stripe":lang==="es"?"Pago seguro via Stripe":"Secured by Stripe -- instant access after payment"}
          </div>
        </div>
      )}
  
      {/* What is inside -- teaser */}
      <div style={{borderTop:"1px solid var(--border)",paddingTop:20,marginTop:8}}>
        <div style={{fontFamily:"var(--fm)",fontSize:8,letterSpacing:4,color:"var(--gold)",textTransform:"uppercase",marginBottom:12}}>
          {lang==="fr"?"Ce Que Vous Obtenez":lang==="es"?"Lo Que Obtienes":"What Is Inside"}
        </div>
        {[
          {label:lang==="fr"?"Guide Soins":lang==="es"?"Guía Cuidado":"Skincare Guide", items:lang==="fr"?["Tous les types de peau expliqués","Chaque ingrédient -- mécanisme et conflits","Construire une routine de zéro","Ajustements saisonniers","Comment lire une étiquette de produit"]:lang==="es"?["Todos los tipos de piel explicados","Cada ingrediente -- mecanismo y conflictos","Construir una rutina desde cero","Ajustes estacionales","Cómo leer una etiqueta de producto"]:["Every skin type explained in detail","Every major ingredient -- mechanism and conflicts","Building a routine from scratch","Seasonal adjustments for winter and summer","How to read a product label"]},
          {label:lang==="fr"?"Guide Rasage":lang==="es"?"Guía Afeitado":"Shaving Guide", items:lang==="fr"?["Science complète des lames -- chaque type de rasoir","Technique pour chaque type de barbe","Chimie pré-rasage et post-rasage","Prévenir et traiter les boutons de rasoir","Guide des ingrédients des produits de rasage"]:lang==="es"?["Ciencia completa de hojas -- cada tipo de maquinilla","Técnica para cada tipo de barba","Química pre y post afeitado","Prevenir y tratar granos de afeitar","Guía de ingredientes de productos de afeitado"]:["Complete blade science -- every razor type explained","Technique for every beard type","Pre-shave and post-shave chemistry","How to prevent and treat razor bumps","Product ingredient guide for shaving"]},
        ].map((section,si)=>(
          <div key={si} style={{marginBottom:16}}>
            <div style={{fontFamily:"var(--fh)",fontSize:14,fontWeight:700,fontStyle:"italic",color:"var(--gold)",marginBottom:8}}>{section.label}</div>
            {section.items.map((item,ii)=>(
              <div key={ii} style={{display:"flex",gap:8,marginBottom:5}}>
                <span style={{color:"var(--gold)",flexShrink:0,fontSize:10}}>*</span>
                <span style={{fontFamily:"var(--fc)",fontSize:13,color:"var(--cream)",fontStyle:"normal",lineHeight:1.6}}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
  
    </div>
  </div>}
  
  </div>{/* end main-content */}
  ```
  
    </div>
  
  {/* Translation loading overlay */}
  
  {/* Email capture modal */}
  {showEmail&&<div className="modal-ov" role="dialog" aria-modal="true" aria-label={t.emailTitle}>
  <div className="modal">
  <div className="modal-inner">
  {!emailDone?(
  <>
  <div className="modal-h">{t.emailTitle}</div>
  <div className="modal-s">{t.emailDesc}</div>
  <input className=“email-in” type=“email” placeholder={t.emailPlaceholder}
  value={emailVal} onChange={e=>setEmailVal(e.target.value)}
  onKeyDown={e=>e.key===“Enter”&&submitEmail()}
  autoFocus/>
  <button className=“btn btn-p” style={{width:“100%”,marginBottom:8}} onClick={submitEmail}>
  {t.emailBtn}
  </button>
  <button className=“email-skip” onClick={()=>setShowEmail(false)}>{t.emailSkip}</button>
  </>
  ):(
  <div className="modal-success">
  <div className="modal-success-icon">*</div>
  <div className="modal-success-h">{lang===“fr”?“Parfait”:lang===“es”?“Perfecto”:“Perfect.”}</div>
  <div className="modal-success-s">{t.emailSuccess}</div>
  </div>
  )}
  </div>
  </div>
  
    </div>}
  
  {/* – STRIPE PAYMENT MODAL – */}
  {payModal&&(
  <div className="modal-ov" role="dialog" aria-modal="true">
  <div className=“modal” onClick={e=>e.stopPropagation()}>
  <div className="modal-inner">
  {paySuccess?(
  <div style={{textAlign:“center”,padding:“20px 0”}}>
  <div style={{fontSize:32,marginBottom:12}}>*</div>
  <div style={{fontFamily:“var(–fh)”,fontSize:20,fontWeight:700,fontStyle:“italic”,color:“var(–gold)”,marginBottom:8}}>
  {lang===“fr”?“Paiement Confirmé!”:lang===“es”?”¡Pago Confirmado!”:“Payment Confirmed!”}
  </div>
  <div style={{fontFamily:“var(–fc)”,fontSize:15,color:“var(–cream)”,fontStyle:“italic”}}>
  {lang===“fr”?“Tes rapports sont maintenant déverrouillés.”:lang===“es”?“Tus informes ya están desbloqueados.”:“Your reports are now unlocked. Generating now…”}
  </div>
  </div>
  ):(
  <>
  {/* Header */}
  <div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,marginBottom:20}}>
  <div>
  <div style={{fontFamily:“var(–fm)”,fontSize:8,letterSpacing:4,color:“var(–gold)”,textTransform:“uppercase”,marginBottom:4}}>
  {lang===“fr”?“Paiement Sécurisé”:lang===“es”?“Pago Seguro”:“Secure Payment”}
  </div>
  <div style={{fontFamily:“var(–fh)”,fontSize:18,fontWeight:700,fontStyle:“italic”,color:“var(–white)”}}>
  {payModal===“biology”       ? t.biologyTitle
  :payModal===“routine”        ? t.routineCardTitle
  :payModal===“skin-combo”     ? t.comboTitle
  :payModal===“shave-biology”  ? (lang===“fr”?“Rapport Biologie du Rasage”:lang===“es”?“Informe Biología del Afeitado”:“Shave Biology Report”)
  :payModal===“shave-card”     ? (lang===“fr”?“Carte de Protocole de Rasage”:lang===“es”?“Tarjeta de Protocolo de Afeitado”:“Shave Protocol Card”)
  :payModal===“shave-combo”    ? (lang===“fr”?“Bundle Rasage Complet”:lang===“es”?“Bundle Completo de Afeitado”:“Complete Shave Bundle”)
  :payModal===“skincare-guide” ? t.skincareGuideTitle
  :payModal===“shaving-guide”  ? t.shavingGuideTitle
  :payModal===“guides-combo”   ? (lang===“fr”?“Les Deux Guides”:lang===“es”?“Ambas Guías”:“Both Guides”)
  : “SKINR Report”}
  </div>
  <div style={{fontFamily:“var(–fm)”,fontSize:11,color:“var(–gold)”,marginTop:4}}>
  ${payModal===“skin-combo”||payModal===“shave-combo”?22:payModal===“guides-combo”?15:payModal===“skincare-guide”||payModal===“shaving-guide”?9:payModal===“routine”||payModal===“shave-card”?12:15} USD
  {lang===“fr”&&<span style={{color:“var(–soft)”,marginLeft:6,fontSize:10}}>(~${Math.round((payModal===“skin-combo”||payModal===“shave-combo”?22:payModal===“guides-combo”?15:payModal===“skincare-guide”||payModal===“shaving-guide”?9:payModal===“routine”||payModal===“shave-card”?12:15)*1.36)} CAD)</span>}
  </div>
  </div>
  <button onClick={()=>{setPayModal(null);setPayError(””);setClientSecret(””);setCardElement(null);}}
  style={{background:“none”,border:“none”,color:“var(–soft)”,fontSize:20,cursor:“pointer”,padding:4}}>
  ✕
  </button>
  </div>
  
  ```
            {/* Context box -- accurate description per product, no false claims */}
            {(() => {
              const isGuide = payModal==="skincare-guide"||payModal==="shaving-guide"||payModal==="guides-combo";
              const isSkinPersonalised = payModal==="biology"||payModal==="routine"||payModal==="skin-combo";
              const isShavePersonalised = payModal==="shave-biology"||payModal==="shave-card"||payModal==="shave-combo";
  
              // Guides -- no personalisation claim, just what they get
              if(isGuide) return (
                <div style={{border:"1px solid var(--goldb)",background:"var(--gold3)",
                  padding:"10px 14px",marginBottom:16,fontFamily:"var(--fc)",
                  fontSize:13,color:"var(--cream)",fontStyle:"italic",lineHeight:1.65}}>
                  {payModal==="skincare-guide"
                    ? (lang==="fr"?"La référence complète des soins pour hommes -- ingrédients, types de peau, et construction de routine. Accès immédiat après paiement."
                      :lang==="es"?"La referencia completa de cuidado para hombres -- ingredientes, tipos de piel y construcción de rutina. Acceso inmediato tras el pago."
                      :"The complete men's skincare reference -- every ingredient, every skin type, routine building from scratch. Instant access after payment.")
                    : payModal==="shaving-guide"
                    ? (lang==="fr"?"La bible du rasage clinique -- science des lames, technique par type de barbe, traitement des boutons. Accès immédiat."
                      :lang==="es"?"La biblia clínica del afeitado -- ciencia de hojas, técnica por tipo de barba, tratamiento de granos. Acceso inmediato."
                      :"The clinical shaving bible -- blade science, technique by beard type, bump treatment. Instant access after payment.")
                    : (lang==="fr"?"Les deux guides complets -- soins de la peau et rasage. Économise $3. Accès immédiat aux deux."
                      :lang==="es"?"Ambas guías completas -- cuidado de piel y afeitado. Ahorra $3. Acceso inmediato a las dos."
                      :"Both complete guides -- skincare and shaving. Save $3. Instant access to both after payment.")
                  }
                </div>
              );
  
              // Personalised skin reports -- reference their skin type
              if(isSkinPersonalised && profile) return (
                <div style={{border:"1px solid var(--goldb)",background:"var(--gold3)",
                  padding:"10px 14px",marginBottom:16,fontFamily:"var(--fc)",
                  fontSize:13,color:"var(--cream)",fontStyle:"italic",lineHeight:1.65}}>
                  {payModal==="biology"
                    ? (lang==="fr"?`Ce rapport explique exactement pourquoi ta peau ${profile.skinType?.toLowerCase()||""} se comporte comme elle le fait -- au niveau cellulaire.`
                      :lang==="es"?`Este informe explica exactamente por qué tu piel ${profile.skinType?.toLowerCase()||""} se comporta como lo hace -- a nivel celular.`
                      :`This report explains exactly why your ${profile.skinType||""} skin behaves the way it does -- at the cellular level.`)
                    : payModal==="routine"
                    ? (lang==="fr"?"Une carte de routine imprimable construite à partir de ton profil exact -- pas un guide générique."
                      :lang==="es"?"Una tarjeta de rutina imprimible construida desde tu perfil exacto -- no una guía genérica."
                      :"A printable routine card built from your exact skin profile -- not a generic guide.")
                    : (lang==="fr"?`Les deux rapports personnalisés pour ta peau ${profile.skinType?.toLowerCase()||""} -- meilleure valeur.`
                      :lang==="es"?`Ambos informes personalizados para tu piel ${profile.skinType?.toLowerCase()||""} -- mejor valor.`
                      :`Both reports personalised to your ${profile.skinType||""} skin profile -- best value.`)
                  }
                </div>
              );
  
              // Personalised shave reports -- reference their shave problem
              if(isShavePersonalised && savedShave) return (
                <div style={{border:"1px solid var(--goldb)",background:"var(--gold3)",
                  padding:"10px 14px",marginBottom:16,fontFamily:"var(--fc)",
                  fontSize:13,color:"var(--cream)",fontStyle:"italic",lineHeight:1.65}}>
                  {payModal==="shave-biology"
                    ? (lang==="fr"?"Ce rapport explique la biologie exacte derrière tes problèmes de rasage -- au niveau cellulaire et folliculaire."
                      :lang==="es"?"Este informe explica la biología exacta detrás de tus problemas de afeitado -- a nivel celular y folicular."
                      :"This report explains the exact biology behind your shaving problem -- at the cellular and follicle level.")
                    : payModal==="shave-card"
                    ? (lang==="fr"?"Ta carte de protocole de rasage personnalisée -- tes étapes exactes pré, pendant et post-rasage."
                      :lang==="es"?"Tu tarjeta de protocolo de afeitado personalizada -- tus pasos exactos pre, durante y post-afeitado."
                      :"Your personalised shave protocol card -- your exact pre, during, and post-shave steps.")
                    : (lang==="fr"?"Les deux rapports de rasage personnalisés à ton profil exact -- meilleure valeur."
                      :lang==="es"?"Ambos informes de afeitado personalizados para tu perfil exacto -- mejor valor."
                      :"Both shave reports personalised to your exact profile -- best value.")
                  }
                </div>
              );
  
              return null;
            })()}
  
            {/* Email field for report delivery */}
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"var(--fm)",fontSize:8,letterSpacing:3,color:"var(--soft)",textTransform:"uppercase",marginBottom:6}}>
                {lang==="fr"?"Courriel pour recevoir le rapport":lang==="es"?"Email para recibir el informe":"Email to receive your report"}
              </div>
              <input
                type="email"
                style={{width:"100%",background:"var(--bg)",border:"1px solid var(--border)",
                  padding:"10px 14px",fontFamily:"var(--fc)",fontSize:14,color:"var(--white)",
                  outline:"none",fontStyle:"italic"}}
                placeholder={emailSaved || t.emailPlaceholder}
                defaultValue={emailSaved || ""}
                onChange={e=>{if(e.target.value) setEmailSaved(e.target.value);}}
              />
              <div style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--muted)",fontStyle:"italic",marginTop:4}}>
                {lang==="fr"?"Ton rapport sera envoyé à cette adresse après paiement.":lang==="es"?"Tu informe será enviado a este correo tras el pago.":"Your report will be emailed here after payment."}
              </div>
            </div>
  
            {/* Card form */}
            {payLoading&&!clientSecret?(
              <div style={{textAlign:"center",padding:"20px 0",fontFamily:"var(--fc)",fontSize:13,color:"var(--soft)",fontStyle:"italic"}}>
                {lang==="fr"?"Configuration du paiement...":lang==="es"?"Configurando el pago...":"Setting up payment..."}
              </div>
            ):(
              <>
                {/* Apple Pay / Google Pay -- shows automatically if available */}
                {prButtonAvailable&&(
                  <div style={{marginBottom:16}}>
                    <div id="skinr-pr-button" style={{minHeight:48}}/>
                    <div style={{display:"flex",alignItems:"center",gap:10,margin:"12px 0"}}>
                      <div style={{flex:1,height:1,background:"var(--border)"}}/>
                      <div style={{fontFamily:"var(--fc)",fontSize:11,color:"var(--muted)",fontStyle:"italic",whiteSpace:"nowrap"}}>
                        {lang==="fr"?"ou payer par carte":lang==="es"?"o pagar con tarjeta":"or pay by card"}
                      </div>
                      <div style={{flex:1,height:1,background:"var(--border)"}}/>
                    </div>
                  </div>
                )}
                <div style={{marginBottom:12}}>
                  <div style={{fontFamily:"var(--fm)",fontSize:8,letterSpacing:3,color:"var(--soft)",textTransform:"uppercase",marginBottom:8}}>
                    {lang==="fr"?"Détails de la carte":lang==="es"?"Detalles de la tarjeta":"Card details"}
                  </div>
                  {/* Stripe Card Element mounts here */}
                  <div id="skinr-card-element"
                    style={{border:"1px solid var(--border)",padding:"12px 14px",
                      background:"var(--bg)",minHeight:44}}/>
                  {payError&&(
                    <div style={{fontFamily:"var(--fc)",fontSize:12,color:"var(--red)",fontStyle:"italic",marginTop:8}}>
                      {payError}
                    </div>
                  )}
                </div>
                <button className="btn btn-p" style={{width:"100%",marginBottom:10}}
                  onClick={confirmPayment} disabled={payLoading||!clientSecret||!cardElement}>
                  {payLoading
                    ? (lang==="fr"?"Traitement...":lang==="es"?"Procesando...":"Processing...")
                    : (lang==="fr"?`Payer $${payModal==="combo"?15:10} USD`:lang==="es"?`Pagar $${payModal==="combo"?15:10} USD`:`Pay $${payModal==="combo"?15:10} USD`)}
                </button>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  fontFamily:"var(--fc)",fontSize:11,color:"var(--muted)",fontStyle:"italic"}}>
                  <span>🔒</span>
                  <span>
                    {lang==="fr"
                      ? "Paiement sécurisé par Stripe. Aucune donnée de carte stockée sur nos serveurs."
                      : lang==="es"
                      ? "Pago seguro por Stripe. Ningún dato de tarjeta almacenado en nuestros servidores."
                      : "Secured by Stripe. Card data is processed by Stripe and never touches our servers."}
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  </div>
  ```
  
  )}
  
  {/* – PRIVACY POLICY MODAL – */}
  {showPrivacy&&(
  <div className=“modal-ov” role=“dialog” aria-modal=“true” onClick={()=>setShowPrivacy(false)}>
  <div className=“modal” onClick={e=>e.stopPropagation()} style={{maxHeight:“80vh”,overflowY:“auto”}}>
  <div className="modal-inner">
  <div style={{fontFamily:“var(–fh)”,fontSize:18,fontWeight:700,fontStyle:“italic”,marginBottom:16,color:“var(–gold)”}}>Privacy Policy</div>
  <div style={{fontFamily:“var(–fc)”,fontSize:14,lineHeight:1.85,color:“var(–cream)”,fontStyle:“normal”}}>
  <p style={{marginBottom:12}}><strong>Last updated: {new Date().getFullYear()}</strong></p>
  <p style={{marginBottom:12}}>SKINR does not collect, sell, or share your personal data with any third party for commercial purposes.</p>
  <p style={{marginBottom:12}}><strong>What we store:</strong> Your skin profile, shave protocol results, and check-in history are stored locally in your browser (localStorage). This data never leaves your device unless you choose to submit your email.</p>
  <p style={{marginBottom:12}}><strong>Email:</strong> If you provide your email address, it is sent to our team via Formspree and used solely to deliver your protocol and occasional skin tips. We do not sell or rent your email.</p>
  <p style={{marginBottom:12}}><strong>Amazon affiliate links:</strong> SKINR participates in the Amazon Associates program. We earn a small commission when you purchase through our links. This does not affect the price you pay or the recommendations we make.</p>
  <p style={{marginBottom:12}}><strong>Analytics:</strong> We may use anonymised analytics to understand how the product is used. No personally identifiable information is collected.</p>
  <p style={{marginBottom:12}}><strong>Contact:</strong> For any privacy questions, contact us at privacy@getskinr.com</p>
  </div>
  <button className=“btn btn-p” style={{width:“100%”,marginTop:16}} onClick={()=>setShowPrivacy(false)}>Close</button>
  </div>
  </div>
  </div>
  )}
  
  {/* – TERMS OF SERVICE MODAL – */}
  {showTerms&&(
  <div className=“modal-ov” role=“dialog” aria-modal=“true” onClick={()=>setShowTerms(false)}>
  <div className=“modal” onClick={e=>e.stopPropagation()} style={{maxHeight:“80vh”,overflowY:“auto”}}>
  <div className="modal-inner">
  <div style={{fontFamily:“var(–fh)”,fontSize:18,fontWeight:700,fontStyle:“italic”,marginBottom:16,color:“var(–gold)”}}>Terms of Service</div>
  <div style={{fontFamily:“var(–fc)”,fontSize:14,lineHeight:1.85,color:“var(–cream)”,fontStyle:“normal”}}>
  <p style={{marginBottom:12}}><strong>Last updated: {new Date().getFullYear()}</strong></p>
  <p style={{marginBottom:12}}><strong>General guidance only.</strong> SKINR provides general skincare and shaving guidance based on your answers. This is not medical advice and is not a substitute for professional dermatological consultation.</p>
  <p style={{marginBottom:12}}><strong>Not a medical service.</strong> SKINR is not a medical service and does not diagnose, treat, or cure any skin condition. If you have a medical skin condition, consult a board-certified dermatologist.</p>
  <p style={{marginBottom:12}}><strong>Product recommendations.</strong> Product recommendations are generated by AI based on your profile. Individual results vary. SKINR makes no guarantee that recommended products will work for your specific skin.</p>
  <p style={{marginBottom:12}}><strong>Affiliate disclosure.</strong> SKINR participates in affiliate programs including Amazon Associates. We may earn a commission on qualifying purchases. Our recommendations are not influenced by commercial arrangements.</p>
  <p style={{marginBottom:12}}><strong>Limitation of liability.</strong> SKINR is provided “as is” without warranty. We are not liable for any adverse reactions to products recommended by the platform. Always patch-test new skincare products.</p>
  <p style={{marginBottom:12}}><strong>Age.</strong> SKINR is intended for users aged 18 and over.</p>
  <p style={{marginBottom:12}}><strong>Contact:</strong> legal@getskinr.com</p>
  </div>
  <button className=“btn btn-p” style={{width:“100%”,marginTop:16}} onClick={()=>setShowTerms(false)}>Close</button>
  </div>
  </div>
  </div>
  )}
  
  </>);
  }
