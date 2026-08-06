# Research: Landing Hero

## Summary

The best heroes convert through **clarity, authority, and an interactive glimpse of the product** — not through decorative effects. UrbanPulse's current hero has a solid foundation (live UHS badge, clear headline, CTAs) but needs sharper copy, a stronger trust signal in the hero, and a more premium visual treatment.

## References

| Site | Key Takeaway |
|------|-------------|
| Apple | Lead with output, not mechanism. Show the livable city, not the dashboard. |
| Linear | Product-as-hero: embed a realistic city scenario, not a mock. Show agents working. |
| Stripe | Put credibility numbers in the hero. "Always on" / "99.99% uptime" / "X cities served." |
| Vercel | Interactive preview: let visitors taste the value without signing up. |
| Framer | Show AI doing the work. Transparency of process builds trust. |
| Alche Studio | Scroll cue ("scroll to explore →") reduces bounce by signaling more content below. |
| Raycast | Lead with identity. "For cities that build for tomorrow" targets a specific persona. |

## Comparisons

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| Current hero (inlined, stats, live badge) | Live data builds trust, clear CTAs | Copy is generic ("AI-Powered Civic Infrastructure"), lacks identity targeting | Needs iteration, not replacement |
| Full-screen cinematic video | High emotional impact, memorable | Slow load, reduced-motion complexity, expensive to produce | Rejected — wrong for government-tech tone |
| Interactive city map in hero | Proves product works, highly engaging | Complex to build, performance risk, distracts from message | Future consideration for later sprints |
| Product screenshot with real data | Authentic, shows real value | Must look convincing, not like a mockup | Chosen — show real agents/interface in hero |
| Minimal hero with one hard number | Stripe-style authority | Requires a real number (cities served, sensors monitored) | Chosen — add credibility metric to hero |

## Decision

**Keep the current hero structure but sharpen every element:**

1. **Headline**: Rewrite for identity targeting. "For cities that build for tomorrow" positions UrbanPulse as an aspirational choice, not a utility.
2. **Trust signal**: Add a hard credibility metric in the hero (not in the stats row below) — "Trusted by X city agencies" or "Always on, 99.99% uptime."
3. **Visual treatment**: Elevate the background from glowing orbs to something that suggests a real city / infrastructure map. Subtle data visualization felt as atmosphere.
4. **Product-as-hero hint**: Show a fragment of real agent activity (3-4 agent cards animating subtly) to prove the product exists, not as the full pipeline section but as a visual anchor.
5. **Scroll cue**: Add an explicit "scroll to explore" cue so visitors know there's more content below.
6. **CTA**: Keep two CTAs but make the primary ("Report an Issue") more urgent — "See How It Works" or "Watch the Demo."

## References Screenshots

(Screenshots would be saved in `screenshots/` directory)

## Rejected

- Full-screen video hero — too slow, wrong tone for government tech
- Carousel — ANTI_PATTERNS.md: nothing decorative
- Particle effects — ANTI_PATTERNS.md: tired trend
- 3D city model — performance cost, mobile battery impact
