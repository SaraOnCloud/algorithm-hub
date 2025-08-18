import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUser {
  sub: number;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export const CurrentUser = createParamDecorator<keyof JwtUser | undefined>(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtUser | undefined = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);

