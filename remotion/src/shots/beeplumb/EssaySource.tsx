import React from 'react';
import { Stage, SourceCard } from '../../lib/commentary';

// beeplumbgh commentary kit demo: a cited source with a highlight push
// Renders standalone over the placeholder bed. For a real video, pass bed={{ src: staticFile('...') }}
// (cutaway) or bed="none" + transparent: true (overlay over the master). See lib/commentary.tsx.
export const compositionConfig = { id: 'EssaySource', durationInSeconds: 6, fps: 60, width: 1920, height: 1080 };

const Shot: React.FC = () => (
  <Stage>
    <SourceCard
      outlet="Herbert A. Simon"
      date="1971"
      title="Designing Organizations for an Information-Rich World"
      highlight={{ x: 0.06, y: 0.24, w: 0.8, h: 0.16 }}
    />
  </Stage>
);
export default Shot;
