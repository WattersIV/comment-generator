import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: "Scooter's Report Card Comment Generator"
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className} suppressHydrationWarning>
				<Header />
				<main className="h-[calc(100vh-64px)] overflow-x-hidden overflow-y-auto">{children}</main>
				<Toaster richColors position="bottom-right" />
			</body>
		</html>
	);
}
