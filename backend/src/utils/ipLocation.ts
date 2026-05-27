import { Request } from 'express';

function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }
  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0];
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp;
  }
  return req.ip || '127.0.0.1';
}

function getLocationByIp(ip: string): string {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return '未知';
  }

  const ipSegments = ip.split('.');
  const lastSegment = parseInt(ipSegments[ipSegments.length - 1] || '0', 10);

  const locations = [
    '中国·北京·北京',
    '中国·上海·上海',
    '中国·广东·深圳',
    '中国·广东·广州',
    '中国·浙江·杭州',
    '中国·江苏·南京',
    '中国·四川·成都',
    '中国·湖北·武汉',
    '中国·陕西·西安',
    '中国·山东·青岛',
  ];

  const index = lastSegment % locations.length;
  return locations[index];
}

export function getLocationFromRequest(req: Request): string {
  const ip = getClientIp(req);
  return getLocationByIp(ip);
}
