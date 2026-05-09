import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  Download,
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

const STORAGE_KEY = 'planner-app-v2';

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

const todayDate = () => new Date().toISOString().slice(0, 10);
const toLocalInput = (date = new Date()) => {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return copy.toISOString().slice(0, 16);
};

function addRepeatDate(dateString, repeat) {
  if (!dateString || repeat === 'none') return '';
  const next = new Date(dateString);
  if (repeat === 'daily') next.setDate(next.getDate() + 1);
  if (repeat === 'weekly') next.setDate(next.getDate() + 7);
  if (repeat === 'monthly') next.setMonth(next.getMonth() + 1);
  return toLocalInput(next);
}

function createId() {
  return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(todayDate());
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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setTasks(data.tasks || []);
      setPurchases(data.purchases || []);
      setSettings({ ...defaultSettings, ...(data.settings || {}) });
    }

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, purchases, settings }));
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

  const aiPlan = useMemo(() => {
    const open = tasks.filter((task) => !task.done);
    const urgent = open.filter((task) => task.priority === 'high');
    const today = open.filter((task) => task.date?.slice(0, 10) === todayDate());
    const purchasesSoon = purchases.filter((item) => !item.bought).slice(0, 5);

    if (!open.length && !purchasesSoon.length) return 'Сегодня свободный день. Можно добавить одну важную цель.';
    return [
      urgent.length ? `Сначала сделай важные задачи: ${urgent.slice(0, 3).map((task) => task.text).join(', ')}.` : '',
      today.length ? `На сегодня запланировано ${today.length} дел.` : 'На сегодня нет задач с датой — распредели список по времени.',
      purchasesSoon.length ? `По покупкам: ${purchasesSoon.map((item) => item.text).join(', ')}.` : '',
      'Совет: оставь 30–60 минут буфера между делами.',
    ].filter(Boolean).join(' ');
  }, [tasks, purchases]);

  const addTask = () => {
    if (!taskForm.text.trim()) return;
    setTasks((prev) => [{
      ...taskForm,
      id: createId(),
      done: false,
      notified: false,
      createdAt: new Date().toISOString(),
    }, ...prev]);
    setTaskForm({ ...taskForm, text: '', notes: '' });
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
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTaskForm((prev) => ({ ...prev, text }));
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
      setTasks(data.tasks || []);
      setPurchases(data.purchases || []);
      setSettings({ ...defaultSettings, ...(data.settings || {}) });
    });
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
    <div className="app">
      <div className="container">
        <header className="hero">
          <div>
            <span className="badge">PWA · дела · покупки · напоминания</span>
            <h1>Планировщик дел и покупок</h1>
            <p>Задачи, календарь, повторения, приоритеты, голосовой ввод, резервные копии и уведомления.</p>
          </div>
          <div className="hero-actions">
            <button onClick={exportData}><Download size={18} /> Экспорт</button>
            <button className="secondary" onClick={() => fileInput.current?.click()}><Upload size={18} /> Импорт</button>
            <input ref={fileInput} type="file" accept="application/json" hidden onChange={importData} />
          </div>
        </header>

        <section className="stats">
          <div className="card"><CalendarDays /><strong>{stats.today}</strong><span>Сегодня</span></div>
          <div className="card"><Bell /><strong>{stats.total}</strong><span>Всего задач</span></div>
          <div className="card"><Check /><strong>{stats.done}</strong><span>Выполнено</span></div>
          <div className="card"><ShoppingCart /><strong>{stats.purchases}</strong><span>Купить</span></div>
        </section>

        <section className="panel ai-panel">
          <div>
            <h2><Sparkles size={22} /> AI-план дня</h2>
            <p>{aiPlan}</p>
          </div>
          <button onClick={sendTelegram}>Отправить в Telegram</button>
        </section>

        <main className="grid wide">
          <section className="panel">
            <h2>Добавить дело</h2>
            <div className="form">
              <div className="voice-row">
                <input value={taskForm.text} onChange={(e) => setTaskForm({ ...taskForm, text: e.target.value })} placeholder="Что нужно сделать?" />
                <button className={listening ? 'recording' : ''} onClick={startVoice}><Mic size={18} /></button>
              </div>
              <textarea value={taskForm.notes} onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })} placeholder="Заметки, адрес, детали..." />
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
              <button onClick={addTask}><Plus size={18} /> Добавить дело</button>
            </div>
          </section>

          <section className="panel">
            <h2>Покупки</h2>
            <div className="form">
              <input value={purchaseForm.text} onChange={(e) => setPurchaseForm({ ...purchaseForm, text: e.target.value })} placeholder="Что купить?" />
              <div className="form-grid three">
                <input value={purchaseForm.category} onChange={(e) => setPurchaseForm({ ...purchaseForm, category: e.target.value })} placeholder="Категория" />
                <select value={purchaseForm.priority} onChange={(e) => setPurchaseForm({ ...purchaseForm, priority: e.target.value })}>{priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select>
                <input type="date" value={purchaseForm.plannedDate} onChange={(e) => setPurchaseForm({ ...purchaseForm, plannedDate: e.target.value })} />
              </div>
              <button onClick={addPurchase}><Plus size={18} /> Добавить покупку</button>
            </div>

            <div className="list">
              {purchases.map((item) => (
                <article className="item" key={item.id}>
                  <div>
                    <strong className={item.bought ? 'done' : ''}>{item.text}</strong>
                    <small>{item.category} · {item.priority} · {item.plannedDate}</small>
                  </div>
                  <div className="actions">
                    <button className="icon" onClick={() => togglePurchase(item.id)}><Check size={16} /></button>
                    <button className="icon danger" onClick={() => setPurchases(purchases.filter((p) => p.id !== item.id))}><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        <section className="panel">
          <div className="tabs">
            {[
              ['today', 'Сегодня'],
              ['week', 'Неделя'],
              ['all', 'Все'],
              ['done', 'Выполнено'],
            ].map(([id, label]) => <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>{label}</button>)}
          </div>

          <div className="list">
            {visibleTasks.map((task) => (
              <article className={`item priority-${task.priority}`} key={task.id}>
                <div>
                  <strong className={task.done ? 'done' : ''}>{task.text}</strong>
                  <small>{task.date ? new Date(task.date).toLocaleString() : 'Без даты'} · {task.category} · {task.priority}</small>
                  {task.repeat !== 'none' && <small className="repeat"><Repeat size={13} /> повтор: {task.repeat}</small>}
                  {task.notes && <p>{task.notes}</p>}
                </div>
                <div className="actions">
                  <button className="icon" onClick={() => toggleTask(task.id)}><Check size={16} /></button>
                  <button className="icon danger" onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))}><Trash2 size={16} /></button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid">
          <div className="panel">
            <h2>Календарь</h2>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            <div className="calendar-day">
              {dayTasks.length ? dayTasks.map((task) => <div key={task.id}>{new Date(task.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {task.text}</div>) : <p>На этот день задач нет.</p>}
            </div>
          </div>

          <div className="panel">
            <h2><Settings size={22} /> Интеграции</h2>
            <div className="form">
              <input value={settings.supabaseUrl} onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })} placeholder="Supabase URL" />
              <input value={settings.supabaseAnonKey} onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })} placeholder="Supabase anon key" />
              <input value={settings.telegramBotToken} onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })} placeholder="Telegram bot token" />
              <input value={settings.telegramChatId} onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })} placeholder="Telegram chat_id" />
              <button onClick={syncToSupabase}><Save size={18} /> Сохранить в Supabase</button>
            </div>
            <p className="hint">Для Telegram создай бота через BotFather, напиши ему сообщение и добавь token/chat_id сюда.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
