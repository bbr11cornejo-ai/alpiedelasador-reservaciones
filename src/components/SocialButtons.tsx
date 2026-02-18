import { MessageCircle, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialButtonsProps {
  whatsappLink?: string;
  facebookLink?: string;
}

export const SocialButtons = ({ 
  whatsappLink = '#', 
  facebookLink = '#' 
}: SocialButtonsProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <Button
        variant="social"
        size="lg"
        asChild
        className="flex-1 md:flex-none"
      >
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5 text-[#25D366]" />
          <span>WhatsApp</span>
        </a>
      </Button>
      
      <Button
        variant="social"
        size="lg"
        asChild
        className="flex-1 md:flex-none"
      >
        <a
          href={facebookLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <Facebook className="w-5 h-5 text-[#1877F2]" />
          <span>Facebook</span>
        </a>
      </Button>
    </div>
  );
};
