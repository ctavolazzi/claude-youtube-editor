import React from 'react';
import { Stage, ChapterCard } from '../../lib/commentary';

// beeplumbgh commentary kit demo: an act break
// Renders standalone over the placeholder bed. For a real video, pass bed={{ src: staticFile('...') }}
// (cutaway) or bed="none" + transparent: true (overlay over the master). See lib/commentary.tsx.
export const compositionConfig = { id: 'EssayChapter', durationInSeconds: 4, fps: 60, width: 1920, height: 1080 };

const Shot: React.FC = () => (
  <Stage>
    <ChapterCard n={2} total={5} title="The feed is not a window" sub="It is a room someone else decorated." />
  </Stage>
);
export default Shot;
