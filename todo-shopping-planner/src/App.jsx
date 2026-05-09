import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarDays, Check, ShoppingCart, Trash2, Plus } from 'lucide-react';

const STORAGE_KEY = 'planner-app-v1';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [purchaseText, setPurchaseText] = useState('');
  const [taskDate, setTaskDate] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setTasks(data.tasks || []);
      setPurchases(data.purchases || []);
    }

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, purchases }));
  }, [tasks, purchases]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      tasks.forEach((task) => {
        if (!task.done && task.date && !task.notified) {
          const taskTime = new Date(task.date);

          if (taskTime <= now) {
            if (Notification.permission === 'granted') {
              new Notification(`Напоминание: ${task.text}`);
            }

            setTasks((prev) =>
              prev.map((item) =>
                item.id === task.id ? { ...item, notified: true } : item
              )
            );
          }
        }
      });
    }, 30000);

    return () => clearInterval(timer);
  }, [tasks]);

  const addTask = () => {
    if (!taskText.trim()) return;

    setTasks([
      {
        id: Date.now(),
        text: taskText,
        date: taskDate,
        done: false,
        notified: false,
      },
      ...tasks,
    ]);

    setTaskText('');
    setTaskDate('');
  };

  const addPurchase = () => {
    if (!purchaseText.trim()) return;

    setPurchases([
      {
        id: Date.now(),
        text: purchaseText,
        bought: false,
      },
      ...purchases,
    ]);

    setPurchaseText('');
  };

  const stats = useMemo(() => ({
    tasks: tasks.length,
    completed: tasks.filter((t) => t.done).length,
    purchases: purchases.length,
  }), [tasks, purchases]);

  return (
    <div className='app'>
      <div className='container'>
        <div className='hero'>
          <div>
            <span className='badge'>Планировщик жизни</span>
            <h1>Дела, покупки и напоминания</h1>
            <p>Планируй задачи, покупки и получай напоминания прямо в браузере.</p>
          </div>
          <Bell size={56} />
        </div>

        <div className='stats'>
          <div className='card'>
            <CalendarDays />
            <strong>{stats.tasks}</strong>
            <span>Всего задач</span>
          </div>

          <div className='card'>
            <Check />
            <strong>{stats.completed}</strong>
            <span>Выполнено</span>
          </div>

          <div className='card'>
            <ShoppingCart />
            <strong>{stats.purchases}</strong>
            <span>Покупок</span>
          </div>
        </div>

        <div className='grid'>
          <section className='panel'>
            <div className='panel-title'>
              <h2>Дела</h2>
            </div>

            <div className='form'>
              <input
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder='Что нужно сделать?'
              />

              <input
                type='datetime-local'
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
              />

              <button onClick={addTask}>
                <Plus size={18} />
                Добавить задачу
              </button>
            </div>

            <div className='list'>
              {tasks.map((task) => (
                <div key={task.id} className='item'>
                  <div>
                    <strong className={task.done ? 'done' : ''}>{task.text}</strong>
                    {task.date && <small>{new Date(task.date).toLocaleString()}</small>}
                  </div>

                  <div className='actions'>
                    <button
                      className='icon'
                      onClick={() =>
                        setTasks(tasks.map((t) =>
                          t.id === task.id ? { ...t, done: !t.done } : t
                        ))
                      }
                    >
                      <Check size={16} />
                    </button>

                    <button
                      className='icon danger'
                      onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className='panel'>
            <div className='panel-title'>
              <h2>Покупки</h2>
            </div>

            <div className='form inline'>
              <input
                value={purchaseText}
                onChange={(e) => setPurchaseText(e.target.value)}
                placeholder='Что купить?'
              />

              <button onClick={addPurchase}>
                <Plus size={18} />
              </button>
            </div>

            <div className='list'>
              {purchases.map((item) => (
                <div key={item.id} className='item'>
                  <strong className={item.bought ? 'done' : ''}>{item.text}</strong>

                  <div className='actions'>
                    <button
                      className='icon'
                      onClick={() =>
                        setPurchases(purchases.map((p) =>
                          p.id === item.id ? { ...p, bought: !p.bought } : p
                        ))
                      }
                    >
                      <Check size={16} />
                    </button>

                    <button
                      className='icon danger'
                      onClick={() => setPurchases(purchases.filter((p) => p.id !== item.id))}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
