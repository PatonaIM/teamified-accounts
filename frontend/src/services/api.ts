/**
 * Centralized API Client
 * 
 * This file re-exports the properly configured axios instance from authService.
 * All services should import from this file to ensure consistent token handling,
 * refresh logic, and request/response interceptors.
 * 
 * DO NOT create new axios instances. Always use this centralized client.
 */

import api from './authService';

export default api;
