// Servicio de autenticación del frontend
const AUTH_API = '/api/auth';

export const authService = {
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const response = await fetch(AUTH_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          username,
          password,
        }),
      });

      const result = await response.json();
      
      if (result.success && result.token) {
        // Guardar token en localStorage
        localStorage.setItem('admin_token', result.token);
        return { success: true, token: result.token };
      }
      
      return { success: false, error: result.error || 'Error de autenticación' };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async verifyToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return false;

      const response = await fetch(AUTH_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          token,
        }),
      });

      const result = await response.json();
      return result.success && result.valid;
    } catch {
      return false;
    }
  },

  logout() {
    localStorage.removeItem('admin_token');
  },

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }
};

