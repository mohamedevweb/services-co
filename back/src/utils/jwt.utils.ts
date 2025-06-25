import { decode } from 'hono/jwt';

export function getUserId(token: string): string {
    const tokenDecode = decode(token.replace("Bearer ", ""));
    return tokenDecode.payload.id as string;
}

export function getUserRole(token: string): string {
    const tokenDecode = decode(token.replace("Bearer ", ""));
    return tokenDecode.payload.role as string;
}

export function getUserInfo(token: string) {
    const tokenDecode = decode(token.replace("Bearer ", ""));
    return {
        id: tokenDecode.payload.id as string,
        role: tokenDecode.payload.role as string
    };
} 