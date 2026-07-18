import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const C = {
  blue: '#0A84FF',
  green: '#30D158',
  orange: '#FF9F0A',
  red: '#FF453A',
  purple: '#5E5CE6',
  teal: '#64D2FF',
  text: '#1C1C1E',
  sub: '#6E6E73'
};

const tabs = [
  { key: 'workout', label: '健身', icon: '⌁' },
  { key: 'meal', label: '饮食', icon: '◌' },
  { key: 'weight', label: '体重', icon: '⌂' },
  { key: 'stats', label: '统计', icon: '▣' }
];

const groups = [
  { key: 'chest', label: '胸部', color: C.red, exercises: ['杠铃卧推', '哑铃卧推', '上斜卧推', '哑铃飞鸟', '绳索夹胸', '俯卧撑'] },
  { key: 'back', label: '背部', color: C.blue, exercises: ['引体向上', '高位下拉', '杠铃划船', '坐姿划船', '单臂哑铃划船', '硬拉'] },
  { key: 'shoulder', label: '肩部', color: C.orange, exercises: ['肩推', '侧平举', '前平举', '面拉', '反向飞鸟', '耸肩'] },
  { key: 'leg', label: '腿部', color: C.purple, exercises: ['深蹲', '腿举', '箭步蹲', '腿弯举', '保加利亚分腿蹲', '小腿提踵'] },
  { key: 'arm', label: '手臂', color: C.teal, exercises: ['杠铃弯举', '哑铃弯举', '锤式弯举', '绳索下压', '窄距卧推', '臂屈伸'] },
  { key: 'core', label: '核心', color: '#FF375F', exercises: ['卷腹', '平板支撑', '悬垂举腿', '俄罗斯转体', '登山跑', '自行车卷腹'] },
  { key: 'cardio', label: '有氧', color: C.green, exercises: ['跑步', '动感单车', '游泳', '划船机', '椭圆机', '跳绳'] }
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function today(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function readLocal(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function secondsLabel(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function dateLabel(date) {
  const d = new Date(`${date}T00:00:00`);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function App() {
  const [tab, setTab] = useState('workout');
  const [workouts, setWorkouts] = useState(() => readLocal('fittrack_workouts', []));
  const [meals, setMeals] = useState(() => readLocal('fittrack_meals', []));
  const [weights, setWeights] = useState(() => readLocal('fittrack_weights', []));
  const [favorites, setFavorites] = useState(() => readLocal('fittrack_favorites', ['杠铃卧推', '深蹲', '引体向上']));
  const frame = useRef(null);
  const start = useRef({ x: 0, y: 0, axis: null });
  const [width, setWidth] = useState(390);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => writeLocal('fittrack_workouts', workouts), [workouts]);
  useEffect(() => writeLocal('fittrack_meals', meals), [meals]);
  useEffect(() => writeLocal('fittrack_weights', weights), [weights]);
  useEffect(() => writeLocal('fittrack_favorites', favorites), [favorites]);

  useEffect(() => {
    const measure = () => frame.current && setWidth(frame.current.clientWidth);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const index = tabs.findIndex((item) => item.key === tab);

  const onTouchStart = (event) => {
    start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY, axis: null };
    setDragging(true);
  };

  const onTouchMove = (event) => {
    const dx = event.touches[0].clientX - start.current.x;
    const dy = event.touches[0].clientY - start.current.y;
    if (!start.current.axis && Math.abs(dx) + Math.abs(dy) > 12) {
      start.current.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (start.current.axis === 'x') {
      event.preventDefault();
      setDrag(Math.max(-width * 0.42, Math.min(width * 0.42, dx)));
    }
  };

  const onTouchEnd = () => {
    if (start.current.axis === 'x') {
      if (drag < -width * 0.2 && index < tabs.length - 1) setTab(tabs[index + 1].key);
      if (drag > width * 0.2 && index > 0) setTab(tabs[index - 1].key);
    }
    setDragging(false);
    setDrag(0);
    start.current.axis = null;
  };

  return (
    <div className="app-bg">
      <div
        ref={frame}
        className="app-frame"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="pages"
          style={{
            width: `${tabs.length * 100}%`,
            transform: `translateX(${-index * width + drag}px)`,
            transition: dragging ? 'none' : 'transform .44s cubic-bezier(.22,1,.36,1)'
          }}
        >
          <Page width={width}><WorkoutTab workouts={workouts} setWorkouts={setWorkouts} favorites={favorites} setFavorites={setFavorites} /></Page>
          <Page width={width}><MealTab meals={meals} setMeals={setMeals} /></Page>
          <Page width={width}><WeightTab weights={weights} setWeights={setWeights} /></Page>
          <Page width={width}><StatsTab workouts={workouts} meals={meals} weights={weights} /></Page>
        </div>
      </div>
      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
}

function Page({ width, children }) {
  return <section className="page" style={{ width }}>{children}</section>;
}

function Header({ title, color, icon }) {
  return (
    <header className="header">
      <div className="header-icon" style={{ background: `linear-gradient(135deg, ${color}, ${color}AA)` }}>{icon}</div>
      <div>
        <p>FitTrack</p>
        <h1>{title}</h1>
      </div>
    </header>
  );
}

function Card({ children, onClick, className = '' }) {
  return <div className={`card ${className}`} onClick={onClick}>{children}</div>;
}

function Row({ children }) {
  return <div className="row">{children}</div>;
}

function PrimaryButton({ children, onClick, color = C.blue, disabled }) {
  return <button className="primary-btn" disabled={disabled} onClick={onClick} style={{ background: disabled ? 'rgba(120,120,128,.18)' : color }}>{children}</button>;
}

function SmallButton({ children, onClick, color = C.blue, ghost }) {
  return <button className={ghost ? 'small-btn ghost' : 'small-btn'} onClick={onClick} style={{ color: ghost ? color : '#fff', borderColor: color, background: ghost ? 'transparent' : color }}>{children}</button>;
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-layer">
      <button className="modal-backdrop" onClick={onClose} aria-label="关闭" />
      <div className={`modal ${wide ? 'wide' : ''}`}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function WheelPicker({ label, value, min, max, step = 1, onChange, suffix = '' }) {
  const values = [];
  for (let n = min; n <= max; n += step) values.push(Number(n.toFixed(1)));
  return (
    <label className="wheel">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(Number(event.target.value))}>
        {values.map((item) => <option key={item} value={item}>{item}{suffix}</option>)}
      </select>
    </label>
  );
}

function WorkoutTab({ workouts, setWorkouts, favorites, setFavorites }) {
  const [session, setSession] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [rest, setRest] = useState(0);
  const [, tick] = useState(0);
  const prs = useMemo(() => calcPrs(workouts), [workouts]);
  const lastWorkout = workouts[0];

  useEffect(() => {
    if (!session?.running && rest === 0) return;
    const timer = setInterval(() => {
      tick((v) => v + 1);
      setRest((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [session?.running, rest]);

  const elapsed = session?.running ? Math.floor((Date.now() - session.startedAt) / 1000) : 0;

  const begin = () => setSession({ startedAt: Date.now(), running: true, date: today(), time: nowTime(), exercises: [] });
  const copyPrevious = () => {
    if (!lastWorkout) return;
    setSession({
      startedAt: Date.now(),
      running: true,
      date: today(),
      time: nowTime(),
      exercises: lastWorkout.exercises.map((item) => ({ ...item, id: uid() }))
    });
  };
  const addExercise = (exercise) => {
    if (!session) begin();
    setSession((current) => ({
      ...(current || { startedAt: Date.now(), running: true, date: today(), time: nowTime(), exercises: [] }),
      exercises: [...(current?.exercises || []), { ...exercise, id: uid(), sets: 3, reps: 10, weight: 0 }]
    }));
    setPickerOpen(false);
  };
  const updateExercise = (id, patch) => {
    setSession((current) => ({ ...current, exercises: current.exercises.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  };
  const saveSession = () => {
    if (!session?.exercises.length) return;
    const record = {
      id: uid(),
      date: session.date,
      time: session.time,
      totalDurationSec: Math.max(60, elapsed),
      exercises: session.exercises
    };
    setWorkouts([record, ...workouts]);
    setSession(null);
    setFinishOpen(false);
    setRest(0);
  };
  const discardSession = () => {
    setSession(null);
    setFinishOpen(false);
    setRest(0);
  };

  return (
    <div>
      <Header title="健身记录" color={C.green} icon="◆" />
      <main className="content">
        <Card className="dashboard">
          <div>
            <p className="muted">今日训练</p>
            <h2>{session ? secondsLabel(elapsed) : workouts.some((w) => w.date === today()) ? '已完成' : '准备开始'}</h2>
          </div>
          <div className="dashboard-actions">
            {!session && <SmallButton onClick={begin} color={C.green}>开始训练</SmallButton>}
            {!session && <SmallButton onClick={copyPrevious} color={C.blue} ghost>复制上次</SmallButton>}
            {session && <SmallButton onClick={() => setFinishOpen(true)} color={C.red}>结束</SmallButton>}
          </div>
        </Card>

        {rest > 0 && <Card className="rest-card"><span>休息计时</span><strong>{rest}s</strong></Card>}

        <button className="add-dashed" onClick={() => setPickerOpen(true)}>＋ 添加训练动作</button>

        {session && (
          <Card>
            <div className="section-title"><h3>本次训练</h3><span>{session.exercises.length} 个动作</span></div>
            {session.exercises.map((exercise) => (
              <div className="exercise-editor" key={exercise.id}>
                <div className="exercise-title">
                  <div>
                    <strong>{exercise.name}</strong>
                    <span>{exercise.group}</span>
                  </div>
                  <button onClick={() => setSession((current) => ({ ...current, exercises: current.exercises.filter((item) => item.id !== exercise.id) }))}>删除</button>
                </div>
                <div className="wheel-grid">
                  <WheelPicker label="组数" value={exercise.sets} min={1} max={12} onChange={(sets) => updateExercise(exercise.id, { sets })} />
                  <WheelPicker label="次数" value={exercise.reps} min={1} max={30} onChange={(reps) => updateExercise(exercise.id, { reps })} />
                  <WheelPicker label="重量" value={exercise.weight} min={0} max={200} step={2.5} onChange={(weight) => updateExercise(exercise.id, { weight })} />
                </div>
                <SmallButton onClick={() => setRest(90)} color={C.orange} ghost>完成一组，休息 90 秒</SmallButton>
              </div>
            ))}
            {!session.exercises.length && <Empty text="添加动作后开始记录" />}
            <div className="split-actions">
              <PrimaryButton onClick={() => setFinishOpen(true)} color={C.red}>结束训练</PrimaryButton>
              <PrimaryButton onClick={saveSession} color={C.green} disabled={!session.exercises.length}>保存训练</PrimaryButton>
            </div>
          </Card>
        )}

        <Card>
          <div className="section-title"><h3>个人纪录 PR</h3><span>自动统计</span></div>
          {Object.entries(prs).slice(0, 4).map(([name, pr]) => (
            <Row key={name}><span>{name}</span><b>{pr.weight}kg × {pr.reps}</b></Row>
          ))}
          {!Object.keys(prs).length && <Empty text="保存训练后会显示个人纪录" />}
        </Card>

        <Card>
          <div className="section-title"><h3>最近训练</h3><span>{workouts.length} 次</span></div>
          {workouts.slice(0, 5).map((workout) => <WorkoutSummary workout={workout} key={workout.id} />)}
          {!workouts.length && <Empty text="还没有训练记录" />}
        </Card>
      </main>

      {pickerOpen && <ExercisePicker favorites={favorites} setFavorites={setFavorites} onPick={addExercise} onClose={() => setPickerOpen(false)} />}
      {finishOpen && (
        <Modal title="结束训练" onClose={() => setFinishOpen(false)}>
          <p className="modal-copy">结束后可以保存本次训练，也可以放弃，放弃不会写入记录。</p>
          <div className="split-actions">
            <PrimaryButton onClick={discardSession} color={C.red}>放弃训练</PrimaryButton>
            <PrimaryButton onClick={saveSession} color={C.green} disabled={!session?.exercises.length}>保存训练</PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ExercisePicker({ favorites, setFavorites, onPick, onClose }) {
  const [groupKey, setGroupKey] = useState(groups[0].key);
  const group = groups.find((item) => item.key === groupKey);
  const toggleFavorite = (name) => {
    setFavorites(favorites.includes(name) ? favorites.filter((item) => item !== name) : [...favorites, name]);
  };
  return (
    <Modal title="添加训练动作" onClose={onClose} wide>
      <div className="exercise-picker">
        <div className="group-column">
          {groups.map((item) => (
            <button key={item.key} className={item.key === groupKey ? 'active' : ''} onClick={() => setGroupKey(item.key)}>{item.label}</button>
          ))}
        </div>
        <div className="exercise-column">
          {group.exercises.map((name) => (
            <div className="pick-row" key={name}>
              <button onClick={() => onPick({ name, group: group.label, color: group.color })}>
                <strong>{name}</strong>
                <span>{favorites.includes(name) ? '常用动作' : `${group.label}动作`}</span>
              </button>
              <button className="star" onClick={() => toggleFavorite(name)}>{favorites.includes(name) ? '★' : '☆'}</button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function MealTab({ meals, setMeals }) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState(500);
  const todayCalories = meals.filter((meal) => meal.date === today()).reduce((sum, meal) => sum + meal.calories, 0);
  const addMeal = () => {
    if (!name.trim()) return;
    setMeals([{ id: uid(), date: today(), time: nowTime(), name: name.trim(), calories: Number(calories) }, ...meals]);
    setName('');
  };
  return (
    <div>
      <Header title="饮食记录" color={C.orange} icon="◌" />
      <main className="content">
        <Card className="dashboard">
          <div><p className="muted">今日摄入</p><h2>{todayCalories} 大卡</h2></div>
        </Card>
        <Card>
          <div className="section-title"><h3>添加饮食</h3><span>手动记录</span></div>
          <input className="text-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：鸡胸肉饭" />
          <WheelPicker label="热量" value={calories} min={100} max={1600} step={50} onChange={setCalories} />
          <PrimaryButton onClick={addMeal} color={C.orange}>保存饮食</PrimaryButton>
        </Card>
        <Card>
          <div className="section-title"><h3>最近饮食</h3><span>{meals.length} 条</span></div>
          {meals.slice(0, 8).map((meal) => <Row key={meal.id}><span>{meal.name}</span><b>{meal.calories} 大卡</b></Row>)}
          {!meals.length && <Empty text="还没有饮食记录" />}
        </Card>
      </main>
    </div>
  );
}

function WeightTab({ weights, setWeights }) {
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(nowTime());
  const [weight, setWeight] = useState(70);
  const addWeight = () => {
    setWeights([{ id: uid(), date, time, weight: Number(weight) }, ...weights]);
  };
  return (
    <div>
      <Header title="体重记录" color={C.blue} icon="⌂" />
      <main className="content">
        <Card>
          <div className="section-title"><h3>记录体重</h3><span>新增时间</span></div>
          <div className="form-grid">
            <input className="text-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <input className="text-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <WheelPicker label="体重 kg" value={weight} min={35} max={150} step={0.1} onChange={setWeight} />
          <PrimaryButton onClick={addWeight} color={C.blue}>保存体重</PrimaryButton>
        </Card>
        <Card>
          <div className="section-title"><h3>体重趋势</h3><span>{weights.length} 条</span></div>
          <SvgLine data={weights.slice().reverse().map((item) => ({ label: `${dateLabel(item.date)} ${item.time || ''}`, value: item.weight }))} color={C.blue} />
        </Card>
        <Card>
          {weights.map((item) => <Row key={item.id}><span>{item.date} {item.time || '--:--'}</span><b>{item.weight} kg</b></Row>)}
          {!weights.length && <Empty text="还没有体重记录" />}
        </Card>
      </main>
    </div>
  );
}

function StatsTab({ workouts, meals, weights }) {
  const [detail, setDetail] = useState(null);
  const workoutDates = new Set(workouts.map((item) => item.date));
  const monthDays = buildMonthDays(new Date());
  const totalSec = workouts.reduce((sum, item) => sum + (item.totalDurationSec || 0), 0);
  const volume = workouts.reduce((sum, workout) => sum + workout.exercises.reduce((s, e) => s + Number(e.sets || 0) * Number(e.reps || 0) * Number(e.weight || 0), 0), 0);
  const thisMonth = today().slice(0, 7);
  const monthWorkouts = workouts.filter((item) => item.date.startsWith(thisMonth)).length;

  return (
    <div>
      <Header title="统计" color={C.purple} icon="▣" />
      <main className="content stats-content">
        <div className="summary-grid">
          <Card onClick={() => setDetail({ type: 'summary' })}><Metric label="训练次数" value={`${workouts.length}`} color={C.green} /></Card>
          <Card onClick={() => setDetail({ type: 'duration' })}><Metric label="训练时长" value={secondsLabel(totalSec)} color={C.teal} /></Card>
          <Card onClick={() => setDetail({ type: 'volume' })}><Metric label="总容量" value={`${Math.round(volume)}kg`} color={C.orange} /></Card>
          <Card onClick={() => setDetail({ type: 'month' })}><Metric label="本月训练" value={`${monthWorkouts}次`} color={C.purple} /></Card>
        </div>

        <Card className="calendar-card">
          <div className="section-title"><h3>训练日历</h3><span>点击日期查看当天</span></div>
          <div className="weekdays">{['一', '二', '三', '四', '五', '六', '日'].map((d) => <span key={d}>{d}</span>)}</div>
          <div className="month-grid">
            {monthDays.map((day, index) => (
              <button
                key={day ? day.date : `blank-${index}`}
                className={`day ${day && workoutDates.has(day.date) ? 'trained' : ''} ${day?.date === today() ? 'today' : ''}`}
                disabled={!day}
                onClick={() => day && setDetail({ type: 'day', date: day.date })}
              >
                {day?.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="chart-card">
          <div className="section-title"><h3>体重曲线</h3><span>更大视图</span></div>
          <SvgLine data={weights.slice().reverse().map((item) => ({ label: dateLabel(item.date), value: item.weight }))} color={C.blue} />
        </Card>

        <Card>
          <div className="section-title"><h3>训练热力图</h3><span>最近 28 天</span></div>
          <div className="heatmap">
            {Array.from({ length: 28 }).map((_, index) => {
              const date = today(index - 27);
              return <button key={date} className={workoutDates.has(date) ? 'hot' : ''} onClick={() => setDetail({ type: 'day', date })} title={date} />;
            })}
          </div>
        </Card>
      </main>
      {detail && <StatsDetail detail={detail} workouts={workouts} meals={meals} weights={weights} onClose={() => setDetail(null)} />}
    </div>
  );
}

function StatsDetail({ detail, workouts, meals, weights, onClose }) {
  if (detail.type === 'day') {
    const dayWorkouts = workouts.filter((item) => item.date === detail.date);
    const dayMeals = meals.filter((item) => item.date === detail.date);
    const dayWeights = weights.filter((item) => item.date === detail.date);
    return (
      <Modal title={`${dateLabel(detail.date)}详情`} onClose={onClose}>
        <h3 className="detail-title">训练</h3>
        {dayWorkouts.map((w) => <WorkoutSummary workout={w} key={w.id} />)}
        {!dayWorkouts.length && <Empty text="当天没有训练" />}
        <h3 className="detail-title">饮食</h3>
        {dayMeals.map((m) => <Row key={m.id}><span>{m.name}</span><b>{m.calories} 大卡</b></Row>)}
        {!dayMeals.length && <Empty text="当天没有饮食记录" />}
        <h3 className="detail-title">体重</h3>
        {dayWeights.map((w) => <Row key={w.id}><span>{w.time || '--:--'}</span><b>{w.weight} kg</b></Row>)}
        {!dayWeights.length && <Empty text="当天没有体重记录" />}
      </Modal>
    );
  }
  return (
    <Modal title="统计详情" onClose={onClose}>
      {workouts.map((w) => <WorkoutSummary workout={w} key={w.id} />)}
      {!workouts.length && <Empty text="还没有训练记录" />}
    </Modal>
  );
}

function Metric({ label, value, color }) {
  return <div className="metric"><strong style={{ color }}>{value}</strong><span>{label}</span></div>;
}

function WorkoutSummary({ workout }) {
  return (
    <div className="workout-summary">
      <div className="summary-head"><b>{dateLabel(workout.date)} · {workout.time}</b><span>{secondsLabel(workout.totalDurationSec || 0)}</span></div>
      {(workout.exercises || []).map((exercise, index) => (
        <Row key={`${exercise.name}-${index}`}><span>{exercise.name}</span><b>{exercise.sets}组 × {exercise.reps}次</b></Row>
      ))}
    </div>
  );
}

function SvgLine({ data, color }) {
  if (data.length < 2) return <Empty text="至少两条记录后显示曲线" />;
  const min = Math.min(...data.map((item) => item.value));
  const max = Math.max(...data.map((item) => item.value));
  const range = max - min || 1;
  const points = data.map((item, index) => {
    const x = 22 + index * (256 / Math.max(1, data.length - 1));
    const y = 178 - ((item.value - min) / range) * 126;
    return { ...item, x, y };
  });
  return (
    <svg className="svg-chart" viewBox="0 0 300 220">
      <path d="M22 28V178H282" />
      <polyline points={points.map((p) => `${p.x},${p.y}`).join(' ')} style={{ stroke: color }} />
      {points.map((p) => <circle key={`${p.label}-${p.value}`} cx={p.x} cy={p.y} r="4" style={{ fill: color }} />)}
      <text x="22" y="205">{data[0].label}</text>
      <text x="220" y="205">{data[data.length - 1].label}</text>
      <text x="222" y="34">{data[data.length - 1].value}kg</text>
    </svg>
  );
}

function TabBar({ tab, setTab }) {
  const index = tabs.findIndex((item) => item.key === tab);
  return (
    <nav className="tabbar">
      <div className="tab-indicator" style={{ left: `calc(${index} * 25% + 8px)` }} />
      {tabs.map((item) => (
        <button key={item.key} className={tab === item.key ? 'active' : ''} onClick={() => setTab(item.key)}>
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function buildMonthDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const days = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= last; d += 1) {
    const value = new Date(year, month, d);
    days.push({ label: d, date: value.toISOString().slice(0, 10) });
  }
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function calcPrs(workouts) {
  const prs = {};
  workouts.forEach((workout) => {
    workout.exercises?.forEach((exercise) => {
      const weight = Number(exercise.weight || 0);
      const reps = Number(exercise.reps || 0);
      if (!prs[exercise.name] || weight > prs[exercise.name].weight || (weight === prs[exercise.name].weight && reps > prs[exercise.name].reps)) {
        prs[exercise.name] = { weight, reps };
      }
    });
  });
  return prs;
}

export default App;
