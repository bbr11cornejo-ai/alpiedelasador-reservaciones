// API Route para autenticación
import crypto from 'crypto';

// Hash SHA-256 de la contraseña (generado previamente)
// Contraseña original: "asador2026"
// Hash: (se genera en el servidor, NO en el código)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  passwordHash: 'c566b96c55d509ed06e0685f8a4b75a2d156226c9a8dd13534b093e8f1f7f893' // SHA-256 de "asador2026"
};

// Secret para JWT (debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-super-seguro-aqui-cambiar-en-produccion';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(username: string): string {
  const payload = {
    username,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  };
  
  // Simple JWT (en producción usar librería como jsonwebtoken)
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(token)
    .digest('hex');
  
  return `${token}.${signature}`;
}

function verifyToken(token: string): boolean {
  try {
    const [payload, signature] = token.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSignature) return false;
    
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    return data.exp > Date.now();
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Método no permitido' });
    return;
  }

  try {
    const { username, password, action, token } = req.body;

    // Acción: Login
    if (action === 'login') {
      const passwordHash = hashPassword(password);
      
      if (username === ADMIN_CREDENTIALS.username && 
          passwordHash === ADMIN_CREDENTIALS.passwordHash) {
        const authToken = generateToken(username);
        res.status(200).json({ 
          success: true, 
          token: authToken,
          message: 'Autenticación exitosa'
        });
      } else {
        res.status(401).json({ 
          success: false, 
          error: 'Credenciales incorrectas' 
        });
      }
      return;
    }

    // Acción: Verificar token
    if (action === 'verify') {
      const isValid = verifyToken(token);
      res.status(200).json({ success: true, valid: isValid });
      return;
    }

    res.status(400).json({ success: false, error: 'Acción no válida' });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
}

