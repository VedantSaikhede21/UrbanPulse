# Demo asset credits

Photographs used by the UrbanPulse demo. Every file here was downloaded from
Wikimedia Commons by `qa/collect_demo_assets.py`, which only accepts
public-domain, CC0 or CC-BY licensed files so the assets can live in this
repository. Attribution is recorded here as those licences require.

Regenerate or extend the set with:

```
python qa/collect_demo_assets.py      # fetch candidates into _review/
python qa/finalize_demo_assets.py     # promote the picks, rewrite this file
```

## Why the pairs matter

The verification agent compares the citizen's uploaded photo against the
closure photo the officer submits. A before/after pair only reaches `verified`
when both show the same class of civic defect and the second one shows it
resolved. Submitting an unrelated photo is correctly rejected to
`needs_review` — the agent reads the images rather than trusting the form.


## `pothole-before.webp`

Severe pothole with crumbled asphalt on a city road. Used as the citizen's 'before' evidence for a Roads & Potholes report.

- Source: [File:Pot holes.webp](https://commons.wikimedia.org/wiki/File:Pot_holes.webp)
- Author: Wikideas1
- Licence: CC0
- Credit: Own work
- Retrieved from category: `Category:Potholes`

## `road-repair-after.jpg`

Fresh asphalt being laid by a paving machine. Used as the officer's closure evidence, i.e. the same class of defect resolved.

- Source: [File:Asphalt paving.jpg](https://commons.wikimedia.org/wiki/File:Asphalt_paving.jpg)
- Author: Sammya Nig Ltd
- Licence: CC BY-SA 4.0
- Credit: Ihe onyonyo na-egosi ebe a na-arụ okporo ụzọ
- Retrieved from category: `Category:Road paving`

## `garbage-dumping.jpg`

Dumped waste on open ground. Used as 'before' evidence for a Garbage & Sanitation report.

- Source: [File:Basurero-bahia-peran-asturias.jpg](https://commons.wikimedia.org/wiki/File:Basurero-bahia-peran-asturias.jpg)
- Author: AsturiasVerde
- Licence: Public domain
- Credit: Own work
- Retrieved from category: `Category:Illegal dumping`

## `streetlight-led.jpg`

LED street light in service at night. Used as closure evidence for a Streetlight & Electrical report.

- Source: [File:Led streetlight.jpg](https://commons.wikimedia.org/wiki/File:Led_streetlight.jpg)
- Author: Cgwalther
- Licence: CC BY-SA 2.5
- Credit: Own work
- Retrieved from category: `Category:LED street lights`
