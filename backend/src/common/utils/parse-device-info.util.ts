import { UAParser } from 'ua-parser-js';
import * as geoip from 'geoip-lite';
import { DeviceInfo } from '../interfaces/device-infos.interface';
import { mapLocationToVietnamese } from './location-mapper.util';

export function parseDeviceInfo(userAgent: string, ip: string): DeviceInfo {
  const result = UAParser(userAgent);

  // Clean IP (remove potential ::ffff: prefix for IPv4-mapped IPv6)
  const cleanIp = ip?.replace('::ffff:', '') || '';

  // Check if IP is localhost/private network
  const isLocalhost =
    !cleanIp ||
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp === '0.0.0.0' ||
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('192.168.') ||
    // Regex check for range 172.16.x.x - 172.31.x.x
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanIp) ||
    cleanIp.startsWith('fc00:') || // IPv6 Unique Local
    cleanIp.startsWith('fe80:'); // IPv6 Link Local

  // Get location from IP using geoip-lite
  let location: string | null = null;
  if (isLocalhost) {
    // Set location to "Mạng cục bộ" for localhost/loopback addresses
    location = 'Mạng cục bộ';
  } else {
    const geo = geoip.lookup(cleanIp);
    if (geo && geo.country) {
      // Format: "City, Country" or just "Country" if city is unavailable
      const rawLocation = geo.city ? `${geo.city}, ${geo.country}` : geo.country;
      // Map to Vietnamese names
      location = mapLocationToVietnamese(rawLocation);
    }
  }

  // Auto-generate device name from vendor + model (if available)
  let deviceName: string | null = null;
  if (result.device.vendor || result.device.model) {
    const vendor = result.device.vendor || '';
    const model = result.device.model || '';
    deviceName = `${vendor} ${model}`.trim() || null;
  }

  if (!userAgent) {
    return {
      browser: null,
      os: null,
      devicetype: null,
      deviceName: null,
      ip: ip,
      location: location ?? null,
    };
  }

  return {
    browser: `${result.browser.name} ${result.browser.version}`,
    os: `${result.os.name} ${result.os.version}`,
    devicetype: result.device.type || null,
    deviceName: deviceName,
    ip: ip,
    location: location,
  };
}
