import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TickHistoryItem } from '../types/deriv';
import './LiveChart.css';
interface LiveChartProps {
  symbol: string;
  data: TickHistoryItem[];
  currentPrice?: number;
  pipSize?: number;
}
function formatTime(epoch: number): string {
  const d = new Date(epoch*1000);
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
}
export default function LiveChart({ symbol, data, currentPrice, pipSize=0.01 }: LiveChartProps) {
  const decimals = String(pipSize).split('.')[1]?.length ?? 2;
  const isUp = data.length>=2 ? data[data.length-1].quote>=data[0].quote : true;
  const color = isUp ? '#00d4a1' : '#ff4d6a';
  const min = data.length>0 ? Math.min(...data.map(d=>d.quote)) : 0;
  const max = data.length>0 ? Math.max(...data.map(d=>d.quote)) : 0;
  const range = max-min;
  const yDomain = [min-range*0.05, max+range*0.05];
  const chartData = data.map(d => ({ time: formatTime(d.epoch), price: d.quote }));
  return (
    <div className="live-chart-card card">
      <div className="chart-header">
        <div>
          <div className="chart-symbol">{symbol}</div>
          <div className="chart-price mono" style={{color}}>
            {currentPrice!==undefined ? currentPrice.toFixed(decimals) : '—'}
            {data.length>=2 && <span style={{color,fontSize:12}}> {isUp?'▲':'▼'} {Math.abs(data[data.length-1].quote-data[0].quote).toFixed(decimals)}</span>}
          </div>
        </div>
        <div className="chart-meta">
          <span className="tag tag-muted">{data.length} ticks</span>
          <span className="live-badge">● LIVE</span>
        </div>
      </div>
      <div className="chart-area">
        {data.length<2 ? (
          <div className="chart-empty">Waiting for price data…</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{top:4,right:4,left:0,bottom:0}}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25}/>
                  <stop offset="100%" stopColor={color} stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,74,0.6)" vertical={false}/>
              <XAxis dataKey="time" tick={{fill:'#4a5a78',fontSize:10,fontFamily:'JetBrains Mono'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
              <YAxis domain={yDomain} tick={{fill:'#4a5a78',fontSize:10,fontFamily:'JetBrains Mono'}} axisLine={false} tickLine={false} tickFormatter={(v)=>v.toFixed(decimals)} width={70}/>
              <Tooltip contentStyle={{background:'#131b2e',border:'1px solid #1e2d4a',borderRadius:8,fontFamily:'JetBrains Mono',fontSize:12,color:'#e8edf5'}} labelStyle={{color:'#7a8ba8'}} formatter={(val:number)=>[val.toFixed(decimals),'Price']}/>
              <Area type="monotone" dataKey="price" stroke={color} strokeWidth={1.5} fill="url(#priceGrad)" dot={false} isAnimationActive={false}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
