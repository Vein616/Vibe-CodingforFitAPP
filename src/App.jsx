import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dumbbell, UtensilsCrossed, Scale, BarChart3, Plus, X, TrendingUp,
  TrendingDown, Minus, Sparkles, Loader2, Trash2, Calendar as CalendarIcon,
  LineChart as LineChartIcon, Play, Square, Check, Pencil, ChevronRight, ChevronDown
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';

const C = {
  blue: '#0A84FF',
  green: '#30D158',
  orange: '#FF9F0A',
  red: '#FF453A',
  purple: '#5E5CE6',
  pink: '#FF375F',
  teal: '#64D2FF',
  indigo: '#5E5CE6',
  text: '#1C1C1E',
  sub: '#6E6E73',
  sep: 'rgba(60,60,67,0.13)',
};

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif";

const GLASS = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.6)',
};

const MUSCLE_GROUPS = [
  { key: 'chest', label: '胸', color: C.red, exercises: ['杠铃卧推', '哑铃卧推', '上斜哑铃卧推', '下斜杠铃卧推', '蝴蝶机夹胸', '双杠臂屈伸', '绳索夹胸', '俯卧撑'] },
  { key: 'back', label: '背', color: C.blue, exercises: ['引体向上', '高位下拉', '坐姿绳索划船', '杠铃划船', '单臂哑铃划船', '硬拉', 'T杠划船', '直臂下拉'] },
  { key: 'shoulder', label: '肩', color: C.orange, exercises: ['杠铃推举', '哑铃肩推', '侧平举', '前平举', '反向飞鸟', '阿诺德推举', '直立划船', '耸肩'] },
  { key: 'leg', label: '腿', color: C.purple, exercises: ['杠铃深蹲', '腿举机', '腿屈伸', '腿弯举', '保加利亚分腿蹲', '箭步蹲', '臀桥', '站姿提踵'] },
  { key: 'arm', label: '臂', color: C.teal, exercises: ['杠铃弯举', '哑铃弯举', '锤式弯举', '绳索下压', '窄距卧推', '反手臂屈伸', '牧师凳弯举', '过头臂屈伸'] },
  { key: 'core', label: '腹', color: C.pink, exercises: ['卷腹', '平板支撑', '悬垂举腿', '俄罗斯转体', '山羊挺身', '自行车卷腹', '侧平板支撑'] },
  { key: 'cardio', label: '有氧', color: C.green, exercises: ['跑步', '动感单车', '游泳', '划船机', '椭圆机', '跳绳', '爬楼机'] },
];

const MEAL_TYPES = [
  { key: '早餐', color: C.orange },
  { key: '午餐', color: C.blue },
  { key: '晚餐', color: C.purple },
  { key: '加餐', color: C.green },
];

const UNITS = ['次', 'kg', '秒', '分'];

function uid() { return Math.random().toString(36).slice(2, 10); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function nowTime() { return new Date().toTimeString().slice(0, 5); }
function fmtDate(d) {
  const dt = new Date(d + 'T00:00:00');
  return `${dt.getMonth() + 1}月${dt.getDate()}日`;
}
function fmtSec(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

/* ---------- shared UI ---------- */

function Header({ title, icon: Icon, color }) {
  return (
    <div style={{ padding: '26px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
        background: `linear-gradient(135deg, ${color}, ${color}AA)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 6px 16px ${color}4D`,
      }}>
        {Icon && <Icon size={22} color="#fff" strokeWidth={2.2} />}
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.5, fontFamily: FONT }}>{title}</h1>
    </div>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{ ...GLASS, borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 30px rgba(31,38,135,0.08)', cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );
}

function Row({ children, last, style, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: last ? 'none' : `0.5px solid ${C.sep}`, cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );
}

function SegControl({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', ...GLASS, borderRadius: 14, padding: 3, gap: 2 }}>
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          style={{
            flex: 1, border: 'none', borderRadius: 11, padding: '8px 10px',
            background: value === opt.key ? 'rgba(255,255,255,0.9)' : 'transparent',
            color: value === opt.key ? C.text : C.sub,
            fontWeight: value === opt.key ? 600 : 500, fontSize: 13,
            fontFamily: FONT, cursor: 'pointer',
            boxShadow: value === opt.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            transition: 'all 0.2s',
          }}
        >
          {opt.icon && <opt.icon size={13} />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Chip({ label, active, done, onClick, color, glass }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: active ? 'none' : '1px solid rgba(255,255,255,0.6)',
        borderRadius: 22, padding: '9px 16px', fontSize: 14,
        fontFamily: FONT, cursor: done ? 'default' : 'pointer', fontWeight: 500,
        background: active ? (color || C.blue) : (done ? 'rgba(120,120,128,0.12)' : (glass ? 'rgba(255,255,255,0.45)' : '#EFEFF2')),
        backdropFilter: !active && glass ? 'blur(20px)' : 'none',
        color: active ? '#FFFFFF' : (done ? C.sub : C.text),
        opacity: done ? 0.7 : 1,
        transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', gap: 4,
      }}
    >
      {done && <Check size={12} />}
      {label}
    </button>
  );
}

function PrimaryButton({ children, onClick, disabled, color }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', border: 'none', borderRadius: 18, padding: '15px',
        background: disabled ? 'rgba(120,120,128,0.16)' : (color || C.blue),
        color: disabled ? C.sub : '#fff',
        fontSize: 16, fontWeight: 600, fontFamily: FONT,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        boxShadow: disabled ? 'none' : `0 6px 16px ${color || C.blue}55`,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

function SmallButton({ children, onClick, color, outline }) {
  return (
    <button onClick={onClick} style={{
      border: outline ? `1.5px solid ${color}` : 'none', borderRadius: 20, padding: '8px 14px',
      background: outline ? 'transparent' : color, color: outline ? color : '#fff',
      fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 4,
    }}>
      {children}
    </button>
  );
}

function Empty({ text }) {
  return (
    <div style={{ padding: '30px 20px', textAlign: 'center', color: C.sub, fontFamily: FONT, fontSize: 14 }}>
      {text}
    </div>
  );
}

function AppBackground({ children }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #EAF4FF 0%, #DCE9FF 35%, #E4EEFF 65%, #F0F6FF 100%)',
      minHeight: 640, maxWidth: 430, margin: '0 auto', position: 'relative',
    }}>
      {children}
    </div>
  );
}

const inputStyle = { border: `1px solid rgba(255,255,255,0.7)`, background: 'rgba(255,255,255,0.6)', borderRadius: 10, padding: '8px 10px', fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' };

function Modal({ title, onClose, children, width }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, boxSizing: 'border-box' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: width || 380, maxHeight: '82vh', overflowY: 'auto', boxSizing: 'border-box',
        background: 'rgba(250,251,255,0.95)', backdropFilter: 'blur(30px) saturate(180%)', WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        borderRadius: 26, padding: '18px 18px 20px', boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
        animation: 'modalPop 0.26s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <style>{`@keyframes modalPop { from { transform: scale(0.86); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: FONT, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'rgba(120,120,128,0.16)', borderRadius: 14, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={15} color={C.sub} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const navBtnStyle = { border: 'none', background: 'rgba(120,120,128,0.12)', borderRadius: 10, width: 30, height: 30, fontSize: 16, color: C.text, cursor: 'pointer', fontFamily: FONT, flexShrink: 0 };

function MonthCalendar({ year, month, onPrev, onNext, valueByDate, colorFn, binary, onDayClick }) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const today = todayStr();
  const monthLabel = `${year}年${month + 1}月`;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={onPrev} style={navBtnStyle}>‹</button>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: FONT }}>{monthLabel}</span>
        <button onClick={onNext} style={navBtnStyle}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 8 }}>
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, color: C.sub, fontFamily: FONT, fontWeight: 600 }}>{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 6 }}>
          {week.map((d, di) => {
            if (!d) return <div key={di} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const val = valueByDate[dateStr] || 0;
            const has = val > 0;
            const isToday = dateStr === today;
            return (
              <button key={di} onClick={() => onDayClick(dateStr)} style={{
                aspectRatio: '1', border: isToday ? `1.5px solid ${C.blue}` : 'none', borderRadius: 11,
                background: binary ? (has ? colorFn(1) : 'rgba(120,120,128,0.07)') : colorFn(val),
                cursor: 'pointer', fontSize: 14, fontWeight: has ? 700 : 500,
                color: has ? '#fff' : C.sub, fontFamily: FONT, padding: 0,
              }}>{d}</button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ---------- Workout Tab ---------- */

async function searchExercisesAI(query) {
  const response = await fetch('/api/search-exercises', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error('api not available');
  return response.json();
}

function WorkoutTab({ workouts, save }) {
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(nowTime());
  const [showPicker, setShowPicker] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [pending, setPending] = useState([]);
  const [selected, setSelected] = useState([]);
  const [custom, setCustom] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [searchPending, setSearchPending] = useState([]);
  const [session, setSession] = useState({ status: 'idle', startedAt: null, elapsedSec: 0, startTimeStr: null, endTimeStr: null });
  const [restTarget, setRestTarget] = useState(90);
  const [editingRestTarget, setEditingRestTarget] = useState(false);
  const [restTargetDraft, setRestTargetDraft] = useState('90');
  const restAnchor = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [calDate, setCalDate] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [calDayDetail, setCalDayDetail] = useState(null);
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (session.status !== 'running') return;
    const id = setInterval(() => forceTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [session.status]);

  function addExercise(name, groupLabel, groupColor) {
    if (selected.some(e => e.name === name)) return;
    setSelected(s => [...s, {
      id: uid(), name, group: groupLabel, color: groupColor, collapsed: false, unit: '次',
      sets: [{ id: uid(), value: 8, restSec: null, completed: false }],
    }]);
  }
  function togglePending(name) {
    if (selected.some(e => e.name === name)) return;
    setPending(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name]);
  }
  function confirmAddPending(group) {
    pending.forEach(name => addExercise(name, group.label, group.color));
    setPending([]);
  }
  function toggleSearchPending(name) {
    if (selected.some(e => e.name === name)) return;
    setSearchPending(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name]);
  }
  function confirmAddSearchPending() {
    searchPending.forEach(name => addExercise(name, 'AI推荐', C.purple));
    setSearchPending([]);
  }
  async function runSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true); setSearchError(''); setSearchResults([]);
    try {
      const list = await searchExercisesAI(searchQuery.trim());
      setSearchResults(Array.isArray(list) ? list : []);
    } catch (e) {
      setSearchError('搜索失败，可以在左侧按部位手动添加');
    } finally {
      setSearching(false);
    }
  }
  function closePicker() {
    setShowPicker(false);
    setActiveGroup(null);
    setPending([]);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
    setSearchPending([]);
  }
  function addCustom() {
    const name = custom.trim();
    if (!name) return;
    const g = MUSCLE_GROUPS.find(g => g.key === activeGroup);
    addExercise(name, g ? g.label : '自定义', g ? g.color : C.sub);
    setCustom('');
  }
  function removeEx(id) {
    setSelected(s => s.filter(e => e.id !== id));
  }
  function toggleCollapse(id) {
    setSelected(s => s.map(e => e.id === id ? { ...e, collapsed: !e.collapsed } : e));
  }
  function cycleUnit(id) {
    setSelected(s => s.map(e => {
      if (e.id !== id) return e;
      const idx = UNITS.indexOf(e.unit);
      return { ...e, unit: UNITS[(idx + 1) % UNITS.length] };
    }));
  }
  function addSetToExercise(id) {
    setSelected(s => s.map(e => {
      if (e.id !== id) return e;
      const last = e.sets[e.sets.length - 1];
      return { ...e, sets: [...e.sets, { id: uid(), value: last ? last.value : 8, restSec: null, completed: false }] };
    }));
  }
  function updateSetValue(exId, setId, value) {
    setSelected(s => s.map(e => e.id === exId ? { ...e, sets: e.sets.map(st => st.id === setId ? { ...st, value } : st) } : e));
  }
  function toggleSetComplete(exId, setId) {
    const now = Date.now();
    let becameComplete = false;
    setSelected(s => s.map(e => {
      if (e.id !== exId) return e;
      return {
        ...e, sets: e.sets.map(st => {
          if (st.id !== setId) return st;
          if (!st.completed) {
            becameComplete = true;
            const delta = restAnchor.current ? Math.round((now - restAnchor.current) / 1000) : null;
            return { ...st, completed: true, restSec: delta };
          }
          return { ...st, completed: false, restSec: null };
        }),
      };
    }));
    if (becameComplete) restAnchor.current = now;
  }

  function startSession() {
    setSession({ status: 'running', startedAt: Date.now(), elapsedSec: 0, startTimeStr: nowTime(), endTimeStr: null });
    restAnchor.current = Date.now();
  }
  function stopSession() {
    setSession(s => {
      const elapsed = s.elapsedSec + Math.floor((Date.now() - s.startedAt) / 1000);
      return { status: 'stopped', startedAt: null, elapsedSec: elapsed, startTimeStr: s.startTimeStr, endTimeStr: nowTime() };
    });
  }
  function displaySessionSec() {
    if (session.status === 'running' && session.startedAt) return session.elapsedSec + Math.floor((Date.now() - session.startedAt) / 1000);
    return session.elapsedSec;
  }
  function displayRestSec() {
    if (session.status !== 'running' || !restAnchor.current) return 0;
    return Math.floor((Date.now() - restAnchor.current) / 1000);
  }
  function confirmRestTarget() {
    const v = parseInt(restTargetDraft, 10);
    if (v && v > 0) setRestTarget(v);
    setEditingRestTarget(false);
  }

  function saveSession() {
    if (selected.length === 0) return;
    const entry = {
      id: uid(), date, time, startTime: session.startTimeStr, endTime: session.endTimeStr, totalDurationSec: session.elapsedSec,
      exercises: selected.map(e => ({ name: e.name, group: e.group, color: e.color, unit: e.unit, sets: e.sets.map(s => ({ value: s.value, completed: s.completed, restSec: s.restSec })) })),
    };
    save([entry, ...workouts]);
    resetAll();
  }
  function discardSession() {
    resetAll();
  }
  function resetAll() {
    setSelected([]);
    setActiveGroup(null);
    setPending([]);
    restAnchor.current = null;
    setSession({ status: 'idle', startedAt: null, elapsedSec: 0, startTimeStr: null, endTimeStr: null });
  }

  function removeWorkout(id) {
    save(workouts.filter(w => w.id !== id));
  }
  function startEdit(w) {
    setEditingId(w.id);
    setEditDraft({ date: w.date, time: w.time, exercises: w.exercises.map(e => ({ ...e, sets: e.sets ? e.sets.map(s => ({ ...s })) : [] })) });
  }
  function cancelEdit() { setEditingId(null); setEditDraft(null); }
  function saveEdit(id) {
    save(workouts.map(w => w.id === id ? { ...w, date: editDraft.date, time: editDraft.time, exercises: editDraft.exercises } : w));
    setEditingId(null); setEditDraft(null);
  }
  function removeDraftEx(idx) {
    setEditDraft(d => ({ ...d, exercises: d.exercises.filter((_, i) => i !== idx) }));
  }

  const sorted = [...workouts].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const workoutDayMap = useMemo(() => { const m = {}; workouts.forEach(w => { m[w.date] = (m[w.date] || 0) + 1; }); return m; }, [workouts]);
  const currentGroup = MUSCLE_GROUPS.find(g => g.key === activeGroup);
  const restPct = Math.min(100, (displayRestSec() / restTarget) * 100);

  return (
    <div>
      <Header title="健身记录" icon={Dumbbell} color={C.green} />
      <div style={{ padding: '0 20px' }}>
        <Card style={{ marginBottom: 16 }}>
          <Row>
            <span style={{ fontSize: 15, color: C.text, fontFamily: FONT }}>日期</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 15, fontFamily: FONT, color: C.blue, textAlign: 'right' }} />
          </Row>
          <Row last>
            <span style={{ fontSize: 15, color: C.text, fontFamily: FONT }}>时间</span>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 15, fontFamily: FONT, color: C.blue, textAlign: 'right' }} />
          </Row>
        </Card>

        {showPicker && (
          <Modal title="添加训练动作" onClose={closePicker} width={400}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 78, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                {MUSCLE_GROUPS.map(g => (
                  <button key={g.key} onClick={() => { setActiveGroup(g.key); setPending([]); }} style={{
                    border: 'none', borderRadius: 12, padding: '10px 6px', cursor: 'pointer',
                    background: activeGroup === g.key ? g.color : 'rgba(120,120,128,0.08)',
                    color: activeGroup === g.key ? '#fff' : C.text,
                    fontSize: 13, fontWeight: 600, fontFamily: FONT, textAlign: 'center',
                  }}>{g.label}</button>
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 0, maxHeight: 300, overflowY: 'auto' }}>
                {!currentGroup ? (
                  <div style={{ fontSize: 13, color: C.sub, fontFamily: FONT, padding: '10px 4px' }}>先在左侧选择训练部位</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {currentGroup.exercises.map(ex => {
                        const added = selected.some(e => e.name === ex);
                        const isPending = pending.includes(ex);
                        return (
                          <Chip key={ex} label={ex} active={isPending} done={added} color={currentGroup.color} glass
                            onClick={() => togglePending(ex)} />
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: pending.length > 0 ? 8 : 0 }}>
                      <input
                        value={custom}
                        onChange={e => setCustom(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustom()}
                        placeholder="自定义动作"
                        style={{ flex: 1, ...inputStyle, fontSize: 13 }}
                      />
                      <button onClick={addCustom} style={{ border: 'none', background: currentGroup.color, borderRadius: 10, width: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Plus size={15} color="#fff" />
                      </button>
                    </div>
                    {pending.length > 0 && (
                      <SmallButton onClick={() => confirmAddPending(currentGroup)} color={currentGroup.color}>
                        <Plus size={13} /> 添加（{pending.length}）
                      </SmallButton>
                    )}
                  </>
                )}
              </div>
            </div>

            <div style={{ height: 1, background: C.sep, margin: '0 0 16px' }} />

            <p style={{ fontSize: 12, color: C.sub, margin: '0 2px 8px', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: 0.3 }}>AI 搜索相似动作</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runSearch()}
                placeholder="比如：适合肩膀的哑铃动作"
                style={{ flex: 1, ...inputStyle }}
              />
              <button onClick={runSearch} disabled={!searchQuery.trim() || searching} style={{
                border: 'none', background: (!searchQuery.trim() || searching) ? 'rgba(120,120,128,0.16)' : C.purple,
                borderRadius: 12, width: 42, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {searching ? <Loader2 size={17} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={17} color="#fff" />}
              </button>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
            {searchError && <div style={{ fontSize: 12, color: C.red, fontFamily: FONT, marginBottom: 10 }}>{searchError}</div>}
            {searchResults.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: searchPending.length > 0 ? 10 : 0 }}>
                  {searchResults.map(name => {
                    const added = selected.some(e => e.name === name);
                    const isPending = searchPending.includes(name);
                    return (
                      <Chip key={name} label={name} active={isPending} done={added} color={C.purple} glass
                        onClick={() => toggleSearchPending(name)} />
                    );
                  })}
                </div>
                {searchPending.length > 0 && (
                  <SmallButton onClick={confirmAddSearchPending} color={C.purple}>
                    <Plus size={14} /> 添加所选动作（{searchPending.length}）
                  </SmallButton>
                )}
              </div>
            )}

            <PrimaryButton onClick={closePicker} color={C.blue}>完成</PrimaryButton>
          </Modal>
        )}

        {selected.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: C.sub, margin: '0 4px 8px', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: 0.3 }}>本次训练</p>

            <Card style={{ marginBottom: 12 }}>
              <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.sub, fontFamily: FONT, marginBottom: 2 }}>总计时</div>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'monospace', color: session.status === 'running' ? C.green : C.text, marginBottom: 8 }}>
                    {fmtSec(displaySessionSec())}
                  </div>
                  {session.status !== 'stopped' && (
                    <SmallButton onClick={session.status === 'running' ? stopSession : startSession} color={session.status === 'running' ? C.red : C.green}>
                      {session.status === 'running' ? <Square size={12} fill="#fff" /> : <Play size={12} fill="#fff" />}
                      {session.status === 'running' ? '结束训练' : '开始训练'}
                    </SmallButton>
                  )}
                  {session.status === 'stopped' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <SmallButton onClick={discardSession} color={C.red} outline>
                        <Trash2 size={13} /> 删除
                      </SmallButton>
                      <SmallButton onClick={saveSession} color={C.green}>
                        <Check size={13} /> 保存
                      </SmallButton>
                    </div>
                  )}
                </div>

                {session.status === 'running' && (() => {
                  const pct = Math.min(1, displayRestSec() / restTarget);
                  const isRed = pct >= 0.8;
                  const r = 27, circ = 2 * Math.PI * r;
                  return (
                    <div style={{ position: 'relative', width: 66, height: 66, flexShrink: 0 }}
                      onClick={() => { setEditingRestTarget(!editingRestTarget); setRestTargetDraft(String(restTarget)); }}>
                      <svg width={66} height={66} style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx={33} cy={33} r={r} stroke="rgba(120,120,128,0.15)" strokeWidth={6} fill="none" />
                        <circle cx={33} cy={33} r={r} stroke={isRed ? C.red : C.green} strokeWidth={6} fill="none"
                          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: C.text }}>{fmtSec(displayRestSec())}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {editingRestTarget && (
                <div style={{ padding: '0 16px 14px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: C.sub, fontFamily: FONT }}>目标休息秒数</span>
                  <input type="number" value={restTargetDraft} onChange={e => setRestTargetDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmRestTarget()}
                    style={{ ...inputStyle, width: 60, padding: '4px 6px', fontSize: 12 }} autoFocus />
                  <button onClick={confirmRestTarget} style={{ border: 'none', background: C.green, borderRadius: 8, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} color="#fff" />
                  </button>
                </div>
              )}

              {session.status === 'stopped' && (
                <div style={{ margin: '0 16px 14px', fontSize: 11, color: C.orange, fontFamily: FONT, background: 'rgba(255,159,10,0.1)', padding: '6px 10px', borderRadius: 10 }}>
                  训练已结束，还没保存——点"保存"记录本次训练，或点"删除"直接放弃
                </div>
              )}
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {selected.map(ex => {
                const completedCount = ex.sets.filter(s => s.completed).length;
                return (
                  <Card key={ex.id}>
                    <div style={{ padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div onClick={() => toggleCollapse(ex.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1, minWidth: 0 }}>
                          <ChevronDown size={14} color={C.sub} style={{ transform: ex.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }} />
                          <span style={{ width: 8, height: 8, borderRadius: 4, background: ex.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</span>
                          <span style={{ fontSize: 11, color: C.sub, fontFamily: FONT, flexShrink: 0 }}>{completedCount}/{ex.sets.length}</span>
                        </div>
                        <button onClick={() => removeEx(ex.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}>
                          <X size={16} color={C.sub} />
                        </button>
                      </div>

                      {ex.collapsed ? (
                        <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                          {ex.sets.map(s => (
                            <div key={s.id} style={{ width: 'calc(100% / 8)', maxWidth: 22, height: 5, borderRadius: 3, background: s.completed ? C.green : 'rgba(120,120,128,0.2)' }} />
                          ))}
                        </div>
                      ) : (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 30px', gap: 6, paddingBottom: 6, borderBottom: `1px solid ${C.sep}`, marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: C.sub, fontFamily: FONT, textAlign: 'center' }}>组</span>
                            <span style={{ fontSize: 11, color: C.sub, fontFamily: FONT, textAlign: 'center' }}>时间</span>
                            <button onClick={() => cycleUnit(ex.id)} style={{ border: 'none', background: 'none', fontSize: 11, color: C.sub, fontFamily: FONT, cursor: 'pointer', textAlign: 'center' }}>{ex.unit} ▾</button>
                            <span style={{ fontSize: 11, color: C.sub, fontFamily: FONT, textAlign: 'center' }}>✓</span>
                          </div>
                          {ex.sets.map((s, i) => (
                            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 30px', gap: 6, alignItems: 'center', padding: '6px 0' }}>
                              <span style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: C.text, fontFamily: FONT }}>{i + 1}</span>
                              <span style={{ textAlign: 'center', fontSize: 12, fontFamily: 'monospace', color: s.restSec != null ? C.text : C.sub }}>{s.restSec != null ? fmtSec(s.restSec) : '-'}</span>
                              <input type="number" value={s.value} onChange={e => updateSetValue(ex.id, s.id, e.target.value)}
                                style={{ ...inputStyle, textAlign: 'center', padding: '6px 2px', fontSize: 13 }} />
                              <button onClick={() => toggleSetComplete(ex.id, s.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                                <div style={{ width: 22, height: 22, borderRadius: 11, background: s.completed ? C.green : 'rgba(120,120,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {s.completed && <Check size={13} color="#fff" />}
                                </div>
                              </button>
                            </div>
                          ))}
                          <button onClick={() => addSetToExercise(ex.id)} style={{
                            width: '100%', marginTop: 8, border: 'none', borderRadius: 12, padding: '9px',
                            background: 'rgba(120,120,128,0.08)', color: C.text, fontSize: 13, fontWeight: 600, fontFamily: FONT,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          }}>
                            <Plus size={13} /> Add Set
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setShowPicker(true)} style={{
            width: '100%', border: '1.5px dashed rgba(10,132,255,0.4)', borderRadius: 18, padding: '16px',
            background: 'rgba(10,132,255,0.06)', color: C.blue, fontSize: 15, fontWeight: 600, fontFamily: FONT,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Plus size={20} /> 添加训练动作
          </button>
        </div>

        <p style={{ fontSize: 13, color: C.sub, margin: '0 4px 8px', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: 0.3 }}>训练日历</p>
        <Card style={{ marginBottom: 24 }}>
          <div style={{ padding: '16px 12px' }}>
            <MonthCalendar
              year={calDate.year} month={calDate.month}
              onPrev={() => setCalDate(c => { const m = c.month - 1; return m < 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: m }; })}
              onNext={() => setCalDate(c => { const m = c.month + 1; return m > 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: m }; })}
              valueByDate={workoutDayMap} colorFn={() => 'rgba(48,209,88,1)'} binary
              onDayClick={d => { if (workoutDayMap[d]) { setCalDayDetail(d); setEditingId(null); } }}
            />
            <Legend items={[['未训练', 'rgba(120,120,128,0.07)'], ['有训练', 'rgba(48,209,88,1)']]} />
          </div>
        </Card>

        {calDayDetail && (
          <Modal title={fmtDate(calDayDetail)} onClose={() => { setCalDayDetail(null); cancelEdit(); }} width={380}>
            {workouts.filter(w => w.date === calDayDetail).map(w => {
              const isEditing = editingId === w.id;
              if (isEditing) {
                return (
                  <div key={w.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      <input type="date" value={editDraft.date} onChange={e => setEditDraft(d => ({ ...d, date: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                      <input type="time" value={editDraft.time} onChange={e => setEditDraft(d => ({ ...d, time: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                      {editDraft.exercises.map((ex, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 10, padding: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontFamily: FONT, flex: 1, color: C.text, fontWeight: 600 }}>{ex.name}</span>
                            <button onClick={() => removeDraftEx(i)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={14} color={C.sub} /></button>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {(ex.sets || []).map((s, si) => (
                              <input key={si} type="number" value={s.value}
                                onChange={e => setEditDraft(d => ({
                                  ...d, exercises: d.exercises.map((exx, ii) => ii === i ? { ...exx, sets: exx.sets.map((ss, sii) => sii === si ? { ...ss, value: e.target.value } : ss) } : exx)
                                }))}
                                style={{ ...inputStyle, width: 46, padding: '5px 3px', textAlign: 'center', fontSize: 12 }} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <SmallButton onClick={() => saveEdit(w.id)} color={C.green}><Check size={13} /> 保存修改</SmallButton>
                      <SmallButton onClick={cancelEdit} color={C.sub}>取消</SmallButton>
                    </div>
                  </div>
                );
              }
              return (
                <div key={w.id} onClick={() => startEdit(w)} style={{ ...GLASS, borderRadius: 14, padding: '12px 14px', marginBottom: 10, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
                      {w.time} <Pencil size={11} color={C.sub} />
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {w.totalDurationSec ? <span style={{ fontSize: 12, color: C.green, fontFamily: FONT, fontWeight: 600 }}>{fmtSec(w.totalDurationSec)}</span> : null}
                      <button onClick={(ev) => { ev.stopPropagation(); removeWorkout(w.id); if (workouts.filter(x => x.date === calDayDetail).length <= 1) setCalDayDetail(null); }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <Trash2 size={14} color={C.sub} />
                      </button>
                    </div>
                  </div>
                  {(w.exercises || []).map((ex, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: FONT, marginBottom: 3 }}>
                      <span style={{ color: C.text }}>{ex.name}</span>
                      <span style={{ color: C.sub }}>{(ex.sets || []).map(s => s.value).join('/')} {ex.unit}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </Modal>
        )}
      </div>
    </div>
  );
}

/* ---------- Meal Tab ---------- */

async function callClaudeForCalories(description, mealType) {
  const response = await fetch('/api/estimate-calories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, mealType }),
  });
  if (!response.ok) throw new Error('api not available');
  return response.json();
}

function MealTab({ meals, save }) {
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(nowTime());
  const [mealType, setMealType] = useState('午餐');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  async function identify() {
    if (!desc.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const r = await callClaudeForCalories(desc, mealType);
      setResult(r);
    } catch (e) {
      setError('识别失败，可以手动输入热量后保存');
      setResult({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, suggestion: '' });
    } finally {
      setLoading(false);
    }
  }

  function submit() {
    if (!result) return;
    const entry = { id: uid(), date, time, mealType, description: desc, ...result };
    save([entry, ...meals]);
    setDesc(''); setResult(null); setError('');
  }
  function remove(id) {
    save(meals.filter(m => m.id !== id));
  }
  function startEdit(m) {
    setEditingId(m.id);
    setEditDraft({ ...m });
  }
  function cancelEdit() { setEditingId(null); setEditDraft(null); }
  function saveEdit() {
    save(meals.map(m => m.id === editDraft.id ? { ...editDraft, calories: Number(editDraft.calories) } : m));
    setEditingId(null); setEditDraft(null);
  }

  const grouped = useMemo(() => {
    const g = {};
    [...meals].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).forEach(m => {
      if (!g[m.date]) g[m.date] = [];
      g[m.date].push(m);
    });
    return Object.entries(g);
  }, [meals]);

  return (
    <div>
      <Header title="饮食记录" icon={UtensilsCrossed} color={C.orange} />
      <div style={{ padding: '0 20px' }}>
        <Card style={{ marginBottom: 16 }}>
          <Row>
            <span style={{ fontSize: 15, color: C.text, fontFamily: FONT }}>日期</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 15, fontFamily: FONT, color: C.blue, textAlign: 'right' }} />
          </Row>
          <Row last>
            <span style={{ fontSize: 15, color: C.text, fontFamily: FONT }}>时间</span>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 15, fontFamily: FONT, color: C.blue, textAlign: 'right' }} />
          </Row>
        </Card>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {MEAL_TYPES.map(mt => (
            <Chip key={mt.key} label={mt.key} active={mealType === mt.key} onClick={() => setMealType(mt.key)} color={mt.color} glass />
          ))}
        </div>

        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="描述这一餐吃了什么，例如：一碗牛肉面，加一个卤蛋，一杯豆浆"
          rows={3}
          style={{ width: '100%', ...GLASS, border: '1px solid rgba(255,255,255,0.7)', borderRadius: 16, padding: 12, fontSize: 14, fontFamily: FONT, outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 12 }}
        />

        <div style={{ marginBottom: 16 }}>
          <PrimaryButton onClick={identify} disabled={!desc.trim() || loading} color={C.orange}>
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={18} />}
            {loading ? 'AI 识别中…' : 'AI 识别热量'}
          </PrimaryButton>
        </div>

        {result && (
          <Card style={{ marginBottom: 16 }}>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: C.orange, fontFamily: FONT }}>{result.calories}</span>
                <span style={{ fontSize: 14, color: C.sub, fontFamily: FONT }}>大卡</span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: C.sub, fontFamily: FONT }}>蛋白质 {result.protein_g}g</span>
                <span style={{ fontSize: 12, color: C.sub, fontFamily: FONT }}>碳水 {result.carbs_g}g</span>
                <span style={{ fontSize: 12, color: C.sub, fontFamily: FONT }}>脂肪 {result.fat_g}g</span>
              </div>
              {result.suggestion && (
                <div style={{ fontSize: 13, color: C.text, fontFamily: FONT, background: 'rgba(255,159,10,0.12)', padding: '8px 10px', borderRadius: 10, marginBottom: 12 }}>
                  💡 {result.suggestion}
                </div>
              )}
              {error && <div style={{ fontSize: 12, color: C.red, fontFamily: FONT, marginBottom: 8 }}>{error}</div>}
              <PrimaryButton onClick={submit} color={C.orange}>保存这条记录</PrimaryButton>
            </div>
          </Card>
        )}

        <p style={{ fontSize: 13, color: C.sub, margin: '0 4px 8px', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: 0.3 }}>饮食记录（点击可编辑）</p>
        {grouped.length === 0 ? <Empty text="还没有记录，试着描述一顿饭并识别热量" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {grouped.map(([d, items]) => {
              const total = items.reduce((s, m) => s + (m.calories || 0), 0);
              return (
                <div key={d}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px 8px' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: FONT }}>{fmtDate(d)}</span>
                    <span style={{ fontSize: 13, color: C.orange, fontWeight: 600, fontFamily: FONT }}>共 {total} 大卡</span>
                  </div>
                  <Card>
                    {items.map((m, i) => {
                      const isEditing = editingId === m.id;
                      if (isEditing) {
                        return (
                          <div key={m.id} style={{ padding: 14, borderBottom: i === items.length - 1 ? 'none' : `0.5px solid ${C.sep}` }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                              <input type="time" value={editDraft.time} onChange={e => setEditDraft(d => ({ ...d, time: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                              <input type="number" value={editDraft.calories} onChange={e => setEditDraft(d => ({ ...d, calories: e.target.value }))} style={{ ...inputStyle, width: 80 }} />
                            </div>
                            <textarea value={editDraft.description} onChange={e => setEditDraft(d => ({ ...d, description: e.target.value }))} rows={2}
                              style={{ ...inputStyle, width: '100%', marginBottom: 8, resize: 'none' }} />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <SmallButton onClick={saveEdit} color={C.green}><Check size={13} /> 保存</SmallButton>
                              <SmallButton onClick={cancelEdit} color={C.sub}>取消</SmallButton>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <Row key={m.id} last={i === items.length - 1} onClick={() => startEdit(m)}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
                              {m.mealType} · {m.time} <Pencil size={11} color={C.sub} />
                            </div>
                            <div style={{ fontSize: 13, color: C.sub, fontFamily: FONT, marginTop: 2 }}>{m.description}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: C.orange, fontFamily: FONT }}>{m.calories} 大卡</span>
                            <button onClick={(ev) => { ev.stopPropagation(); remove(m.id); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}>
                              <Trash2 size={15} color={C.sub} />
                            </button>
                          </div>
                        </Row>
                      );
                    })}
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Weight Tab ---------- */

function WeightTab({ weights, save }) {
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(nowTime());
  const [weight, setWeight] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [weightDetail, setWeightDetail] = useState(null);

  function submit() {
    const w = parseFloat(weight);
    if (!w || w <= 0) return;
    const entry = { id: uid(), date, time, weight: w };
    const list = [...weights.filter(x => x.date !== date), entry].sort((a, b) => a.date.localeCompare(b.date));
    save(list);
    setWeight('');
  }
  function remove(id) {
    save(weights.filter(w => w.id !== id));
  }
  function startEdit(w) { setEditingId(w.id); setEditDraft({ ...w }); }
  function cancelEdit() { setEditingId(null); setEditDraft(null); }
  function saveEdit() {
    save(weights.map(w => w.id === editDraft.id ? { ...editDraft, weight: parseFloat(editDraft.weight) } : w).sort((a, b) => a.date.localeCompare(b.date)));
    setEditingId(null); setEditDraft(null);
  }

  const sorted = [...weights].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const prev = sorted[1];
  const delta = latest && prev ? +(latest.weight - prev.weight).toFixed(1) : null;

  return (
    <div>
      <Header title="体重记录" icon={Scale} color={C.blue} />
      <div style={{ padding: '0 20px' }}>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ padding: 22, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: C.sub, fontFamily: FONT, marginBottom: 4 }}>最新体重</div>
            <div style={{ fontSize: 42, fontWeight: 800, color: C.text, fontFamily: FONT }}>
              {latest ? latest.weight : '--'} <span style={{ fontSize: 16, fontWeight: 500, color: C.sub }}>kg</span>
            </div>
            {delta !== null && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 13, fontFamily: FONT, color: delta > 0 ? C.red : delta < 0 ? C.green : C.sub }}>
                {delta > 0 ? <TrendingUp size={14} /> : delta < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                {Math.abs(delta)} kg 较上次
              </div>
            )}
          </div>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Row>
            <span style={{ fontSize: 15, color: C.text, fontFamily: FONT }}>日期</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 15, fontFamily: FONT, color: C.blue, textAlign: 'right' }} />
          </Row>
          <Row>
            <span style={{ fontSize: 15, color: C.text, fontFamily: FONT }}>时间</span>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 15, fontFamily: FONT, color: C.blue, textAlign: 'right' }} />
          </Row>
          <Row last>
            <span style={{ fontSize: 15, color: C.text, fontFamily: FONT }}>体重 (kg)</span>
            <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.0"
              style={{ border: 'none', background: 'transparent', fontSize: 15, fontFamily: FONT, color: C.blue, textAlign: 'right', width: 80 }} />
          </Row>
        </Card>

        <div style={{ marginBottom: 24 }}>
          <PrimaryButton onClick={submit} disabled={!weight}>
            <Plus size={18} /> 保存体重
          </PrimaryButton>
        </div>

        <p style={{ fontSize: 13, color: C.sub, margin: '0 4px 8px', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: 0.3 }}>体重曲线（点击可查看/编辑）</p>
        <Card style={{ marginBottom: 24 }}>
          <div style={{ padding: '16px 8px' }}>
            {sorted.length === 0 ? <Empty text="还没有记录，输入今天的体重吧" /> : (
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...weights].sort((a, b) => a.date.localeCompare(b.date))}
                    margin={{ left: -20, right: 8 }}
                    onClick={e => { if (e && e.activeLabel) setWeightDetail(e.activeLabel); }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.sep} vertical={false} />
                    <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fontSize: 10, fill: C.sub }} />
                    <YAxis tick={{ fontSize: 10, fill: C.sub }} domain={['dataMin - 1', 'dataMax + 1']} label={{ value: 'kg', angle: -90, position: 'insideLeft', fontSize: 11, fill: C.sub }} />
                    <Tooltip labelFormatter={d => fmtDate(d)} />
                    <Line type="monotone" dataKey="weight" stroke={C.blue} strokeWidth={2} dot={{ r: 4, cursor: 'pointer' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>

        {weightDetail && (() => {
          const w = weights.find(x => x.date === weightDetail);
          if (!w) return null;
          const isEditing = editingId === w.id;
          return (
            <Modal title={fmtDate(w.date)} onClose={() => { setWeightDetail(null); cancelEdit(); }} width={340}>
              {isEditing ? (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input type="date" value={editDraft.date} onChange={e => setEditDraft(d => ({ ...d, date: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                    <input type="time" value={editDraft.time || ''} onChange={e => setEditDraft(d => ({ ...d, time: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                    <input type="number" step="0.1" value={editDraft.weight} onChange={e => setEditDraft(d => ({ ...d, weight: e.target.value }))} style={{ ...inputStyle, width: 70 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <SmallButton onClick={() => { saveEdit(); setWeightDetail(editDraft.date); }} color={C.green}><Check size={13} /> 保存</SmallButton>
                    <SmallButton onClick={cancelEdit} color={C.sub}>取消</SmallButton>
                  </div>
                </div>
              ) : (
                <div onClick={() => startEdit(w)} style={{ textAlign: 'center', padding: '10px 0', cursor: 'pointer' }}>
                  <div style={{ fontSize: 34, fontWeight: 800, color: C.text, fontFamily: FONT }}>{w.weight}<span style={{ fontSize: 14, color: C.sub, fontWeight: 500 }}> kg</span></div>
                  {w.time && <div style={{ fontSize: 12, color: C.sub, fontFamily: FONT, marginTop: 4 }}>记录时间 {w.time}</div>}
                  <div style={{ fontSize: 12, color: C.blue, fontFamily: FONT, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Pencil size={11} /> 点击修改
                  </div>
                </div>
              )}
            </Modal>
          );
        })()}
      </div>
    </div>
  );
}

/* ---------- Stats Tab ---------- */

function buildDayRange(days) {
  const arr = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

function workoutColor(v) {
  if (!v) return 'rgba(60,60,67,0.1)';
  const min = v / 60;
  if (min < 20) return 'rgba(48,209,88,0.35)';
  if (min < 45) return 'rgba(48,209,88,0.65)';
  return 'rgba(48,209,88,1)';
}
function mealColor(v) {
  if (v === 0) return 'rgba(60,60,67,0.1)';
  if (v < 1200) return 'rgba(255,159,10,0.3)';
  if (v <= 2500) return 'rgba(255,159,10,0.65)';
  return 'rgba(255,69,58,0.8)';
}
function weightColor(v) {
  return v > 0 ? C.blue : 'rgba(60,60,67,0.1)';
}

function Legend({ items }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
      {items.map(([label, color]) => (
        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.sub, fontFamily: FONT }}>
          <span style={{ width: 10, height: 10, borderRadius: 4, background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

function StatsTab({ workouts, meals, weights }) {
  const [metric, setMetric] = useState('workout');
  const [view, setView] = useState('calendar');
  const [calDate, setCalDate] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [dayDetail, setDayDetail] = useState(null);
  const [summaryDetail, setSummaryDetail] = useState(null);
  const days30 = buildDayRange(30);
  const thisWeekDates = buildDayRange(7);

  const workoutByDate = useMemo(() => {
    const m = {};
    workouts.forEach(w => { m[w.date] = (m[w.date] || 0) + 1; });
    return m;
  }, [workouts]);

  const workoutDurationByDate = useMemo(() => {
    const m = {};
    workouts.forEach(w => { m[w.date] = (m[w.date] || 0) + (w.totalDurationSec || 0); });
    return m;
  }, [workouts]);

  const mealByDate = useMemo(() => {
    const m = {};
    meals.forEach(x => { m[x.date] = (m[x.date] || 0) + (x.calories || 0); });
    return m;
  }, [meals]);

  const weightByDate = useMemo(() => {
    const m = {};
    weights.forEach(w => { m[w.date] = w.weight; });
    return m;
  }, [weights]);

  const workoutCurveDataBase = days30.map(d => ({ date: d.slice(5), minutes: Math.round((workoutDurationByDate[d] || 0) / 60) }));
  const workoutCurveData = workoutCurveDataBase.map((row, i) => {
    const slice = workoutCurveDataBase.slice(Math.max(0, i - 6), i + 1);
    return { ...row, avg: Math.round((slice.reduce((s, r) => s + r.minutes, 0) / slice.length) * 10) / 10 };
  });
  const mealCurveData = days30.map(d => ({ date: d.slice(5), calories: mealByDate[d] || 0 }));
  const weightCurveData = [...weights].sort((a, b) => a.date.localeCompare(b.date)).map(w => ({ date: w.date.slice(5), weight: w.weight }));

  const metricOptions = [
    { key: 'workout', label: '健身', icon: Dumbbell },
    { key: 'meal', label: '饮食', icon: UtensilsCrossed },
    { key: 'weight', label: '体重', icon: Scale },
  ];
  const viewOptions = [
    { key: 'calendar', label: '日历', icon: CalendarIcon },
    { key: 'curve', label: '曲线', icon: LineChartIcon },
  ];

  function prevMonth() { setCalDate(c => { const m = c.month - 1; return m < 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: m }; }); }
  function nextMonth() { setCalDate(c => { const m = c.month + 1; return m > 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: m }; }); }

  const currentValueByDate = metric === 'workout' ? workoutDurationByDate : metric === 'meal' ? mealByDate : weightByDate;
  const currentColorFn = metric === 'workout' ? workoutColor : metric === 'meal' ? mealColor : weightColor;

  const summaryTitles = { workout: '本周训练详情', duration: '本周训练时长详情', calories: '每日热量详情', weight: '体重变化详情' };

  return (
    <div>
      <Header title="统计" icon={BarChart3} color={C.indigo} />
      <div style={{ padding: '0 20px' }}>
        <div style={{ marginBottom: 12 }}>
          <SegControl options={metricOptions} value={metric} onChange={setMetric} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <SegControl options={viewOptions} value={view} onChange={setView} />
        </div>

        <Card style={{ marginBottom: 20 }}>
          <div style={{ padding: '16px 12px' }}>
            {view === 'calendar' && (
              <>
                <MonthCalendar
                  year={calDate.year} month={calDate.month} onPrev={prevMonth} onNext={nextMonth}
                  valueByDate={currentValueByDate} colorFn={currentColorFn} binary={false}
                  onDayClick={setDayDetail}
                />
                {metric === 'workout' && <Legend items={[['未训练', 'rgba(60,60,67,0.1)'], ['<20分', 'rgba(48,209,88,0.35)'], ['20-45分', 'rgba(48,209,88,0.65)'], ['>45分', 'rgba(48,209,88,1)']]} />}
                {metric === 'meal' && <Legend items={[['未记录', 'rgba(60,60,67,0.1)'], ['<1200', 'rgba(255,159,10,0.3)'], ['1200-2500', 'rgba(255,159,10,0.65)'], ['>2500', 'rgba(255,69,58,0.8)']]} />}
                {metric === 'weight' && <Legend items={[['未记录', 'rgba(60,60,67,0.1)'], ['已记录', C.blue]]} />}
              </>
            )}

            {view === 'curve' && metric === 'workout' && (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={workoutCurveData} margin={{ left: -20, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.sep} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.sub }} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: C.sub }} allowDecimals={false} label={{ value: '分钟', angle: -90, position: 'insideLeft', fontSize: 11, fill: C.sub }} />
                    <Tooltip />
                    <Bar dataKey="minutes" fill={C.green} radius={[4, 4, 0, 0]} name="训练时长(分钟)" />
                    <Line type="monotone" dataKey="avg" stroke={C.blue} strokeWidth={2} dot={false} name="7日均值" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
            {view === 'curve' && metric === 'meal' && (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mealCurveData} margin={{ left: -20, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.sep} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.sub }} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: C.sub }} label={{ value: '大卡', angle: -90, position: 'insideLeft', fontSize: 11, fill: C.sub }} />
                    <Tooltip />
                    <ReferenceLine y={2000} stroke={C.sub} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="calories" stroke={C.orange} strokeWidth={2} dot={false} name="每日热量" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {view === 'curve' && metric === 'weight' && (
              <div style={{ height: 300 }}>
                {weightCurveData.length === 0 ? <Empty text="还没有体重记录" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightCurveData} margin={{ left: -20, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.sep} vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.sub }} />
                      <YAxis tick={{ fontSize: 10, fill: C.sub }} domain={['dataMin - 1', 'dataMax + 1']} label={{ value: 'kg', angle: -90, position: 'insideLeft', fontSize: 11, fill: C.sub }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke={C.blue} strokeWidth={2} dot={{ r: 3 }} name="体重" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </div>
        </Card>

        <SummaryRow workouts={workouts} meals={meals} weights={weights} onSelect={setSummaryDetail} />
      </div>

      {dayDetail && (
        <Modal title={fmtDate(dayDetail)} onClose={() => setDayDetail(null)} width={380}>
          {metric === 'workout' && (() => {
            const list = workouts.filter(w => w.date === dayDetail);
            return list.length === 0 ? <Empty text="这天没有训练记录" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {list.map(w => (
                  <div key={w.id} style={{ ...GLASS, borderRadius: 14, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: C.text, fontFamily: FONT, marginBottom: 4 }}>
                      <span>{w.time}</span>
                      {w.totalDurationSec ? <span style={{ color: C.green }}>{fmtSec(w.totalDurationSec)}</span> : null}
                    </div>
                    <div style={{ fontSize: 12, color: C.sub, fontFamily: FONT }}>{(w.exercises || []).map(e => `${e.name}(${(e.sets || []).length}组)`).join('、')}</div>
                  </div>
                ))}
              </div>
            );
          })()}
          {metric === 'meal' && (() => {
            const list = meals.filter(m => m.date === dayDetail);
            const total = list.reduce((s, m) => s + (m.calories || 0), 0);
            return list.length === 0 ? <Empty text="这天没有饮食记录" /> : (
              <div>
                <div style={{ fontSize: 13, color: C.orange, fontWeight: 700, fontFamily: FONT, marginBottom: 10 }}>共 {total} 大卡</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {list.map(m => (
                    <div key={m.id} style={{ ...GLASS, borderRadius: 14, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, fontFamily: FONT, color: C.text }}>
                        <span>{m.mealType} · {m.time}</span><span style={{ color: C.orange }}>{m.calories} 大卡</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.sub, fontFamily: FONT, marginTop: 2 }}>{m.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          {metric === 'weight' && (() => {
            const w = weights.find(x => x.date === dayDetail);
            return !w ? <Empty text="这天没有体重记录" /> : (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: C.text, fontFamily: FONT }}>{w.weight}<span style={{ fontSize: 14, color: C.sub, fontWeight: 500 }}> kg</span></div>
                {w.time && <div style={{ fontSize: 12, color: C.sub, fontFamily: FONT, marginTop: 4 }}>记录时间 {w.time}</div>}
              </div>
            );
          })()}
        </Modal>
      )}

      {summaryDetail && (
        <Modal title={summaryTitles[summaryDetail]} onClose={() => setSummaryDetail(null)} width={380}>
          {summaryDetail === 'workout' && (() => {
            const list = [...workouts].filter(w => thisWeekDates.includes(w.date)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
            return list.length === 0 ? <Empty text="本周还没有训练记录" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {list.map(w => (
                  <div key={w.id} style={{ ...GLASS, borderRadius: 14, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: C.text, fontFamily: FONT, marginBottom: 4 }}>
                      <span>{fmtDate(w.date)} · {w.time}</span>
                      {w.totalDurationSec ? <span style={{ color: C.green }}>{fmtSec(w.totalDurationSec)}</span> : null}
                    </div>
                    <div style={{ fontSize: 12, color: C.sub, fontFamily: FONT }}>{(w.exercises || []).map(e => e.name).join('、')}</div>
                  </div>
                ))}
              </div>
            );
          })()}
          {summaryDetail === 'duration' && (() => {
            const byDay = {};
            workouts.filter(w => thisWeekDates.includes(w.date)).forEach(w => {
              byDay[w.date] = (byDay[w.date] || 0) + (w.totalDurationSec || 0);
            });
            const rows = thisWeekDates.filter(d => byDay[d]).sort((a, b) => b.localeCompare(a));
            return rows.length === 0 ? <Empty text="本周还没有训练时长记录" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rows.map(d => (
                  <div key={d} style={{ ...GLASS, borderRadius: 14, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, color: C.text, fontFamily: FONT }}>{fmtDate(d)}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.teal, fontFamily: FONT }}>{fmtSec(byDay[d])}</span>
                  </div>
                ))}
              </div>
            );
          })()}
          {summaryDetail === 'calories' && (() => {
            const byDay = {};
            meals.forEach(m => { byDay[m.date] = (byDay[m.date] || 0) + (m.calories || 0); });
            const rows = Object.keys(byDay).sort((a, b) => b.localeCompare(a)).slice(0, 14);
            return rows.length === 0 ? <Empty text="还没有饮食记录" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rows.map(d => (
                  <div key={d} style={{ ...GLASS, borderRadius: 14, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, color: C.text, fontFamily: FONT }}>{fmtDate(d)}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.orange, fontFamily: FONT }}>{byDay[d]} 大卡</span>
                  </div>
                ))}
              </div>
            );
          })()}
          {summaryDetail === 'weight' && (() => {
            const list = [...weights].sort((a, b) => b.date.localeCompare(a.date));
            return list.length === 0 ? <Empty text="还没有体重记录" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {list.map((w, i) => {
                  const next = list[i + 1];
                  const delta = next ? +(w.weight - next.weight).toFixed(1) : null;
                  return (
                    <div key={w.id} style={{ ...GLASS, borderRadius: 14, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, color: C.text, fontFamily: FONT }}>{fmtDate(w.date)}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: FONT }}>{w.weight} kg</span>
                        {delta !== null && (
                          <span style={{ fontSize: 12, fontFamily: FONT, color: delta > 0 ? C.red : delta < 0 ? C.green : C.sub }}>
                            {delta > 0 ? '+' : ''}{delta}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}

function SummaryRow({ workouts, meals, weights, onSelect }) {
  const thisWeek = buildDayRange(7);
  const weekWorkouts = workouts.filter(w => thisWeek.includes(w.date)).length;
  const weekMinutes = Math.round(workouts.filter(w => thisWeek.includes(w.date)).reduce((s, w) => s + (w.totalDurationSec || 0), 0) / 60);
  const avgCalories = (() => {
    const days = {};
    meals.forEach(m => { days[m.date] = (days[m.date] || 0) + (m.calories || 0); });
    const vals = Object.values(days);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  })();
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const weightChange = sorted.length >= 2 ? +(sorted[sorted.length - 1].weight - sorted[0].weight).toFixed(1) : null;

  const items = [
    { key: 'workout', label: '本周训练', value: `${weekWorkouts}次`, color: C.green },
    { key: 'duration', label: '本周时长', value: `${weekMinutes}分`, color: C.teal },
    { key: 'calories', label: '日均热量', value: avgCalories ? `${avgCalories}` : '--', color: C.orange },
    { key: 'weight', label: '体重变化', value: weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange}kg` : '--', color: weightChange > 0 ? C.red : C.blue },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
      {items.map(it => (
        <Card key={it.label} onClick={() => onSelect(it.key)}>
          <div style={{ padding: '12px 6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: it.color, fontFamily: FONT }}>{it.value}</div>
            <div style={{ fontSize: 10, color: C.sub, fontFamily: FONT, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              {it.label}<ChevronRight size={10} color={C.sub} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Tab Bar ---------- */

function TabBar({ tab, setTab }) {
  const items = [
    { key: 'workout', label: '健身', icon: Dumbbell },
    { key: 'meal', label: '饮食', icon: UtensilsCrossed },
    { key: 'weight', label: '体重', icon: Scale },
    { key: 'stats', label: '统计', icon: BarChart3 },
  ];
  const idx = items.findIndex(it => it.key === tab);
  return (
    <div style={{
      position: 'fixed', bottom: 18, left: 0, right: 0, maxWidth: 390, margin: '0 auto',
      ...GLASS, borderRadius: 30,
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 6px', zIndex: 50,
      boxShadow: '0 12px 32px rgba(31,38,135,0.15)',
    }}>
      <div style={{
        position: 'absolute', top: 8, bottom: 8,
        left: `calc(${idx} * 25% + 6px)`, width: 'calc(25% - 12px)',
        background: 'rgba(255,255,255,0.7)', borderRadius: 20,
        boxShadow: '0 4px 14px rgba(10,132,255,0.15)',
        transition: 'left 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
      {items.map(it => {
        const Icon = it.icon;
        const active = tab === it.key;
        return (
          <button key={it.key} onClick={() => setTab(it.key)}
            style={{
              position: 'relative', zIndex: 1,
              background: 'none', border: 'none', borderRadius: 20,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 16px', cursor: 'pointer',
              flex: 1,
            }}>
            <Icon size={22} color={active ? C.blue : C.sub} strokeWidth={active ? 2.3 : 1.8}
              style={{ transform: active ? 'scale(1.14) translateY(-1px)' : 'scale(1)', transition: 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1), color 0.2s' }} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 500, color: active ? C.blue : C.sub, fontFamily: FONT, transition: 'color 0.2s' }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Root ---------- */

const TAB_ORDER = ['workout', 'meal', 'weight', 'stats'];

function loadLocal(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}
function saveLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

export default function FitTrackApp() {
  const [tab, setTab] = useState('workout');
  const [workouts, setWorkouts] = useState(() => loadLocal('fittrack_workouts', []));
  const [meals, setMeals] = useState(() => loadLocal('fittrack_meals', []));
  const [weights, setWeights] = useState(() => loadLocal('fittrack_weights', []));

  const wrapperRef = useRef(null);
  const [vw, setVw] = useState(390);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const lockedAxis = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, [tab]);
  useEffect(() => {
    function measure() { if (wrapperRef.current) setVw(wrapperRef.current.clientWidth); }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  function saveWorkouts(list) { setWorkouts(list); saveLocal('fittrack_workouts', list); }
  function saveMeals(list) { setMeals(list); saveLocal('fittrack_meals', list); }
  function saveWeights(list) { setWeights(list); saveLocal('fittrack_weights', list); }

  const idx = TAB_ORDER.indexOf(tab);

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    lockedAxis.current = null;
    setDragging(true);
  }
  function onTouchMove(e) {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (!lockedAxis.current) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) lockedAxis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (lockedAxis.current === 'x') {
      if (e.cancelable) e.preventDefault();
      setDragX(dx);
    }
  }
  function onTouchEnd() {
    setDragging(false);
    if (lockedAxis.current === 'x') {
      const threshold = vw * 0.22;
      if (dragX < -threshold && idx < TAB_ORDER.length - 1) setTab(TAB_ORDER[idx + 1]);
      else if (dragX > threshold && idx > 0) setTab(TAB_ORDER[idx - 1]);
    }
    setDragX(0);
    lockedAxis.current = null;
  }

  const offset = -idx * vw + (dragging && lockedAxis.current === 'x' ? dragX : 0);

  return (
    <AppBackground>
      <div
        ref={wrapperRef}
        style={{ overflow: 'hidden', position: 'relative', fontFamily: FONT, touchAction: 'pan-y' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div style={{
          display: 'flex',
          position: 'relative',
          left: `${offset}px`,
          transition: dragging ? 'none' : 'left 0.32s cubic-bezier(0.32,0.72,0,1)',
          paddingBottom: 100,
        }}>
          <div style={{ width: vw, flexShrink: 0 }}><WorkoutTab workouts={workouts} save={saveWorkouts} /></div>
          <div style={{ width: vw, flexShrink: 0 }}><MealTab meals={meals} save={saveMeals} /></div>
          <div style={{ width: vw, flexShrink: 0 }}><WeightTab weights={weights} save={saveWeights} /></div>
          <div style={{ width: vw, flexShrink: 0 }}><StatsTab workouts={workouts} meals={meals} weights={weights} /></div>
        </div>
      </div>
      <TabBar tab={tab} setTab={setTab} />
    </AppBackground>
  );
}
