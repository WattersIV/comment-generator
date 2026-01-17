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

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 flex items-center justify-center p-4">
			{/* Background decorative elements */}
			<div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
			<div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
			<div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

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
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="••••••••"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="h-11 px-4 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
								/>
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

				{/* Footer Info */}
				<div className="mt-8 text-center text-xs text-slate-500">
					<p>Secure authentication powered by Supabase</p>
				</div>
			</div>

			{/* CSS for animations */}
			<style jsx>{`
				@keyframes blob {
					0%,
					100% {
						transform: translate(0, 0) scale(1);
					}
					33% {
						transform: translate(30px, -50px) scale(1.1);
					}
					66% {
						transform: translate(-20px, 20px) scale(0.9);
					}
				}

				.animate-blob {
					animation: blob 7s infinite;
				}

				.animation-delay-2000 {
					animation-delay: 2s;
				}

				.animation-delay-4000 {
					animation-delay: 4s;
				}
			`}</style>
		</div>
	);
}
