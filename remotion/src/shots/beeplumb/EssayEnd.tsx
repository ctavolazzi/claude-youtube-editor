import React from 'react';
import { Stage, CommentaryEnd } from '../../lib/commentary';

// beeplumbgh commentary kit demo: the end card
// Renders standalone over the placeholder bed. For a real video, pass bed={{ src: staticFile('...') }}
// (cutaway) or bed="none" + transparent: true (overlay over the master). See lib/commentary.tsx.
export const compositionConfig = { id: 'EssayEnd', durationInSeconds: 5, fps: 60, width: 1920, height: 1080 };

const Shot: React.FC = () => (
  <Stage>
    <CommentaryEnd next="The Comfort Trap" />
  </Stage>
);
export default Shot;
