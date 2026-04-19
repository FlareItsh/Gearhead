import DashboardBookingConfirmation from '@/components/DashboardBookingConfirmation'
import HeadingSmall from '@/components/heading-small'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { clearPendingBooking, getPendingBooking, type PendingBooking } from '@/lib/pendingBooking'
import type { SharedData } from '@/types'
import { Link, usePage } from '@inertiajs/react'
import axios from 'axios'
import { 
  CalendarDays, 
  HandCoins, 
  Star, 
  Wrench, 
  ChevronRight,
  History,
  Timer,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { route } from 'ziggy-js'

const CustomerDashboard: React.FC = () => {
  const pageProps = usePage().props as unknown as SharedData & {
    paymentsCount?: number
    totalSpent?: number
  }
  const { auth } = pageProps
  const firstName = auth?.user?.first_name ?? auth?.user?.name ?? 'there'
  const paymentsCount = pageProps.paymentsCount ?? 0
  const totalSpent = pageProps.totalSpent ?? 0

  // Loyalty logic: 9 visits = reward
  const loyaltyProgress = paymentsCount % 9
  const loyaltyTarget = 9
  const progressPercentage = (loyaltyProgress / loyaltyTarget) * 100

  const [upcomingBookings, setUpcomingBookings] = useState<
    Array<{
      service_order_id: string | number
      service_names: string
      order_date: string
      order_type: string
      total_amount: string | number
      status: string
    }>
  >([])
  const [payments, setPayments] = useState<
    Array<{
      payment_id: string | number
      services: string
      date: string
      amount: string | number
      payment_status: string
    }>
  >([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    const fetchData = () => {
      axios.get(route('payments.user'))
        .then((res) => setPayments(res.data))
        .catch((err) => console.error('Payments error:', err))

      axios.get(route('bookings.upcoming'))
        .then((res) => setUpcomingBookings(res.data))
        .catch((err) => console.error('Upcoming bookings error:', err))
    }

    const pending = getPendingBooking()
    if (pending) {
      setPendingBooking(pending)
      setShowConfirmation(true)
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const recentPayments = [...payments]
    .sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime())
    .slice(0, 5)

  const handleConfirmBooking = async () => {
    if (!pendingBooking || isConfirming) return
    setIsConfirming(true)
    try {
      const timeString = pendingBooking.time
      let hour = 0, minute = 0
      const timeMatch = timeString.match(/(\d+):(\d+)/)
      if (timeMatch) {
        hour = parseInt(timeMatch[1]) || 0
        minute = parseInt(timeMatch[2]) || 0
      }
      if (timeString.includes('PM') && hour < 12) hour += 12
      else if (timeString.includes('AM') && hour === 12) hour = 0

      const hours = String(hour).padStart(2, '0')
      const minutes = String(minute).padStart(2, '0')
      const orderDate = `${pendingBooking.date} ${hours}:${minutes}`

      await axios.post('/api/bookings/book', {
        order_date: orderDate,
        variant_ids: pendingBooking.services.map((s) => s.selectedVariant.service_variant),
      })

      clearPendingBooking()
      setPendingBooking(null)
      setShowConfirmation(false)
      toast.success('Booking confirmed successfully!')
      
      const res = await axios.get(route('bookings.upcoming'))
      setUpcomingBookings(res.data)
    } catch (error) {
      console.error('Failed to confirm booking:', error)
      toast.error('Failed to confirm booking. Please try again.')
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <>
      <DashboardBookingConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        booking={pendingBooking}
        isLoading={isConfirming}
        onConfirm={handleConfirmBooking}
      />

      <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4 md:p-6 lg:p-8 animate-in fade-in duration-700">
        
        {/* --- Hero Section --- */}
        <section className="relative overflow-hidden rounded-3xl bg-secondary/30 shadow-2xl">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/dashboard-hero.png" 
              alt="Premium Car Care" 
              className="h-full w-full object-cover opacity-60 dark:opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>
          
          <div className="relative z-10 flex flex-col gap-4 px-6 py-8 md:max-w-3xl md:px-10 md:py-12">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl text-foreground">
                Welcome back, <span className="text-highlight">{firstName}</span>
              </h1>
              <p className="max-w-md text-base text-muted-foreground md:text-lg">
                Your vehicle deserves the best. Ready for your next shine?
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/services">
                <Button className="h-11 bg-highlight px-6 text-base font-bold text-black hover:scale-105 transition-transform">
                  <CalendarDays className="mr-2 h-4 w-4" /> Book Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* --- Stats and Loyalty Grid --- */}
        <div className="grid gap-6 md:grid-cols-12">
          
          {/* Loyalty Progress Card - Takes more space */}
          <div className="relative col-span-12 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md md:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" /> 
                  Loyalty Rewards
                </h4>
                <p className="text-sm text-muted-foreground">Every 9th wash is on us!</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-highlight">{loyaltyProgress}</span>
                <span className="text-lg font-medium text-muted-foreground"> / {loyaltyTarget}</span>
              </div>
            </div>

            <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
              <div 
                className="h-full bg-highlight transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="mt-6 grid grid-cols-9 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex h-8 items-center justify-center rounded-lg border transition-all ${
                    i < loyaltyProgress 
                      ? 'border-highlight bg-highlight/20 text-highlight shadow-sm shadow-highlight/20' 
                      : 'border-dashed border-muted-foreground/30 text-muted-foreground/30'
                  }`}
                >
                  <Wrench className={`h-4 w-4 ${i < loyaltyProgress ? 'animate-pulse' : ''}`} />
                </div>
              ))}
            </div>
            
            <p className="mt-4 text-center text-sm font-medium text-muted-foreground">
              {loyaltyTarget - loyaltyProgress} more bookings until your next reward!
            </p>
          </div>

          {/* Quick Stats Column */}
          <div className="col-span-12 flex flex-col gap-4 md:col-span-4">
             <div className="group flex flex-1 items-center gap-4 rounded-2xl border bg-card p-6 transition-all hover:border-highlight/50 hover:shadow-sm">
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground leading-none mb-1">Total Services</p>
                  <h3 className="text-2xl font-bold text-foreground">{paymentsCount}</h3>
                </div>
             </div>
             
             <div className="group flex flex-1 items-center gap-4 rounded-2xl border bg-card p-6 transition-all hover:border-highlight/50 hover:shadow-sm">
                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <HandCoins className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground leading-none mb-1">Total Savings</p>
                  <h3 className="text-2xl font-bold text-foreground">₱{totalSpent.toLocaleString()}</h3>
                </div>
             </div>
          </div>
        </div>

        {/* --- Desktop Two-Column Activity --- */}
        <div className="grid gap-8 lg:grid-cols-5">
          
          {/* Upcoming Bookings - Main Column */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <HeadingSmall title="Upcoming Appointments" description="Your upcoming car care sessions" />
              <Link href="/bookings">
                <Button variant="ghost" size="sm" className="text-highlight">
                  Manage <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div 
                    key={String(booking.service_order_id)} 
                    className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:border-highlight/40 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                         <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-highlight/10 text-highlight">
                            <Timer className="h-6 w-6" />
                         </div>
                         <div>
                            <h5 className="text-lg font-bold text-foreground">{booking.service_names || 'Carwash Service'}</h5>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {new Date(String(booking.order_date)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                         </div>
                      </div>
                      <Badge variant={
                          booking.status === 'pending' ? 'warning' : 
                          booking.status === 'in_progress' ? 'info' : 
                          booking.status === 'completed' ? 'success' : 'destructive'
                        }>
                        {booking.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Estimate:</span> 
                        <span className="ml-1 font-bold">₱{Number(booking.total_amount).toLocaleString()}</span>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                        {booking.order_type === 'R' ? 'Reservation' : 'Walk-in'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-12 text-center">
                  <div className="mb-3 rounded-full bg-secondary p-4">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground">No upcoming bookings</p>
                  <Link href="/services" className="mt-2 text-highlight hover:underline font-bold">Book a service now</Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent History - Sidebar Column */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <HeadingSmall title="Recent Activity" description="Completed services" />
              <History className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="space-y-3">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div 
                    key={String(payment.payment_id)} 
                    className="flex flex-col rounded-2xl border bg-secondary/15 p-4 transition-all hover:bg-secondary/25"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h6 className="text-sm font-bold text-foreground">{payment.services || 'General Service'}</h6>
                        <p className="text-xs text-muted-foreground">
                          {new Date(String(payment.date)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between border-t border-muted/20 pt-3">
                       <span className="text-xs font-medium text-muted-foreground">Status: Completed</span>
                       <span className="text-sm font-bold text-foreground">₱{Number(payment.amount).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">No recent activity found.</p>
              )}
              
              {recentPayments.length > 0 && (
                <Link href="/bookings?status=completed" className="group mt-4 flex items-center justify-center gap-1 text-sm font-bold text-muted-foreground hover:text-highlight transition-colors">
                  View full history <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default CustomerDashboard
