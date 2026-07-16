export class SimklEnvError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SimklEnvError';
	}
}

export interface SimklConfig {
	clientId: string;
	accessToken: string;
	apiBase: string;
}

export function simklConfig(env: Record<string, string | undefined> = process.env): SimklConfig {
	const clientId = env.SIMKL_CLIENT_ID;
	const accessToken = env.SIMKL_ACCESS_TOKEN;

	if (!clientId) {
		throw new SimklEnvError('Missing SIMKL_CLIENT_ID');
	}
	if (!accessToken) {
		throw new SimklEnvError('Missing SIMKL_ACCESS_TOKEN');
	}

	return {
		clientId,
		accessToken,
		apiBase: env.SIMKL_API_BASE ?? 'https://api.simkl.com'
	};
}
