import React from 'react';
import { Stage, LowerThird, GameCredit } from '../../lib/commentary';

// Alpha overlay demo (transparent: true): renders to .mov and bake.py composites it over the
// master (gameplay + VO) as an 'overlay' span. No bed, no scrim, no finish: the master shows through.
export const compositionConfig = { id: 'EssayLowerThirdOverlay', durationInSeconds: 4, fps: 60, width: 1920, height: 1080, transparent: true };

const Shot: React.FC = () => (
  <Stage bed="none" finish={false}>
    <GameCredit game="Placeholder Ridge Ride" />
    <LowerThird title="Herbert A. Simon" sub="economist, Nobel 1978 · coined 'attention economy' ideas in 1971" start={6} hold={200} />
  </Stage>
);
export default Shot;
