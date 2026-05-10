import { useMemo } from "react";
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";

function fmtDate(d: string) {
  if (d === "Unscheduled") return "Unscheduled / Anytime";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export function StaticJourneyMap({ days }: { days: any[] }) {
  const MAP_WIDTH = 1000;
  const ROW_HEIGHT = 200;
  const AMPLITUDE = 300;

  const journey = useMemo(() => {
    const arr: any[] = [];
    days.forEach((day, idx) => {
      arr.push({ type: 'day', data: day, id: day.date, idx });
      day.stops.forEach(({ stop, acts }: any) => {
        acts.forEach((a: any) => arr.push({ type: 'act', data: a, id: a.id, stop }));
      });
    });
    return arr;
  }, [days]);

  const totalHeight = Math.max(1, journey.length) * ROW_HEIGHT;
  
  const pathLines = useMemo(() => {
    const lines: string[] = [];
    for (let i = 0; i < journey.length; i++) {
      const targetY = i * ROW_HEIGHT + (ROW_HEIGHT / 2);
      const targetX = (MAP_WIDTH / 2) + Math.sin(i * Math.PI / 2) * AMPLITUDE; 
      
      if (i === 0) {
        lines.push(`M ${targetX} ${targetY}`);
      } else {
        const prevY = (i - 1) * ROW_HEIGHT + (ROW_HEIGHT / 2);
        const prevX = (MAP_WIDTH / 2) + Math.sin((i - 1) * Math.PI / 2) * AMPLITUDE;
        const curve = `C ${prevX} ${prevY + ROW_HEIGHT/2}, ${targetX} ${targetY - ROW_HEIGHT/2}, ${targetX} ${targetY}`;
        lines.push(curve);
      }
    }
    return lines;
  }, [journey]);

  const getImageUrl = (item: any) => {
    if (item.type === 'act' && item.data.image_url) return item.data.image_url;
    if (item.type === 'act' && item.data.title) return `https://loremflickr.com/200/200/${encodeURIComponent(item.data.title.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').slice(0,2).join(','))}/all`;
    return null;
  };

  return (
    <div className="relative mx-auto mt-12 mb-24 animate-fade-up w-full max-w-5xl" style={{ height: `${journey.length * 160}px` }}>
      {journey.map((_, i) => {
        if (i % 2 !== 0) return null;
        const targetY = i * ROW_HEIGHT + (ROW_HEIGHT / 2);
        const topPct = (targetY / totalHeight) * 100;
        const isLeft = (i % 4 === 0);
        return (
          <div key={`deco-${i}`} className="absolute text-5xl md:text-7xl opacity-30 z-0 animate-float pointer-events-none" style={{ top: `calc(${topPct}% - 40px)`, left: isLeft ? '5%' : '85%', animationDelay: `${i * 0.5}s` }}>
            {['🌲', '☁️', '⛰️', '🌴', '🏕️', '🎈', '☁️'][i % 7]}
          </div>
        )
      })}

      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none" viewBox={`0 0 ${MAP_WIDTH} ${totalHeight}`}>
        <path d={pathLines.join(' ')} vectorEffect="non-scaling-stroke" stroke="rgba(37,99,235,0.15)" strokeWidth="10" strokeLinecap="round" strokeDasharray="1 24" fill="none" />
      </svg>

      {journey.map((item, i) => {
        const targetY = i * ROW_HEIGHT + (ROW_HEIGHT / 2);
        const targetX = (MAP_WIDTH / 2) + Math.sin(i * Math.PI / 2) * AMPLITUDE;
        
        const topPct = (targetY / totalHeight) * 100;
        const leftPct = (targetX / MAP_WIDTH) * 100;
        
        const isLeft = targetX > (MAP_WIDTH / 2) || (targetX === (MAP_WIDTH / 2) && i % 4 === 2);

        return (
          <div 
            key={item.id} 
            className="absolute flex items-center gap-4 md:gap-8 -translate-y-1/2 z-20"
            style={{ 
              top: `${topPct}%`, 
              left: isLeft ? 'auto' : `${leftPct}%`, 
              right: isLeft ? `${100 - leftPct}%` : 'auto',
              flexDirection: isLeft ? 'row-reverse' : 'row'
            }}
          >
            <div className={`shrink-0 rounded-full flex items-center justify-center shadow-lg ${item.type === 'day' ? 'w-14 h-14 md:w-16 md:h-16 border-[3px] bg-gradient-hero text-white' : 'w-10 h-10 md:w-12 md:h-12 border-[2px] bg-white text-primary border-primary/50'} relative overflow-hidden z-20`}>
              {getImageUrl(item) ? (
                <img src={getImageUrl(item)} className="w-full h-full object-cover" alt="" />
              ) : (
                item.type === 'day' ? <Calendar className="w-5 h-5 md:w-6 md:h-6" /> : <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </div>

            <div className="w-32 sm:w-40 md:w-48 p-2 sm:p-3 rounded-2xl shadow-xl glass border border-white text-slate-800">
              {item.type === 'act' && getImageUrl(item) && (
                <img src={getImageUrl(item)} className="w-full h-12 sm:h-16 md:h-20 object-cover rounded-lg mb-2 shadow-sm" alt="" />
              )}
              
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 text-primary">
                {item.type === 'day' ? (item.data.isUnscheduled ? 'Flexible' : `Day ${item.idx + 1}`) : item.data.category || 'Activity'}
              </p>
              <p className="text-xs sm:text-sm font-bold leading-tight line-clamp-2">
                {item.type === 'day' ? fmtDate(item.data.date) : item.data.title}
              </p>
              
              {item.type === 'act' && (item.data.start_time || item.stop?.city) && (
                <p className="text-[10px] sm:text-[11px] mt-1 sm:mt-2 flex items-center gap-1 font-semibold text-slate-500">
                  {item.data.start_time ? <><Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {item.data.start_time}</> : <><MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {item.stop?.city}</>}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
