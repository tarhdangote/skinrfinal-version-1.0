/**

- SKINR — The Men’s Shaving Guide
- src/guides/shavingGuide.js
- 
- Professional clinical reference guide.
- $9 product — also sold on Etsy as PDF.
- Displayed in-app after purchase. Emailed as PDF after PDF system is live.
  */

export const SHAVING_GUIDE = {
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
