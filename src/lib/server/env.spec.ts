import { describe, it, expect } from 'vitest';
import { simklConfig, SimklEnvError } from './env';

describe('simklConfig', () => {
	it('returns values from env when all are set', () => {
		const config = simklConfig({
			SIMKL_CLIENT_ID: 'test-client-id',
			SIMKL_ACCESS_TOKEN: 'test-access-token',
			SIMKL_API_BASE: 'https://api.test.example'
		});
		expect(config).toEqual({
			clientId: 'test-client-id',
			accessToken: 'test-access-token',
			apiBase: 'https://api.test.example'
		});
	});

	it('defaults SIMKL_API_BASE when not provided', () => {
		const config = simklConfig({
			SIMKL_CLIENT_ID: 'test-client-id',
			SIMKL_ACCESS_TOKEN: 'test-access-token'
		});
		expect(config.apiBase).toBe('https://api.simkl.com');
	});

	it('throws a SimklEnvError when SIMKL_CLIENT_ID is missing', () => {
		expect(() =>
			simklConfig({
				SIMKL_ACCESS_TOKEN: 'test-access-token'
			})
		).toThrow(SimklEnvError);
		expect(() =>
			simklConfig({
				SIMKL_ACCESS_TOKEN: 'test-access-token'
			})
		).toThrow('Missing SIMKL_CLIENT_ID');
	});

	it('throws a SimklEnvError when SIMKL_ACCESS_TOKEN is missing', () => {
		expect(() =>
			simklConfig({
				SIMKL_CLIENT_ID: 'test-client-id'
			})
		).toThrow(SimklEnvError);
		expect(() =>
			simklConfig({
				SIMKL_CLIENT_ID: 'test-client-id'
			})
		).toThrow('Missing SIMKL_ACCESS_TOKEN');
	});
});
