import './globals.css';

export const metadata = {
  title: 'Internet Quality Dashboard (demo data)',
  description: 'Demo analytics dashboard built with Next.js. All data is fictional.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
