import Heading from '@/components/heading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Inertia } from '@inertiajs/inertia'
import { Head, Link, usePage } from '@inertiajs/react'
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  Clock as ClockIcon,
  CreditCard,
  History,
  Info,
  Tag,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

const breadcrumbs: BreadcrumbItem[] = [{ title: 'My Bookings', href: '/bookings' }]

type Booking = {
  service_order_id: number
  order_status: string
  order_date: string
  order_type: string
  services: string
  total_amount: number
  payment_method?: string
}

export default function Bookings() {
  const pageProps = usePage().props as unknown as {
    bookings?: Booking[]
    selectedStatus?: string
    user?: { first_name?: string }
  }

  const bookings = pageProps.bookings ?? []
  const initialStatus = pageProps.selectedStatus ?? 'all'
  
  const [selectedStatus, setSelectedStatus] = useState(initialStatus)

  const filteredBookings = useMemo(() => {
    const list = selectedStatus === 'all' ? (pageProps.bookings ?? []) : (pageProps.bookings ?? []).filter((b) => b.order_status === selectedStatus)

    return [...list].sort((a, b) => {
      // Pending always on top
      if (a.order_status === 'pending' && b.order_status !== 'pending') {
        return -1
      }
      if (a.order_status !== 'pending' && b.order_status === 'pending') {
        return 1
      }

      // In progress second
      if (a.order_status === 'in_progress' && b.order_status !== 'in_progress') {
        return -1
      }
      if (a.order_status !== 'in_progress' && b.order_status === 'in_progress') {
        return 1
      }

      // Otherwise sort by date (newest first)
      return new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    })
  }, [pageProps.bookings, selectedStatus])

  // View Details modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [isCancelClosing, setIsCancelClosing] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)

  const openModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setModalOpen(true)
    setIsClosing(false)
  }

  const closeModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setSelectedBooking(null)
      setModalOpen(false)
      setIsClosing(false)
    }, 400)
  }

  const openCancelModal = (booking: Booking) => {
    setBookingToCancel(booking)
    setCancelModalOpen(true)
    setIsCancelClosing(false)
  }

  const closeCancelModal = () => {
    setIsCancelClosing(true)
    setTimeout(() => {
      setBookingToCancel(null)
      setCancelModalOpen(false)
      setIsCancelClosing(false)
    }, 400)
  }

  const confirmCancel = () => {
    if (!bookingToCancel) return

    Inertia.post(
      `/bookings/cancel/${bookingToCancel.service_order_id}`,
      {},
      {
        onSuccess: () => {
          toast.success('Booking cancelled successfully!')
          closeCancelModal()
          if (
            selectedBooking &&
            selectedBooking.service_order_id === bookingToCancel.service_order_id
          ) {
            closeModal()
          }
        },
        onError: () => {
          toast.error('Failed to cancel booking')
        },
      },
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: AlertCircle, variant: 'warning' as const, label: 'Pending Approval', color: 'text-amber-500', bg: 'bg-amber-500/10' }
      case 'in_progress':
        return { icon: ClockIcon, variant: 'info' as const, label: 'Service In Progress', color: 'text-blue-500', bg: 'bg-blue-500/10' }
      case 'completed':
        return { icon: CheckCircle, variant: 'success' as const, label: 'Completed', color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
      case 'cancelled':
        return { icon: X, variant: 'destructive' as const, label: 'Cancelled', color: 'text-rose-500', bg: 'bg-rose-500/10' }
      default:
        return { icon: ClockIcon, variant: 'secondary' as const, label: status.toUpperCase(), color: 'text-muted-foreground', bg: 'bg-muted/10' }
    }
  }

  const canCancel = (status: string) => !['in_progress', 'completed', 'cancelled'].includes(status)

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Bookings" />
      
      <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Heading
            title="My Bookings"
            description="Keep track of your vehicle's care history and upcoming sessions."
          />
          
          {/* Status Filter Control */}
          <div className="flex w-full overflow-x-auto rounded-2xl bg-secondary/30 p-1 md:w-auto">
            {(['all', 'pending', 'in_progress', 'completed', 'cancelled'] as const).map((status) => {
              const isActive = status === selectedStatus
              const displayLabel =
                status === 'all'
                  ? 'All'
                  : status === 'in_progress'
                  ? 'In Progress'
                  : status.charAt(0).toUpperCase() + status.slice(1)

              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`flex-shrink-0 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all md:px-6 md:py-2.5 md:text-sm ${
                    isActive
                      ? 'bg-highlight text-black shadow-lg shadow-highlight/20 scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {displayLabel}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bookings List Section */}
        <div className="custom-scrollbar min-h-[500px] flex-1 overflow-y-auto">
          {filteredBookings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredBookings.map((b, index) => {
                const config = getStatusConfig(b.order_status)
                const StatusIcon = config.icon
                
                return (
                  <div
                    key={b.service_order_id}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-sidebar-border/50 bg-background transition-all duration-300 hover:border-highlight/40 hover:shadow-2xl hover:shadow-highlight/5 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  >
                    {/* Status Accent Bar */}
                    <div className={`absolute left-0 top-0 h-1.5 w-full ${config.bg.replace('/10', '')} opacity-80`} />
                    
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex items-start justify-between">
                         <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${config.bg} ${config.color}`}>
                            <StatusIcon className="h-6 w-6" />
                         </div>
                         <Badge variant={config.variant} className="px-3 py-1 font-bold uppercase tracking-wider">
                           {config.label}
                         </Badge>
                      </div>

                      <div className="mb-6 flex-1">
                        <h4 className="mb-2 text-xl font-extrabold text-foreground leading-tight group-hover:text-highlight transition-colors">
                          {b.services || 'General Service'}
                        </h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5 font-medium">
                            <CalendarDays className="h-4 w-4 text-highlight" />
                            {new Date(b.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <Clock className="h-4 w-4 text-highlight" />
                            {new Date(b.order_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end justify-between border-t border-muted/20 pt-5">
                        <div className="space-y-1">
                           <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Estimated Total</p>
                           <p className="text-2xl font-black text-foreground">₱{b.total_amount.toLocaleString()}</p>
                        </div>
                        
                        <div className="flex gap-2">
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => openModal(b)}
                             className="h-10 rounded-xl px-4 font-bold hover:bg-secondary/50"
                           >
                              Details
                           </Button>
                           {canCancel(b.order_status) && (
                             <Button
                               size="sm"
                               variant="destructive"
                               onClick={() => openCancelModal(b)}
                               className="h-10 rounded-xl px-4 font-bold"
                             >
                               Cancel
                             </Button>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 rounded-full bg-secondary/30 p-8 text-muted-foreground/50">
                <History className="h-16 w-16" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">No bookings found</h3>
              <p className="mb-8 max-w-md text-muted-foreground">
                {selectedStatus === 'all' 
                  ? "You haven't made any bookings yet. Ready to give your car some love?"
                  : `You don't have any bookings with status "${selectedStatus}".`}
              </p>
              <Link href="/services">
                <Button className="h-12 rounded-2xl bg-highlight px-8 font-black text-black transition-transform hover:scale-105 active:scale-95">
                  Book A Service Now
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* View Details Modal */}
        {modalOpen && selectedBooking && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isClosing ? 'opacity-0' : 'bg-black/60 backdrop-blur-md'}`}>
            <div className={`relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-sidebar-border bg-background p-0 shadow-2xl transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
              
              {/* Modal Header/Glow */}
              <div className={`absolute left-0 top-0 h-1 w-full ${getStatusConfig(selectedBooking.order_status).bg.replace('/10', '')}`} />
              
              <div className="p-8 md:p-10">
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute right-6 top-6 rounded-full bg-secondary/50 p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="mb-8 flex items-center gap-5">
                   <div className={`flex h-16 w-16 items-center justify-center rounded-3xl ${getStatusConfig(selectedBooking.order_status).bg} ${getStatusConfig(selectedBooking.order_status).color}`}>
                      {(() => {
                        const { icon: Icon } = getStatusConfig(selectedBooking.order_status)
                        return <Icon className="h-8 w-8" />
                      })()}
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-foreground">Booking Details</h3>
                      <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">ID #{selectedBooking.service_order_id.toString().padStart(5, '0')}</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                            <Tag className="h-3.5 w-3.5" /> Services
                         </div>
                         <p className="text-sm font-bold text-foreground leading-snug">{selectedBooking.services}</p>
                      </div>
                      <div className="space-y-1.5">
                         <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                            <Calendar className="h-3.5 w-3.5" /> Date & Time
                         </div>
                         <p className="text-sm font-bold text-foreground">{new Date(selectedBooking.order_date).toLocaleString()}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6 pb-6 border-b border-muted/20">
                      <div className="space-y-1.5">
                         <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                            <Info className="h-3.5 w-3.5" /> Order Type
                         </div>
                         <p className="text-sm font-bold text-foreground">{selectedBooking.order_type === 'W' ? 'Walk-in' : 'Reservation'}</p>
                      </div>
                      <div className="space-y-1.5">
                         <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                            <CreditCard className="h-3.5 w-3.5" /> Payment
                         </div>
                         <p className="text-sm font-bold text-foreground">{selectedBooking.payment_method || 'Unspecified'}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between rounded-3xl bg-secondary/30 p-6">
                      <div className="space-y-1">
                         <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Total Amount</p>
                         <p className="text-3xl font-black text-highlight">₱{selectedBooking.total_amount.toLocaleString()}</p>
                      </div>
                      <Badge variant={getStatusConfig(selectedBooking.order_status).variant} className="px-4 py-1.5 text-xs font-black uppercase tracking-widest">
                         {getStatusConfig(selectedBooking.order_status).label}
                      </Badge>
                   </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <Button
                    variant="secondary"
                    onClick={closeModal}
                    className="h-12 flex-1 rounded-2xl font-black transition-transform active:scale-95"
                  >
                    Close
                  </Button>
                  {canCancel(selectedBooking.order_status) && (
                    <Button
                      variant="destructive"
                      className="h-12 flex-1 rounded-2xl font-black transition-transform active:scale-95"
                      onClick={() => openCancelModal(selectedBooking)}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {cancelModalOpen && bookingToCancel && (
          <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${isCancelClosing ? 'opacity-0' : 'bg-black/80 backdrop-blur-xl'}`}>
            <div className={`relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-background p-8 text-center shadow-2xl transition-all duration-300 ${isCancelClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-500">
                <AlertCircle className="h-10 w-10" />
              </div>
              
              <h3 className="mb-2 text-2xl font-black text-foreground">Cancel Booking?</h3>
              <p className="mb-8 text-muted-foreground">
                This will remove your reservation for <span className="font-bold text-foreground">{bookingToCancel.services}</span>. This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={closeCancelModal}
                  className="h-12 flex-1 rounded-2xl font-black transition-transform active:scale-95"
                >
                  No, Keep it
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmCancel}
                  className="h-12 flex-1 rounded-2xl font-black shadow-lg shadow-rose-500/20 transition-transform active:scale-95 hover:bg-rose-600"
                >
                  Yes, Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
