import React from 'react';
import { Stage, ClipFrame } from '../../lib/commentary';

// beeplumbgh commentary kit demo: a framed, credited fair-use excerpt
// Renders standalone over the placeholder bed. For a real video, pass bed={{ src: staticFile('...') }}
// (cutaway) or bed="none" + transparent: true (overlay over the master). See lib/commentary.tsx.
export const compositionConfig = { id: 'EssayClip', durationInSeconds: 5, fps: 60, width: 1920, height: 1080 };

const Shot: React.FC = () => (
  <Stage>
    <ClipFrame title="What the other side says" credit="Channel Name · &quot;Video Title&quot; · 01:12 to 01:20 · excerpt for commentary" />
  </Stage>
);
export default Shot;
