import Heading from '@/components/heading'
import HeadingSmall from '@/components/heading-small'
import { Button } from '@/components/ui/button'
import Calendar from '@/components/ui/calendar'
import AppLayout from '@/layouts/app-layout'
import { Head, usePage } from '@inertiajs/react'
import axios from 'axios'
import { AlertCircle, CheckCircle2, ChevronDown, Clock, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const breadcrumbs = [{ title: 'Services', href: '/services' }]

interface ServiceVariant {
  service_variant: number
  size: string
  price: number | string
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

export default function Services() {
  const pageProps = usePage().props as unknown as {
    services?: Service[]
    categories?: string[]
    selectedCategory?: string
  }

  const services = pageProps.services ?? []
  const categories = pageProps.categories ?? []

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [isBooking, setIsBooking] = useState(false)
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const dropdownRef = useRef<HTMLDivElement>(null)

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

    let hour = 6
    let minute = 30

    // If today, adjust start time based on current time
    if (isToday) {
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      // If current time is past 6:30 AM
      if (currentHour > 6 || (currentHour === 6 && currentMinute >= 30)) {
        hour = currentHour
        minute = currentMinute

        // Round up to next 30-min slot
        if (minute > 0) {
          minute = minute < 30 ? 30 : 60
        }
        if (minute === 60) {
          hour += 1
          minute = 0
        }

        // Add 1-hour buffer
        hour += 1
      }
    }

    const slots: string[] = []

    // Generate slots from start time until 10:00 PM
    while (hour < 22 || (hour === 22 && minute === 0)) {
      const isPM = hour >= 12
      const displayHour = hour % 12 === 0 ? 12 : hour % 12
      const period = isPM ? 'PM' : 'AM'
      const timeStr = `${displayHour}:${minute === 0 ? '00' : '30'} ${period}`

      // Only add if it's 6:30 AM or later (double check for safety)
      if (hour > 6 || (hour === 6 && minute >= 30)) {
        slots.push(timeStr)
      }

      // Next 30-min
      minute += 30
      if (minute >= 60) {
        minute = 0
        hour += 1
      }

      // Stop at 10:00 PM (22:00)
      if (hour > 22) break
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
      const [yearStr, monthStr, dayStr] = selectedDate.split('-')
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

      const response = await axios.post('/api/bookings/book', {
        order_date: orderDate,
        variant_ids: variantIds,
      })

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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Services" />

      {/* Main Content (unchanged) */}
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <Heading
          title="Services & Pricing"
          description="Explore our Gearhead Carwash services"
        />

        {/* Category Buttons */}
        <div className="custom-scrollbar flex w-full gap-4 overflow-x-auto">
          <Button
            variant={selectedCategory === 'All' ? 'highlight' : 'default'}
            className="text-lg"
            onClick={() => setSelectedCategory('All')}
          >
            All
          </Button>
          {categories.map((cat) => {
            const isActive = cat === selectedCategory
            return (
              <Button
                key={cat}
                variant={isActive ? 'highlight' : 'default'}
                className="text-lg"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            )
          })}
        </div>

        {/* Services Grid */}
        <div className="mb-5 p-2">
          <h4 className="mb-2 text-2xl font-bold">Services - {selectedCategory}</h4>
          <div className="custom-scrollbar h-[60vh] overflow-y-auto">
            {filteredServices.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4">
                {filteredServices.map((s) => {
                  return (
                    <div
                      key={s.service_id}
                      className="flex w-sm flex-col justify-between gap-5 rounded-sm border p-4"
                    >
                      <HeadingSmall
                        title={`${s.service_name}`}
                        description={s.description}
                      />

                      <hr className="border-gray-400/50" />

                      <div className="flex justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {s.variants.length > 0
                              ? `${Math.min(...s.variants.map((v) => v.estimated_duration))}-${Math.max(...s.variants.map((v) => v.estimated_duration))} mins`
                              : 'N/A'}
                          </span>
                        </div>
                        <p className="font-bold">
                          {s.variants.length > 0
                            ? `Starts at ₱${Math.min(...s.variants.map((v) => Number(v.price))).toLocaleString()}`
                            : 'N/A'}
                        </p>
                      </div>

                      <Button
                        variant="highlight"
                        className="mt-4 w-full"
                        onClick={() => {
                          setSelectedServiceForModal(s)
                          setIsVariantModalOpen(true)
                        }}
                      >
                        Select Size
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No services available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Floating Footer */}
      {selectedServices.length > 0 && (
        <div className="absolute right-0 bottom-1 left-0 mx-auto my-4 flex w-md max-w-lg items-center justify-between rounded-lg border border-border/20 bg-highlight p-3 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="relative h-7 w-7 rounded-full bg-primary">
              <span className="absolute inset-0 flex items-center justify-center text-lg font-medium text-white">
                {selectedServices.length}
              </span>
            </div>
            <div>
              <span className="text-primary/70">Total amount:</span>{' '}
              <strong className="text-primary">₱{totalPrice.toLocaleString()}</strong>
            </div>
          </div>
          <Button
            variant="default"
            onClick={() => setIsModalOpen(true)}
          >
            View Selected Services
          </Button>
        </div>
      )}

      {/* MODAL WITH SMART TIME PICKER */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm duration-200 animate-in fade-in"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="pointer-events-none fixed inset-0 z-[9999] flex items-end justify-center p-4 pb-8 sm:items-center">
            <div
              className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl duration-300 animate-in fade-in slide-in-from-bottom-12 zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Content Grid */}
              <div className="grid gap-0 md:grid-cols-2">
                {/* Left Column: Services List */}
                <div className="flex flex-col border-b border-border/30 md:border-b-0">
                  <div className="flex items-center justify-between border-b border-border/30 px-5 py-4">
                    <h2 className="text-xl font-bold">
                      Selected Services{' '}
                      <span className="text-yellow-600">({selectedServices.length})</span>
                    </h2>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg p-1.5 transition hover:bg-muted/70 md:hidden"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div
                    className="custom-scrollbar flex-1 overflow-y-auto p-5"
                    style={{ maxHeight: 'calc(100vh - 300px)' }}
                  >
                    <div className="space-y-3">
                      {selectedServices.map((s) => (
                        <div
                          key={`${s.service_name}-${s.selectedVariant.size}`}
                          className="flex items-center justify-between rounded-xl border border-border/40 p-4 shadow-sm"
                        >
                          <div className="flex-1 pr-3">
                            <p className="font-semibold text-foreground">
                              {s.service_name}{' '}
                              <span className="text-sm text-muted-foreground">
                                ({s.selectedVariant.size})
                              </span>
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {s.selectedVariant.estimated_duration} mins
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold">
                              ₱{Number(s.selectedVariant.price).toLocaleString()}
                            </span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeService(s)}
                              className="h-8 px-3 text-xs"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total (Mobile only, or kept here if prefered, but usually better at bottom) */}
                  <div className="flex min-h-[80px] items-center justify-between border-t border-border/30 bg-muted/20 px-5 py-4">
                    <span className="text-base font-medium text-foreground">Total</span>
                    <span className="text-2xl font-bold text-foreground">
                      ₱{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Right Column: Date & Time */}
                <div className="flex flex-col bg-muted/10 p-5">
                  {/* Mobile close button is in left col, desktop close can be here or omitted if clicking outside works */}
                  <div className="mb-2 hidden justify-end md:flex">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg p-1.5 transition hover:bg-muted/70"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Select Date
                      </label>
                      <div className="mb-6 flex justify-center">
                        <Calendar
                          selectedDate={selectedDate}
                          onSelect={(date: string) => {
                            setSelectedDate(date)
                            setSelectedTime('') // Reset time when date changes
                          }}
                          minDate={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Preferred Time
                      </label>
                      <div
                        className="relative"
                        ref={dropdownRef}
                      >
                        <button
                          type="button"
                          onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                          className={`w-full rounded-lg border bg-background px-4 py-4 pr-12 text-base font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none ${
                            selectedTime
                              ? 'border-primary/70 bg-primary/5'
                              : 'border-border hover:border-primary/40'
                          }`}
                        >
                          {selectedTime ? selectedTime : 'Choose available time...'}
                        </button>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                          <ChevronDown
                            className={`h-5 w-5 text-muted-foreground transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </div>

                        {isTimeDropdownOpen && (
                          <div
                            className={`custom-scrollbar absolute right-0 left-0 z-50 max-h-64 overflow-y-auto rounded-lg border border-border bg-background shadow-lg ${
                              dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                            }`}
                          >
                            {availableTimeSlots.length > 0 ? (
                              availableTimeSlots.map((time) => (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTime(time)
                                    setIsTimeDropdownOpen(false)
                                  }}
                                  className={`block w-full px-4 py-3 text-left transition-colors hover:bg-primary/10 ${
                                    selectedTime === time
                                      ? 'bg-primary/20 font-semibold text-primary'
                                      : 'text-foreground'
                                  }`}
                                >
                                  {time} {time === availableTimeSlots[0] && '(Earliest available)'}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                                No available times
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {selectedTime && (
                        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Booking scheduled for{' '}
                          <strong>
                            {selectedDate} at {selectedTime}
                          </strong>
                        </p>
                      )}
                      {availableTimeSlots.length === 0 && (
                        <p className="mt-3 text-sm font-medium text-orange-600">
                          Gearhead is closed for this date. Please select another date!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 border-t border-border/30 bg-background/80 px-5 py-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Continue Selecting
                </Button>
                <Button
                  size="lg"
                  variant="highlight"
                  className="flex-1 font-bold"
                  disabled={selectedServices.length === 0 || !selectedTime || isBooking}
                  onClick={handleBook}
                >
                  {isBooking
                    ? 'Booking...'
                    : selectedTime
                      ? `Book at ${selectedTime}`
                      : 'Proceed to Booking'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Status Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="mb-4 flex justify-center">
              {modalType === 'success' && (
                <div className="rounded-full bg-emerald-100 p-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
              )}
              {modalType === 'error' && (
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
              )}
              {modalType === 'warning' && (
                <div className="rounded-full bg-orange-100 p-3">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="mb-2 text-center text-xl font-bold">
              {modalType === 'success' && 'Success!'}
              {modalType === 'error' && 'Error'}
              {modalType === 'warning' && 'Attention'}
            </h3>

            {/* Message */}
            <p className="mb-6 text-center text-muted-foreground">{modalMessage}</p>

            {/* OK Button */}
            <Button
              onClick={() => setShowModal(false)}
              className="w-full"
              variant={modalType === 'success' ? 'default' : 'destructive'}
            >
              OK
            </Button>
          </div>
        </div>
      )}
      {/* Variant Selection Modal */}
      {isVariantModalOpen && selectedServiceForModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsVariantModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl animate-in slide-in-from-bottom-5 zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">{selectedServiceForModal.service_name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedServiceForModal.description}
                </p>
              </div>
              <button
                onClick={() => setIsVariantModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <hr className="my-4 border-border/50" />

            <div className="space-y-4">
              <p className="font-semibold">Select Size:</p>
              <div className="custom-scrollbar max-h-[50vh] space-y-3 overflow-y-auto pr-2">
                {selectedServiceForModal.variants.map((variant) => {
                  const active = isSelected(
                    selectedServiceForModal.service_id,
                    variant.service_variant,
                  )
                  return (
                    <div
                      key={variant.service_variant}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3 shadow-sm transition-all hover:border-primary/50"
                    >
                      <div>
                        <p className="text-base font-bold">{variant.size}</p>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{variant.estimated_duration} mins</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">
                          ₱{Number(variant.price).toLocaleString()}
                        </span>
                        <Button
                          size="sm"
                          variant="highlight"
                          className={
                            active
                              ? 'border-transparent bg-green-600 font-bold text-white hover:bg-green-700'
                              : 'min-w-[70px] font-bold'
                          }
                          onClick={() => toggleService(selectedServiceForModal, variant)}
                        >
                          {active ? 'Added' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => setIsVariantModalOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
