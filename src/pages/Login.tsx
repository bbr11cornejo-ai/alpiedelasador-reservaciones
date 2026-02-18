import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import logoImage from '@/logo quinta.png';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login - In production, this would connect to Lovable Cloud
    setTimeout(() => {
      if (formData.email && formData.password) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido al panel de administración.",
        });
        // For demo purposes, we'll just redirect
        // In production, this would verify credentials with the backend
        navigate('/');
      } else {
        toast({
          title: "Error de autenticación",
          description: "Por favor verifica tus credenciales.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 gradient-subtle" />
      
      <div className="relative w-full max-w-md animate-scale-in">
        {/* Back Link */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Login Card */}
        <div className="bg-card rounded-2xl shadow-elegant p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="h-16 flex items-center justify-center mx-auto mb-4">
              <img 
                src={logoImage} 
                alt="Al Pie del Asador" 
                className="h-full w-auto object-contain"
              />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Al Pie del Asador
            </h1>
            <p className="text-muted-foreground mt-2">
              Panel de Administración
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4 text-primary" />
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@alpiedelasador.mx"
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-foreground">
                <Lock className="w-4 h-4 text-primary" />
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className="h-12 rounded-xl pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="hero" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Olvidaste tu contraseña?{' '}
            <button className="text-primary hover:underline">
              Recuperar acceso
            </button>
          </p>
        </div>

        {/* Security Note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Conexión segura · Solo personal autorizado
        </p>
      </div>
    </div>
  );
};

export default Login;
