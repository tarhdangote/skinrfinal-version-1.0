/**

- SKINR — The Men’s Skincare Guide
- src/guides/skincareGuide.js
- 
- Professional clinical reference guide.
- $9 product — also sold on Etsy as PDF.
- Displayed in-app after purchase. Emailed as PDF after PDF system is live.
  */

export const SKINCARE_GUIDE = {
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
