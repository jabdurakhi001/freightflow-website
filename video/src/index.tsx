import { Composition, registerRoot } from 'remotion';
import { HeroReveal, HERO_DURATION, HERO_FPS } from './HeroReveal';

function Root() {
  return (
    <Composition
      id="HeroReveal"
      component={HeroReveal}
      durationInFrames={HERO_DURATION}
      fps={HERO_FPS}
      width={1280}
      height={720}
    />
  );
}

registerRoot(Root);
