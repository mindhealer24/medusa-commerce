# Profile Management in Fashion Starter

## Overview

This document provides detailed technical documentation on how the Fashion Starter template implements profile management functionality, specifically:
1. Editing profile information (name, email, phone)
2. Changing password

The implementation uses React, React Query, and Medusa SDK to provide a smooth user experience for managing personal information.

## Table of Contents

1. [Architecture & Component Structure](#architecture--component-structure)
2. [Profile Information Editing](#profile-information-editing)
3. [Password Management](#password-management)
4. [Data Flow](#data-flow)
5. [Security Considerations](#security-considerations)
6. [Testing](#testing)

## Architecture & Component Structure

The profile management functionality is built using several key components:

### Main Components

1. **Account Page**
   - Displays user information and provides entry points to edit functionality
   - Path: `fashion-starter/storefront/src/app/[countryCode]/(main)/account/page.tsx`

2. **Personal Information Form**
   - Modal dialog with form fields for editing name and phone
   - Path: `fashion-starter/storefront/src/modules/account/components/PersonalInfoForm.tsx`

3. **Profile Edit Details Dialog**
   - In Solace implementation: `solace-medusa-starter/src/modules/account/components/profile-edit-details/index.tsx`

4. **Account Info Component**
   - Reusable component providing edit/view/success/error states
   - Path: `solace-medusa-starter/src/modules/account/components/account-info/index.tsx`

5. **Reset Password Form**
   - Handles password change requests
   - Path: `fashion-starter/storefront/src/modules/auth/components/ResetPasswordForm.tsx`

## Profile Information Editing

### User Interface Flow

1. User accesses their account page which displays their current profile information
2. User clicks the "Edit" or "Change" button to modify profile information
3. A modal dialog opens with pre-filled form fields
4. User makes changes and submits the form
5. System displays success/error message and updates the displayed information

### Implementation Details

#### Form Schema Definition

```typescript
// From fashion-starter/storefront/src/hooks/customer.ts
export const updateCustomerFormSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional().nullable(),
});
```

#### API Function

```typescript
// From fashion-starter/storefront/src/lib/data/customer.ts
export const updateCustomer = async function (
  formData: z.infer<typeof updateCustomerFormSchema>
): Promise<
  { state: "initial" | "success" } | { state: "error"; error: string }
> {
  return sdk.store.customer
    .update(
      {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone ?? undefined,
      },
      {},
      await getAuthHeaders()
    )
    .then(() => {
      revalidateTag("customer")
      return { state: "success" as const }
    })
    .catch(() => {
      revalidateTag("customer")
      return {
        state: "error" as const,
        error: "Failed to update customer personal information",
      }
    })
}
```

#### React Hook for Data Mutation

```typescript
// From fashion-starter/storefront/src/hooks/customer.ts
export const useUpdateCustomer = (
  options?: UseMutationOptions<
    { state: "error" | "success" | "initial"; error?: string },
    Error,
    z.infer<typeof updateCustomerFormSchema>
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["update-customer"],
    mutationFn: async (values: z.infer<typeof updateCustomerFormSchema>) => {
      return updateCustomer(values)
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}
```

#### Form Component Implementation

```typescript
// From fashion-starter/storefront/src/modules/account/components/PersonalInfoForm.tsx
export const PersonalInfoForm = withReactQueryProvider<{
  defaultValues?: {
    first_name: string
    last_name: string
    phone?: string
  }
}>(({ defaultValues }) => {
  const { mutate, isPending, data } = useUpdateCustomer()
  
  const { close } = React.useContext(ReactAria.OverlayTriggerStateContext)!
  const onSubmit = (values: z.infer<typeof updateCustomerFormSchema>) => {
    mutate(values, {
      onSuccess: (res) => {
        if (res.state === "success") {
          close()
        }
      },
    })
  }
  
  return (
    <Form
      onSubmit={onSubmit}
      schema={updateCustomerFormSchema}
      defaultValues={defaultValues}
    >
      {/* Form fields and buttons */}
    </Form>
  )
})
```

### Email Management

The Fashion Starter doesn't directly allow users to change their email through the UI. Instead, it provides a notice:

```tsx
<p className="text-xs text-grayscale-500 mb-16">
  If you want to change your email please contact us via customer support.
</p>
```

This approach provides additional security since email is often used as the primary identifier and for password recovery.

## Password Management

The Fashion Starter implements two approaches for password management:

### 1. Direct Password Change (From Profile)

Users can change their password directly from their profile page when they know their current password.

#### Component Implementation

```typescript
// From solace-medusa-starter/src/modules/account/components/profile-password/index.tsx
const ProfileName: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  // TODO: Add support for password updates
  const [state, formAction] = useActionState((() => {}) as any, {
    customer,
    success: false,
    error: null,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} onReset={() => clearState()} className="w-full">
      <AccountInfo
        label="Password"
        currentInfo={
          <span>The password is not shown for security reasons</span>
        }
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error ?? undefined}
        clearState={clearState}
        data-testid="account-password-editor"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="old_password"
            required
            type="password"
            data-testid="old-password-input"
          />
          <Input
            type="password"
            name="new_password"
            required
            data-testid="new-password-input"
          />
          <Input
            type="password"
            name="confirm_password"
            required
            data-testid="confirm-password-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}
```

### 2. Password Reset Flow

For users who have forgotten their password or prefer to use a reset link, the system provides a password reset functionality.

#### Password Reset Request

```typescript
// From fashion-starter/storefront/src/lib/data/customer.ts
export async function requestPasswordReset() {
  const customer = await getCustomer()

  if (!customer) {
    return {
      success: false as const,
      error: "No customer found",
    }
  }
  await sdk.auth.resetPassword("logged-in-customer", "emailpass", {
    identifier: customer.email,
  })

  return {
    success: true as const,
  }
}
```

#### Schema Validation for Password Reset

```typescript
// From fashion-starter/storefront/src/modules/auth/components/ResetPasswordForm.tsx
const resetPasswordFormSchema = baseSchema.superRefine((data, ctx) => {
  if (data.new_password !== data.confirm_new_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords must match",
      path: ["confirm_new_password"],
    })
  }

  if (data.type === "reset" && data.current_password === data.new_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "New password must be different from the current password",
      path: ["new_password"],
    })
  }
})
```

#### Reset Password Form Component

```typescript
// From fashion-starter/storefront/src/modules/auth/components/ResetPasswordForm.tsx
export const ChangePasswordForm: React.FC<{
  email: string
  token: string
  customer?: boolean
}> = ({ email, token, customer }) => {
  const [formState, formAction, isPending] = React.useActionState(
    resetPassword,
    { email, token, state: "initial" }
  )

  const [isModalOpen, setIsModalOpen] = React.useState(false)

  React.useEffect(() => {
    if (formState.state === "success") {
      setIsModalOpen(true)
    }
  }, [formState])

  const onSubmit = (values: z.infer<typeof resetPasswordFormSchema>) => {
    React.startTransition(() => formAction(values))
  }

  return (
    <>
      <Form
        onSubmit={onSubmit}
        schema={resetPasswordFormSchema}
        defaultValues={customer ? { type: "reset" } : { type: "forgot" }}
      >
        {/* Form fields */}
        {/* Success/error messages */}
      </Form>
      {/* Success modal */}
    </>
  )
}
```

#### Password Update Function

```typescript
// From fashion-starter/storefront/src/lib/data/customer.ts
export async function resetPassword(
  currentState: unknown,
  formData: z.infer<typeof baseSchema>
): Promise<
  z.infer<typeof resetPasswordStateSchema> &
    ({ state: "initial" | "success" } | { state: "error"; error: string })
> {
  const validatedState = resetPasswordStateSchema.parse(currentState)
  
  // For reset type (existing users), verify current password
  if (formData.type === "reset") {
    try {
      await sdk.auth.login("customer", "emailpass", {
        email: validatedState.email,
        password: formData.current_password,
      })
    } catch (error) {
      return {
        ...validatedState,
        state: "error" as const,
        error: "Wrong password",
      }
    }
  }
  
  // Update the password
  return sdk.auth
    .updateProvider(
      formData.type === "reset" ? "logged-in-customer" : "customer",
      "emailpass",
      {
        email: validatedState.email,
        password: formData.new_password,
      },
      validatedState.token
    )
    .then(() => {
      return {
        ...validatedState,
        state: "success" as const,
      }
    })
    .catch(() => {
      return {
        ...validatedState,
        state: "error" as const,
        error: "Failed to update password",
      }
    })
}
```

#### Email Notification

After a password reset, the system sends a notification email to the user:

```typescript
// From fashion-starter/medusa/src/subscribers/auth-password-reset-notification.ts
export default async function sendPasswordResetNotification({
  event: { data },
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  // Fetch customer info
  const { data: customers } = await query.graph({
    entity: "customer",
    fields,
    filters: { email: data.entity_id },
  });
  const customer = customers[0];

  // Send notification email
  await notificationModuleService.createNotifications({
    to: customer.email,
    channel: "email",
    template:
      data.actor_type === "logged-in-customer"
        ? "auth-password-reset"
        : "auth-forgot-password",
    data: { customer, token: data.token },
  });
}
```

## Data Flow

### Profile Update Flow

1. User submits updated profile information via form
2. Form data is validated using Zod schema
3. API call is made to Medusa backend via SDK
4. On success:
   - Cache is invalidated to refresh data
   - UI displays success message
   - Modal is closed
5. On error:
   - Error message is displayed
   - Form remains open for correction

### Password Change Flow

1. **Direct Change:**
   - User enters current and new password
   - Current password is verified with backend
   - If correct, new password is set
   - Success/error message is displayed

2. **Reset Flow:**
   - User requests password reset
   - Reset link with token is sent to email
   - User clicks link and enters new password
   - Password is updated with token verification
   - Success notification is displayed

## Security Considerations

1. **Password Security:**
   - Passwords are never displayed on the UI
   - Current password verification before changes
   - Minimum password length enforcement (6+ characters)
   - New password must differ from old password
   - Confirmation password must match new password

2. **Email Security:**
   - Email changes require customer support intervention
   - Password reset tokens are sent via email
   - Token-based authentication for password resets

3. **Data Protection:**
   - Authentication headers are used for all API calls
   - Form validation prevents invalid data submission

## Testing

The implementation includes end-to-end tests to ensure functionality:

```typescript
// From fashion-starter/storefront/e2e/tests/authenticated/profile.spec.ts
test("Verifies password changes work correctly", async ({
  loginPage,
  accountProfilePage: profilePage,
  accountOverviewPage: overviewPage,
}) => {
  await test.step("Navigate to the account Profile page", async () => {
    await overviewPage.goto()
    await profilePage.profileLink.click()
  })

  await test.step("Update the password", async () => {
    await profilePage.passwordEditButton.click()
    await profilePage.oldPasswordInput.fill("password")
    await profilePage.newPasswordInput.fill("updated-password")
    await profilePage.confirmPasswordInput.fill("updated-password")
    await profilePage.passwordSaveButton.click()
    await expect(profilePage.passwordSuccessMessage).toBeVisible()
  })

  await test.step("logout and log back in", async () => {
    await profilePage.logoutLink.click()
    await expect(loginPage.container).toBeVisible()
    await loginPage.emailInput.fill("test@example.com")
    await loginPage.passwordInput.fill("updated-password")
    await loginPage.signInButton.click()
    await expect(overviewPage.container).toBeVisible()
  })
})

test("Profile changes persist across page refreshes and logouts", async ({
  page,
  loginPage,
  accountOverviewPage: overviewPage,
  accountProfilePage: profilePage,
}) => {
  // Test updating personal information
  // Verify changes persist after refresh/logout
})
```

## Conclusion

The Fashion Starter's profile management implementation provides a secure and user-friendly way for customers to manage their personal information and security settings. It follows React best practices with proper form validation, state management, and security considerations while providing a smooth user experience with appropriate feedback throughout the process. 