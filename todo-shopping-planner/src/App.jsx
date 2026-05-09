import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  Download,
  Home,
  ListTodo,
  Mic,
  Plus,
  Repeat,
  Save,
  Settings,
  ShoppingCart,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';

const STORAGE_KEY = 'planner-app-v3';

const defaultSettings = {
  telegramBotToken: '',
  telegramChatId: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
};

const categories = ['Дом', 'Работа', 'Здоровье', 'Семья', 'Учёба', 'Покупки'];
const priorities = [
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' },
];

const priorityLabels = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

const todayDate = () => new Date().toISOString().slice(0, 10);
const toLocalInput = (date = new Date()) => {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return copy.toISOString().slice(0, 16);
};

function createId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

function addRepeatDate(dateString, repeat) {
  if (!dateString || repeat === 'none') return '';
  const next = new Date(dateString);
  if (repeat === 'daily') next.setDate(next.getDate() + 1);
  if (repeat === 'weekly') next.setDate(next.getDate() + 7);
  if (repeat === 'monthly') next.setMonth(next.getMonth() + 1);
  return toLocalInput(next);
}

function splitTasks(text) {
  return text
    .replace(/\s+(и еще|ещё|потом|затем)\s+/gi, '\n')
    .replace(/[;•]/g, '\n')
    .split(/\n|(?:^|\s)(?:\d+\.|- )/g)
    .map((item) => item.trim().replace(/^(и|ещё|еще)\s+/i, ''))
    .filter((item) => item.length > 2);
}

function inferTask(text, baseForm) {
  const lower = text.toLowerCase();
  let category = baseForm.category;
  let priority = baseForm.priority;
  let date = baseForm.date || toLocalInput();

  if (/купить|магазин|продукт|молоко|хлеб|аптек/i.test(lower)) category = 'Покупки';
  if (/врач|спорт|трениров|лекарств|здоров/i.test(lower)) category = 'Здоровье';
  if (/работ|звонок|созвон|письмо|проект|отчет|отчёт/i.test(lower)) category = 'Работа';
  if (/срочно|важно|не забыть|обязательно/i.test(lower)) priority = 'high';

  const timeMatch = lower.match(/(?:в\s*)?(\d{1,2})[:.](\d{2})|(?:в\s+)(\d{1,2})\s*(?:час|часа|часов)?/i);
  if (timeMatch) {
    const next = new Date(date);
    const hours = Number(timeMatch[1] || timeMatch[3]);
    const minutes = Number(timeMatch[2] || 0);
    if (!Number.isNaN(hours)) {
      next.setHours(Math.min(hours, 23), Math.min(minutes, 59), 0, 0);
      date = toLocalInput(next);
    }
  }

  if (/завтра/i.test(lower)) {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    date = toLocalInput(next);
  }

  return { text, category, priority, date };
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function PriorityChip({ value }) {
  return <span className={`chip priority-chip priority-chip-${value}`}>{priorityLabels[value] || value}</span>;
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(todayDate());
  const [bulkText, setBulkText] = useState('');
  const [taskForm, setTaskForm] = useState({
    text: '',
    date: toLocalInput(),
    category: 'Дом',
    priority: 'medium',
    repeat: 'none',
    notes: '',
  });
  const [purchaseForm, setPurchaseForm] = useState({
    text: '',
    category: 'Продукты',
    priority: 'medium',
    plannedDate: todayDate(),
  });
  const [listening, setListening] = useState(false);
  const fileInput = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('planner-app-v2');
      if (saved) {
        const data = JSON.parse(saved);
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
        setPurchases(Array.isArray(data.purchases) ? data.purchases : []);
        setSettings({ ...defaultSettings, ...(data.settings || {}) });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('planner-app-v2');
    }

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      }).catch(() => {});
    }

    if ('caches' in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key))).catch(() => {});
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, purchases, settings }));
    } catch {}
  }, [tasks, purchases, settings]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      setTasks((current) =>
        current.flatMap((task) => {
          if (task.done || task.notified || !task.date || new Date(task.date) > now) return [task];

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Напоминание: ${task.text}`, {
              body: task.notes || `Категория: ${task.category}`,
            });
          }

          const nextDate = addRepeatDate(task.date, task.repeat);
          const updatedTask = { ...task, notified: true };

          if (nextDate) {
            return [
              updatedTask,
              {
                ...task,
                id: createId(),
                date: nextDate,
                done: false,
                notified: false,
                createdAt: new Date().toISOString(),
              },
            ];
          }

          return [updatedTask];
        })
      );
    }, 20000);

    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const today = todayDate();
    return {
      total: tasks.length,
      today: tasks.filter((task) => task.date?.slice(0, 10) === today && !task.done).length,
      done: tasks.filter((task) => task.done).length,
      purchases: purchases.filter((item) => !item.bought).length,
    };
  }, [tasks, purchases]);

  const dayTasks = useMemo(
    () => tasks
      .filter((task) => task.date?.slice(0, 10) === selectedDate)
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0)),
    [tasks, selectedDate]
  );

  const visibleTasks = useMemo(() => {
    if (activeTab === 'today') return tasks.filter((task) => task.date?.slice(0, 10) === todayDate());
    if (activeTab === 'week') {
      const now = new Date();
      const end = new Date();
      end.setDate(now.getDate() + 7);
      return tasks.filter((task) => task.date && new Date(task.date) >= now && new Date(task.date) <= end);
    }
    if (activeTab === 'done') return tasks.filter((task) => task.done);
    return tasks;
  }, [tasks, activeTab]);

  const parsedBulkTasks = useMemo(() => splitTasks(bulkText), [bulkText]);

  const aiPlan = useMemo(() => {
    const open = tasks.filter((task) => !task.done);
    const urgent = open.filter((task) => task.priority === 'high');
    const today = open.filter((task) => task.date?.slice(0, 10) === todayDate());
    const purchasesSoon = purchases.filter((item) => !item.bought).slice(0, 5);

    if (!open.length && !purchasesSoon.length) return 'Сегодня свободный день. Добавь одну главную цель — приложение поможет не забыть.';
    return [
      urgent.length ? `Сначала сделай важные задачи: ${urgent.slice(0, 3).map((task) => task.text).join(', ')}.` : '',
      today.length ? `На сегодня запланировано ${today.length} дел.` : 'На сегодня нет задач с датой — распредели список по времени.',
      purchasesSoon.length ? `По покупкам: ${purchasesSoon.map((item) => item.text).join(', ')}.` : '',
      'Совет: оставь 30–60 минут буфера между делами.',
    ].filter(Boolean).join(' ');
  }, [tasks, purchases]);

  const createTaskFromText = (text) => {
    const inferred = inferTask(text, taskForm);
    return {
      ...taskForm,
      ...inferred,
      id: createId(),
      done: false,
      notified: false,
      createdAt: new Date().toISOString(),
    };
  };

  const addTask = () => {
    if (!taskForm.text.trim()) return;
    setTasks((prev) => [createTaskFromText(taskForm.text), ...prev]);
    setTaskForm({ ...taskForm, text: '', notes: '' });
  };

  const addBulkTasks = () => {
    const items = splitTasks(bulkText || taskForm.text);
    if (!items.length) return;
    setTasks((prev) => [...items.map(createTaskFromText), ...prev]);
    setBulkText('');
    setTaskForm({ ...taskForm, text: '', notes: '' });
    setActiveTab('all');
  };

  const addPurchase = () => {
    if (!purchaseForm.text.trim()) return;
    setPurchases((prev) => [{
      ...purchaseForm,
      id: createId(),
      bought: false,
      createdAt: new Date().toISOString(),
    }, ...prev]);
    setPurchaseForm({ ...purchaseForm, text: '' });
  };

  const toggleTask = (id) => {
    setTasks((prev) => prev.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  };

  const togglePurchase = (id) => {
    setPurchases((prev) => prev.map((item) => item.id === id ? { ...item, bought: !item.bought } : item));
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Голосовой ввод не поддерживается в этом браузере. Попробуй Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      const items = splitTasks(text);
      setBulkText(items.length > 1 ? items.join('\n') : text);
      setTaskForm((prev) => ({ ...prev, text: items[0] || text }));
    };
    recognition.start();
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ tasks, purchases, settings }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'planner-backup.json';
    link.click();
  };

  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const data = JSON.parse(text);
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      setPurchases(Array.isArray(data.purchases) ? data.purchases : []);
      setSettings({ ...defaultSettings, ...(data.settings || {}) });
    }).catch(() => alert('Не удалось импортировать файл.'));
  };

  const syncToSupabase = async () => {
    if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
      alert('Добавь Supabase URL и anon key в настройках.');
      return;
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(settings.supabaseUrl, settings.supabaseAnonKey);
    const { error } = await supabase.from('planner_backups').insert({
      payload: { tasks, purchases },
      created_at: new Date().toISOString(),
    });

    alert(error ? `Ошибка Supabase: ${error.message}` : 'Резервная копия отправлена в Supabase.');
  };

  const sendTelegram = async () => {
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      alert('Добавь token бота и chat_id в настройках.');
      return;
    }

    const text = `План на сегодня:\n${visibleTasks.map((task) => `• ${task.text}`).join('\n') || 'Нет задач'}`;
    const url = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: settings.telegramChatId, text }),
      });
      alert('План отправлен в Telegram.');
    } catch {
      alert('Не получилось отправить в Telegram. Проверь настройки бота.');
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo"><Check size={22} /></div>
          <div>
            <strong>Planner</strong>
            <span>дела и покупки</span>
          </div>
        </div>
        <nav>
          <a href="#top" className="nav-item active"><Home size={18} /> Обзор</a>
          <a href="#tasks" className="nav-item"><ListTodo size={18} /> Задачи</a>
          <a href="#shopping" className="nav-item"><ShoppingCart size={18} /> Покупки</a>
          <a href="#calendar" className="nav-item"><CalendarDays size={18} /> Календарь</a>
          <a href="#settings" className="nav-item"><Settings size={18} /> Интеграции</a>
        </nav>
        <div className="sidebar-card">
          <Sparkles size={18} />
          <p>Планируй день небольшими шагами — так проще закончить начатое.</p>
        </div>
      </aside>

      <div className="app" id="top">
        <div className="container">
          <header className="hero">
            <div>
              <span className="badge">PWA · дела · покупки · напоминания</span>
              <h1>Твой умный планировщик</h1>
              <p>Говори или вставляй сразу несколько задач — приложение само разложит их в список.</p>
            </div>
            <div className="hero-actions">
              <button onClick={exportData}><Download size={18} /> Экспорт</button>
              <button className="secondary" onClick={() => fileInput.current?.click()}><Upload size={18} /> Импорт</button>
              <input ref={fileInput} type="file" accept="application/json" hidden onChange={importData} />
            </div>
          </header>

          <section className="stats">
            <div className="card stat-card accent-blue"><CalendarDays /><strong>{stats.today}</strong><span>Сегодня</span></div>
            <div className="card stat-card accent-purple"><Bell /><strong>{stats.total}</strong><span>Всего задач</span></div>
            <div className="card stat-card accent-green"><Check /><strong>{stats.done}</strong><span>Выполнено</span></div>
            <div className="card stat-card accent-orange"><ShoppingCart /><strong>{stats.purchases}</strong><span>Купить</span></div>
          </section>

          <section className="panel ai-panel">
            <div>
              <h2><Sparkles size={22} /> AI-план дня</h2>
              <p>{aiPlan}</p>
            </div>
            <button onClick={sendTelegram}>Отправить в Telegram</button>
          </section>

          <main className="grid wide">
            <section className="panel glass-panel" id="tasks">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Голосом или списком</span>
                  <h2>Новые дела</h2>
                </div>
                <ListTodo size={26} />
              </div>
              <div className="form">
                <div className="voice-row">
                  <input value={taskForm.text} onChange={(e) => setTaskForm({ ...taskForm, text: e.target.value })} placeholder="Одно дело: оплатить счета в 18:00" />
                  <button className={listening ? 'recording round-button' : 'round-button'} onClick={startVoice} title="Продиктовать задачи"><Mic size={18} /></button>
                </div>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={'Можно сразу несколько:\nкупить корм\nпозвонить врачу завтра в 10\nсрочно отправить отчет'}
                />
                {parsedBulkTasks.length > 1 && <div className="bulk-preview">Распознано задач: <strong>{parsedBulkTasks.length}</strong></div>}
                <textarea value={taskForm.notes} onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })} placeholder="Общие заметки для новых задач..." />
                <div className="form-grid">
                  <input type="datetime-local" value={taskForm.date} onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })} />
                  <select value={taskForm.category} onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}>{categories.map((cat) => <option key={cat}>{cat}</option>)}</select>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>{priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select>
                  <select value={taskForm.repeat} onChange={(e) => setTaskForm({ ...taskForm, repeat: e.target.value })}>
                    <option value="none">Без повтора</option>
                    <option value="daily">Каждый день</option>
                    <option value="weekly">Каждую неделю</option>
                    <option value="monthly">Каждый месяц</option>
                  </select>
                </div>
                <div className="dual-actions">
                  <button className="primary-action" onClick={addTask}><Plus size={18} /> Добавить одно</button>
                  <button className="secondary-action" onClick={addBulkTasks}><ListTodo size={18} /> Добавить списком</button>
                </div>
              </div>
            </section>

            <section className="panel glass-panel" id="shopping">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Список магазина</span>
                  <h2>Покупки</h2>
                </div>
                <ShoppingCart size={26} />
              </div>
              <div className="form">
                <input value={purchaseForm.text} onChange={(e) => setPurchaseForm({ ...purchaseForm, text: e.target.value })} placeholder="Например: молоко, корм, подарок" />
                <div className="form-grid three">
                  <input value={purchaseForm.category} onChange={(e) => setPurchaseForm({ ...purchaseForm, category: e.target.value })} placeholder="Категория" />
                  <select value={purchaseForm.priority} onChange={(e) => setPurchaseForm({ ...purchaseForm, priority: e.target.value })}>{priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select>
                  <input type="date" value={purchaseForm.plannedDate} onChange={(e) => setPurchaseForm({ ...purchaseForm, plannedDate: e.target.value })} />
                </div>
                <button className="primary-action" onClick={addPurchase}><Plus size={18} /> Добавить покупку</button>
              </div>

              <div className="list compact-list">
                {purchases.length ? purchases.map((item) => (
                  <article className="item purchase-item" key={item.id}>
                    <div>
                      <strong className={item.bought ? 'done' : ''}>{item.text}</strong>
                      <div className="meta-row"><span className="chip">{item.category}</span><PriorityChip value={item.priority} /><span className="chip">{item.plannedDate}</span></div>
                    </div>
                    <div className="actions">
                      <button className="icon" onClick={() => togglePurchase(item.id)}><Check size={16} /></button>
                      <button className="icon danger" onClick={() => setPurchases(purchases.filter((p) => p.id !== item.id))}><Trash2 size={16} /></button>
                    </div>
                  </article>
                )) : <EmptyState icon={<ShoppingCart size={26} />} title="Список покупок пуст" text="Добавь продукты, подарки или любые планируемые покупки." />}
              </div>
            </section>
          </main>

          <section className="panel task-board">
            <div className="board-header">
              <div>
                <span className="eyebrow">Фокус</span>
                <h2>Мои задачи</h2>
              </div>
              <div className="tabs">
                {[
                  ['today', 'Сегодня'],
                  ['week', 'Неделя'],
                  ['all', 'Все'],
                  ['done', 'Выполнено'],
                ].map(([id, label]) => <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>{label}</button>)}
              </div>
            </div>

            <div className="list">
              {visibleTasks.length ? visibleTasks.map((task) => (
                <article className={`item task-item priority-${task.priority}`} key={task.id}>
                  <div className="task-content">
                    <strong className={task.done ? 'done' : ''}>{task.text}</strong>
                    <div className="meta-row">
                      <span className="chip">{task.date ? new Date(task.date).toLocaleString() : 'Без даты'}</span>
                      <span className="chip">{task.category}</span>
                      <PriorityChip value={task.priority} />
                    </div>
                    {task.repeat !== 'none' && <small className="repeat"><Repeat size={13} /> повтор: {task.repeat}</small>}
                    {task.notes && <p>{task.notes}</p>}
                  </div>
                  <div className="actions">
                    <button className="icon" onClick={() => toggleTask(task.id)}><Check size={16} /></button>
                    <button className="icon danger" onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))}><Trash2 size={16} /></button>
                  </div>
                </article>
              )) : <EmptyState icon={<ListTodo size={28} />} title="Здесь пока спокойно" text="Добавь первую задачу или выбери другой фильтр." />}
            </div>
          </section>

          <section className="grid" id="calendar">
            <div className="panel calendar-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">План по дням</span>
                  <h2>Календарь</h2>
                </div>
                <CalendarDays size={26} />
              </div>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              <div className="calendar-day">
                {dayTasks.length ? dayTasks.map((task) => <div className="timeline-item" key={task.id}><span>{new Date(task.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><strong>{task.text}</strong></div>) : <EmptyState icon={<CalendarDays size={26} />} title="На этот день задач нет" text="Можно запланировать отдых или добавить дело выше." />}
              </div>
            </div>

            <div className="panel" id="settings">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Синхронизация</span>
                  <h2>Интеграции</h2>
                </div>
                <Settings size={26} />
              </div>
              <div className="form">
                <input value={settings.supabaseUrl} onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })} placeholder="Supabase URL" />
                <input value={settings.supabaseAnonKey} onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })} placeholder="Supabase anon key" />
                <input value={settings.telegramBotToken} onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })} placeholder="Telegram bot token" />
                <input value={settings.telegramChatId} onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })} placeholder="Telegram chat_id" />
                <button className="primary-action" onClick={syncToSupabase}><Save size={18} /> Сохранить в Supabase</button>
              </div>
              <p className="hint">Для Telegram создай бота через BotFather, напиши ему сообщение и добавь token/chat_id сюда.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
