import { useState, useCallback, useMemo } from 'react';
import { X, User, Phone, Hash, Clock, PartyPopper, Timer, DollarSign, Check, Upload, Camera, Image as ImageIcon, Trash2, CheckCircle2, FileText, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Booking, BookingStatus } from '@/types/booking';
import { useToast } from '@/hooks/use-toast';
import { PaymentProofModal } from '@/components/PaymentProofModal';

interface BookingFormProps {
  selectedDate: Date;
  existingBooking?: Booking;
  onClose: () => void;
  onSave: (booking: Omit<Booking, 'id' | 'createdAt'> & { paymentProofFile?: File }) => void;
  onUpdate?: (booking: Booking & { paymentProofFile?: File }) => void;
  onDelete?: (bookingId: string) => void;
  onMarkPaid?: (bookingId: string) => void;
  onShowContract?: (booking: Booking) => void;
  isAdmin: boolean;
}

const EVENT_TYPES = [
  'Boda',
  'XV Años',
  'Bautizo',
  'Primera Comunión',
  'Cumpleaños',
  'Evento Corporativo',
  'Reunión Familiar',
  'Otro'
];

const DURATION_OPTIONS = [
  '4 horas',
  '6 horas',
  '8 horas',
  '10 horas',
  '12 horas',
  'Día completo'
];


export const BookingForm = ({ selectedDate, existingBooking, onClose, onSave, onUpdate, onDelete, onMarkPaid, onShowContract, isAdmin }: BookingFormProps) => {
  const { toast } = useToast();
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaidConfirm, setShowPaidConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    clientName: existingBooking?.clientName || '',
    phone: existingBooking?.phone || '',
    reservedQuantity: existingBooking?.reservedQuantity?.toString() || '',
    schedule: existingBooking?.schedule || '',
    eventType: existingBooking?.eventType || '',
    duration: existingBooking?.duration || '',
    rentalCost: existingBooking?.rentalCost?.toString() || '',
    status: existingBooking?.status || 'reserved' as BookingStatus
  });

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Calcular pago restante automáticamente - memoizado
  const remainingPayment = useMemo(() => {
    const rentalCost = parseFloat(formData.rentalCost) || 0;
    const reservedQuantity = parseFloat(formData.reservedQuantity) || 0;
    return rentalCost - reservedQuantity;
  }, [formData.rentalCost, formData.reservedQuantity]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.clientName || !formData.phone || !paymentProofFile) {
      toast({
        title: "Campos obligatorios faltantes",
        description: "Debes completar: Nombre del Cliente, Teléfono y Comprobante de Pago (foto).",
        variant: "destructive"
      });
      return;
    }

    // Validar campos restantes
    if (!formData.reservedQuantity || !formData.schedule || !formData.eventType || !formData.duration || !formData.rentalCost) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos del formulario.",
        variant: "destructive"
      });
      return;
    }

    onSave({
      date: selectedDate.toISOString().split('T')[0],
      clientName: formData.clientName,
      phone: formData.phone,
      reservedQuantity: parseInt(formData.reservedQuantity, 10),
      schedule: formData.schedule,
      eventType: formData.eventType,
      duration: formData.duration,
      rentalCost: parseFloat(formData.rentalCost),
      status: formData.status,
      paymentProofFile: paymentProofFile || undefined
    });
  }, [formData, paymentProofFile, selectedDate, onSave, toast]);

  const handleUpdate = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!existingBooking || !onUpdate) return;

    // Validar campos obligatorios (sin validar paymentProofFile porque ya existe)
    if (!formData.clientName || !formData.phone) {
      toast({
        title: "Campos obligatorios faltantes",
        description: "Debes completar: Nombre del Cliente y Teléfono.",
        variant: "destructive"
      });
      return;
    }

    // Validar campos restantes
    if (!formData.reservedQuantity || !formData.schedule || !formData.eventType || !formData.duration || !formData.rentalCost) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos del formulario.",
        variant: "destructive"
      });
      return;
    }

    onUpdate({
      ...existingBooking,
      date: selectedDate.toISOString().split('T')[0],
      clientName: formData.clientName,
      phone: formData.phone,
      reservedQuantity: parseInt(formData.reservedQuantity, 10),
      schedule: formData.schedule,
      eventType: formData.eventType,
      duration: formData.duration,
      rentalCost: parseFloat(formData.rentalCost),
      status: formData.status,
      paymentProofFile: paymentProofFile || undefined
    });
    
    setIsEditing(false);
  }, [formData, paymentProofFile, selectedDate, existingBooking, onUpdate, toast]);

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-card rounded-2xl shadow-lg max-w-md w-full p-6 animate-scale-in">
          <div className="text-center">
            <h3 className="font-display text-xl font-semibold mb-2">
              {formatDate(selectedDate)}
            </h3>
            <p className="text-muted-foreground mb-4">
              Para realizar una reservación, por favor contáctenos por WhatsApp o inicie sesión como administrador.
            </p>
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Si existe una reservación, mostrar detalles en lugar del formulario
  if (existingBooking) {
    // Modo de edición
    if (isEditing) {
      return (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in modal-content">
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    Editar Reservación
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {formatDate(selectedDate)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="rounded-xl">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              {/* Client Name */}
              <div className="space-y-2">
                <Label htmlFor="editClientName" className="flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4 text-primary" />
                  Nombre del Cliente *
                </Label>
                <Input
                  id="editClientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Nombre completo del cliente"
                  className="h-12 rounded-xl"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="editPhone" className="flex items-center gap-2 text-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  Teléfono *
                </Label>
                <Input
                  id="editPhone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ej: 33 1234 5678"
                  className="h-12 rounded-xl"
                />
              </div>

              {/* Reserved Quantity */}
              <div className="space-y-2">
                <Label htmlFor="editReservedQuantity" className="flex items-center gap-2 text-foreground">
                  <Hash className="w-4 h-4 text-primary" />
                  $ Monto de la separación *
                </Label>
                <Input
                  id="editReservedQuantity"
                  type="number"
                  value={formData.reservedQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, reservedQuantity: e.target.value }))}
                  placeholder="Ej: 1000"
                  className="h-12 rounded-xl"
                  min="0"
                />
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <Label htmlFor="editSchedule" className="flex items-center gap-2 text-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  Horario Acordado *
                </Label>
                <Input
                  id="editSchedule"
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                  placeholder="Ej: 14:00 - 22:00"
                  className="h-12 rounded-xl"
                />
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground">
                  <PartyPopper className="w-4 h-4 text-primary" />
                  Tipo de Evento *
                </Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Selecciona el tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground">
                  <Timer className="w-4 h-4 text-primary" />
                  Duración *
                </Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Selecciona la duración" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(duration => (
                      <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rental Cost */}
              <div className="space-y-2">
                <Label htmlFor="editRentalCost" className="flex items-center gap-2 text-foreground">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Costo de Renta (MXN) *
                </Label>
                <Input
                  id="editRentalCost"
                  type="number"
                  value={formData.rentalCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, rentalCost: e.target.value }))}
                  placeholder="Ej: 3500"
                  className="h-12 rounded-xl"
                  min="0"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground">
                  Estado de la Reservación
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as BookingStatus }))}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reserved">Reservado</SelectItem>
                    <SelectItem value="occupied">Ocupado</SelectItem>
                    <SelectItem value="free">Libre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Remaining Payment (calculated) */}
              {formData.rentalCost && formData.reservedQuantity && (
                <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary/20">
                  <Label className="text-muted-foreground text-sm block mb-2">Pago Restante</Label>
                  <p className="font-bold text-2xl text-primary">
                    ${remainingPayment.toLocaleString('es-MX')} MXN
                  </p>
                </div>
              )}

              {/* Payment Proof (optional update) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground">
                  <Upload className="w-4 h-4 text-primary" />
                  Comprobante de Pago (opcional - nuevo)
                </Label>
                
                <div className="flex gap-2">
                  <label className="flex-1 h-12 rounded-xl border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Galería</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPaymentProofFile(file);
                          toast({
                            title: "Archivo seleccionado",
                            description: file.name,
                          });
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <label className="flex-1 h-12 rounded-xl border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-center gap-2 transition-colors">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm font-medium">Cámara</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPaymentProofFile(file);
                          toast({
                            title: "Foto capturada",
                            description: file.name,
                          });
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {paymentProofFile ? (
                  <p className="text-sm text-muted-foreground">
                    Nuevo archivo: {paymentProofFile.name}
                  </p>
                ) : existingBooking.paymentProofUrl && (
                  <p className="text-sm text-green-600">
                    ✓ Ya tiene comprobante guardado
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 space-y-3">
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                >
                  <Check className="w-5 h-5" />
                  Guardar Cambios
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Modo de visualización (detalles)
    return (
      <>
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in modal-content">
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      Detalles de Reservación
                    </h3>
                    {existingBooking.paid && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Pagado
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">
                    {formatDate(selectedDate)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Botón Editar */}
                  {onUpdate && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </Button>
                  )}
                  
                  {/* Botón Marcar como Pagado */}
                  {onMarkPaid && !existingBooking.paid && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => setShowPaidConfirm(true)}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Marcar como Pagado
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Cliente</Label>
                  <p className="font-medium text-foreground">{existingBooking.clientName}</p>
                </div>
                
                {existingBooking.phone && (
                  <div>
                    <Label className="text-muted-foreground text-sm">Teléfono</Label>
                    <p className="font-medium text-foreground">{existingBooking.phone}</p>
                  </div>
                )}
              </div>

              {existingBooking.reservedQuantity && (
                <div>
                  <Label className="text-muted-foreground text-sm">$ Monto de la separación</Label>
                  <p className="font-medium text-foreground">${existingBooking.reservedQuantity}</p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground text-sm">Horario</Label>
                <p className="font-medium text-foreground">{existingBooking.schedule}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Tipo de Evento</Label>
                  <p className="font-medium text-foreground">{existingBooking.eventType}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground text-sm">Duración</Label>
                  <p className="font-medium text-foreground">{existingBooking.duration}</p>
                </div>
              </div>

              {/* Pago Restante (calculado) */}
              <div>
                <Label className="text-muted-foreground text-sm">Pago Restante</Label>
                <p className="font-medium text-foreground text-lg text-primary">
                  ${((existingBooking.rentalCost || 0) - (existingBooking.reservedQuantity || 0)).toLocaleString('es-MX')} MXN
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm">Costo de Renta</Label>
                <p className="font-medium text-foreground text-lg">${existingBooking.rentalCost.toFixed(2)} MXN</p>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm">Estado</Label>
                <p className={`font-medium inline-block px-3 py-1 rounded-lg text-sm ${
                  existingBooking.status === 'free' ? 'bg-status-free-light text-status-free' :
                  existingBooking.status === 'reserved' ? 'bg-status-reserved-light text-status-reserved' :
                  'bg-status-occupied-light text-status-occupied'
                }`}>
                  {existingBooking.status === 'free' ? 'Libre' : 
                   existingBooking.status === 'reserved' ? 'Reservado' : 'Ocupado'}
                </p>
              </div>

              {/* Payment Proof Button */}
              {existingBooking.paymentProofUrl && (
                <div>
                  <Label className="text-muted-foreground text-sm mb-2 block">Comprobante de Pago</Label>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setShowImageModal(true)}
                  >
                    <ImageIcon className="w-5 h-5" />
                    Ver Comprobante
                  </Button>
                </div>
              )}

              {/* Contract Button */}
              <div>
                <Label className="text-muted-foreground text-sm mb-2 block">Contrato de Arrendamiento</Label>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => {
                    console.log('🔵 Clic en botón Contrato');
                    if (onShowContract && existingBooking) {
                      onShowContract(existingBooking);
                    }
                  }}
                >
                  <FileText className="w-5 h-5" />
                  Contrato
                </Button>
              </div>

              <div className="pt-4 space-y-3">
                <Button onClick={onClose} variant="outline" className="w-full">
                  Cerrar
                </Button>
                
                {/* Botón Eliminar Reservación */}
                {onDelete && (
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-5 h-5" />
                    Eliminar Reservación
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && existingBooking.paymentProofUrl && (
          <PaymentProofModal
            imageUrl={existingBooking.paymentProofUrl}
            clientName={existingBooking.clientName}
            onClose={() => setShowImageModal(false)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div 
            className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div 
              className="bg-card rounded-2xl shadow-lg max-w-md w-full p-6 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    ¿Eliminar Reservación?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Esta acción eliminará permanentemente la reservación de <strong>{existingBooking.clientName}</strong> para el {formatDate(selectedDate)}. 
                    Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        if (onDelete && existingBooking.id) {
                          onDelete(existingBooking.id);
                          setShowDeleteConfirm(false);
                        }
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paid Confirmation Dialog */}
        {showPaidConfirm && (
          <div 
            className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowPaidConfirm(false)}
          >
            <div 
              className="bg-card rounded-2xl shadow-lg max-w-md w-full p-6 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    ¿Marcar como Pagado?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Se marcará la reservación de <strong>{existingBooking.clientName}</strong> como pagada completamente. 
                    Esto indica que ya se recibió el pago total.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowPaidConfirm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        if (onMarkPaid && existingBooking.id) {
                          onMarkPaid(existingBooking.id);
                          setShowPaidConfirm(false);
                        }
                      }}
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
    <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in modal-content">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Nueva Reservación
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {formatDate(selectedDate)}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName" className="flex items-center gap-2 text-foreground">
              <User className="w-4 h-4 text-primary" />
              Nombre del Cliente *
            </Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="Nombre completo del cliente"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-foreground">
              <Phone className="w-4 h-4 text-primary" />
              Teléfono *
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Ej: 33 1234 5678"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Reserved Quantity */}
          <div className="space-y-2">
            <Label htmlFor="reservedQuantity" className="flex items-center gap-2 text-foreground">
              <Hash className="w-4 h-4 text-primary" />
              $ Monto de la separación *
            </Label>
            <Input
              id="reservedQuantity"
              type="number"
              value={formData.reservedQuantity}
              onChange={(e) => setFormData(prev => ({ ...prev, reservedQuantity: e.target.value }))}
              placeholder="Ej: 1000"
              className="h-12 rounded-xl"
              min="0"
            />
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label htmlFor="schedule" className="flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              Horario Acordado *
            </Label>
            <Input
              id="schedule"
              type="text"
              value={formData.schedule}
              onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
              placeholder="Ej: 14:00 - 22:00"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-foreground">
              <PartyPopper className="w-4 h-4 text-primary" />
              Tipo de Evento *
            </Label>
            <Select
              value={formData.eventType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Selecciona el tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-foreground">
              <Timer className="w-4 h-4 text-primary" />
              Duración *
            </Label>
            <Select
              value={formData.duration}
              onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Selecciona la duración" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map(duration => (
                  <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rental Cost */}
          <div className="space-y-2">
            <Label htmlFor="rentalCost" className="flex items-center gap-2 text-foreground">
              <DollarSign className="w-4 h-4 text-primary" />
              Costo de Renta (MXN) *
            </Label>
            <Input
              id="rentalCost"
              type="number"
              value={formData.rentalCost}
              onChange={(e) => setFormData(prev => ({ ...prev, rentalCost: e.target.value }))}
              placeholder="Ej: 3500"
              className="h-12 rounded-xl"
              min="0"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-foreground">
              Estado de la Reservación
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as BookingStatus }))}
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reserved">Reservado</SelectItem>
                <SelectItem value="occupied">Ocupado</SelectItem>
                <SelectItem value="free">Libre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Remaining Payment (calculated) */}
          {formData.rentalCost && formData.reservedQuantity && (
            <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary/20">
              <Label className="text-muted-foreground text-sm block mb-2">Pago Restante</Label>
              <p className="font-bold text-2xl text-primary">
                ${remainingPayment.toLocaleString('es-MX')} MXN
              </p>
            </div>
          )}

          {/* Payment Proof */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-foreground">
              <Upload className="w-4 h-4 text-primary" />
              Comprobante de Pago
            </Label>
            
            <div className="flex gap-2">
              {/* Botón para seleccionar desde galería */}
              <label className="flex-1 h-12 rounded-xl border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-center gap-2 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Galería</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPaymentProofFile(file);
                      toast({
                        title: "Archivo seleccionado",
                        description: file.name,
                      });
                    }
                  }}
                  className="hidden"
                />
              </label>

              {/* Botón para tomar foto con cámara */}
              <label className="flex-1 h-12 rounded-xl border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-center gap-2 transition-colors">
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">Cámara</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPaymentProofFile(file);
                      toast({
                        title: "Foto capturada",
                        description: file.name,
                      });
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {paymentProofFile && (
              <p className="text-sm text-muted-foreground">
                Archivo: {paymentProofFile.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              variant="hero" 
              size="lg" 
              className="w-full"
            >
              <Check className="w-5 h-5" />
              Guardar Reservación
            </Button>
          </div>
        </form>
      </div>
    </div>
  </>
  );
};
