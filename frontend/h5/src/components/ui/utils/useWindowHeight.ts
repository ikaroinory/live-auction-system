import { useLayoutEffect, useState } from 'react';

export function useWindowHeight() {
  const [height, setHeight] = useState(() => window.innerHeight);

  useLayoutEffect(() => {
    const handleResize = () => setHeight(window.innerHeight);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return height;
}
