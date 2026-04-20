import {
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Clapperboard,
  HeartPulse,
  Wallet,
  MoreHorizontal,
  Plane,
  Smartphone,
  Shirt,
  GraduationCap,
  Gift,
  Zap,
  Coffee,
  Stethoscope,
  Wrench,
  UtensilsCrossed,
  Package
} from 'lucide-react-native';

export const ICON_MAP: Record<string, any> = {
  'SHOPPING_BAG': ShoppingBag,
  'RESTAURANT': Utensils,
  'CAR': Car,
  'DIRECTIONS_CAR': Car,
  'HOME': Home,
  'MOVIE': Clapperboard,
  'CELEBRATION': Clapperboard,
  'HEALTH': HeartPulse,
  'WALLET': Wallet,
  'PLANE': Plane,
  'SMARTPHONE': Smartphone,
  'SHIRT': Shirt,
  'GRADUATION_CAP': GraduationCap,
  'SCHOOL': GraduationCap,
  'GIFT': Gift,
  'CARD_GIFTCARD': Gift,
  'ZAP': Zap,
  'BOLT': Zap,
  'COFFEE': Coffee,
  'PAYMENTS': Wallet,
  'WORK': Smartphone,
  'ANALYTICS': Clapperboard,
  'GROCERY': ShoppingBag,
  'SAVINGS': Wallet,
  'HOME_REPAIR': Wrench,
  'RESTAURANT_MENU': UtensilsCrossed,
  'MORE_HORIZ': Package,
};

export const getIconFromName = (iconName: string) => {
  return ICON_MAP[iconName] || MoreHorizontal;
};

export const getColorForCategory = (categoryId: string): string => {
  const colors = ['#FF9500', '#34C759', '#007AFF', '#5856D6', '#FF2D55', '#FFCC00', '#FF3B30', '#8E8E93'];
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
