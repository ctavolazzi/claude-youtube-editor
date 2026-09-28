# gameplay/: reusable background beds

Long, calm gameplay takes that sit under the essays. **Video files are git-ignored** (they are big,
and they are the publisher's footage); `catalog.json` is committed so every take stays findable.

Use from a shot: `<Stage bed={{ src: staticFile('library/gameplay/<file>.mp4'), startFrom: 60 * 90 }}>`
(startFrom is in frames; 60 * 90 = 1:30 into the take).

Catalog entry:

```json
{
  "file": "rdr2-ride-heartlands-01.mp4",
  "game": "Red Dead Redemption 2",
  "action": "slow ride across open plains at dusk, HUD off",
  "mood": ["lonely", "calm", "golden"],
  "length_s": 1260,
  "fps": 60,
  "resolution": "2560x1440",
  "hud": false,
  "policy": "publisher video policy URL, checked YYYY-MM-DD",
  "used_in": []
}
```

Pick beds by **mood per chapter**; see `docs/COMMENTARY.md`.
