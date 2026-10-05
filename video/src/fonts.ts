import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import '@fontsource/overpass/700.css';
import '@fontsource/overpass/800.css';
import '@fontsource/overpass/900.css';
import '@fontsource/overpass-mono/600.css';

export const SANS = '"Overpass", sans-serif';
export const MONO = '"Overpass Mono", monospace';

/** Holds the render until the sign faces have loaded, so no frame shows a fallback font. */
export function useSignFonts() {
  const [handle] = useState(() => delayRender('Overpass'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`800 40px "Overpass"`),
      document.fonts.load(`900 40px "Overpass"`),
      document.fonts.load(`600 20px "Overpass Mono"`),
    ]).finally(() => continueRender(handle));
  }, [handle]);
}
