'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ErrorPage() {
	return (
		<div className="h-full flex items-center justify-center p-4">
			<Card className="max-w-md w-full">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Something went wrong</CardTitle>
					<CardDescription>
						We encountered an unexpected error. Please try again or return to the home page.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex justify-center">
					<Link href="/">
						<Button>Return Home</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
