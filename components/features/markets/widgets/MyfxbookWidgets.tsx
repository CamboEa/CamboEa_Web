'use client';

import React, { memo } from 'react';

interface MyfxbookForexHeatmapWidgetProps {
  height?: number;
}

export const MyfxbookForexHeatmapWidget = memo(function MyfxbookForexHeatmapWidget({
  height = 480,
}: MyfxbookForexHeatmapWidgetProps) {
  return (
    <div className="space-y-2">
      <div style={{ height }}>
        <iframe
          src="https://widgets.myfxbook.com/widgets/heat-map.html?symbols=17,7,1,4,2,3,50,51&type=0"
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

interface MyfxbookVolatilityWidgetProps {
  height?: number;
}

export const MyfxbookVolatilityWidget = memo(function MyfxbookVolatilityWidget({
  height = 520,
}: MyfxbookVolatilityWidgetProps) {
  return (
    <div className="space-y-2">
      <div style={{ height }}>
        <iframe
          src="https://widgets.myfxbook.com/widgets/market-volatility.html?symbols=17,7,1,4,2,3,50,51&type=0"
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

interface MyfxbookEconomicCalendarWidgetProps {
  height?: number;
}

export const MyfxbookEconomicCalendarWidget = memo(function MyfxbookEconomicCalendarWidget({
  height = 620,
}: MyfxbookEconomicCalendarWidgetProps) {
  return (
    <div className="space-y-2">
      <div style={{ height }}>
        <iframe
          src="https://widget.myfxbook.com/widget/calendar.html?lang=kh&impacts=0,1,2,3&countries=China,Japan,United%20Kingdom,United%20States"
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
