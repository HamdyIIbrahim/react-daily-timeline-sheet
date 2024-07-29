export const formatTime = (time: string, format: "12h" | "24h"): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: format === "12h",
  });
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${(minutes % 60).toFixed(0)}m`;
};

export const parseTime = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
};

export const calculatePercentage = (start: string, end: string): number => {
  const startTime = parseTime(start);
  const endTime = parseTime(end);
  return ((endTime - startTime) / 24) * 100;
};
