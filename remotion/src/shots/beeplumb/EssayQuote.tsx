import React from 'react';
import { Stage, QuoteCard } from '../../lib/commentary';

// beeplumbgh commentary kit demo: a pull quote with its attribution
// Renders standalone over the placeholder bed. For a real video, pass bed={{ src: staticFile('...') }}
// (cutaway) or bed="none" + transparent: true (overlay over the master). See lib/commentary.tsx.
export const compositionConfig = { id: 'EssayQuote', durationInSeconds: 7, fps: 60, width: 1920, height: 1080 };

const Shot: React.FC = () => (
  <Stage>
    <QuoteCard
      quote="A wealth of information creates a poverty of attention."
      mark="poverty of attention."
      author="Herbert A. Simon"
      source="Designing Organizations for an Information-Rich World"
      year={1971}
    />
  </Stage>
);
export default Shot;
