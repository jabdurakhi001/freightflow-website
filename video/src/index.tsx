import { Still, registerRoot } from 'remotion';
import { FootageStill } from './FootageStill';
import { OgCard } from './OgCard';

function Root() {
  return (
    <>
      <Still id="OgCard" component={OgCard} width={1200} height={630} />
      {/* Photo slots on the site, cut from the same (cleaned) footage. */}
      <Still id="PhotoFleet" component={FootageStill} width={1200} height={900} defaultProps={{ frame: 38, focus: '40% 50%', zoom: 1.04 }} />
      <Still id="PhotoDrivers" component={FootageStill} width={1600} height={900} defaultProps={{ frame: 48, focus: '40% 60%', zoom: 1.04 }} />
      <Still id="PhotoFinal" component={FootageStill} width={1600} height={900} defaultProps={{ frame: 56, focus: '40% 60%', zoom: 1.04 }} />
    </>
  );
}

registerRoot(Root);
