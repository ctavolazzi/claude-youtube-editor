// Standalone entry for Beeplumb #1's thumbnails (three 1280x720 stills: ThumbA, ThumbB, ThumbC).
import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { ThumbA, ThumbB, ThumbC, THUMB } from './shots/beeplumb-01-blank-canvas/Thumbnails';

const Root: React.FC = () => (
  <>
    {([['ThumbA', ThumbA], ['ThumbB', ThumbB], ['ThumbC', ThumbC]] as const).map(([id, comp]) => (
      <Composition key={id} id={id} component={comp} durationInFrames={THUMB.frame + 1} fps={30} width={THUMB.width} height={THUMB.height} />
    ))}
  </>
);

registerRoot(Root);
