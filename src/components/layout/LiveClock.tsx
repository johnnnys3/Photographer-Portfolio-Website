'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSite } from '@/components/SiteProvider';

/** `ACCRA / 14:32`. Renders `--:--` until mounted so server and client markup match. */
export function LiveClock({ withCity = true }: { withCity?: boolean }) {
  const { city, timezone } = useSite();
  const [time, setTime] = useState('--:--');
  const fmt = useMemo(
    () => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }),
    [timezone],
  );

  useEffect(() => {
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, [fmt]);

  return (
    <span>
      {withCity && `${city} / `}
      {time}
    </span>
  );
}
