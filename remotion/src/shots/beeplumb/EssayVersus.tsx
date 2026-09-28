import React from 'react';
import { Stage, VersusCard } from '../../lib/commentary';

// beeplumbgh commentary kit demo: the trap vs the strategy
// Renders standalone over the placeholder bed. For a real video, pass bed={{ src: staticFile('...') }}
// (cutaway) or bed="none" + transparent: true (overlay over the master). See lib/commentary.tsx.
export const compositionConfig = { id: 'EssayVersus', durationInSeconds: 7, fps: 60, width: 1920, height: 1080 };

const Shot: React.FC = () => (
  <Stage>
    <VersusCard
      left={{ label: 'The trap', items: ['Open the feed to wake up', 'Let the default decide', 'Rest by scrolling'] }}
      right={{ label: 'The strategy', items: ['Decide the day before you open anything', 'Pick the default on purpose', 'Rest by doing nothing at all'] }}
    />
  </Stage>
);
export default Shot;
