import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import GuestLayout from '@/layouts/guest-layout'
import { savePendingBooking, type PendingBooking } from '@/lib/pendingBooking'
import { register } from '@/routes'
import { Head, router, usePage } from '@inertiajs/react'
import axios from 'axios'
import { AlertCircle, CheckCircle2, ChevronDown, Circle, Clock, Star, X, Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const breadcrumbs = [{ title: 'Services', href: '/services' }]

interface ServiceVariant {
  service_variant: number
  size: string
  price: number
  estimated_duration: number
  enabled: boolean
}

interface Service {
  service_id: number
  service_name: string
  description: string
  category: string
  status: string
  variants: ServiceVariant[]
}

interface SelectedService extends Service {
  selectedVariant: ServiceVariant
}

interface User {
  user_id: number
  name: string
  email: string
  role: string
}

export default function Services() {
  const pageProps = usePage().props as unknown as {
    services?: Service[]
    categories?: string[]
    selectedCategory?: string
    auth?: { user: User | null }
  }

  const auth = pageProps.auth ?? { user: null }
  const services = pageProps.services ?? []
  const categories = pageProps.categories ?? []

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClosingCheckout, setIsClosingCheckout] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [isBooking, setIsBooking] = useState(false)
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const closeCheckoutModal = () => {
    setIsClosingCheckout(true)
    setTimeout(() => {
      setIsModalOpen(false)
      setIsClosingCheckout(false)
    }, 400)
  }

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning'>('success')
  const [modalMessage, setModalMessage] = useState('')

  // Variant Selection Modal State
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<Service | null>(null)

  // Load/save cart
  useEffect(() => {
    const saved = localStorage.getItem('selectedServices')
    if (saved) {
      try {
        setSelectedServices(JSON.parse(saved))
      } catch {
        localStorage.removeItem('selectedServices')
      }
    }
  }, [])

  // Handle dropdown position
  useEffect(() => {
    if (isTimeDropdownOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      // If less than 300px space below and more space above, position to top
      if (spaceBelow < 300 && spaceAbove > 300) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
  }, [isTimeDropdownOpen])

  // Handle service pre-selection from query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const serviceName = params.get('service')

    if (serviceName && services.length > 0) {
      const matchedService = services.find(
        (s) => s.service_name.toLowerCase() === serviceName.toLowerCase(),
      )
      if (matchedService) {
        setSelectedServiceForModal(matchedService)
        setIsVariantModalOpen(true)

        // Clear the param from URL without refreshing
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [services])

  useEffect(() => {
    if (selectedServices.length > 0) {
      localStorage.setItem('selectedServices', JSON.stringify(selectedServices))
    } else {
      localStorage.removeItem('selectedServices')
    }
  }, [selectedServices])

  const toggleService = (service: Service, variant: ServiceVariant) => {
    setSelectedServices((prev) => {
      const exists = prev.some(
        (s) =>
          s.service_id === service.service_id &&
          s.selectedVariant.service_variant === variant.service_variant,
      )
      if (exists) {
        return prev.filter(
          (s) =>
            !(
              s.service_id === service.service_id &&
              s.selectedVariant.service_variant === variant.service_variant
            ),
        )
      }
      return [...prev, { ...service, selectedVariant: variant }]
    })
  }

  const removeService = (item: SelectedService) => {
    setSelectedServices((prev) =>
      prev.filter(
        (s) =>
          !(
            s.service_id === item.service_id &&
            s.selectedVariant.service_variant === item.selectedVariant.service_variant
          ),
      ),
    )
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.selectedVariant.price), 0)

  const isSelected = (serviceId: number, variantId: number) =>
    selectedServices.some(
      (s) => s.service_id === serviceId && s.selectedVariant.service_variant === variantId,
    )

  // Sort services by category and size
  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      // Size order mapping: Small < Medium < Large < X-Large < XX-Large
      // We don't need to sort by size anymore since we are grouping variants,
      // but we can sort the services themselves if needed.
      // For now, let's just sort by category then name.

      // First sort by category alphabetically
      const categoryCompare = (a.category || '').localeCompare(b.category || '')
      if (categoryCompare !== 0) {
        return categoryCompare
      }

      return a.service_name.localeCompare(b.service_name)
    })
  }, [services])

  // Filter services by selected category
  const filteredServices = useMemo(() => {
    if (selectedCategory === 'All') {
      return sortedServices
    }
    return sortedServices.filter((s) => s.category === selectedCategory)
  }, [sortedServices, selectedCategory])

  // ─────────────────────────────────────────────────────────────
  // SMART TIME SLOT GENERATOR (Current time + 1 hour)
  // ─────────────────────────────────────────────
  const availableTimeSlots = useMemo(() => {
    const now = new Date()
    const isToday = selectedDate === now.toISOString().split('T')[0]

    const slots: string[] = []
    let hour = 6
    let minute = 30 // Start at 6:30 AM

    while (hour < 22 || (hour === 22 && minute === 0)) {
      const isPM = hour >= 12
      const displayHour = hour % 12 === 0 ? 12 : hour % 12
      const period = isPM ? 'PM' : 'AM'
      const timeStr = `${displayHour}:${minute === 0 ? '00' : '30'} ${period}`

      // Check if this slot is in the future if it's today
      let shouldAdd = true
      if (isToday) {
        const slotTime = new Date(now)
        slotTime.setHours(hour, minute, 0, 0)
        if (slotTime <= now) {
          shouldAdd = false
        }
      }

      if (shouldAdd) {
        slots.push(timeStr)
      }

      // Next 30-min
      minute += 30
      if (minute >= 60) {
        minute = 0
        hour += 1
      }
    }

    return slots
  }, [selectedDate])

  const handleBook = async () => {
    if (!selectedTime || selectedServices.length === 0) {
      setModalType('warning')
      setModalMessage('Please select a time and at least one service')
      setShowModal(true)
      return
    }

    // Redirect to registration if not logged in
    if (!auth.user) {
      handleGuestBooking()
      return
    }

    setIsBooking(true)
    try {
      // Get variant_ids from selectedServices
      const variantIds = selectedServices.map((s) => s.selectedVariant.service_variant)

      console.log('Selected services count:', selectedServices.length)
      console.log('Variant IDs to send:', variantIds)

      if (variantIds.length === 0) {
        setModalType('error')
        setModalMessage('Could not find service IDs. Please try again.')
        setShowModal(true)
        setIsBooking(false)
        return
      }

      if (variantIds.length !== selectedServices.length) {
        console.warn(
          `Only ${variantIds.length} out of ${selectedServices.length} services were found`,
        )
      }

      // Convert time to proper format with selected date
      // selectedTime is like "3:00 PM"
      const [timeStr, period] = selectedTime.split(' ')
      const [hourStr, minuteStr] = timeStr.split(':')
      let hour = parseInt(hourStr)
      const minute = parseInt(minuteStr)

      if (period === 'PM' && hour !== 12) {
        hour += 12
      } else if (period === 'AM' && hour === 12) {
        hour = 0
      }

      // Format as YYYY-MM-DD HH:MM
      const hours = String(hour).padStart(2, '0')
      const minutes = String(minute).padStart(2, '0')
      const orderDate = `${selectedDate} ${hours}:${minutes}`

      console.log('Sending booking with order_date:', orderDate)
      console.log('Sending booking with variant_ids:', variantIds)

      const bookingData: Record<string, unknown> = {
        order_date: orderDate,
        variant_ids: variantIds,
      }

      const response = await axios.post('/api/bookings/book', bookingData)

      // Success - clear selections and close modal
      setSelectedServices([])
      localStorage.removeItem('selectedServices')
      setIsModalOpen(false)
      setSelectedTime('')

      setModalType('success')
      setModalMessage('Booking confirmed! Your reservation has been created.')
      setShowModal(true)
      toast.success('Booking confirmed!')
      console.log('Booking response:', response.data)
    } catch (error) {
      console.error('Booking error:', error)
      if (axios.isAxiosError(error) && error.response) {
        setModalType('error')
        setModalMessage(`Booking failed: ${error.response.data?.message || 'Unknown error'}`)
        setShowModal(true)
        toast.error('Booking failed')
      } else {
        setModalType('error')
        setModalMessage('Booking failed. Please try again.')
        setShowModal(true)
        toast.error('Booking failed')
      }
    } finally {
      setIsBooking(false)
    }
  }

  const handleGuestBooking = (timeOverride?: string) => {
    const timeToUse = timeOverride || selectedTime

    // Create pending booking object - map services to the required interface
    const pending: PendingBooking = {
      services: selectedServices.map((s) => ({
        service_name: s.service_name,
        selectedVariant: {
          service_variant: s.selectedVariant.service_variant,
          size: s.selectedVariant.size,
          price: Number(s.selectedVariant.price),
          estimated_duration: s.selectedVariant.estimated_duration,
        },
      })),
      date: selectedDate,
      time: timeToUse,
      guestInfo: null, // No guest info for direct register flow
      totalPrice,
    }

    // Save to localStorage
    savePendingBooking(pending)

    // Close the services modal and redirect to register
    setIsModalOpen(false)
    router.visit(register())
  }

  const LayoutComponent = auth.user ? AppLayout : GuestLayout
  const layoutProps = auth.user ? { breadcrumbs } : {}

  return (
    <LayoutComponent {...layoutProps}>
      <Head title="Services" />

      <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4 pb-32 duration-700 animate-in fade-in slide-in-from-bottom-4 md:p-6 md:pb-32 lg:p-8 lg:pb-32">
        {/* --- Unified Hero Section --- */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-muted/20 shadow-xl transition-all duration-700">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/hero-bg.jpg"
              alt="Premium Car Care"
              className="h-full w-full object-cover opacity-20 mix-blend-overlay"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col gap-4 px-8 py-10 md:max-w-3xl md:px-12 md:py-14">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
                Our <span className="text-highlight italic">Services</span>
              </h1>
              <p className="text-sm font-medium text-muted-foreground/80 md:text-base">
                Select the perfect treatment for your vehicle. Premium care, professional results.
              </p>
            </div>
          </div>
        </section>

        {/* --- Category & Filter Section --- */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black tracking-widest text-muted-foreground/60 uppercase">
                Choose Category
              </h2>
              <div className="mx-4 h-px flex-1 bg-border/20" />
            </div>
            <div className="custom-scrollbar flex w-full gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`rounded-full px-6 py-2.5 text-xs font-black tracking-widest whitespace-nowrap uppercase transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-highlight text-black shadow-md shadow-highlight/10'
                    : 'border border-border/40 bg-white text-muted-foreground hover:border-highlight/40 dark:bg-card'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-6 py-2.5 text-xs font-black tracking-widest whitespace-nowrap uppercase transition-all ${
                    selectedCategory === cat
                      ? 'bg-highlight text-black shadow-md shadow-highlight/10'
                      : 'border border-border/40 bg-white text-muted-foreground hover:border-highlight/40 dark:bg-card'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* --- Services Grid --- */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.length > 0 ? (
              filteredServices.map((s) => (
                <div
                  key={s.service_id}
                  className="group flex flex-col justify-between rounded-3xl border border-border/40 bg-white p-6 transition-all hover:-translate-y-1 hover:border-highlight/40 hover:shadow-xl dark:bg-card"
                >
                  <div className="space-y-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-highlight/10 text-highlight">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-foreground uppercase">
                        {s.service_name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs font-medium text-muted-foreground/70">
                        {s.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between border-t border-border/10 pt-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/60">
                        <Clock className="h-3.5 w-3.5 text-highlight" />
                        <span>
                          {s.variants.length > 0
                            ? `${Math.min(...s.variants.map((v) => v.estimated_duration))}m+`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold tracking-wider text-muted-foreground/40 uppercase">
                          From
                        </p>
                        <p className="text-lg font-black tracking-tighter text-foreground">
                          {s.variants.length > 0
                            ? `₱${Math.min(...s.variants.map((v) => Number(v.price))).toLocaleString()}`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="highlight"
                      className="h-10 w-full rounded-xl text-xs font-black tracking-widest uppercase"
                      onClick={() => {
                        setSelectedServiceForModal(s)
                        setIsVariantModalOpen(true)
                      }}
                    >
                      View Options
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/40 bg-muted/5 py-20">
                <AlertCircle className="mb-4 h-10 w-10 text-muted-foreground/20" />
                <p className="font-bold text-muted-foreground">No services found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Unified Floating Footer --- */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-[100] w-full max-w-md -translate-x-1/2 px-4">
          <div className="flex items-center justify-between rounded-2xl border border-border bg-white p-3 shadow-2xl dark:bg-card">
            <div className="flex items-center gap-3 pl-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-highlight text-sm font-black text-black">
                {selectedServices.length}
              </div>
              <div className="leading-none">
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Total Estimate
                </p>
                <p className="text-lg font-black tracking-tighter text-foreground">
                  ₱{totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
            <Button
              className="h-11 rounded-xl bg-black px-6 text-xs font-black tracking-widest text-white uppercase hover:bg-black/90 dark:bg-highlight dark:text-black"
              onClick={() => setIsModalOpen(true)}
            >
              Checkout <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* --- Normalized Booking Modal --- */}
      {isModalOpen && (
        <div
          className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-400 ${isClosingCheckout ? 'opacity-0' : 'bg-black/60 backdrop-blur-md'}`}
        >
          <div
            className="fixed inset-0"
            onClick={closeCheckoutModal}
          />
          <div
            className={`relative w-full max-w-lg rounded-[2.5rem] border border-border/40 bg-white shadow-2xl transition-all duration-400 dark:bg-card ${isClosingCheckout ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
          >
            <div className="flex items-center justify-between border-b border-border/40 p-6">
              <div>
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  Confirm Selection
                </h2>
                <p className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">
                  Review your car care session
                </p>
              </div>
              <button
                onClick={closeCheckoutModal}
                className="rounded-full bg-secondary/80 p-2.5 text-muted-foreground transition-all hover:rotate-90 hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="custom-scrollbar mt-4 max-h-[70vh] space-y-5 overflow-y-auto p-6 pt-0">
              <div className="space-y-3">
                {selectedServices.map((s, idx) => (
                  <div
                    key={idx}
                    className="group relative flex items-center justify-between rounded-2xl border border-border/10 bg-white/50 p-4 transition-all hover:bg-white dark:bg-muted/5 dark:hover:bg-muted/10"
                  >
                    <div>
                      <h4 className="text-sm leading-tight font-black text-foreground uppercase">
                        {s.service_name}
                      </h4>
                      <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                        {s.selectedVariant.size} • {s.selectedVariant.estimated_duration}m
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-base font-black text-foreground">
                        ₱{Number(s.selectedVariant.price).toLocaleString()}
                      </p>
                      <button
                        onClick={() => removeService(s)}
                        className="rounded-full p-1.5 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-5 border-t border-border/20 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">
                      <CalendarIcon className="h-3 w-3 text-highlight" />
                      Desired Date
                    </label>
                    <div className="group relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/40 group-focus-within:text-highlight transition-colors">
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full rounded-2xl border border-border/40 bg-white py-4 pl-12 pr-4 text-sm font-black text-foreground shadow-sm transition-all focus:border-highlight/40 focus:ring-4 focus:ring-highlight/10 dark:bg-card/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">
                      <Clock className="h-3 w-3 text-highlight" />
                      Preferred Start Time
                    </label>
                    <div className="group relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/40 group-focus-within:text-highlight transition-colors">
                        <Clock className="h-4 w-4" />
                      </div>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full appearance-none rounded-2xl border border-border/40 bg-white py-4 pl-12 pr-10 text-sm font-black text-foreground shadow-sm transition-all focus:border-highlight/40 focus:ring-4 focus:ring-highlight/10 dark:bg-card/50"
                      >
                        <option value="">Select a time slot</option>
                        {availableTimeSlots.map((t) => (
                          <option
                            key={t}
                            value={t}
                          >
                            {t}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground/40 group-focus-within:text-highlight">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/50 bg-muted/40 p-6 shadow-inner dark:bg-muted/10">
                  <div className="flex items-end justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black tracking-widest text-muted-foreground/80 uppercase">
                        Total Amount
                      </p>
                      <p className="text-3xl leading-none font-black text-foreground">
                        ₱{totalPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl border border-highlight/20 bg-highlight/10 px-3 py-1.5 text-[10px] font-black tracking-widest text-highlight uppercase">
                      Quote
                    </div>
                  </div>
                </div>

                <Button
                  variant="highlight"
                  className="h-13 w-full rounded-xl text-sm font-black tracking-widest uppercase shadow-2xl shadow-highlight/30 transition-all hover:scale-[1.02] active:scale-95 disabled:grayscale"
                  disabled={selectedServices.length === 0 || !selectedTime || isBooking}
                  onClick={handleBook}
                >
                  {isBooking ? 'Finalizing...' : 'Book Appointment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Normalized Variant Modal --- */}
      {isVariantModalOpen && selectedServiceForModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all duration-300">
          <div
            className="fixed inset-0"
            onClick={() => setIsVariantModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-border/40 bg-white shadow-2xl dark:bg-card">
            <div className="flex items-center justify-between border-b border-border/40 p-8">
              <div>
                <h3 className="text-2xl font-black text-foreground">
                  {selectedServiceForModal.service_name}
                </h3>
                <p className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">
                  Select your vehicle size
                </p>
              </div>
              <button
                onClick={() => setIsVariantModalOpen(false)}
                className="rounded-full bg-secondary/80 p-3 text-muted-foreground transition-all hover:rotate-90 hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="custom-scrollbar max-h-[60vh] space-y-4 overflow-y-auto p-8">
              {selectedServiceForModal.variants.map((variant) => {
                const active = isSelected(
                  selectedServiceForModal.service_id,
                  variant.service_variant,
                )
                return (
                  <button
                    key={variant.service_variant}
                    onClick={() => toggleService(selectedServiceForModal, variant)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left shadow-sm transition-all ${
                      active
                        ? 'border-highlight bg-highlight/5 ring-1 ring-highlight'
                        : 'border-border/40 bg-white hover:border-highlight/20 dark:bg-muted/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                        active 
                          ? 'border-highlight bg-highlight shadow-[0_0_10px_rgba(234,179,8,0.3)]' 
                          : 'border-border/60 bg-transparent'
                      }`}>
                        {active && <div className="h-2 w-2 rounded-full bg-black" />}
                      </div>
                      <div>
                        <p className={`text-base leading-tight font-black uppercase transition-colors ${active ? 'text-highlight' : 'text-foreground'}`}>
                          {variant.size}
                        </p>
                        <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                          {variant.estimated_duration} mins
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black transition-colors ${active ? 'text-highlight' : 'text-foreground'}`}>
                        ₱{Number(variant.price).toLocaleString()}
                      </p>
                      {active && (
                        <div className="mt-1 flex items-center justify-end gap-1 animate-in fade-in zoom-in duration-300">
                          <CheckCircle2 className="h-3 w-3 text-highlight" />
                          <span className="text-[10px] font-black tracking-widest text-highlight uppercase">
                            Selected
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="p-8 pt-0">
              <Button
                variant="highlight"
                className="h-14 w-full rounded-2xl text-xs font-black tracking-widest uppercase shadow-xl shadow-highlight/20 transition-all hover:scale-[1.02] active:scale-95"
                onClick={() => setIsVariantModalOpen(false)}
              >
                Confirm Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- Unified Status Modal --- */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl transition-all duration-300">
          <div
            className="fixed inset-0"
            onClick={() => setShowModal(false)}
          />
          <div className="shadow-3xl relative w-full max-w-sm rounded-[2.5rem] border border-border/40 bg-background p-10 text-center">
            <div className="mb-8 flex justify-center">
              {modalType === 'success' && (
                <div className="rounded-3xl bg-emerald-500/10 p-6 text-emerald-500 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              )}
              {modalType === 'error' && (
                <div className="rounded-3xl bg-destructive/10 p-6 text-destructive shadow-lg shadow-destructive/20">
                  <AlertCircle className="h-12 w-12" />
                </div>
              )}
              {modalType === 'warning' && (
                <div className="rounded-3xl bg-orange-500/10 p-6 text-orange-500 shadow-lg shadow-orange-500/20">
                  <AlertCircle className="h-12 w-12" />
                </div>
              )}
            </div>
            <h3 className="mb-3 text-3xl font-black tracking-tighter text-foreground uppercase">
              {modalType === 'success' ? 'Brilliant!' : modalType === 'error' ? 'Oops!' : 'Wait!'}
            </h3>
            <p className="mb-10 px-2 text-sm leading-relaxed font-medium text-muted-foreground">
              {modalMessage}
            </p>
            <Button
              onClick={() => setShowModal(false)}
              className="h-14 w-full rounded-2xl font-black tracking-widest uppercase shadow-xl transition-all hover:scale-105 active:scale-95"
              variant={modalType === 'success' ? 'highlight' : 'destructive'}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </LayoutComponent>
  )
}
