// Standalone entry for Beeplumb #1's thumbnails: ThumbA (final), ThumbB, ThumbC, and ThumbFeed
// (all three at phone and sidebar size, for the legibility check).
// Render: node scripts/render-thumbs.mjs src/blank-canvas-thumbs-entry.tsx ../videos/beeplumb-01-blank-canvas/packaging/thumbs
import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { THUMBS, TITLE } from './shots/beeplumb-01-blank-canvas/Thumbnails';
import { F } from './shots/beeplumb-01-blank-canvas/common';
import { ThumbFeed, THUMB_SIZE } from './lib/thumbnail';

const Feed: React.FC = () => <ThumbFeed thumbs={THUMBS} title={TITLE} font={F.display} />;

const Root: React.FC = () => (
  <>
    {THUMBS.map(({ id, C }) => (
      <Composition key={id} id={`Thumb${id}`} component={C} durationInFrames={1} fps={30} {...THUMB_SIZE} />
    ))}
    <Composition id="ThumbFeed" component={Feed} durationInFrames={1} fps={30} {...THUMB_SIZE} />
  </>
);

registerRoot(Root);
