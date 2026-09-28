// Standalone entry for Beeplumb #1 ("the blank canvas"): registers only this composition, with
// its length read from the generated voiceover timing, and never loads src/fonts.ts.
import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { BlankCanvas, compositionConfig as c } from './shots/beeplumb-01-blank-canvas/BlankCanvas';
import { DURATION_FRAMES } from './shots/beeplumb-01-blank-canvas/common';

const Root: React.FC = () => (
  <Composition id={c.id} component={BlankCanvas} durationInFrames={DURATION_FRAMES} fps={c.fps} width={c.width} height={c.height} />
);

registerRoot(Root);
