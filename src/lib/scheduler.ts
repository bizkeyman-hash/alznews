import { clearCache } from "@/lib/cache";
import { clearScoreCache } from "@/lib/scoring";

const KST_OFFSET = 9 * 60; // UTC+9 in minutes
const REFRESH_HOURS = [7, 19]; // 오전 7시, 오후 7시

function getNextRefreshMs(): number {
  const now = new Date();
  // Current time in KST
  const kstMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + KST_OFFSET) % (24 * 60);
  const kstHour = Math.floor(kstMinutes / 60);
  const kstMin = kstMinutes % 60;

  // Find next refresh hour
  let nextHour = REFRESH_HOURS.find((h) => h > kstHour || (h === kstHour && kstMin === 0));
  let daysToAdd = 0;

  if (nextHour === undefined) {
    // All today's slots passed, schedule for tomorrow's first slot
    nextHour = REFRESH_HOURS[0];
    daysToAdd = 1;
  }

  // Calculate ms until next refresh
  const targetKstMinutes = nextHour * 60;
  let diffMinutes = targetKstMinutes - kstMinutes + daysToAdd * 24 * 60;
  if (diffMinutes <= 0) diffMinutes += 24 * 60;

  return diffMinutes * 60 * 1000;
}

function formatKST(date: Date): string {
  return date.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}

function scheduleNext() {
  const ms = getNextRefreshMs();
  const nextTime = new Date(Date.now() + ms);
  console.log(`[Scheduler] Next refresh at ${formatKST(nextTime)} KST (in ${Math.round(ms / 60000)}min)`);

  setTimeout(() => {
    console.log(`[Scheduler] Refreshing news at ${formatKST(new Date())} KST`);
    clearCache();
    clearScoreCache();
    scheduleNext();
  }, ms);
}

export function startScheduler() {
  console.log(`[Scheduler] Started — auto-refresh at ${REFRESH_HOURS.map((h) => `${h}:00`).join(", ")} KST`);
  scheduleNext();
}
