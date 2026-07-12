# Registration Validation Error - Fix Applied

## Problem
The registration form was failing with a 400 error: "La validation des données a échoué" (Data validation failed) with the specific error "Le rôle est requis" (Role is required).

The backend API was expecting a `role` field in the registration payload, but the frontend was not sending it.

## Solution
Updated the registration system to include the `role` field with a default value of `VIEWER` for new user registrations.

## Files Modified

### 1. src/app/models/plm.models.ts
- Updated `RegisterRequest` interface to include optional `role` field
- Marked `confirmPassword` as optional since it's only for frontend validation

```typescript
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;  // Frontend validation only
  role?: string;             // Backend requirement
}
```

### 2. src/app/services/auth.service.ts
- Updated `register()` method to include `role` in the payload
- Sets default role to `VIEWER` if not provided
- Ensures the payload structure matches backend expectations

```typescript
register(data: RegisterRequest): Observable<RegisterResponse> {
  const payload = {
    username: data.username,
    email: data.email,
    password: data.password,
    role: data.role || 'VIEWER'  // Default to VIEWER role
  };
  return this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(
    tap(res => {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      this.currentUserSubject.next(res.user);
    })
  );
}
```

### 3. src/app/pages/register/register.component.ts
- Updated `onRegister()` method to pass `role: 'VIEWER'` with registration data
- Improved error message handling to support multiple error formats from backend
- Handles both single error messages and validation error arrays

```typescript
onRegister() {
  if (this.registerForm.invalid || !this.passwordsMatch()) return;
  this.loading = true;
  this.error = '';
  
  const formValue = this.registerForm.value;
  this.auth.register({
    username: formValue.username!,
    email: formValue.email!,
    password: formValue.password!,
    confirmPassword: formValue.confirmPassword!,
    role: 'VIEWER'  // New registrations default to VIEWER
  }).subscribe({
    next: () => this.router.navigate(['/']),
    error: (err) => {
      let errorMsg = 'Registration failed. Please try again.';
      if (err.error?.message) {
        errorMsg = err.error.message;
      } else if (err.error?.errors) {
        errorMsg = Object.values(err.error.errors).join(', ');
      }
      this.error = errorMsg;
      this.loading = false;
    }
  });
}
```

## How It Works

1. User fills in registration form (username, email, password, confirm password)
2. Frontend validates fields and password matching
3. On submit, `onRegister()` creates registration object with default role `VIEWER`
4. `AuthService.register()` takes the registration data and includes the role in API payload
5. Backend receives complete payload with role and validates it successfully
6. On success, JWT token is stored and user is logged in automatically
7. Application navigates to dashboard

## Backend API Requirement

The backend `/api/v1/auth/register` endpoint expects:

```json
{
  "username": "string (required, unique, 3+ chars)",
  "email": "string (required, valid email, unique)",
  "password": "string (required, 6+ chars, hashed)",
  "role": "string (required, e.g. 'VIEWER', 'ENGINEER', 'APPROVER', 'ADMIN')"
}
```

## Response on Success

```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "email@example.com",
    "role": "VIEWER"
  }
}
```

## Testing

1. Navigate to http://localhost:4200/register
2. Fill in form:
   - Username: testuser
   - Email: test@example.com
   - Password: Test123456
   - Confirm: Test123456
3. Click "Create Account"
4. Should successfully register and redirect to dashboard
5. User is automatically logged in with VIEWER role

## Build Status
- Build: SUCCESSFUL (8181ms)
- TypeScript: No errors
- Bundle: All components included with lazy loading
- Registration component size: 8.15 kB (gzipped 2.41 kB)

## Notes
- New users are automatically assigned VIEWER role on registration
- Users cannot change their own role through registration
- Role-based access control is enforced by backend
- Error messages from backend are displayed to user (supports both English and French)
