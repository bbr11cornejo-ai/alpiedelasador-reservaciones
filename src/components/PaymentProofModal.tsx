import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentProofModalProps {
  imageUrl: string;
  clientName: string;
  onClose: () => void;
}

export const PaymentProofModal = ({ imageUrl, clientName, onClose }: PaymentProofModalProps) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Comprobante de Pago
            </h3>
            <p className="text-sm text-muted-foreground">{clientName}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="rounded-xl"
            >
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir en nueva pestaña"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="p-4 bg-muted/20 flex items-center justify-center overflow-auto max-h-[calc(90vh-80px)]">
          <img
            src={imageUrl}
            alt={`Comprobante de pago - ${clientName}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};


