import { useEffect, useState, useMemo } from "react";
import { getTasks } from "../api/taskApi";
import { startTimer, stopTimer, getLogsByUser } from "../api/timeLogApi";
import { simulateIdle } from "../api/notificationApi";
import { useAuth } from "../context/AuthContext";

export default function TimeTracker() {
  const { user } = useAuth();
  const userId = user?.id;

  const [tasks, setTasks] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");

  const activeLog = useMemo(() => timeLogs.find((l) => l.endTime == null), [timeLogs]);

  const fetchData = async () => {
    if (!userId) return;
    try {
      const t = await getTasks();
      const logs = await getLogsByUser({ userId });
      setTasks(t.data.tasks || []);
      setTimeLogs(logs.data.timeLogs || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load timer data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!activeLog) {
      setSeconds(0);
      return;
    }
    const startTime = new Date(activeLog.startTime);
    const tick = () => {
      const now = new Date();
      setSeconds(Math.floor((now - startTime) / 1000));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeLog]);

  const handleStart = async (taskId) => {
    setError("");
    try {
      await startTimer({ taskId });
      await fetchData();
    } catch (e) {
      setError(e?.response?.data?.message || "Could not start timer.");
    }
  };

  const handleStop = async (taskId) => {
    setError("");
    try {
      await stopTimer({ taskId });
      setSeconds(0);
      await fetchData();
    } catch (e) {
      setError(e?.response?.data?.message || "Could not stop timer.");
    }
  };

  const idleSim = async () => {
    try {
      await simulateIdle({ taskId: activeLog?.taskId?._id || activeLog?.taskId });
    } catch {
      /* ignore */
    }
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Timer</h1>
          <p className="text-sm text-slate-600">One active timer at a time across tasks</p>
        </div>
        <button
          type="button"
          onClick={idleSim}
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900"
        >
          Simulate idle warning
        </button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {activeLog ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
          <p className="text-sm font-medium">Timer running</p>
          <p className="text-3xl font-semibold tabular-nums">{formatTime(seconds)}</p>
        </div>
      ) : null}

      <div className="space-y-3">
        {tasks.map((task) => {
          const tid = task._id?.toString?.() || task._id;
          const activeTaskId =
            activeLog?.taskId?._id?.toString?.() || activeLog?.taskId?.toString?.() || activeLog?.taskId;
          const isActive = activeTaskId && activeTaskId === tid;

          return (
            <div
              key={task._id}
              className={`rounded-2xl border p-4 shadow-sm ${
                isActive ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">{task.title}</h2>
                  <p className="text-xs text-slate-500">{task.status}</p>
                </div>
                {!isActive ? (
                  <button
                    type="button"
                    onClick={() => handleStart(task._id)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Start
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStop(task._id)}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
