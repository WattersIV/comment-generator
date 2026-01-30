'use client';

import { login, signup } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function LoginPage() {
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="h-full w-full bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
			{/* Background decorative elements */}
			<div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
			<div className="absolute top-0 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
			<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

			<div className="w-full max-w-md relative z-10">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
						Comment Generator
					</h1>
					<p className="text-slate-600 text-sm">Streamline your report card feedback</p>
				</div>

				{/* Main Card */}
				<Card className="shadow-2xl border-0">
					<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
						<CardTitle className="text-2xl">
							{isSignUp ? 'Create Account' : 'Welcome Back'}
						</CardTitle>
						<CardDescription>
							{isSignUp
								? 'Sign up to get started with comment generation'
								: 'Sign in to your account to continue'}
						</CardDescription>
					</CardHeader>

					<CardContent className="pt-8">
						<form className="space-y-6">
							{/* Email Input */}
							<div className="space-y-3">
								<Label htmlFor="email" className="text-slate-700 font-semibold">
									Email Address
								</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="you@example.com"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="h-11 px-4 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>

							{/* Password Input */}
							<div className="space-y-3">
								<Label htmlFor="password" className="text-slate-700 font-semibold">
									Password
								</Label>
								<div className="relative">
									<Input
										id="password"
										name="password"
										type={showPassword ? 'text' : 'password'}
										placeholder="••••••••"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="h-11 px-4 pr-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
									/>
									<button
										type="button"
										onClick={() => setShowPassword((s) => !s)}
										aria-label={showPassword ? 'Hide password' : 'Show password'}
										className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
									>
										{showPassword ? (
											// eye-off icon
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
												<path d="M10.88 10.88C11.55 10.2 12.71 10 12 10c2.21 0 4 1.79 4 4 0 .71-.2 1.87-.88 2.88" />
												<path d="M21.86 15.64a9.97 9.97 0 0 0-3.54-3.54" />
												<path d="M2.14 8.36a10 10 0 0 0 3.64 3.64" />
												<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7" />
												<line x1="2" y1="2" x2="22" y2="22" />
											</svg>
										) : (
											// eye icon
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M1.05 12C2.73 7.89 7 4 12 4c5 0 9.27 3.89 10.95 8-1.68 4.11-6 8-10.95 8-5 0-9.27-3.89-10.95-8z" />
												<circle cx="12" cy="12" r="3" />
											</svg>
										)}
									</button>
								</div>
							</div>

							{/* Buttons */}
							<div className="flex gap-3 pt-4">
								<Button
									type="submit"
									formAction={login}
									disabled={!email || !password}
									className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
								>
									{isSignUp ? 'Create Account' : 'Sign In'}
								</Button>
								<Button
									type="submit"
									formAction={signup}
									disabled={!email || !password}
									variant="outline"
									className="flex-1 h-11 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold transition-all duration-200"
								>
									{isSignUp ? 'Sign In' : 'Sign Up'}
								</Button>
							</div>
						</form>

						{/* Toggle Button */}
						<div className="mt-6 text-center text-sm">
							<span className="text-slate-600">
								{isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
								<button
									type="button"
									onClick={() => setIsSignUp(!isSignUp)}
									className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
								>
									{isSignUp ? 'Sign In' : 'Sign Up'}
								</button>
							</span>
						</div>
					</CardContent>
				</Card>
			</div>

		</div>
	);
}
