import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { HeroCarousel } from '@/components/HeroCarousel';
import { BookingCalendar } from '@/components/BookingCalendar';
import { BookingForm } from '@/components/BookingForm';
import { SocialButtons } from '@/components/SocialButtons';
import { Booking } from '@/types/booking';
import { MapPin, Phone, Mail, HelpCircle, X, Armchair, Table2, Flame, Snowflake, Refrigerator, Microwave, Volume2, Bath, Droplet, Waves, Trash2 } from 'lucide-react';
import { saveBookingToSheets, getBookingsFromSheets, deleteBookingFromSheets, markBookingAsPaid } from '@/services/googleSheets';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContractModal } from '@/components/ContractModal';
import { generateContract } from '@/services/contractGenerator';

// Sample bookings for demonstration
const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: '1',
    date: '2026-01-15',
    clientName: 'María García',
    phone: '33 1234 5678',
    reservedQuantity: 120,
    schedule: '14:00 - 22:00',
    eventType: 'Boda',
    duration: '8 horas',
    rentalCost: 45000,
    status: 'occupied',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    date: '2026-01-20',
    clientName: 'Carlos Hernández',
    phone: '33 9876 5432',
    reservedQuantity: 80,
    schedule: '10:00 - 18:00',
    eventType: 'XV Años',
    duration: '8 horas',
    rentalCost: 35000,
    status: 'reserved',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    date: '2026-02-14',
    clientName: 'Ana López',
    phone: '33 5555 1122',
    reservedQuantity: 150,
    schedule: '16:00 - 00:00',
    eventType: 'Boda',
    duration: '8 horas',
    rentalCost: 50000,
    status: 'reserved',
    createdAt: new Date().toISOString()
  }
];

const Index = () => {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false); // Por defecto NO es admin
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showIncludesModal, setShowIncludesModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractPdfUrl, setContractPdfUrl] = useState<string>('');
  const [contractClientName, setContractClientName] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Bloquear DevTools para visitantes (no admin) - DESACTIVADO TEMPORALMENTE
  // useDevToolsBlocker(isAdmin);

  // Función reutilizable para cargar reservaciones
  const loadBookings = useCallback(async () => {
    console.log('🔄 Iniciando carga de reservaciones...');
    try {
      const sheetsBookings = await getBookingsFromSheets();
      console.log('✅ Reservaciones cargadas exitosamente:', sheetsBookings.length);
      console.log('📋 Primeras 2 reservaciones:', sheetsBookings.slice(0, 2));
      setBookings(sheetsBookings);
      console.log('✅ Estado de bookings actualizado con', sheetsBookings.length, 'reservaciones');
    } catch (error: any) {
      console.error('❌ Error cargando reservaciones:', error);
      console.error('❌ Stack trace:', error.stack);
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar las reservaciones',
        variant: 'destructive',
      });
      // Mantener array vacío si hay error
      setBookings([]);
    }
  }, [toast]);

  const handleDateSelect = useCallback((date: Date) => {
    if (!isAdmin) return; // Solo admin puede seleccionar fechas
    setSelectedDate(date);
  }, [isAdmin]);

  const handleCloseForm = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await authService.login(loginData.username, loginData.password);
    
    if (result.success) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginData({ username: '', password: '' });
      toast({
        title: "✅ Sesión iniciada",
        description: "Bienvenido, Administrador",
      });
      // Recargar bookings con datos completos ahora que hay token
      await loadBookings();
    } else {
      toast({
        title: "❌ Error",
        description: result.error || "Usuario o contraseña incorrectos",
        variant: "destructive"
      });
    }
  }, [loginData, toast, loadBookings]);

  const handleLogout = useCallback(async () => {
    authService.logout();
    setIsAdmin(false);
    setSelectedDate(null);
    toast({
      title: "👋 Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    // Recargar bookings con datos filtrados (sin token)
    await loadBookings();
  }, [toast, loadBookings]);

  // Verificar token y cargar reservaciones al iniciar
  useEffect(() => {
    const initialize = async () => {
      // Primero verificar si hay token válido
      const isValid = await authService.verifyToken();
      if (isValid) {
        setIsAdmin(true);
      }
      // Luego cargar bookings (con o sin token, el backend filtra según corresponda)
      await loadBookings();
    };
    initialize();
  }, [loadBookings]);

  const handleSaveBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'> & { paymentProofFile?: File }) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    try {
      // Guardar en Google Sheets con foto en Cloudinary
      const sheetsResult = await saveBookingToSheets(newBooking, bookingData.paymentProofFile);
      
      if (sheetsResult.success) {
        // Actualizar UI después de guardar en Sheets
    setBookings(prev => {
      const filtered = prev.filter(b => b.date !== bookingData.date);
      return [...filtered, newBooking];
    });
        
        toast({
          title: "✅ Reservación guardada",
          description: bookingData.paymentProofFile 
            ? "La reservación y el comprobante se guardaron correctamente."
            : "La reservación se guardó en Google Sheets correctamente",
        });
      } else {
        toast({
          title: "❌ Error",
          description: `No se pudo guardar en Google Sheets: ${sheetsResult.error}`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error guardando reservación:', error);
      toast({
        title: "❌ Error",
        description: "Hubo un problema al guardar la reservación en Google Sheets",
        variant: "destructive"
      });
    }

    setSelectedDate(null);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      // Eliminar de Google Sheets
      const deleteResult = await deleteBookingFromSheets(bookingId);
      
      if (deleteResult.success) {
        // Actualizar UI después de eliminar
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        
        toast({
          title: "✅ Reservación eliminada",
          description: "La reservación se eliminó correctamente de Google Sheets.",
        });
        
        setSelectedDate(null);
      } else {
        toast({
          title: "❌ Error",
          description: `No se pudo eliminar: ${deleteResult.error}`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error eliminando reservación:', error);
      toast({
        title: "❌ Error",
        description: "Hubo un problema al eliminar la reservación",
        variant: "destructive"
      });
    }
  };

  const handleMarkPaid = async (bookingId: string) => {
    try {
      // Marcar como pagado en Google Sheets
      const paidResult = await markBookingAsPaid(bookingId);
      
      if (paidResult.success) {
        // Actualizar UI después de marcar como pagado
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, paid: true } : b
        ));
        
        toast({
          title: "✅ Marcado como Pagado",
          description: "La reservación se marcó como pagada correctamente.",
        });
        
        setSelectedDate(null);
      } else {
        toast({
          title: "❌ Error",
          description: `No se pudo marcar como pagado: ${paidResult.error}`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error marcando como pagado:', error);
      toast({
        title: "❌ Error",
        description: "Hubo un problema al marcar la reservación como pagada",
        variant: "destructive"
      });
    }
  };

  const handleShowContract = useCallback((booking: Booking) => {
    try {
      const pdfUrl = generateContract(booking);
      setContractPdfUrl(pdfUrl);
      setContractClientName(booking.clientName);
      setShowContractModal(true);
    } catch (error) {
      console.error('❌ Error generando contrato:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el contrato.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const existingBooking = useMemo(() => 
    selectedDate 
      ? bookings.find(b => b.date === selectedDate.toISOString().split('T')[0])
      : undefined,
    [selectedDate, bookings]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Saltar al contenido principal
      </a>

      <Header isAdmin={isAdmin} onLogout={handleLogout} />

      {/* Hero Section con Carrusel */}
      <section className="relative overflow-hidden" aria-label="Galería de imágenes">
        {/* Carrusel con contenido integrado */}
        <HeroCarousel />
      </section>

      {/* Calendar Section */}
      <section 
        id="main-content"
        className="pt-6 sm:pt-8 pb-10 sm:pb-12 md:pt-10 md:pb-16"
        aria-labelledby="calendar-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Botón ¿QUÉ INCLUYE? */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <Button
                onClick={() => setShowIncludesModal(true)}
                variant="outline"
                size="lg"
                className="gap-2 text-primary border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px] focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Ver qué incluye el servicio"
              >
                <HelpCircle className="w-5 h-5" aria-hidden="true" />
                ¿QUÉ INCLUYE?
              </Button>
            </div>

            <div className="text-center mb-6 sm:mb-10">
              <h2 
                id="calendar-heading"
                className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4"
              >
                Calendario de Disponibilidad
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Selecciona una fecha para ver su disponibilidad
              </p>
            </div>

            <BookingCalendar
              year={2026}
              bookings={bookings}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section 
        className="py-10 sm:py-12 md:py-16 bg-card"
        aria-labelledby="contact-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 
              id="contact-heading"
              className="sr-only"
            >
              Información de contacto
            </h2>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 justify-items-center">
              <div className="w-full max-w-md flex flex-col sm:flex-row sm:items-start gap-4 p-4 sm:p-6 rounded-2xl bg-background shadow-elegant animate-fade-in">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0" aria-hidden="true">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-1">Ubicación</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-3">
                    Santiago Roel 217, Burócratas del Estado
                  </p>
                  <a
                    href="https://share.google/jeCsdpjUb2j5dEPy1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block w-full max-w-[320px] mx-auto rounded-xl overflow-hidden border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Abrir ubicación en Google Maps - Santiago Roel 217, Burócratas del Estado"
                  >
                    <div className="flex items-center justify-center bg-background/60">
                      <iframe
                        title="Mapa de ubicación - Santiago Roel 217, Burócratas del Estado"
                        src="https://www.google.com/maps?q=Santiago%20Roel%20217%2C%20Bur%C3%B3cratas%20del%20Estado&output=embed"
                        className="block w-full h-32 sm:h-40"
                        loading="lazy"
                        aria-label="Mapa interactivo de la ubicación"
                      />
                    </div>
                  </a>
                </div>
              </div>

              <div className="w-full max-w-md flex flex-col items-center justify-center gap-4 p-6 sm:p-8 rounded-2xl bg-background shadow-elegant animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex items-center justify-center" aria-hidden="true">
                  <Phone className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-3">Teléfono</h3>
                  <div className="text-muted-foreground text-sm sm:text-base space-y-2">
                    <a 
                      href="tel:+528110803130" 
                      className="block hover:underline text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-lg focus:px-2 focus:py-1 min-h-[44px] flex items-center justify-center"
                      aria-label="Llamar al teléfono +52 8110803130"
                    >
                      +52 8110803130
                    </a>
                    <a 
                      href="tel:+528118166128" 
                      className="block hover:underline text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-lg focus:px-2 focus:py-1 min-h-[44px] flex items-center justify-center"
                      aria-label="Llamar al teléfono +52 8118166128"
                    >
                      +52 8118166128
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-6 sm:py-8 border-t border-border"
        role="contentinfo"
      >
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground text-xs sm:text-sm">
            <p>
              © 2026 Al Pie del Asador.{' '}
              <button 
                onClick={() => setShowLoginModal(true)}
                className="hover:text-primary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-lg focus:px-2 focus:py-1 min-h-[44px]"
                aria-label="Iniciar sesión como administrador"
              >
                Todos los derechos reservados.
              </button>
            </p>
          </div>
        </div>
      </footer>

      {/* Booking Form Modal */}
      {selectedDate && (
        <BookingForm
          selectedDate={selectedDate}
          existingBooking={existingBooking}
          onClose={handleCloseForm}
          onSave={handleSaveBooking}
          onDelete={handleDeleteBooking}
          onMarkPaid={handleMarkPaid}
          onShowContract={handleShowContract}
          isAdmin={isAdmin}
        />
      )}

      {/* Modal ¿QUÉ INCLUYE? */}
      {showIncludesModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowIncludesModal(false)}
        >
          <div 
            className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  ¿Qué Incluye la Renta?
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowIncludesModal(false)}
                className="rounded-xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Armchair className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground pt-2">
                  <strong className="text-foreground">50 sillas</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Table2 className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground pt-2">
                  <strong className="text-foreground">4 mesas</strong> con manteles de lona color beige claro
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Table2 className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground pt-2">
                  <strong className="text-foreground">1 mesa de bienvenida</strong> con mantel de lona color beige claro
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground pt-2">
                  <strong className="text-foreground">Asador</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Snowflake className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground pt-2">
                  <strong className="text-foreground">Hielera grande</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Refrigerator className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground pt-2">
                  <strong className="text-foreground">Frigobar</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Microwave className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground pt-2">
                  <strong className="text-foreground">Microondas</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Volume2 className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground pt-2">
                  <strong className="text-foreground">Bocina</strong> con cable auxiliar
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Bath className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground pt-2">
                  <strong className="text-foreground">2 baños</strong> con 1 papel de baño cada uno
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Droplet className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground pt-2">
                  <strong className="text-foreground">Jabón de manos</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground pt-2">
                  <strong className="text-foreground">2 botes de basura grandes</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Waves className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground pt-2">
                  <strong className="text-foreground">Alberca</strong> de 120 cm a 140 cm de profundidad
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Waves className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground pt-2">
                  <strong className="text-foreground">Chapoteadero</strong> de 45 cm de profundidad
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border p-6 rounded-b-2xl">
              <p className="text-center text-sm text-muted-foreground mb-4">
                <strong className="text-foreground">Horario tope de salida 11:59 pm!</strong>
              </p>
              <Button
                onClick={() => setShowIncludesModal(false)}
                variant="default"
                className="w-full"
                size="lg"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Contrato */}
      {showContractModal && contractPdfUrl && (
        <ContractModal
          pdfUrl={contractPdfUrl}
          clientName={contractClientName}
          onClose={() => setShowContractModal(false)}
        />
      )}

      {/* Modal de Login (oculto en footer) */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowLoginModal(false)}
        >
          <div 
            className="bg-card rounded-2xl shadow-lg max-w-md w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                Acceso Administrativo
              </h3>
              <p className="text-muted-foreground text-sm">
                Ingresa tus credenciales para acceder al panel
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Ingresa tu usuario"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Ingresa tu contraseña"
                  className="mt-2"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginData({ username: '', password: '' });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Iniciar Sesión
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
