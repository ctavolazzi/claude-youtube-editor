import React from 'react';
import { AbsoluteFill, Series } from 'remotion';
import {
  GameplayBed, Grain, Scanlines, GameCredit, ThesisCard, ChapterCard, QuoteCard, SourceCard,
  ClipFrame, TermCard, StatCallout, VersusCard, CommentaryEnd, LowerThird,
} from '../../lib/commentary';

// The whole kit as one continuous piece: a single gameplay bed runs UNDER every beat (it never
// cuts, the way the real videos work), and the beats change on top of it. Use this to feel the
// pacing, and as the template for a first real video's cutaway sequence.
export const compositionConfig = { id: 'EssayReel', durationInSeconds: 46, fps: 60, width: 1920, height: 1080 };

const S = 60; // frames per second
const Reel: React.FC = () => (
  <AbsoluteFill>
    <GameplayBed dim={0.6} push={0.08} />
    <GameCredit game="Placeholder Ridge Ride" />
    <Series>
      <Series.Sequence durationInFrames={6 * S}>
        <ThesisCard kicker="The Attention Tax" text="Nothing you use for free is actually free. You pay in the one thing you can't earn back." mark="can't earn back." />
      </Series.Sequence>
      <Series.Sequence durationInFrames={4 * S}>
        <ChapterCard n={1} total={3} title="The feed is not a window" sub="It is a room someone else decorated." />
      </Series.Sequence>
      <Series.Sequence durationInFrames={6 * S}>
        <QuoteCard quote="A wealth of information creates a poverty of attention." mark="poverty of attention." author="Herbert A. Simon" source="Designing Organizations for an Information-Rich World" year={1971} />
        <LowerThird title="Herbert A. Simon" sub="economist · 1971" start={150} hold={150} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={5 * S}>
        <SourceCard outlet="Herbert A. Simon" date="1971" title="Designing Organizations for an Information-Rich World" highlight={{ x: 0.06, y: 0.24, w: 0.8, h: 0.16 }} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={4 * S}>
        <ClipFrame title="What the other side says" credit="Channel Name · &quot;Video Title&quot; · 01:12 to 01:20 · excerpt for commentary" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={4 * S}>
        <ChapterCard n={2} total={3} title="Paying the tax on purpose" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={5 * S}>
        <TermCard term="attention tax" phonetic="/əˈten.ʃən tæks/" definition="The cost, paid in focus, for every service that charges you nothing." note="Nobody sends you the bill. You just notice the week is gone." />
      </Series.Sequence>
      <Series.Sequence durationInFrames={4 * S}>
        <StatCallout value={168} label="hours in every week. Same for everyone who ever lived." source="arithmetic (24 × 7)" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={4 * S}>
        <VersusCard stagger={8} left={{ label: 'The trap', items: ['Open the feed to wake up', 'Let the default decide', 'Rest by scrolling'] }} right={{ label: 'The strategy', items: ['Decide the day first', 'Pick the default on purpose', 'Rest by doing nothing'] }} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={4 * S}>
        <CommentaryEnd next="The Comfort Trap" />
      </Series.Sequence>
    </Series>
    <Grain />
    <Scanlines />
  </AbsoluteFill>
);
export default Reel;
