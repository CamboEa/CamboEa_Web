'use client';

import React, { memo, useEffect, useState } from 'react';

interface MyfxbookWidgetBaseProps {
  height?: number;
  refreshIntervalMs?: number;
}

function useRefreshTick(refreshIntervalMs: number) {
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (refreshIntervalMs <= 0) return;

    const intervalId = window.setInterval(() => {
      setRefreshTick((prev) => prev + 1);
    }, refreshIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [refreshIntervalMs]);

  return refreshTick;
}

interface MyfxbookForexHeatmapWidgetProps extends MyfxbookWidgetBaseProps {}

export const MyfxbookForexHeatmapWidget = memo(function MyfxbookForexHeatmapWidget({
  height = 480,
  refreshIntervalMs = 5_000,
}: MyfxbookForexHeatmapWidgetProps) {
  const refreshTick = useRefreshTick(refreshIntervalMs);
  const iframeSrc = `https://widgets.myfxbook.com/widgets/heat-map.html?symbols=17,7,1,4,2,3,50,51&type=0&_rt=${refreshTick}`;

  return (
    <div className="space-y-2">
      <div style={{ height }}>
        <iframe
          src={iframeSrc}
          width="100%"
          height="100%"
          frameBorder="0"
          title="Myfxbook Forex Heat Map"
          loading="lazy"
        />
      </div>
    </div>
  );
});

interface MyfxbookVolatilityWidgetProps extends MyfxbookWidgetBaseProps {}

export const MyfxbookVolatilityWidget = memo(function MyfxbookVolatilityWidget({
  height = 520,
  refreshIntervalMs = 30_000,
}: MyfxbookVolatilityWidgetProps) {
  const refreshTick = useRefreshTick(refreshIntervalMs);
  const iframeSrc = `https://widgets.myfxbook.com/widgets/market-volatility.html?symbols=51,50,17,7,1,4,2,3&type=0&_rt=${refreshTick}`;

  return (
    <div className="space-y-2">
      <div style={{ height }}>
        <iframe
          src={iframeSrc}
          width="100%"
          height="100%"
          frameBorder="0"
          title="Myfxbook Market Volatility"
          loading="lazy"
        />
      </div>
    </div>
  );
});

interface MyfxbookEconomicCalendarWidgetProps extends MyfxbookWidgetBaseProps {}

export const MyfxbookEconomicCalendarWidget = memo(function MyfxbookEconomicCalendarWidget({
  height = 620,
  refreshIntervalMs = 30_000,
}: MyfxbookEconomicCalendarWidgetProps) {
  const refreshTick = useRefreshTick(refreshIntervalMs);
  const iframeSrc = `https://widget.myfxbook.com/widget/calendar.html?lang=kh&impacts=0,1,2,3&countries=China,Japan,United%20Kingdom,United%20States&_rt=${refreshTick}`;

  return (
    <div className="space-y-2">
      <div style={{ height }}>
        <iframe
          src={iframeSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          title="Economic Calendar"
          loading="lazy"
        />
      </div>
    </div>
  );
});
