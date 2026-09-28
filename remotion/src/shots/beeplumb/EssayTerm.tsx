import React from 'react';
import { Stage, TermCard } from '../../lib/commentary';

// beeplumbgh commentary kit demo: a coined term, dictionary style
// Renders standalone over the placeholder bed. For a real video, pass bed={{ src: staticFile('...') }}
// (cutaway) or bed="none" + transparent: true (overlay over the master). See lib/commentary.tsx.
export const compositionConfig = { id: 'EssayTerm', durationInSeconds: 6, fps: 60, width: 1920, height: 1080 };

const Shot: React.FC = () => (
  <Stage>
    <TermCard
      term="attention tax"
      phonetic="/əˈten.ʃən tæks/"
      definition="The cost, paid in focus, for every service that charges you nothing."
      note="Nobody sends you the bill. You just notice the week is gone."
    />
  </Stage>
);
export default Shot;
