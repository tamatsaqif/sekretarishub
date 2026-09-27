# Design Direction

## 1. Core Design Intent

Build the interface with a strong Apple/iOS-inspired visual language.

The result must feel:

* Clean
* Calm
* Minimal
* Premium
* Soft
* Consistent
* Intentional
* Modern
* Native-feeling

The interface must NOT feel:

* AI-generated
* Generic SaaS
* Over-designed
* Colorful
* Noisy
* Excessively decorative

### Hard Rule

Do not invent, add, or introduce UI elements, sections, features, decorations, copy, or interactions that were not explicitly requested.

Only design and implement what is required.

---

# 2. Color System

Use a monochrome palette only.

### Primary palette

* Pure white: `#FFFFFF`
* Soft white: `#F8F8F8`
* Light gray: `#F2F2F2`
* Neutral gray: `#E5E5E5`
* Medium gray: `#A1A1A1`
* Dark gray: `#666666`
* Near black: `#1D1D1F`
* Black: `#000000`

### Rules

* White and gray should dominate the interface.
* Use near-black for primary text.
* Use gray for secondary and supporting text.
* Use subtle gray borders.
* Keep contrast high enough for readability.
* Do not introduce colorful accent colors unless explicitly requested.

### Absolutely avoid

* Purple gradients
* Blue gradients
* Pink gradients
* Rainbow gradients
* Neon colors
* Unnecessary accent colors
* Multi-color UI
* Decorative color blobs

---

# 3. Typography

## Primary font

Use **SF Pro** whenever available.

Preferred font stack:

`SF Pro Display, SF Pro Text, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif`

### Font rules

* Headings: strong but not excessively heavy
* Body: regular and highly readable
* Supporting text: muted gray
* Avoid excessive font weights
* Avoid decorative fonts
* Avoid mixing unrelated font families
* Do not use more than one visual font family

### Hierarchy

Create obvious hierarchy between:

1. Page title
2. Section title
3. Supporting information
4. Body content
5. Metadata / tertiary information

Hierarchy should be communicated through:

* Size
* Weight
* Contrast
* Spacing

Do not rely on color alone.

---

# 4. Typography Scale

Prefer a restrained scale.

* `12px` — metadata
* `14px` — secondary text
* `16px` — body
* `18px` — emphasized body
* `20px` — small heading
* `24px` — section heading
* `32px` — page heading
* `40px` — large hero/page heading

Do not make text unnecessarily large.

---

# 5. Layout

Use a clean, spacious layout inspired by modern Apple interfaces.

### Principles

* Strong alignment
* Generous whitespace
* Clear grouping
* Predictable spacing
* Simple visual flow
* Minimal visual noise

### Content width

Prefer a centered content container with a reasonable maximum width.

Recommended:

`max-width: 1100px–1200px`

Do not stretch content unnecessarily across the entire screen.

---

# 6. Spacing System

Use a consistent spacing scale:

* `4px`
* `8px`
* `12px`
* `16px`
* `20px`
* `24px`
* `32px`
* `40px`
* `48px`
* `64px`

Avoid arbitrary spacing values unless necessary.

Spacing must feel intentional and consistent throughout the entire interface.

---

# 7. Border Radius

The interface should feel rounded and soft.

Preferred radius:

* Small elements: `8px`
* Inputs / small controls: `10px`
* Buttons: `12px–14px`
* Cards: `16px–20px`
* Large containers: `20px–24px`

Use a consistent radius system.

Do not randomly mix many different corner radii.

Avoid excessive pill-shaped components unless the component naturally calls for it.

---

# 8. Buttons

Buttons should feel like polished iOS controls.

## Primary button

Use a subtle glassmorphism appearance when appropriate.

Characteristics:

* Translucent surface
* Soft blur
* Thin border
* Subtle highlight
* Soft shadow
* Smooth hover transition
* Smooth press feedback

Example visual direction:

* `background: rgba(...)`
* `backdrop-filter: blur(...)`
* subtle neutral border
* very soft shadow

### Important

Glassmorphism must remain subtle.

Do NOT:

* Use strong glowing effects
* Use colorful glass
* Use rainbow glass
* Use excessive blur
* Make text difficult to read

Buttons must remain readable and functional.

---

# 9. Glassmorphism Rules

Glass effects are a supporting visual treatment, not the entire design language.

Use glassmorphism primarily for:

* Buttons
* Floating controls
* Small overlays
* Elements that genuinely benefit from translucency

Do not make every card, section, panel, and container glass.

Avoid the typical "AI glassmorphism" look where the entire interface becomes transparent.

---

# 10. Cards and Surfaces

Cards should be simple and restrained.

Preferred:

* White or soft-gray surface
* Thin neutral border
* Minimal shadow
* Rounded corners
* Consistent padding

Cards should exist only when they improve grouping or readability.

Do not put every piece of content inside its own card.

Avoid:

* Giant floating cards
* Excessive shadows
* Decorative card backgrounds
* Random gradients
* Nested cards inside cards without a clear reason

---

# 11. Shadows

Use very soft, realistic shadows.

Shadows should provide depth, not decoration.

Preferred appearance:

* Low opacity
* Large blur
* Small vertical offset
* Neutral tone

Avoid:

* Dark heavy shadows
* Colored shadows
* Glow effects
* Excessive elevation

---

# 12. Icons and Emojis

## Icons

Use one consistent icon system throughout the interface.

Icons should:

* Have consistent stroke weight
* Have consistent proportions
* Be visually balanced
* Support meaning

Do not mix multiple unrelated icon libraries.

Do not use icons purely as decoration unless explicitly requested.

## Emojis

When emojis are requested, prefer **Apple/iOS-style emoji rendering**.

Use native emoji characters first.

The browser/device should render the emoji naturally.

Do not replace normal emoji with manually designed illustrations unless necessary.

### Important platform behavior

If the environment cannot reliably reproduce Apple-style emoji, prefer a clean SVG/icon alternative rather than using random emoji packs that create an inconsistent visual style.

Do not use colorful emoji and unrelated icon styles together without a clear reason.

---

# 13. Animation

Animations must feel smooth, subtle, and intentional.

The interface should feel responsive without looking flashy.

### Preferred motion

* Fast but smooth hover transitions
* Gentle opacity changes
* Small scale changes
* Soft movement
* Subtle fade/slide transitions

Recommended timing:

* Micro interaction: `120–180ms`
* Standard interaction: `180–250ms`
* Larger transition: `250–400ms`

Use smooth easing curves.

Prefer natural easing such as:

`cubic-bezier(0.22, 1, 0.36, 1)`

### Do NOT use

* Excessive bouncing
* Constant floating animations
* Large entrance animations
* Random spinning
* Excessive parallax
* Attention-seeking effects
* Animation on every element

Animation should enhance usability, not distract from content.

---

# 14. Interaction Feedback

Every interactive element should provide subtle feedback.

Examples:

* Hover
* Focus
* Active/pressed
* Disabled

Feedback should be subtle and consistent.

Buttons may use a small scale response such as:

`scale(0.98)`

when pressed.

Do not use exaggerated transformations.

---

# 15. Responsive Design

The design must be **mobile-first**.

Mobile is not simply a smaller desktop layout.

On mobile:

* Preserve hierarchy
* Preserve comfortable spacing
* Prevent cramped content
* Keep touch targets comfortable
* Avoid horizontal overflow
* Keep typography readable
* Keep buttons easy to tap

Desktop should expand the layout naturally without changing the design language.

---

# 16. Visual Hierarchy

Every page must have one obvious visual entry point.

The user should immediately understand:

1. Where they are
2. What the page is about
3. What information matters most
4. What action is available

Primary content should receive the strongest visual emphasis.

Secondary content should be quieter.

Tertiary information should remain subtle.

Never make every element equally prominent.

---

# 17. Consistency Rules

Consistency is mandatory.

Keep these consistent across the entire website:

* Font
* Font weights
* Font sizes
* Colors
* Border colors
* Radius
* Shadows
* Button style
* Input style
* Icon style
* Spacing
* Animation timing
* Hover states
* Focus states

If a component pattern already exists, reuse it instead of creating another visual variation.

Do not introduce a new style for the same type of component.

---

# 18. Anti AI-Slop Rules

The final result must NOT contain common AI-generated design patterns.

Strictly avoid:

* Purple/blue gradient backgrounds
* Huge gradient text
* Rainbow gradients
* Random decorative blobs
* Excessive glassmorphism
* Excessive floating elements
* Excessive rounded cards
* Excessive pill buttons
* Giant shadows
* Excessive glow
* Random icon combinations
* Emoji used as random decoration
* Generic SaaS dashboard styling
* Repetitive card grids
* Unnecessary badges
* Fake statistics
* Unrequested illustrations
* Unrequested sections
* Unrequested animations
* Unrequested copy
* Excessive whitespace that makes the page feel empty
* Excessive density that makes the page feel cramped

---

# 19. Content Integrity

Do not invent content.

Do not add:

* Fake statistics
* Fake testimonials
* Fake users
* Fake notifications
* Fake features
* Fake navigation items
* Fake dashboard metrics

Use provided content only.

For missing content, use minimal neutral placeholders only when necessary for layout or development.

---

# 20. Component Philosophy

Prefer fewer, better components.

Every component should have a clear purpose.

Do not create a component simply because it looks visually interesting.

Prioritize:

* Readability
* Reusability
* Consistency
* Simplicity
* Maintainability

---

# 21. Final Quality Checklist

Before considering the design finished, verify:

* [ ] The website is visually monochrome.
* [ ] SF Pro or the defined system fallback is used.
* [ ] Typography hierarchy is immediately clear.
* [ ] Spacing is consistent.
* [ ] Border radii are consistent.
* [ ] Buttons use the intended subtle glass treatment.
* [ ] Glassmorphism is not overused.
* [ ] Shadows are subtle.
* [ ] Icons are visually consistent.
* [ ] Emoji rendering is handled appropriately.
* [ ] Animations are smooth and restrained.
* [ ] Mobile layout feels intentional.
* [ ] No horizontal overflow exists.
* [ ] No unnecessary UI elements were added.
* [ ] No unnecessary colors were added.
* [ ] No AI-slop visual patterns are present.
* [ ] Existing design patterns are reused instead of reinvented.
* [ ] The final interface looks intentionally designed rather than automatically generated.

---

# 22. Absolute Instruction to the Agent

Do not add anything that was not explicitly requested.

Do not "improve" the product by inventing additional features.

Do not introduce visual styles outside this design direction.

Do not change the color philosophy.

Do not change the typography philosophy.

Do not randomly introduce gradients, colorful accents, excessive glassmorphism, decorative shapes, or unnecessary UI.

When uncertain, choose the **simpler, quieter, more consistent** solution.

The goal is not to make the interface look impressive through decoration.

The goal is to make it look **polished through restraint, hierarchy, consistency, spacing, typography, and motion.**
