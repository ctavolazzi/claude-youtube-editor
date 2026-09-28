import React from 'react';
import { Stage, ThesisCard, GameCredit } from '../../lib/commentary';

// beeplumbgh commentary kit demo: the cold-open thesis, one sentence, word by word
// Renders standalone over the placeholder bed. For a real video, pass bed={{ src: staticFile('...') }}
// (cutaway) or bed="none" + transparent: true (overlay over the master). See lib/commentary.tsx.
export const compositionConfig = { id: 'EssayColdOpen', durationInSeconds: 6, fps: 60, width: 1920, height: 1080 };

const Shot: React.FC = () => (
  <Stage>
    <GameCredit game="Placeholder Ridge Ride" />
    <ThesisCard kicker="The Attention Tax" text="Nothing you use for free is actually free. You pay in the one thing you can't earn back." mark="can't earn back." />
  </Stage>
);
export default Shot;
