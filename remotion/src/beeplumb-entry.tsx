// Standalone entry for the Beeplumb explainer: registers ONLY this composition, so rendering it
// never pulls in src/fonts.ts (the house Google Fonts) or any other shot.
import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { BeeplumbExplainer, compositionConfig as c } from './shots/beeplumb-explainer/BeeplumbExplainer';

const Root: React.FC = () => (
  <Composition
    id={c.id}
    component={BeeplumbExplainer}
    durationInFrames={Math.round(c.durationInSeconds * c.fps)}
    fps={c.fps}
    width={c.width}
    height={c.height}
  />
);

registerRoot(Root);
