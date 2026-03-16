/**
 * Centralized HTTP Error Handling Utility
 * Provides robust error parsing and user-friendly messages for different HTTP status codes
 * Follows real-world practices for error handling
 */

/**
 * Error types for categorization
 */
export const ErrorType = {
  NETWORK: 'NETWORK',
  TIMEOUT: 'TIMEOUT',
  AUTH: 'AUTH',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION',
  CONFLICT: 'CONFLICT',
  SERVER: 'SERVER',
  RATE_LIMIT: 'RATE_LIMIT',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Maps HTTP status codes to error types
 */
const statusToErrorType = {
  400: ErrorType.VALIDATION,
  401: ErrorType.AUTH,
  403: ErrorType.FORBIDDEN,
  404: ErrorType.NOT_FOUND,
  409: ErrorType.CONFLICT,
  422: ErrorType.VALIDATION,
  429: ErrorType.RATE_LIMIT,
  500: ErrorType.SERVER,
  502: ErrorType.SERVER,
  503: ErrorType.SERVER,
  504: ErrorType.SERVER,
};

/**
 * Default error messages for each error type
 */
const defaultMessages = {
  [ErrorType.NETWORK]: 'Unable to connect to the server. Please check your internet connection.',
  [ErrorType.TIMEOUT]: 'The request took too long. Please try again.',
  [ErrorType.AUTH]: 'Your session has expired. Please log in again.',
  [ErrorType.FORBIDDEN]: "You don't have permission to perform this action.",
  [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorType.VALIDATION]: 'Invalid data provided. Please check your input.',
  [ErrorType.CONFLICT]: 'A conflict occurred. The resource may already exist.',
  [ErrorType.SERVER]: 'Server error. Please try again later.',
  [ErrorType.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
  [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

/**
 * Parses an axios error and returns structured error information
 * @param {Error} error - The error object from axios
 * @returns {Object} Structured error object with type, message, status, and details
 */
export function parseHttpError(error) {
  // Handle case where error is not an axios error
  if (!error) {
    return createErrorObject(ErrorType.UNKNOWN, defaultMessages[ErrorType.UNKNOWN], null);
  }

  // Check if it's an axios error with response
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    // Get the error type from status code
    const errorType = statusToErrorType[status] || ErrorType.UNKNOWN;
    
    // Try to extract message from response data
    let message = extractErrorMessage(data) || defaultMessages[errorType];
    
    // Add status code to message for debugging (but not shown to user by default)
    const details = { status, data };
    
    return createErrorObject(errorType, message, details);
  }
  
  // Check for network error (no response)
  if (error.code === 'ECONNABORTED') {
    return createErrorObject(ErrorType.TIMEOUT, defaultMessages[ErrorType.TIMEOUT], { code: error.code });
  }
  
  // Check for network errors
  if (error.message && (
    error.message.includes('Network Error') ||
    error.message.includes('net::ERR') ||
    !navigator.onLine
  )) {
    return createErrorObject(ErrorType.NETWORK, defaultMessages[ErrorType.NETWORK], { message: error.message });
  }
  
  // Handle axios cancelation
  if (error.message === 'canceled' || error.message.includes('canceled')) {
    return createErrorObject(ErrorType.UNKNOWN, 'Request was cancelled', { cancelled: true });
  }
  
  // Fallback for any other error
  return createErrorObject(
    ErrorType.UNKNOWN, 
    error.message || defaultMessages[ErrorType.UNKNOWN], 
    { message: error.message }
  );
}

/**
 * Creates a structured error object
 */
function createErrorObject(type, message, details) {
  return {
    type,
    message,
    details,
    // Helper to check if retry makes sense
    isRetryable: [ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.SERVER, ErrorType.RATE_LIMIT].includes(type),
    // Helper to check if it's an auth error that needs re-login
    needsReauth: [ErrorType.AUTH, ErrorType.FORBIDDEN].includes(type),
  };
}

/**
 * Extracts error message from various response data formats
 */
function extractErrorMessage(data) {
  if (!data) return null;
  
  // Try common error message fields
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (data.msg) return data.msg;
  if (data.errors && Array.isArray(data.errors) && data.errors[0]) {
    return typeof data.errors[0] === 'string' ? data.errors[0] : data.errors[0].message;
  }
  
  return null;
}

/**
 * Gets user-friendly title for error type
 */
export function getErrorTitle(errorType) {
  const titles = {
    [ErrorType.NETWORK]: 'Connection Error',
    [ErrorType.TIMEOUT]: 'Request Timeout',
    [ErrorType.AUTH]: 'Session Expired',
    [ErrorType.FORBIDDEN]: 'Access Denied',
    [ErrorType.NOT_FOUND]: 'Not Found',
    [ErrorType.VALIDATION]: 'Validation Error',
    [ErrorType.CONFLICT]: 'Conflict',
    [ErrorType.SERVER]: 'Server Error',
    [ErrorType.RATE_LIMIT]: 'Too Many Requests',
    [ErrorType.UNKNOWN]: 'Something Went Wrong',
  };
  
  return titles[errorType] || 'Error';
}

/**
 * Gets appropriate icon color for error type
 */
export function getErrorColor(errorType) {
  const colors = {
    [ErrorType.NETWORK]: 'blue',
    [ErrorType.TIMEOUT]: 'orange',
    [ErrorType.AUTH]: 'red',
    [ErrorType.FORBIDDEN]: 'red',
    [ErrorType.NOT_FOUND]: 'gray',
    [ErrorType.VALIDATION]: 'yellow',
    [ErrorType.CONFLICT]: 'yellow',
    [ErrorType.SERVER]: 'red',
    [ErrorType.RATE_LIMIT]: 'orange',
    [ErrorType.UNKNOWN]: 'gray',
  };
  
  return colors[errorType] || 'gray';
}

/**
 * Creates a user-friendly error message for fetch operations
 * @param {Error} error - The error from axios
 * @param {string} operation - The operation being performed (e.g., "fetch programs")
 * @returns {string} User-friendly error message
 */
export function getFetchErrorMessage(error, operation = 'load data') {
  const parsed = parseHttpError(error);
  // Use operation in context if needed for future customization
  return `${parsed.message}`;
}

/**
 * Creates a user-friendly error message for CRUD operations
 * @param {Error} error - The error from axios
 * @param {string} operation - The operation (create, update, delete)
 * @param {string} resource - The resource type (program, member, etc.)
 * @returns {string} User-friendly error message
 */
export function getOperationErrorMessage(error, operation, resource) {
  const parsed = parseHttpError(error);
  
  const operationText = {
    create: 'create',
    update: 'update',
    delete: 'delete',
  }[operation] || operation;
  
  // Custom messages for specific scenarios
  if (parsed.type === ErrorType.NOT_FOUND) {
    return `The ${resource} could not be found. It may have already been deleted.`;
  }
  
  if (parsed.type === ErrorType.CONFLICT) {
    return `Cannot ${operationText} ${resource}. There may be a conflict with existing data.`;
  }
  
  if (parsed.type === ErrorType.VALIDATION) {
    return `Cannot ${operationText} ${resource}. Please check your input.`;
  }
  
  if (parsed.type === ErrorType.AUTH || parsed.type === ErrorType.FORBIDDEN) {
    return `You are not authorized to ${operationText} this ${resource}.`;
  }
  
  if (parsed.type === ErrorType.RATE_LIMIT) {
    return `Too many requests. Please wait a moment before trying to ${operationText} again.`;
  }
  
  if (parsed.type === ErrorType.SERVER) {
    return `Server error while trying to ${operationText} ${resource}. Please try again later.`;
  }
  
  if (parsed.type === ErrorType.NETWORK) {
    return `Unable to ${operationText} ${resource}. Please check your internet connection.`;
  }
  
  return `Failed to ${operationText} ${resource}. ${parsed.message}`;
}
