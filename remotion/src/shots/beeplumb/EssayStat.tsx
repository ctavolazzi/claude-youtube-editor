import React from 'react';
import { Stage, StatCallout } from '../../lib/commentary';

// beeplumbgh commentary kit demo: a number with its source
// Renders standalone over the placeholder bed. For a real video, pass bed={{ src: staticFile('...') }}
// (cutaway) or bed="none" + transparent: true (overlay over the master). See lib/commentary.tsx.
export const compositionConfig = { id: 'EssayStat', durationInSeconds: 5, fps: 60, width: 1920, height: 1080 };

const Shot: React.FC = () => (
  <Stage>
    <StatCallout value={168} label="hours in every week. Same for everyone who ever lived." source="arithmetic (24 × 7)" />
  </Stage>
);
export default Shot;
