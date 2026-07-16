import React, { useState, useEffect, useMemo } from 'react';
import {
  Dumbbell, UtensilsCrossed, Scale, BarChart3, Plus, X, TrendingUp,
  TrendingDown, Minus, Sparkles, Loader2, Trash2, Calendar as CalendarIcon,
  LineChart as LineChartIcon, Play, Square, Clock, RotateCcw, Check, Pencil
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
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
    <div style={{ padding: '40px 20px', textAlign: 'center', color: C.sub, fontFamily: FONT, fontSize: 14 }}>
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

/* ---------- Workout Tab ---------- */

function WorkoutTab({ workouts, save }) {
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(nowTime());
  const [activeGroup, setActiveGroup] = useState(null);
  const [pending, setPending] = useState([]); // chips clicked in current panel, not yet added
  const [selected, setSelected] = useState([]); // exercises added to this session
  const [custom, setCustom] = useState('');
  const [session, setSession] = useState({ running: false, startedAt: null, elapsedSec: 0, startTimeStr: null });
  const [rest, setRest] = useState({ running: false, startedAt: null, elapsedSec: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const anyRunning = selected.some(e => e.timerRunning) || session.running || rest.running;
    if (!anyRunning) return;
    const id = setInterval(() => forceTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [selected, session.running, rest.running]);

  function addExercise(name, groupLabel, groupColor) {
    if (selected.some(e => e.name === name)) return;
    setSelected(s => [...s, {
      id: uid(), name, group: groupLabel, color: groupColor,
      sets: '3', reps: '12', durationSec: 0, timerRunning: false, startedAt: null,
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
  function addCustom() {
    const name = custom.trim();
    if (!name) return;
    const g = MUSCLE_GROUPS.find(g => g.key === activeGroup);
    addExercise(name, g ? g.label : '自定义', g ? g.color : C.sub);
    setCustom('');
  }
  function updateEx(id, patch) {
    setSelected(s => s.map(e => e.id === id ? { ...e, ...patch } : e));
  }
  function removeEx(id) {
    setSelected(s => s.filter(e => e.id !== id));
  }
  function toggleTimer(id) {
    setSelected(s => s.map(e => {
      if (e.id !== id) return e;
      if (!e.timerRunning) return { ...e, timerRunning: true, startedAt: Date.now() };
      const elapsed = Math.floor((Date.now() - e.startedAt) / 1000);
      return { ...e, timerRunning: false, startedAt: null, durationSec: e.durationSec + elapsed };
    }));
  }
  function displayExDuration(e) {
    if (e.timerRunning && e.startedAt) return e.durationSec + Math.floor((Date.now() - e.startedAt) / 1000);
    return e.durationSec;
  }

  function toggleSession() {
    if (!session.running) {
      setSession({ running: true, startedAt: Date.now(), elapsedSec: 0, startTimeStr: nowTime() });
    } else {
      const elapsed = session.elapsedSec + Math.floor((Date.now() - session.startedAt) / 1000);
      finalizeAndSave(elapsed, session.startTimeStr, nowTime());
      setSession({ running: false, startedAt: null, elapsedSec: 0, startTimeStr: null });
    }
  }
  function displaySession() {
    if (session.running && session.startedAt) return session.elapsedSec + Math.floor((Date.now() - session.startedAt) / 1000);
    return session.elapsedSec;
  }
  function toggleRest() {
    setRest(r => {
      if (!r.running) return { running: true, startedAt: Date.now(), elapsedSec: r.elapsedSec };
      const elapsed = r.elapsedSec + Math.floor((Date.now() - r.startedAt) / 1000);
      return { running: false, startedAt: null, elapsedSec: elapsed };
    });
  }
  function resetRest() { setRest({ running: false, startedAt: null, elapsedSec: 0 }); }
  function displayRest() {
    if (rest.running && rest.startedAt) return rest.elapsedSec + Math.floor((Date.now() - rest.startedAt) / 1000);
    return rest.elapsedSec;
  }

  function finalizeAndSave(totalSec, startTimeStr, endTimeStr) {
    if (selected.length === 0) return;
    const finalized = selected.map(e => {
      if (e.timerRunning && e.startedAt) {
        const elapsed = Math.floor((Date.now() - e.startedAt) / 1000);
        return { ...e, durationSec: e.durationSec + elapsed, timerRunning: false, startedAt: null };
      }
      return e;
    });
    const entry = {
      id: uid(), date, time, startTime: startTimeStr, endTime: endTimeStr, totalDurationSec: totalSec,
      exercises: finalized.map(e => ({ name: e.name, group: e.group, color: e.color, sets: e.sets, reps: e.reps, durationSec: e.durationSec })),
    };
    save([entry, ...workouts]);
    setSelected([]);
    setActiveGroup(null);
    setPending([]);
    setRest({ running: false, startedAt: null, elapsedSec: 0 });
  }

  function removeWorkout(id) {
    save(workouts.filter(w => w.id !== id));
  }
  function startEdit(w) {
    setEditingId(w.id);
    setEditDraft({ date: w.date, time: w.time, exercises: w.exercises.map(e => ({ ...e })) });
  }
  function cancelEdit() { setEditingId(null); setEditDraft(null); }
  function saveEdit(id) {
    save(workouts.map(w => w.id === id ? { ...w, date: editDraft.date, time: editDraft.time, exercises: editDraft.exercises } : w));
    setEditingId(null); setEditDraft(null);
  }
  function updateDraftEx(idx, patch) {
    setEditDraft(d => ({ ...d, exercises: d.exercises.map((e, i) => i === idx ? { ...e, ...patch } : e) }));
  }
  function removeDraftEx(idx) {
    setEditDraft(d => ({ ...d, exercises: d.exercises.filter((_, i) => i !== idx) }));
  }

  const sorted = [...workouts].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const currentGroup = MUSCLE_GROUPS.find(g => g.key === activeGroup);

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

        <p style={{ fontSize: 13, color: C.sub, margin: '0 4px 8px', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: 0.3 }}>按部位选择动作</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {MUSCLE_GROUPS.map(g => (
            <Chip key={g.key} label={g.label} active={activeGroup === g.key} color={g.color} glass
              onClick={() => { setActiveGroup(activeGroup === g.key ? null : g.key); setPending([]); }} />
          ))}
        </div>

        {currentGroup && (
          <Card style={{ marginBottom: 16 }}>
            <div style={{ padding: 14 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {currentGroup.exercises.map(ex => {
                  const added = selected.some(e => e.name === ex);
                  const isPending = pending.includes(ex);
                  return (
                    <Chip key={ex} label={ex} active={isPending} done={added} color={currentGroup.color} glass
                      onClick={() => togglePending(ex)} />
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: pending.length > 0 ? 10 : 0 }}>
                <input
                  value={custom}
                  onChange={e => setCustom(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustom()}
                  placeholder={`添加自定义${currentGroup.label}部动作`}
                  style={{ flex: 1, ...GLASS, border: '1px solid rgba(255,255,255,0.7)', borderRadius: 12, padding: '9px 12px', fontSize: 13, fontFamily: FONT, outline: 'none' }}
                />
                <button onClick={addCustom} style={{ border: 'none', background: currentGroup.color, borderRadius: 12, width: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={17} color="#fff" />
                </button>
              </div>
              {pending.length > 0 && (
                <SmallButton onClick={() => confirmAddPending(currentGroup)} color={currentGroup.color}>
                  <Plus size={14} /> 添加所选动作（{pending.length}）
                </SmallButton>
              )}
            </div>
          </Card>
        )}

        {selected.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: C.sub, margin: '0 4px 8px', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: 0.3 }}>本次训练</p>

            <Card style={{ marginBottom: 12 }}>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.sub, fontFamily: FONT, marginBottom: 2 }}>总计时</div>
                    <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'monospace', color: session.running ? C.green : C.text }}>
                      {fmtSec(displaySession())}
                    </div>
                  </div>
                  <SmallButton onClick={toggleSession} color={session.running ? C.red : C.green}>
                    {session.running ? <Square size={12} fill="#fff" /> : <Play size={12} fill="#fff" />}
                    {session.running ? '结束并保存' : '开始训练'}
                  </SmallButton>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.5)', borderRadius: 14, padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} color={rest.running ? C.orange : C.sub} />
                    <span style={{ fontSize: 12, color: C.sub, fontFamily: FONT }}>休息</span>
                    <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: rest.running ? C.orange : C.text }}>
                      {fmtSec(displayRest())}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={resetRest} style={{ border: 'none', background: 'rgba(120,120,128,0.16)', borderRadius: 16, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RotateCcw size={13} color={C.sub} />
                    </button>
                    <button onClick={toggleRest} style={{ border: 'none', background: rest.running ? C.red : C.orange, borderRadius: 16, padding: '0 14px', height: 30, cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {rest.running ? <Square size={11} fill="#fff" /> : <Play size={11} fill="#fff" />}
                      休息
                    </button>
                  </div>
                </div>
                {!session.running && (
                  <div style={{ fontSize: 11, color: C.sub, fontFamily: FONT, marginTop: 10 }}>点击"开始训练"计时，练完点"结束并保存"会自动记录本次开始/结束时间和总时长</div>
                )}
              </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {selected.map(e => (
                <Card key={e.id}>
                  <div style={{ padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 4, background: e.color }} />
                        <span style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: FONT }}>{e.name}</span>
                        <span style={{ fontSize: 11, color: C.sub, fontFamily: FONT }}>{e.group}</span>
                      </div>
                      <button onClick={() => removeEx(e.id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <X size={16} color={C.sub} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: C.sub, fontFamily: FONT, marginBottom: 4 }}>组数</div>
                        <input type="number" value={e.sets} onChange={ev => updateEx(e.id, { sets: ev.target.value })}
                          style={{ ...inputStyle, width: '100%', textAlign: 'center' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: C.sub, fontFamily: FONT, marginBottom: 4 }}>次数</div>
                        <input type="number" value={e.reps} onChange={ev => updateEx(e.id, { reps: ev.target.value })}
                          style={{ ...inputStyle, width: '100%', textAlign: 'center' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.5)', borderRadius: 14, padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={15} color={e.timerRunning ? e.color : C.sub} />
                        <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: e.timerRunning ? e.color : C.text }}>
                          {fmtSec(displayExDuration(e))}
                        </span>
                      </div>
                      <button onClick={() => toggleTimer(e.id)}
                        style={{
                          border: 'none', borderRadius: 20, padding: '7px 16px', cursor: 'pointer',
                          background: e.timerRunning ? C.red : e.color, color: '#fff',
                          display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, fontFamily: FONT,
                        }}>
                        {e.timerRunning ? <Square size={12} fill="#fff" /> : <Play size={12} fill="#fff" />}
                        {e.timerRunning ? '结束' : '开始'}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        <p style={{ fontSize: 13, color: C.sub, margin: '0 4px 8px', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: 0.3 }}>训练记录（点击可编辑）</p>
        {sorted.length === 0 ? <Empty text="还没有记录，添加你的第一次训练吧" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {sorted.map(w => {
              const isEditing = editingId === w.id;
              const totalSec = (w.exercises || []).reduce((s, e) => s + (e.durationSec || 0), 0);
              if (isEditing) {
                return (
                  <Card key={w.id}>
                    <div style={{ padding: 14 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <input type="date" value={editDraft.date} onChange={e => setEditDraft(d => ({ ...d, date: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                        <input type="time" value={editDraft.time} onChange={e => setEditDraft(d => ({ ...d, time: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                        {editDraft.exercises.map((ex, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.5)', borderRadius: 10, padding: 8 }}>
                            <span style={{ fontSize: 13, fontFamily: FONT, flex: 1, color: C.text }}>{ex.name}</span>
                            <input type="number" value={ex.sets} onChange={e => updateDraftEx(i, { sets: e.target.value })} style={{ ...inputStyle, width: 44, padding: '6px 4px', textAlign: 'center' }} />
                            <span style={{ fontSize: 12, color: C.sub }}>组</span>
                            <input type="number" value={ex.reps} onChange={e => updateDraftEx(i, { reps: e.target.value })} style={{ ...inputStyle, width: 44, padding: '6px 4px', textAlign: 'center' }} />
                            <span style={{ fontSize: 12, color: C.sub }}>次</span>
                            <button onClick={() => removeDraftEx(i)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={14} color={C.sub} /></button>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <SmallButton onClick={() => saveEdit(w.id)} color={C.green}><Check size={13} /> 保存修改</SmallButton>
                        <SmallButton onClick={cancelEdit} color={C.sub}>取消</SmallButton>
                      </div>
                    </div>
                  </Card>
                );
              }
              return (
                <Card key={w.id} onClick={() => startEdit(w)}>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {fmtDate(w.date)} · {w.time}
                        <Pencil size={12} color={C.sub} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {w.totalDurationSec ? (
                          <span style={{ fontSize: 12, color: C.green, fontFamily: FONT, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={12} /> {fmtSec(w.totalDurationSec)}
                          </span>
                        ) : totalSec > 0 && (
                          <span style={{ fontSize: 12, color: C.sub, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={12} /> {fmtSec(totalSec)}
                          </span>
                        )}
                        <button onClick={(ev) => { ev.stopPropagation(); removeWorkout(w.id); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}>
                          <Trash2 size={15} color={C.sub} />
                        </button>
                      </div>
                    </div>
                    {w.startTime && w.endTime && (
                      <div style={{ fontSize: 11, color: C.sub, fontFamily: FONT, marginBottom: 8 }}>{w.startTime} - {w.endTime}</div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(w.exercises || []).map((ex, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontFamily: FONT }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 7, height: 7, borderRadius: 4, background: ex.color || C.sub }} />
                            <span style={{ color: C.text, fontWeight: 500 }}>{ex.name}</span>
                          </div>
                          <span style={{ color: C.sub }}>
                            {ex.sets}组 x {ex.reps}次{ex.durationSec ? ` · ${fmtSec(ex.durationSec)}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Meal Tab ---------- */

/* 注意：AI 识别请求指向 /api/estimate-calories，这是部署到 Vercel 后才存在的后端接口。
   密钥不会出现在浏览器代码里，安全地放在服务器环境变量中。 */
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
          <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
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
  const [weight, setWeight] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  function submit() {
    const w = parseFloat(weight);
    if (!w || w <= 0) return;
    const entry = { id: uid(), date, weight: w };
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

        <p style={{ fontSize: 13, color: C.sub, margin: '0 4px 8px', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: 0.3 }}>历史记录（点击可编辑）</p>
        {sorted.length === 0 ? <Empty text="还没有记录，输入今天的体重吧" /> : (
          <Card style={{ marginBottom: 24 }}>
            {sorted.map((w, i) => {
              const isEditing = editingId === w.id;
              if (isEditing) {
                return (
                  <div key={w.id} style={{ padding: 14, borderBottom: i === sorted.length - 1 ? 'none' : `0.5px solid ${C.sep}` }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input type="date" value={editDraft.date} onChange={e => setEditDraft(d => ({ ...d, date: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                      <input type="number" step="0.1" value={editDraft.weight} onChange={e => setEditDraft(d => ({ ...d, weight: e.target.value }))} style={{ ...inputStyle, width: 80 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <SmallButton onClick={saveEdit} color={C.green}><Check size={13} /> 保存</SmallButton>
                      <SmallButton onClick={cancelEdit} color={C.sub}>取消</SmallButton>
                    </div>
                  </div>
                );
              }
              return (
                <Row key={w.id} last={i === sorted.length - 1} onClick={() => startEdit(w)}>
                  <span style={{ fontSize: 14, color: C.text, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
                    {fmtDate(w.date)} <Pencil size={11} color={C.sub} />
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: FONT }}>{w.weight} kg</span>
                    <button onClick={(ev) => { ev.stopPropagation(); remove(w.id); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}>
                      <Trash2 size={15} color={C.sub} />
                    </button>
                  </div>
                </Row>
              );
            })}
          </Card>
        )}
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

function Heatmap({ dates, valueByDate, colorFn }) {
  const weeks = useMemo(() => {
    const w = [];
    let cur = [];
    const firstDow = new Date(dates[0] + 'T00:00:00').getDay();
    for (let i = 0; i < firstDow; i++) cur.push(null);
    dates.forEach(d => {
      cur.push({ date: d, value: valueByDate[d] || 0 });
      if (cur.length === 7) { w.push(cur); cur = []; }
    });
    if (cur.length) { while (cur.length < 7) cur.push(null); w.push(cur); }
    return w;
  }, [dates, valueByDate]);

  return (
    <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '4px 2px' }}>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {week.map((d, di) => d ? (
            <div key={di} title={`${d.date}: ${d.value}`}
              style={{ width: 14, height: 14, borderRadius: 5, background: colorFn(d.value) }} />
          ) : <div key={di} style={{ width: 14, height: 14 }} />)}
        </div>
      ))}
    </div>
  );
}

function workoutColor(v) {
  if (v === 0) return 'rgba(60,60,67,0.1)';
  if (v === 1) return 'rgba(48,209,88,0.35)';
  if (v === 2) return 'rgba(48,209,88,0.65)';
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

function StatsTab({ workouts, meals, weights }) {
  const [metric, setMetric] = useState('workout');
  const [view, setView] = useState('calendar');
  const days = buildDayRange(70);
  const days30 = buildDayRange(30);

  const workoutByDate = useMemo(() => {
    const m = {};
    workouts.forEach(w => { m[w.date] = (m[w.date] || 0) + 1; });
    return m;
  }, [workouts]);

  const workoutDurationByDate = useMemo(() => {
    const m = {};
    workouts.forEach(w => { m[w.date] = (m[w.date] || 0) + (w.totalDurationSec || (w.exercises || []).reduce((s, e) => s + (e.durationSec || 0), 0)); });
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

  const workoutCurveData = days30.map(d => ({ date: d.slice(5), minutes: Math.round((workoutDurationByDate[d] || 0) / 60) }));
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
          <div style={{ padding: 16 }}>
            {view === 'calendar' && metric === 'workout' && (
              <>
                <Heatmap dates={days} valueByDate={workoutByDate} colorFn={workoutColor} />
                <Legend items={[['0次', 'rgba(60,60,67,0.1)'], ['1次', 'rgba(48,209,88,0.35)'], ['2次', 'rgba(48,209,88,0.65)'], ['3次+', 'rgba(48,209,88,1)']]} />
              </>
            )}
            {view === 'calendar' && metric === 'meal' && (
              <>
                <Heatmap dates={days} valueByDate={mealByDate} colorFn={mealColor} />
                <Legend items={[['未记录', 'rgba(60,60,67,0.1)'], ['<1200', 'rgba(255,159,10,0.3)'], ['1200-2500', 'rgba(255,159,10,0.65)'], ['>2500', 'rgba(255,69,58,0.8)']]} />
              </>
            )}
            {view === 'calendar' && metric === 'weight' && (
              <>
                <Heatmap dates={days} valueByDate={weightByDate} colorFn={weightColor} />
                <Legend items={[['未记录', 'rgba(60,60,67,0.1)'], ['已记录', C.blue]]} />
              </>
            )}

            {view === 'curve' && metric === 'workout' && (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workoutCurveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.sep} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.sub }} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: C.sub }} allowDecimals={false} />
                    <Tooltip formatter={(v) => [`${v} 分钟`, '训练时长']} />
                    <Bar dataKey="minutes" fill={C.green} radius={[4, 4, 0, 0]} name="训练时长(分钟)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {view === 'curve' && metric === 'meal' && (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mealCurveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.sep} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.sub }} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: C.sub }} />
                    <Tooltip />
                    <ReferenceLine y={2000} stroke={C.sub} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="calories" stroke={C.orange} strokeWidth={2} dot={false} name="每日热量" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {view === 'curve' && metric === 'weight' && (
              <div style={{ height: 220 }}>
                {weightCurveData.length === 0 ? <Empty text="还没有体重记录" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightCurveData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.sep} vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.sub }} />
                      <YAxis tick={{ fontSize: 10, fill: C.sub }} domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke={C.blue} strokeWidth={2} dot={{ r: 3 }} name="体重" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </div>
        </Card>

        <SummaryRow workouts={workouts} meals={meals} weights={weights} />
      </div>
    </div>
  );
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

function SummaryRow({ workouts, meals, weights }) {
  const thisWeek = buildDayRange(7);
  const weekWorkouts = workouts.filter(w => thisWeek.includes(w.date)).length;
  const weekMinutes = Math.round(workouts.filter(w => thisWeek.includes(w.date)).reduce((s, w) => s + (w.totalDurationSec || (w.exercises || []).reduce((a, e) => a + (e.durationSec || 0), 0)), 0) / 60);
  const avgCalories = (() => {
    const days = {};
    meals.forEach(m => { days[m.date] = (days[m.date] || 0) + (m.calories || 0); });
    const vals = Object.values(days);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  })();
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const weightChange = sorted.length >= 2 ? +(sorted[sorted.length - 1].weight - sorted[0].weight).toFixed(1) : null;

  const items = [
    { label: '本周训练', value: `${weekWorkouts}次`, color: C.green },
    { label: '本周时长', value: `${weekMinutes}分`, color: C.teal },
    { label: '日均热量', value: avgCalories ? `${avgCalories}` : '--', color: C.orange },
    { label: '体重变化', value: weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange}kg` : '--', color: weightChange > 0 ? C.red : C.blue },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
      {items.map(it => (
        <Card key={it.label}>
          <div style={{ padding: '12px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: it.color, fontFamily: FONT }}>{it.value}</div>
            <div style={{ fontSize: 10, color: C.sub, fontFamily: FONT, marginTop: 2 }}>{it.label}</div>
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
            <Icon size={22} color={active ? C.blue : C.sub} strokeWidth={active ? 2.3 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 500, color: active ? C.blue : C.sub, fontFamily: FONT }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Root ---------- */

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

  function saveWorkouts(list) { setWorkouts(list); saveLocal('fittrack_workouts', list); }
  function saveMeals(list) { setMeals(list); saveLocal('fittrack_meals', list); }
  function saveWeights(list) { setWeights(list); saveLocal('fittrack_weights', list); }

  return (
    <AppBackground>
      <div style={{ paddingBottom: 100, fontFamily: FONT }}>
        {tab === 'workout' && <WorkoutTab workouts={workouts} save={saveWorkouts} />}
        {tab === 'meal' && <MealTab meals={meals} save={saveMeals} />}
        {tab === 'weight' && <WeightTab weights={weights} save={saveWeights} />}
        {tab === 'stats' && <StatsTab workouts={workouts} meals={meals} weights={weights} />}
      </div>
      <TabBar tab={tab} setTab={setTab} />
    </AppBackground>
  );
}
