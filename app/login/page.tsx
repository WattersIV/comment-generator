import { login, signup } from './actions';

export default function LoginPage() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<form className="bg-white p-6 rounded shadow-md w-full max-w-sm">
				<h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
				<div className="mb-4">
					<label htmlFor="email" className="block text-gray-700">
						Email:
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						className="mt-1 p-2 w-full border rounded"
					/>
				</div>
				<div className="mb-6">
					<label htmlFor="password" className="block text-gray-700">
						Password ;0:
					</label>
					<input
						id="password"
						name="password"
						type="text"
						required
						className="mt-1 p-2 w-full border rounded"
					/>
				</div>
				<div className="flex justify-between">
					<button
						formAction={login}
						className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
					>
						Log in
					</button>
					<button
						formAction={signup}
						className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
					>
						Sign up
					</button>
				</div>
			</form>
		</div>
	);
}
