export interface JwtPayload {
	sub: string;
	email: string;
	roles: string[];
	permissions: string[];
	iat?: number;
	exp?: number;
}

export interface AuthenticatedUser {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	roles: Array<{
		id: string;
		name: string;
		permissions: Array<{
			id: string;
			name: string;
			resource: string;
			action: string;
		}>;
	}>;
	isActive: boolean;
}

export interface LoginResponse {
	user: AuthenticatedUser;
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

export interface RefreshTokenResponse {
	accessToken: string;
	expiresIn: number;
}
