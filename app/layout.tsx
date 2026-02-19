import './globals.css'
import Navbar from './components/Navbar'

export const metadata = { title: 'Haircut at Home', description: 'Luxury Grooming Delivered' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#F8F9FA] text-[#1A1A1A] font-sans antialiased">
        {/* The Navbar will decide whether to show itself or not */}
        <Navbar />
        {children}
      </body>
    </html>
  )
}