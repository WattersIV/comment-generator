/**
 * Environment variable validation utility
 * Ensures all required environment variables are set at startup
 */

const requiredEnvVars = [
	'NEXT_PUBLIC_SUPABASE_URL',
	'NEXT_PUBLIC_SUPABASE_ANON_KEY',
	'SUPABASE_SERVICE_ROLE_KEY'
];

export function validateEnvironmentVariables(): void {
	const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

	if (missingVars.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missingVars.join(', ')}\n` +
				'Please ensure all required variables are set in your .env.local file.'
		);
	}
}
