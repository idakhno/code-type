// Minimal client for the ORY Kratos endpoints we rely on.
const KRATOS_PUBLIC_URL = import.meta.env.VITE_KRATOS_PUBLIC_URL || 'http://localhost:4433';

// Types pulled from the Kratos OpenAPI schema.
export type SelfServiceFlowType = 'api' | 'browser';
export type AuthenticatorAssuranceLevel = 'aal0' | 'aal1' | 'aal2' | 'aal3';
export type LoginFlowState = 'choose_method' | 'sent_email' | 'passed_challenge';
export type RegistrationFlowState = 'choose_method' | 'sent_email' | 'passed_challenge';
export type VerificationFlowState = 'choose_method' | 'sent_email' | 'passed_challenge';
export type RecoveryFlowState = 'choose_method' | 'sent_email' | 'passed_challenge';
export type SettingsFlowState = 'show_form' | 'success';

export interface UIContainer {
  action: string;
  method: string;
  nodes: UINode[];
  messages?: UIText[];
}

export interface UINode {
  type: 'input' | 'submit' | 'text' | 'a' | 'img' | 'script' | 'hr';
  group: string;
  attributes: UINodeAttributes;
  messages?: UIText[];
  meta?: Record<string, unknown>;
}

export interface UINodeAttributes {
  name: string;
  type?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  node_type?: string;
  autocomplete?: string;
  pattern?: string;
  min?: number;
  max?: number;
  minlength?: number;
  maxlength?: number;
  placeholder?: string;
  title?: string;
  href?: string;
  src?: string;
  alt?: string;
  text?: string;
  onclick?: string;
  nonce?: string;
  rel?: string;
  id?: string;
  class?: string;
  as?: string;
  action?: string;
  method?: string;
  [key: string]: unknown;
}

export interface UIText {
  id: number;
  text: string;
  type: 'info' | 'error' | 'success';
  context?: Record<string, unknown>;
}

export interface Session {
  id: string;
  active: boolean;
  expires_at?: string;
  authenticated_at?: string;
  issued_at?: string;
  authenticator_assurance_level?: AuthenticatorAssuranceLevel;
  authentication_methods?: SessionAuthenticationMethod[];
  identity: Identity;
  tokenized?: string;
  devices?: SessionDevice[];
}

export interface SessionAuthenticationMethod {
  method: string;
  aal?: AuthenticatorAssuranceLevel;
  completed_at?: string;
  organization?: string;
  provider?: string;
}

export interface SessionDevice {
  id: string;
  ip_address?: string;
  location?: string;
  user_agent?: string;
}

export interface Identity {
  id: string;
  schema_id: string;
  schema_url: string;
  state?: 'active' | 'inactive';
  state_changed_at?: string;
  traits: IdentityTraits;
  verifiable_addresses?: VerifiableAddress[];
  recovery_addresses?: RecoveryAddress[];
  metadata_public?: Record<string, unknown>;
  metadata_admin?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface IdentityTraits {
  email: string;
  name?: {
    first?: string;
    last?: string;
  };
  birthdate?: string;
  bio?: string;
  website?: string;
  [key: string]: unknown;
}

export interface VerifiableAddress {
  id: string;
  value: string;
  verified: boolean;
  via: 'email' | 'sms';
  status: 'sent' | 'completed';
  verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecoveryAddress {
  id: string;
  value: string;
  via: 'email' | 'sms';
  created_at?: string;
  updated_at?: string;
}

export interface LoginFlow {
  id: string;
  type: SelfServiceFlowType;
  expires_at: string;
  issued_at: string;
  request_url: string;
  ui: UIContainer;
  state: LoginFlowState;
  active?: string;
  created_at?: string;
  updated_at?: string;
  identity_schema?: string;
  oauth2_login_challenge?: string;
  oauth2_login_request?: unknown;
  organization_id?: string;
  refresh?: boolean;
  requested_aal?: AuthenticatorAssuranceLevel;
  return_to?: string;
  session_token_exchange_code?: string;
  transient_payload?: Record<string, unknown>;
}

export interface RegistrationFlow {
  id: string;
  type: SelfServiceFlowType;
  expires_at: string;
  issued_at: string;
  request_url: string;
  ui: UIContainer;
  state: RegistrationFlowState;
  active?: string;
  created_at?: string;
  updated_at?: string;
  identity_schema?: string;
  oauth2_login_challenge?: string;
  oauth2_login_request?: unknown;
  organization_id?: string;
  return_to?: string;
  session_token_exchange_code?: string;
  transient_payload?: Record<string, unknown>;
}

export interface LogoutFlow {
  logout_token: string;
  logout_url: string;
}

export interface KratosError {
  error?: {
    id?: string;
    code?: number;
    status?: string;
    message?: string;
    reason?: string;
    hint?: string;
    details?: Record<string, unknown>;
    request?: string;
  };
  error_debug?: string;
  error_hint?: string;
  error_id?: string;
  status_code?: number;
}

export interface LoginResponse {
  session?: Session;
  session_token?: string;
  redirect_to?: string;
  continue_with?: ContinueWith[];
}

export interface RegistrationResponse {
  identity?: Identity;
  session?: Session;
  session_token?: string;
  continue_with?: ContinueWith[];
  redirect_to?: string;
}

export interface ContinueWith {
  action: 'show_verification_ui' | 'show_recovery_ui' | 'show_settings_ui' | 'set_ory_session_token' | 'redirect_browser_to';
  flow?: {
    id: string;
    url: string;
    expires_at: string;
    issued_at: string;
  };
}

export interface VerificationFlow {
  id: string;
  type: SelfServiceFlowType;
  expires_at?: string;
  issued_at: string;
  request_url: string;
  ui: UIContainer;
  state: VerificationFlowState;
  active?: string;
  return_to?: string;
  transient_payload?: Record<string, unknown>;
}

export interface RecoveryFlow {
  id: string;
  type: SelfServiceFlowType;
  expires_at: string;
  issued_at: string;
  request_url: string;
  ui: UIContainer;
  state: RecoveryFlowState;
  active?: string;
  continue_with?: ContinueWith[];
  return_to?: string;
  transient_payload?: Record<string, unknown>;
}

export interface SettingsFlow {
  id: string;
  type: SelfServiceFlowType;
  expires_at: string;
  issued_at: string;
  request_url: string;
  ui: UIContainer;
  state: SettingsFlowState;
  identity: Identity;
  active?: string;
  continue_with?: ContinueWith[];
  return_to?: string;
  transient_payload?: Record<string, unknown>;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Extract CSRF token from flow UI nodes
 */
function extractCSRFToken(ui: UIContainer): string | null {
  const csrfNode = ui.nodes.find(
    (node) => node.type === 'input' && node.attributes.name === 'csrf_token'
  );
  return csrfNode?.attributes.value as string || null;
}

// Kratos expects the password login field to be named 'identifier'.

/**
 * Get error messages from flow UI
 */
function getErrorMessages(ui: UIContainer): UIText[] {
  const messages: UIText[] = [];
  
  // Messages from flow level
  if (ui.messages) {
    messages.push(...ui.messages);
  }
  
  // Messages from nodes
  ui.nodes.forEach((node) => {
    if (node.messages) {
      messages.push(...node.messages);
    }
  });
  
  return messages.filter((msg) => msg.type === 'error');
}

/**
 * Check if error is a Kratos error response
 */
function isKratosError(data: unknown): data is KratosError {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('error' in data || 'error_id' in data || 'error_hint' in data)
  );
}

/**
 * Extract user-friendly error message from Kratos error
 */
function extractErrorMessage(error: KratosError, ui?: UIContainer): string {
  // Try to get message from flow UI first (most user-friendly)
  if (ui) {
    const messages = getErrorMessages(ui);
    if (messages.length > 0) {
      return messages[0].text;
    }
  }

  // Check top-level error_hint first (most specific)
  if (error.error_hint) {
    return error.error_hint;
  }
  
  // Try Kratos error response
  if (error.error?.message) {
    return error.error.message;
  }

  if (error.error?.reason) {
    return error.error.reason;
  }

  // Fallback to generic message
  return 'An authentication error occurred';
}

// API helpers

/**
 * Returns the active Kratos session if the user has one.
 */
export async function checkSession(): Promise<Session | null> {
  try {
    const response = await fetch(`${KRATOS_PUBLIC_URL}/sessions/whoami`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    // 401 means no active session - not an error
    if (response.status === 401) {
      return null;
    }

    // 403 means session requires higher AAL (e.g. AAL2)
    if (response.status === 403) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    // Network errors or other errors mean we can't check session
    return null;
  }
}

/**
 * Starts a browser login flow.
 */
export async function initiateLoginFlow(options?: {
  refresh?: boolean;
  return_to?: string;
  aal?: AuthenticatorAssuranceLevel;
}): Promise<LoginFlow> {
  const params = new URLSearchParams();
  if (options?.refresh) {
    params.append('refresh', 'true');
  }
  if (options?.return_to) {
    params.append('return_to', options.return_to);
  }
  if (options?.aal) {
    params.append('aal', options.aal);
  }

  const url = `${KRATOS_PUBLIC_URL}/self-service/login/browser${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error as KratosError));
  }

  return await response.json();
}

/**
 * Loads a login flow by id.
 */
export async function getLoginFlow(flowId: string): Promise<LoginFlow> {
  const response = await fetch(
    `${KRATOS_PUBLIC_URL}/self-service/login/flows?id=${flowId}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error as KratosError));
  }

  return await response.json();
}

/**
 * Completes the password login flow.
 */
export async function submitLogin(
  flow: LoginFlow,
  email: string,
  password: string
): Promise<LoginResponse> {
  const csrfToken = extractCSRFToken(flow.ui);
  if (!csrfToken) {
    throw new Error('CSRF token not found in flow');
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    throw new Error('Email cannot be empty');
  }

  // updateLoginFlowWithPasswordMethod requires method, password and identifier
  const requestBody = {
    method: 'password',
    password: password,
    identifier: trimmedEmail,
    csrf_token: csrfToken,
  };

  const response = await fetch(`${KRATOS_PUBLIC_URL}/self-service/login?flow=${flow.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    // Check if it's a flow with errors (expired, etc.)
    if (isKratosError(data)) {
      throw new Error(extractErrorMessage(data, 'ui' in data ? (data as unknown as LoginFlow).ui : undefined));
    }
    // If response is a LoginFlow with errors, extract messages
    if ('ui' in data && typeof data === 'object' && data !== null) {
      const flowData = data as LoginFlow;
      const messages = getErrorMessages(flowData.ui);
      if (messages.length > 0) {
        throw new Error(messages[0].text);
      }
    }
    throw new Error('Login failed');
  }

  return data as LoginResponse;
}

/**
 * Starts a browser registration flow.
 */
export async function initiateRegistrationFlow(options?: {
  return_to?: string;
}): Promise<RegistrationFlow> {
  const params = new URLSearchParams();
  if (options?.return_to) {
    params.append('return_to', options.return_to);
  }

  const url = `${KRATOS_PUBLIC_URL}/self-service/registration/browser${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error as KratosError));
  }

  return await response.json();
}

/**
 * Loads a registration flow by id.
 */
export async function getRegistrationFlow(flowId: string): Promise<RegistrationFlow> {
  const response = await fetch(
    `${KRATOS_PUBLIC_URL}/self-service/registration/flows?id=${flowId}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error as KratosError));
  }

  return await response.json();
}

/**
 * Completes the password registration flow.
 */
export async function submitRegistration(
  flow: RegistrationFlow,
  email: string,
  password: string
): Promise<RegistrationResponse> {
  const csrfToken = extractCSRFToken(flow.ui);
  if (!csrfToken) {
    throw new Error('CSRF token not found in flow');
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    throw new Error('Email cannot be empty');
  }

  // Build traits object - only email is required
  const traits = {
    email: trimmedEmail,
  };

  const requestBody = {
    method: 'password',
    password: password,
    csrf_token: csrfToken,
    traits: traits,
  };

  const response = await fetch(`${KRATOS_PUBLIC_URL}/self-service/registration?flow=${flow.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    // Log full error for debugging
    console.error('Registration error:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });

    // Check if it's a flow with errors (expired, etc.)
    if ('ui' in data && typeof data === 'object' && data !== null) {
      const flowData = data as RegistrationFlow;
      const messages = getErrorMessages(flowData.ui);
      if (messages.length > 0) {
        // Log all error messages
        console.error('Registration flow errors:', messages);
        throw new Error(messages.map(m => m.text).join('; '));
      }
    }
    
    if (isKratosError(data)) {
      const errorMsg = extractErrorMessage(data, 'ui' in data ? (data as unknown as RegistrationFlow).ui : undefined);
      throw new Error(errorMsg);
    }
    
    throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
  }

  return data as RegistrationResponse;
}

/**
 * Ends the current browser session via the logout flow.
 */
export async function logout(): Promise<void> {
  // Step 1: Get logout flow
  const flowResponse = await fetch(`${KRATOS_PUBLIC_URL}/self-service/logout/browser`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  // 401 means no active session - that's fine
  if (flowResponse.status === 401) {
    return;
  }

  if (!flowResponse.ok) {
    throw new Error('Failed to initiate logout flow');
  }

  const logoutFlow: LogoutFlow = await flowResponse.json();
  
  if (!logoutFlow.logout_token) {
    throw new Error('No logout token in logout flow');
  }

  // Step 2: call /self-service/logout?token=<logout_token> which returns 204 on success
  const logoutResponse = await fetch(
    `${KRATOS_PUBLIC_URL}/self-service/logout?token=${logoutFlow.logout_token}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  // 204 or 401 both mean success (no session or already logged out)
  if (logoutResponse.status === 204 || logoutResponse.status === 401) {
    return;
  }

  if (!logoutResponse.ok) {
    throw new Error('Logout failed');
  }
}

// ============================================================================
// Verification Flow Functions
// ============================================================================

/**
 * Starts a browser verification flow.
 */
export async function initiateVerificationFlow(options?: {
  return_to?: string;
}): Promise<VerificationFlow> {
  const params = new URLSearchParams();
  if (options?.return_to) {
    params.append('return_to', options.return_to);
  }

  const url = `${KRATOS_PUBLIC_URL}/self-service/verification/browser${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error as KratosError));
  }

  return await response.json();
}

/**
 * Loads a verification flow by id.
 */
export async function getVerificationFlow(flowId: string): Promise<VerificationFlow> {
  const response = await fetch(
    `${KRATOS_PUBLIC_URL}/self-service/verification/flows?id=${flowId}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error as KratosError));
  }

  return await response.json();
}

/**
 * Submits verification data to Kratos.
 */
export async function submitVerification(
  flow: VerificationFlow,
  email?: string,
  token?: string,
  method: string = 'link'
): Promise<void> {
  const csrfToken = extractCSRFToken(flow.ui);
  if (!csrfToken) {
    throw new Error('CSRF token not found in flow');
  }

  // Build URL with token if provided (for email link verification)
  let url = `${KRATOS_PUBLIC_URL}/self-service/verification?flow=${flow.id}`;
  if (token) {
    url += `&token=${encodeURIComponent(token)}`;
  }

  const requestBody: Record<string, unknown> = {
    method: method,
    csrf_token: csrfToken,
  };

  if (email) {
    requestBody.email = email.trim();
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    if (isKratosError(data)) {
      throw new Error(extractErrorMessage(data, 'ui' in data ? (data as unknown as VerificationFlow).ui : undefined));
    }
    if ('ui' in data && typeof data === 'object' && data !== null) {
      const flowData = data as VerificationFlow;
      const messages = getErrorMessages(flowData.ui);
      if (messages.length > 0) {
        throw new Error(messages[0].text);
      }
    }
    throw new Error('Verification failed');
  }
}

// ============================================================================
// Recovery Flow Functions
// ============================================================================

/**
 * Starts a browser recovery flow.
 */
export async function initiateRecoveryFlow(options?: {
  return_to?: string;
}): Promise<RecoveryFlow> {
  const params = new URLSearchParams();
  if (options?.return_to) {
    params.append('return_to', options.return_to);
  }

  const url = `${KRATOS_PUBLIC_URL}/self-service/recovery/browser${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error as KratosError));
  }

  return await response.json();
}

/**
 * Loads a recovery flow by id.
 */
export async function getRecoveryFlow(flowId: string): Promise<RecoveryFlow> {
  const response = await fetch(
    `${KRATOS_PUBLIC_URL}/self-service/recovery/flows?id=${flowId}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error as KratosError));
  }

  return await response.json();
}

/**
 * Sends a recovery request for the supplied email.
 */
export async function submitRecovery(
  flow: RecoveryFlow,
  email: string,
  method: string = 'link'
): Promise<RecoveryFlow> {
  const csrfToken = extractCSRFToken(flow.ui);
  if (!csrfToken) {
    throw new Error('CSRF token not found in flow');
  }

  const requestBody = {
    method: method,
    email: email.trim(),
    csrf_token: csrfToken,
  };

  const response = await fetch(`${KRATOS_PUBLIC_URL}/self-service/recovery?flow=${flow.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    if (isKratosError(data)) {
      throw new Error(extractErrorMessage(data, 'ui' in data ? (data as unknown as RecoveryFlow).ui : undefined));
    }
    if ('ui' in data && typeof data === 'object' && data !== null) {
      const flowData = data as RecoveryFlow;
      const messages = getErrorMessages(flowData.ui);
      if (messages.length > 0) {
        throw new Error(messages[0].text);
      }
    }
    throw new Error('Recovery failed');
  }

  return data as RecoveryFlow;
}

/**
 * Completes recovery by setting a new password.
 */
export async function submitRecoveryWithPassword(
  flow: RecoveryFlow,
  token: string,
  newPassword: string
): Promise<void> {
  const csrfToken = extractCSRFToken(flow.ui);
  if (!csrfToken) {
    throw new Error('CSRF token not found in flow');
  }

  // Token should be in URL query parameter according to OpenAPI spec
  const url = `${KRATOS_PUBLIC_URL}/self-service/recovery?flow=${flow.id}&token=${encodeURIComponent(token)}`;

  const requestBody = {
    method: 'link_recovery',
    password: newPassword,
    csrf_token: csrfToken,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    if (isKratosError(data)) {
      throw new Error(extractErrorMessage(data, 'ui' in data ? (data as unknown as RecoveryFlow).ui : undefined));
    }
    if ('ui' in data && typeof data === 'object' && data !== null) {
      const flowData = data as RecoveryFlow;
      const messages = getErrorMessages(flowData.ui);
      if (messages.length > 0) {
        throw new Error(messages[0].text);
      }
    }
    throw new Error('Password reset failed');
  }
}

// ============================================================================
// Settings Flow Functions
// ============================================================================

/**
 * Starts a browser settings flow (requires an active session).
 */
export async function initiateSettingsFlow(options?: {
  return_to?: string;
}): Promise<SettingsFlow> {
  const params = new URLSearchParams();
  if (options?.return_to) {
    params.append('return_to', options.return_to);
  }

  const url = `${KRATOS_PUBLIC_URL}/self-service/settings/browser${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error as KratosError));
  }

  return await response.json();
}

/**
 * Loads a settings flow by id (requires an active session).
 */
export async function getSettingsFlow(flowId: string): Promise<SettingsFlow> {
  const response = await fetch(
    `${KRATOS_PUBLIC_URL}/self-service/settings/flows?id=${flowId}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error as KratosError));
  }

  return await response.json();
}

/**
 * Updates identity traits during the settings flow.
 */
export async function updateProfile(
  flow: SettingsFlow,
  traits: IdentityTraits
): Promise<SettingsFlow> {
  const csrfToken = extractCSRFToken(flow.ui);
  if (!csrfToken) {
    throw new Error('CSRF token not found in flow');
  }

  const requestBody = {
    method: 'profile',
    csrf_token: csrfToken,
    traits: traits,
  };

  const response = await fetch(`${KRATOS_PUBLIC_URL}/self-service/settings?flow=${flow.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    if (isKratosError(data)) {
      throw new Error(extractErrorMessage(data, 'ui' in data ? (data as unknown as SettingsFlow).ui : undefined));
    }
    if ('ui' in data && typeof data === 'object' && data !== null) {
      const flowData = data as SettingsFlow;
      const messages = getErrorMessages(flowData.ui);
      if (messages.length > 0) {
        throw new Error(messages[0].text);
      }
    }
    throw new Error('Profile update failed');
  }

  return data as SettingsFlow;
}

/**
 * Updates the password during the settings flow.
 */
export async function changePassword(
  flow: SettingsFlow,
  password: string
): Promise<SettingsFlow> {
  const csrfToken = extractCSRFToken(flow.ui);
  if (!csrfToken) {
    throw new Error('CSRF token not found in flow');
  }

  const requestBody = {
    method: 'password',
    csrf_token: csrfToken,
    password: password,
  };

  const response = await fetch(`${KRATOS_PUBLIC_URL}/self-service/settings?flow=${flow.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    if (isKratosError(data)) {
      throw new Error(extractErrorMessage(data, 'ui' in data ? (data as unknown as SettingsFlow).ui : undefined));
    }
    if ('ui' in data && typeof data === 'object' && data !== null) {
      const flowData = data as SettingsFlow;
      const messages = getErrorMessages(flowData.ui);
      if (messages.length > 0) {
        throw new Error(messages[0].text);
      }
    }
    throw new Error('Password change failed');
  }

  return data as SettingsFlow;
}

// Re-export types for convenience
export type { Session as KratosSession };
