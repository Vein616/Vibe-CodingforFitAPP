import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'fittrack-v2-state';

const muscleGroups = [
  { id: 'chest', name: '胸部', exercises: ['卧推', '上斜卧推', '哑铃飞鸟', '俯卧撑', '双杠臂屈伸'] },
  { id: 'back', name: '背部', exercises: ['引体向上', '高位下拉', '杠铃划船', '坐姿划船', '硬拉'] },
  { id: 'shoulder', name: '肩部', exercises: ['推举', '侧平举', '前平举', '面拉', '反向飞鸟'] },
  { id: 'legs', name: '腿部', exercises: ['深蹲', '腿举', '箭步蹲', '腿弯举', '小腿提踵'] },
  { id: 'arms', name: '手臂', exercises: ['杠铃弯举', '哑铃弯举', '绳索下压', '臂屈伸', '锤式弯举'] },
  { id: 'core', name: '核心', exercises: ['卷腹', '平板支撑', '俄罗斯转体', '举腿', '登山跑'] }
];

const tabs = [
  { id: 'home', label: '首页' },
  { id: 'workout', label: '训练' },
  { id: 'food', label: '饮食' },
  { id: 'stats', label: '统计' },
  { id: 'profile', label: '我的' }
];

const defaultState = {
  workouts: [
    {
      id: 'demo-1',
      date: today(-2),
      time: '19:20',
      duration: 48,
      exercises: [
        { name: '卧推', group: '胸部', sets: 4, reps: 8, weight: 60 },
        { name: '哑铃飞鸟', group: '胸部', sets: 3, reps: 12, weight: 14 }
      ]
    },
    {
      id: 'demo-2',
      date: today(-1),
      time: '18:45',
      duration: 42,
      exercises: [
        { name: '引体向上', group: '背部', sets: 4, reps: 6, weight: 0 },
        { name: '坐姿划船', group: '背部', sets: 3, reps: 10, weight: 45 }
      ]
    }
  ],
  weights: [{ id: 'w1', date: today(-1), time: '08:30', value: 70.4 }],
  meals: [{ id: 'm1', date: today(), name: '鸡胸肉饭', calories: 620 }],
  favorites: ['卧推', '深蹲', '引体向上']
};

function today(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  } catch {
    return defaultState;
  }
}

function App() {
  const [state, setState] = useState(loadState);
  const [activeTab, setActiveTab] = useState(0);
  const [drag, setDrag] = useState({ x: 0, active: false });
  const gesture = useRef({ x: 0, y: 0, locked: null });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setData = (updater) => setState((current) => updater(current));

  const onPointerDown = (event) => {
    gesture.current = { x: event.clientX, y: event.clientY, locked: null };
    setDrag({ x: 0, active: true });
  };

  const onPointerMove = (event) => {
    if (!drag.active) return;
    const dx = event.clientX - gesture.current.x;
    const dy = event.clientY - gesture.current.y;
    if (!gesture.current.locked && Math.abs(dx) + Math.abs(dy) > 10) {
      gesture.current.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (gesture.current.locked === 'x') {
      event.preventDefault();
      setDrag({ x: Math.max(-120, Math.min(120, dx)), active: true });
    }
  };

  const onPointerEnd = () => {
    if (gesture.current.locked === 'x' && Math.abs(drag.x) > 60) {
      setActiveTab((tab) => Math.max(0, Math.min(tabs.length - 1, tab + (drag.x < 0 ? 1 : -1))));
    }
    setDrag({ x: 0, active: false });
  };

  return (
    <div className="app-shell">
      <div className="phone">
        <header className="topbar">
          <div>
            <p className="eyebrow">FitTrack V2</p>
            <h1>{tabs[activeTab].label}</h1>
          </div>
          <div className="status-pill">{new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</div>
        </header>

        <nav className="tabs" aria-label="页面切换">
          {tabs.map((tab, index) => (
            <button key={tab.id} className={activeTab === index ? 'active' : ''} onClick={() => setActiveTab(index)}>
              {tab.label}
            </button>
          ))}
        </nav>

        <main
          className="viewport"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          <div
            className="pages"
            style={{
              transform: `translateX(calc(${-activeTab * 100}% + ${drag.x}px))`,
              transition: drag.active ? 'none' : 'transform 520ms cubic-bezier(.2,.9,.18,1)'
            }}
          >
            <Page><Dashboard state={state} setData={setData} setActiveTab={setActiveTab} /></Page>
            <Page><Workout state={state} setData={setData} /></Page>
            <Page><Food state={state} setData={setData} /></Page>
            <Page><Stats state={state} /></Page>
            <Page><Profile state={state} setData={setData} /></Page>
          </div>
        </main>
      </div>
    </div>
  );
}

function Page({ children }) {
  return <section className="page">{children}</section>;
}

function Dashboard({ state, setData, setActiveTab }) {
  const latestWeight = state.weights.at(-1)?.value || '--';
  const todayWorkout = state.workouts.find((item) => item.date === today());
  const streak = getStreak(state.workouts);
  const monthCount = state.workouts.filter((item) => item.date.startsWith(today().slice(0, 7))).length;

  return (
    <div className="screen">
      <section className="hero-panel">
        <div>
          <p>今天状态</p>
          <h2>{todayWorkout ? '训练已完成' : '准备开始训练'}</h2>
        </div>
        <button className="primary" onClick={() => setActiveTab(1)}>开始训练</button>
      </section>
      <div className="metric-grid">
        <Metric label="当前体重" value={`${latestWeight} kg`} />
        <Metric label="连续训练" value={`${streak} 天`} />
        <Metric label="本月训练" value={`${monthCount} 次`} />
        <Metric label="今日摄入" value={`${sumMeals(state.meals, today())} kcal`} />
      </div>
      <section className="panel">
        <div className="section-title"><h3>今日目标</h3><span>{today()}</span></div>
        <Checklist done={Boolean(todayWorkout)} label="完成一次训练" />
        <Checklist done={sumMeals(state.meals, today()) > 0} label="记录饮食" />
        <Checklist done={state.weights.some((item) => item.date === today())} label="记录体重" />
      </section>
      <QuickWeight setData={setData} />
    </div>
  );
}

function Workout({ state, setData }) {
  const [session, setSession] = useState(null);
  const [showExercise, setShowExercise] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [rest, setRest] = useState(0);

  useEffect(() => {
    if (!rest) return;
    const timer = setInterval(() => setRest((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [rest]);

  const previous = state.workouts.at(-1);
  const prs = useMemo(() => calculatePrs(state.workouts), [state.workouts]);

  const addExercise = (exercise) => {
    setSession((current) => ({
      ...current,
      exercises: [...current.exercises, { ...exercise, sets: 3, reps: 10, weight: 0 }]
    }));
    setShowExercise(false);
  };

  const updateExercise = (index, patch) => {
    setSession((current) => ({
      ...current,
      exercises: current.exercises.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    }));
  };

  const saveSession = () => {
    const start = new Date(session.startedAt);
    const duration = Math.max(1, Math.round((Date.now() - start.getTime()) / 60000));
    const record = { ...session, id: uid('workout'), date: today(), time: nowTime(), duration };
    setData((data) => ({ ...data, workouts: [...data.workouts, record] }));
    setSession(null);
    setFinishOpen(false);
  };

  const copyPrevious = () => {
    if (!previous) return;
    setSession({
      startedAt: new Date().toISOString(),
      exercises: previous.exercises.map((item) => ({ ...item }))
    });
  };

  if (!session) {
    return (
      <div className="screen">
        <section className="hero-panel workout-hero">
          <div>
            <p>训练记录</p>
            <h2>开始一次新的训练</h2>
          </div>
          <button className="primary" onClick={() => setSession({ startedAt: new Date().toISOString(), exercises: [] })}>开始</button>
        </section>
        <div className="action-row">
          <button className="ghost" onClick={copyPrevious} disabled={!previous}>复制上次训练</button>
          <button className="ghost" onClick={() => setShowExercise(true)}>先选动作</button>
        </div>
        <section className="panel">
          <div className="section-title"><h3>个人纪录</h3><span>PR</span></div>
          {Object.entries(prs).slice(0, 5).map(([name, pr]) => (
            <div className="list-row" key={name}>
              <span>{name}</span>
              <strong>{pr.weight}kg x {pr.reps}</strong>
            </div>
          ))}
          {!Object.keys(prs).length && <Empty text="保存训练后会自动生成 PR" />}
        </section>
        <History workouts={state.workouts} />
        {showExercise && <ExerciseModal onClose={() => setShowExercise(false)} onPick={addExercise} favorites={state.favorites} setData={setData} />}
      </div>
    );
  }

  return (
    <div className="screen">
      <section className="session-header">
        <div>
          <p>训练中</p>
          <h2>{session.exercises.length ? `${session.exercises.length} 个动作` : '添加动作开始记录'}</h2>
        </div>
        {rest > 0 && <div className="rest-timer">{rest}s</div>}
      </section>
      <button className="wide-add" onClick={() => setShowExercise(true)}>添加训练动作</button>
      <div className="exercise-list">
        {session.exercises.map((exercise, index) => (
          <ExerciseEditor
            key={`${exercise.name}-${index}`}
            exercise={exercise}
            onChange={(patch) => updateExercise(index, patch)}
            onRest={() => setRest(90)}
          />
        ))}
      </div>
      {!session.exercises.length && <Empty text="点击添加训练动作，选择部位和动作" />}
      <div className="sticky-actions">
        <button className="danger" onClick={() => setFinishOpen(true)}>结束训练</button>
        <button className="primary" onClick={saveSession} disabled={!session.exercises.length}>保存训练</button>
      </div>
      {showExercise && <ExerciseModal onClose={() => setShowExercise(false)} onPick={addExercise} favorites={state.favorites} setData={setData} />}
      {finishOpen && (
        <Modal title="训练已结束" onClose={() => setFinishOpen(false)}>
          <p className="modal-copy">你可以保存本次训练，也可以直接放弃，不会写入记录。</p>
          <div className="modal-actions">
            <button className="danger" onClick={() => { setSession(null); setFinishOpen(false); }}>放弃训练</button>
            <button className="primary" onClick={saveSession} disabled={!session.exercises.length}>保存训练</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ExerciseEditor({ exercise, onChange, onRest }) {
  return (
    <article className="exercise-card">
      <div className="section-title"><h3>{exercise.name}</h3><span>{exercise.group}</span></div>
      <div className="picker-row">
        <WheelPicker label="组数" value={exercise.sets} min={1} max={12} onChange={(sets) => onChange({ sets })} />
        <WheelPicker label="次数" value={exercise.reps} min={1} max={30} onChange={(reps) => onChange({ reps })} />
        <WheelPicker label="重量" value={exercise.weight} min={0} max={200} step={2.5} onChange={(weight) => onChange({ weight })} />
      </div>
      <button className="ghost compact" onClick={onRest}>完成一组，开始休息</button>
    </article>
  );
}

function WheelPicker({ label, value, min, max, step = 1, onChange }) {
  const values = [];
  for (let item = min; item <= max; item += step) values.push(Number(item.toFixed(1)));
  return (
    <label className="wheel">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(Number(event.target.value))}>
        {values.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
  );
}

function ExerciseModal({ onClose, onPick, favorites, setData }) {
  const [group, setGroup] = useState(muscleGroups[0]);
  const toggleFavorite = (name) => {
    setData((data) => ({
      ...data,
      favorites: data.favorites.includes(name)
        ? data.favorites.filter((item) => item !== name)
        : [...data.favorites, name]
    }));
  };

  return (
    <Modal title="添加训练动作" onClose={onClose} wide>
      <div className="exercise-picker">
        <div className="group-list">
          {muscleGroups.map((item) => (
            <button key={item.id} className={group.id === item.id ? 'active' : ''} onClick={() => setGroup(item)}>{item.name}</button>
          ))}
        </div>
        <div className="movement-list">
          {group.exercises.map((name) => (
            <div className="movement" key={name}>
              <button onClick={() => onPick({ name, group: group.name })}>
                <strong>{name}</strong>
                <span>{favorites.includes(name) ? '常用动作' : '点击添加'}</span>
              </button>
              <button className="icon-button" onClick={() => toggleFavorite(name)}>{favorites.includes(name) ? '★' : '☆'}</button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function Food({ state, setData }) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState(500);

  const addMeal = () => {
    if (!name.trim()) return;
    setData((data) => ({ ...data, meals: [...data.meals, { id: uid('meal'), date: today(), name, calories: Number(calories) }] }));
    setName('');
  };

  return (
    <div className="screen">
      <section className="panel">
        <div className="section-title"><h3>记录饮食</h3><span>{sumMeals(state.meals, today())} kcal</span></div>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：牛肉饭" />
        <WheelPicker label="热量" value={calories} min={100} max={1500} step={50} onChange={setCalories} />
        <button className="primary full" onClick={addMeal}>添加饮食</button>
      </section>
      <section className="panel">
        <div className="section-title"><h3>今日饮食</h3><span>{today()}</span></div>
        {state.meals.filter((meal) => meal.date === today()).map((meal) => (
          <div className="list-row" key={meal.id}><span>{meal.name}</span><strong>{meal.calories} kcal</strong></div>
        ))}
      </section>
    </div>
  );
}

function Stats({ state }) {
  const [modal, setModal] = useState(null);
  const monthDays = getMonthDays(new Date());
  const workoutDates = new Set(state.workouts.map((item) => item.date));
  const totalDuration = state.workouts.reduce((sum, item) => sum + item.duration, 0);
  const totalVolume = state.workouts.reduce((sum, workout) => sum + workout.exercises.reduce((s, e) => s + e.sets * e.reps * e.weight, 0), 0);

  return (
    <div className="screen stats-screen">
      <div className="metric-grid">
        <button className="metric clickable" onClick={() => setModal({ type: 'summary' })}><span>训练次数</span><strong>{state.workouts.length}</strong></button>
        <button className="metric clickable" onClick={() => setModal({ type: 'duration' })}><span>累计时长</span><strong>{totalDuration} 分</strong></button>
        <button className="metric clickable" onClick={() => setModal({ type: 'volume' })}><span>总容量</span><strong>{Math.round(totalVolume)} kg</strong></button>
        <button className="metric clickable" onClick={() => setModal({ type: 'streak' })}><span>连续训练</span><strong>{getStreak(state.workouts)} 天</strong></button>
      </div>

      <section className="panel calendar-panel">
        <div className="section-title"><h3>训练日历</h3><span>有训练会高亮</span></div>
        <div className="calendar-weekdays">{['一', '二', '三', '四', '五', '六', '日'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">
          {monthDays.map((day, index) => (
            <button
              key={`${day?.date || 'blank'}-${index}`}
              className={day ? `day ${workoutDates.has(day.date) ? 'trained' : ''} ${day.date === today() ? 'today' : ''}` : 'day blank'}
              onClick={() => day && setModal({ type: 'day', date: day.date })}
              disabled={!day}
            >
              {day?.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel chart-panel">
        <div className="section-title"><h3>体重曲线</h3><span>含日期和时间</span></div>
        <LineChart points={state.weights.map((item) => ({ label: `${item.date.slice(5)} ${item.time}`, value: item.value }))} />
      </section>

      <section className="panel">
        <div className="section-title"><h3>训练热力图</h3><span>最近 28 天</span></div>
        <div className="heatmap">
          {Array.from({ length: 28 }).map((_, index) => {
            const date = today(index - 27);
            return <button key={date} className={workoutDates.has(date) ? 'hot' : ''} onClick={() => setModal({ type: 'day', date })} title={date} />;
          })}
        </div>
      </section>

      {modal && <StatsModal modal={modal} state={state} onClose={() => setModal(null)} />}
    </div>
  );
}

function StatsModal({ modal, state, onClose }) {
  if (modal.type === 'day') {
    const workouts = state.workouts.filter((item) => item.date === modal.date);
    const meals = state.meals.filter((item) => item.date === modal.date);
    const weights = state.weights.filter((item) => item.date === modal.date);
    return (
      <Modal title={`${modal.date} 详情`} onClose={onClose}>
        <DetailBlock title="训练" empty="当天没有训练">
          {workouts.map((workout) => <WorkoutSummary key={workout.id} workout={workout} />)}
        </DetailBlock>
        <DetailBlock title="饮食" empty="当天没有饮食记录">
          {meals.map((meal) => <div className="list-row" key={meal.id}><span>{meal.name}</span><strong>{meal.calories} kcal</strong></div>)}
        </DetailBlock>
        <DetailBlock title="体重" empty="当天没有体重记录">
          {weights.map((weight) => <div className="list-row" key={weight.id}><span>{weight.time}</span><strong>{weight.value} kg</strong></div>)}
        </DetailBlock>
      </Modal>
    );
  }

  return (
    <Modal title="统计详情" onClose={onClose}>
      {state.workouts.slice().reverse().map((workout) => <WorkoutSummary key={workout.id} workout={workout} />)}
      {!state.workouts.length && <Empty text="还没有训练记录" />}
    </Modal>
  );
}

function DetailBlock({ title, empty, children }) {
  const hasContent = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div className="detail-block">
      <h4>{title}</h4>
      {hasContent ? children : <Empty text={empty} />}
    </div>
  );
}

function Profile({ state, setData }) {
  return (
    <div className="screen">
      <QuickWeight setData={setData} />
      <section className="panel">
        <div className="section-title"><h3>体重记录</h3><span>日期 + 时间</span></div>
        {state.weights.slice().reverse().map((item) => (
          <div className="list-row" key={item.id}>
            <span>{item.date} {item.time}</span>
            <strong>{item.value} kg</strong>
          </div>
        ))}
      </section>
      <section className="panel">
        <div className="section-title"><h3>常用动作</h3><span>{state.favorites.length}</span></div>
        <div className="chip-row">{state.favorites.map((name) => <span className="chip" key={name}>{name}</span>)}</div>
      </section>
    </div>
  );
}

function QuickWeight({ setData }) {
  const [weight, setWeight] = useState(70);
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(nowTime());

  const add = () => {
    setData((data) => ({ ...data, weights: [...data.weights, { id: uid('weight'), date, time, value: Number(weight) }] }));
  };

  return (
    <section className="panel">
      <div className="section-title"><h3>记录体重</h3><span>支持时间</span></div>
      <div className="form-grid">
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
      </div>
      <WheelPicker label="体重 kg" value={weight} min={35} max={150} step={0.1} onChange={setWeight} />
      <button className="primary full" onClick={add}>保存体重</button>
    </section>
  );
}

function LineChart({ points }) {
  if (points.length < 2) return <Empty text="至少两条体重记录后显示曲线" />;
  const min = Math.min(...points.map((p) => p.value));
  const max = Math.max(...points.map((p) => p.value));
  const range = max - min || 1;
  const coords = points.map((point, index) => {
    const x = 28 + (index * 244) / Math.max(1, points.length - 1);
    const y = 170 - ((point.value - min) / range) * 120;
    return { ...point, x, y };
  });
  return (
    <svg className="chart" viewBox="0 0 300 210" role="img" aria-label="体重趋势图">
      <path d="M28 20V170H286" />
      <polyline points={coords.map((p) => `${p.x},${p.y}`).join(' ')} />
      {coords.map((point) => <circle key={point.label} cx={point.x} cy={point.y} r="4" />)}
      <text x="28" y="194">{points.at(-1).label}</text>
      <text x="218" y="28">{points.at(-1).value}kg</text>
    </svg>
  );
}

function History({ workouts }) {
  return (
    <section className="panel">
      <div className="section-title"><h3>最近训练</h3><span>{workouts.length} 次</span></div>
      {workouts.slice().reverse().slice(0, 5).map((workout) => <WorkoutSummary key={workout.id} workout={workout} />)}
    </section>
  );
}

function WorkoutSummary({ workout }) {
  return (
    <div className="summary">
      <div className="section-title"><h3>{workout.date} {workout.time}</h3><span>{workout.duration} 分钟</span></div>
      {workout.exercises.map((exercise, index) => (
        <div className="list-row" key={`${exercise.name}-${index}`}>
          <span>{exercise.name}</span>
          <strong>{exercise.sets} 组 x {exercise.reps} 次</strong>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function Checklist({ done, label }) {
  return <div className={`check ${done ? 'done' : ''}`}><span>{done ? '✓' : ''}</span>{label}</div>;
}

function Empty({ text }) {
  return <p className="empty">{text}</p>;
}

function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <button className="modal-backdrop" onClick={onClose} aria-label="关闭" />
      <div className={`modal ${wide ? 'wide' : ''}`}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function getMonthDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const days = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= last; day += 1) {
    const value = new Date(year, month, day);
    days.push({ label: day, date: value.toISOString().slice(0, 10) });
  }
  while (days.length % 7) days.push(null);
  return days;
}

function getStreak(workouts) {
  const dates = new Set(workouts.map((item) => item.date));
  let count = 0;
  for (let offset = 0; offset > -365; offset -= 1) {
    if (!dates.has(today(offset))) break;
    count += 1;
  }
  return count;
}

function sumMeals(meals, date) {
  return meals.filter((item) => item.date === date).reduce((sum, item) => sum + item.calories, 0);
}

function calculatePrs(workouts) {
  const prs = {};
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      if (!prs[exercise.name] || exercise.weight > prs[exercise.name].weight) {
        prs[exercise.name] = { weight: exercise.weight, reps: exercise.reps };
      }
    });
  });
  return prs;
}

export default App;
