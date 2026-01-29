import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DeviceInfo } from '../interfaces/device-infos.interface';
import { parseDeviceInfo } from '../utils/parse-device-info.util';

export const GetDeviceInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): DeviceInfo => {
    // ✅ Correct signature
    const request = ctx.switchToHttp().getRequest();
    const userAgent = request.headers['user-agent'];

    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      (request.headers['cf-connecting-ip'] as string) ||
      request.ip ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress;

    const finalIp = ip || '0.0.0.0';

    return parseDeviceInfo(userAgent, finalIp);
  },
);
