'use client';
import { useEffect, useState } from 'react';
import { regions, connection, quarters, hourly, daily } from './data';

const speedColor = (v) => (v < 60 ? '#f5b84b' : v <= 150 ? '#35d0a0' : '#4aa8ff');

function Card({ title, children, className = '' }) {
  return (
    <section className={'card ' + className}>
      {title && <h3>{title}</h3>}
      {children}
    </section>
  );
}

function Kpi({ label, value, unit, note }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}<span>{unit}</span></div>
      {note && <div className="kpi-note">{note}</div>}
    </div>
  );
}

function Donut() {
  const total = connection.reduce((s, c) => s + c.value, 0);
  let acc = 0;
  const r = 40, c = 2 * Math.PI * r;
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" width="110" height="110">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1c2a3f" strokeWidth="14" />
        {connection.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle key={s.label} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="14"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} transform="rotate(-90 50 50)" />
          );
          acc += len;
          return el;
        })}
      </svg>
      <ul className="legend">
        {connection.map((s) => (
          <li key={s.label}><i style={{ background: s.color }} />{s.label}<b>{s.value}%</b></li>
        ))}
      </ul>
    </div>
  );
}

function LineChart({ data, x, y, height = 120, area = false, color = '#4aa8ff', labels = true }) {
  const w = 400, h = height, pad = 14;
  const vals = data.map(y);
  const max = Math.max(...vals) * 1.1, min = 0;
  const px = (i) => pad + (i * (w - pad * 2)) / (data.length - 1);
  const py = (v) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const pts = vals.map((v, i) => `${px(i)},${py(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h + 14}`} className="chart" preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={pad} x2={w - pad} y1={h * t} y2={h * t} stroke="#1c2a3f" strokeWidth="1" />
      ))}
      {area && <polygon points={`${pad},${h - pad} ${pts} ${w - pad},${h - pad}`} fill={color} opacity="0.22" />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={px(i)} cy={py(vals[i])} r="3" fill={color} />
          {labels && (
            <text x={px(i)} y={h + 10} textAnchor="middle" fontSize="9" fill="#7f93ad">{x(d, i)}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

function DailyChart() {
  const w = 400, h = 120, pad = 14;
  const maxT = Math.max(...daily.map((d) => d.tests)) * 1.1;
  const bw = (w - pad * 2) / daily.length;
  const pts = daily.map((d, i) => `${pad + i * bw + bw / 2},${h - pad - (d.speed / 200) * (h - pad * 2)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h + 14}`} className="chart" preserveAspectRatio="none">
      {daily.map((d, i) => {
        const bh = (d.tests / maxT) * (h - pad * 2);
        return (
          <g key={d.d}>
            <rect x={pad + i * bw + 6} y={h - pad - bh} width={bw - 12} height={bh} rx="3" fill="#2b4a73" />
            <text x={pad + i * bw + bw / 2} y={h + 10} textAnchor="middle" fontSize="9" fill="#7f93ad">{d.d}</text>
          </g>
        );
      })}
      <polyline points={pts} fill="none" stroke="#35d0a0" strokeWidth="2.5" />
    </svg>
  );
}

export default function Dashboard() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const maxSpeed = Math.max(...regions.map((r) => r.speed));
  const today = daily[daily.length - 1];

  return (
    <main className="dash">
      <header className="top">
        <div>
          <h1>Internet Quality · Demo Country</h1>
          <p>Speed test analytics · fixed access network · <b>fictional demo data</b></p>
        </div>
        <div className="clock">{now ? now.toLocaleTimeString('en-GB') : '--:--:--'}</div>
      </header>

      <div className="grid">
        <Card title="Top regions" className="regions">
          <div className="sub"><span>tests · avg speed, Mbps</span></div>
          <ol>
            {regions.map((r, i) => (
              <li key={r.name}>
                <span className="rk">{i + 1}</span>
                <span className="rn">{r.name}</span>
                <span className="bar"><i style={{ width: `${(r.speed / maxSpeed) * 100}%`, background: speedColor(r.speed) }} /></span>
                <span className="rt">{r.tests.toLocaleString('en-US')}</span>
                <b>{r.speed}</b>
              </li>
            ))}
          </ol>
        </Card>

        <div className="center">
          <div className="kpis">
            <Kpi label="Tests today" value={today.tests.toLocaleString('en-US')} note="▲ 2.1% vs yesterday" />
            <Kpi label="Avg speed" value="147" unit=" Mbps" />
            <Kpi label="Median" value="72.3" unit=" Mbps" />
            <Kpi label="Upload" value="139" unit=" Mbps" />
            <Kpi label="Faster than 100" value="15" unit=" of 19 regions" />
          </div>
          <Card title="Average speed by hour (Mbps)" className="hourly">
            <LineChart data={hourly} x={(d, i) => (i % 3 === 0 ? String(i).padStart(2, '0') : '')} y={(d) => d} area height={150} />
          </Card>
        </div>

        <div className="right">
          <Card title="Highlights">
            <ul className="hl">
              <li><span>Top region: North Harbor</span><b>195 Mbps</b></li>
              <li><span>Country median</span><b>72.3 Mbps</b></li>
              <li><span>Average upload</span><b>139 Mbps</b></li>
            </ul>
          </Card>
          <Card title="Trends">
            <p className="trend">Download speed over 6 quarters: <b>+25%</b> (118 → 148 Mbps)</p>
            <p className="trend">Daily tests: <b>{today.tests.toLocaleString('en-US')}</b> — users actively check their network</p>
          </Card>
        </div>

        <Card title="Connection type · share of tests" className="b1"><Donut /></Card>
        <Card title="Average speed by quarter (Mbps)" className="b2">
          <LineChart data={quarters} x={(d) => d.q} y={(d) => d.v} />
        </Card>
        <Card title="Tests and speed by day" className="b3"><DailyChart /></Card>
      </div>
      <footer>Demo project · built with Next.js · all numbers are fictional</footer>
    </main>
  );
}
