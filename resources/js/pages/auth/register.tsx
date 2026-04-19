import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController'
import { getPendingBooking } from '@/lib/pendingBooking'
import { login } from '@/routes'
import { Form, Head } from '@inertiajs/react'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import InputError from '@/components/input-error'
import TextLink from '@/components/text-link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthLayout from '@/layouts/auth-layout'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [defaultValues, setDefaultValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })

  useEffect(() => {
    const pending = getPendingBooking()
    if (pending && pending.guestInfo) {
      // Split the name into first and last name
      const nameParts = pending.guestInfo.name.trim().split(/\s+/)
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      setDefaultValues({
        firstName,
        lastName,
        email: pending.guestInfo.email,
      })
    }
  }, [])

  return (
    <AuthLayout
      title="Create an account"
      description="Enter your details below to create your account"
    >
      <Head title="Register" />

      <Form
        {...RegisteredUserController.store.form()}
        resetOnSuccess={['password', 'password_confirmation']}
        disableWhileProcessing
        className="flex flex-col gap-6"
      >
        {({ processing, errors }) => (
          <>
            <div className="grid gap-6">
              <div className="flex flex-col sm:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">First name</Label>
                  <Input
                    id="first_name"
                    type="text"
                    required
                    autoFocus
                    tabIndex={1}
                    autoComplete="given-name"
                    name="first_name"
                    placeholder="First name"
                    defaultValue={defaultValues.firstName}
                  />
                  <InputError
                    message={errors.first_name}
                    className="mt-2"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="last_name">Last name</Label>
                  <Input
                    id="last_name"
                    type="text"
                    required
                    tabIndex={2}
                    autoComplete="family-name"
                    name="last_name"
                    placeholder="Last name"
                    defaultValue={defaultValues.lastName}
                  />
                  <InputError
                    message={errors.last_name}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  tabIndex={3}
                  autoComplete="email"
                  name="email"
                  placeholder="email@example.com"
                  defaultValue={defaultValues.email}
                />
                <InputError message={errors.email} />
              </div>

              {/* PASSWORD FIELD WITH EYE TOGGLE */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    tabIndex={4}
                    autoComplete="new-password"
                    name="password"
                    placeholder="Password"
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <InputError message={errors.password} />
              </div>

              {/* CONFIRM PASSWORD FIELD WITH EYE TOGGLE */}
              <div className="grid gap-2">
                <Label htmlFor="password_confirmation">Confirm password</Label>

                <div className="relative">
                  <Input
                    id="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    tabIndex={5}
                    autoComplete="new-password"
                    name="password_confirmation"
                    placeholder="Confirm password"
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <InputError message={errors.password_confirmation} />
              </div>

              <Button
                type="submit"
                variant="highlight"
                className="mt-2 w-full"
                tabIndex={6}
                data-test="register-user-button"
              >
                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Create account
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <TextLink
                href={login()}
                tabIndex={6}
              >
                Log in
              </TextLink>
            </div>
          </>
        )}
      </Form>
    </AuthLayout>
  )
}
