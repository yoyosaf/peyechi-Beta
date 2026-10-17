import React from 'react';
import {
  FileText,
  Smartphone,
  Wallet,
  Key,
  Watch,
  Heart,
  Bike,
  Package,
  LucideProps
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  categoryId: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ categoryId, className = 'w-5 h-5', ...props }) => {
  switch (categoryId) {
    case 'documents':
      return <FileText className={className} {...props} />;
    case 'electronics':
      return <Smartphone className={className} {...props} />;
    case 'wallets':
      return <Wallet className={className} {...props} />;
    case 'keys':
      return <Key className={className} {...props} />;
    case 'jewelry':
      return <Watch className={className} {...props} />;
    case 'pets':
      return <Heart className={className} {...props} />;
    case 'vehicles':
      return <Bike className={className} {...props} />;
    case 'other':
    default:
      return <Package className={className} {...props} />;
  }
};
