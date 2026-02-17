import { useState, useEffect, useCallback } from 'react';
import { CravingLog } from '@/types/craving';
import { getUserId } from '@/lib/auth';
import { getCravingLogs, saveCravingLog, deleteCravingLog } from '@/lib/db';
import { toast } from 'sonner';

export function useCravingLogs() {
  const [logs, setLogs] = useState<CravingLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const data = await getCravingLogs(userId);
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch craving logs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = useCallback(async (log: CravingLog) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      await saveCravingLog(userId, log);
      setLogs(prev => [log, ...prev]);
    } catch (error) {
      console.error("Failed to add craving log:", error);
      toast.error("Failed to save entry");
    }
  }, []);

  const removeLog = useCallback(async (id: string) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      await deleteCravingLog(userId, id);
      setLogs(prev => prev.filter(l => l.id !== id));
      toast("Entry removed");
    } catch (error) {
      console.error("Failed to remove craving log:", error);
      toast.error("Failed to remove entry");
    }
  }, []);

  const todayLogs = logs.filter(l => {
    const d = new Date(l.timestamp);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return { logs, addLog, removeLog, todayLogs, loading };
}
