import { serialize, parse } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

export function setTokenCookie(
  name: string,
  maxAge: number = 60 * 60 * 8, // 8 hours
  res: NextApiResponse,
  token: string,
) {
  const cookie = serialize(name, token, {
    maxAge,
    expires: new Date(Date.now() + maxAge * 1000),
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'none',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function removeTokenCookie(name: string, res: NextApiResponse) {
  const cookie = serialize(name, '', {
    maxAge: -1,
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function parseCookies(req: NextApiRequest) {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies;

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie;
  return parse(cookie || '');
}

export function getTokenCookie(name: string, req: NextApiRequest) {
  const cookies = parseCookies(req);
  return cookies[name];
}
