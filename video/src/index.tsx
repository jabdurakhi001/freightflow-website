import { Composition, Still, registerRoot } from 'remotion';
import { DRIVE_FPS, DRIVE_FRAMES, HighwayDrive, type DriveProps } from './HighwayDrive';
import { OgCard } from './OgCard';

function Root() {
  return (
    <>
      {/* Landscape: road right of centre, leaving the left side for the hero sign. */}
      <Composition
        id="DriveLandscape"
        component={HighwayDrive}
        durationInFrames={DRIVE_FRAMES}
        fps={DRIVE_FPS}
        width={1600}
        height={900}
        defaultProps={{ vpX: 0.75, horizon: 0.47, focal: 0.95 } satisfies DriveProps}
      />
      {/* Portrait (phones): road centred, horizon high so the sign card can sit below. */}
      <Composition
        id="DrivePortrait"
        component={HighwayDrive}
        durationInFrames={DRIVE_FRAMES}
        fps={DRIVE_FPS}
        width={900}
        height={1600}
        defaultProps={{ vpX: 0.56, horizon: 0.36, focal: 0.95 } satisfies DriveProps}
      />
      <Still id="OgCard" component={OgCard} width={1200} height={630} />
    </>
  );
}

registerRoot(Root);
