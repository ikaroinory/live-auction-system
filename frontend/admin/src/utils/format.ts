export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  if (minutes > 0) {
    return `${minutes}分钟${secs}秒`;
  }
  return `${secs}秒`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN');
}
