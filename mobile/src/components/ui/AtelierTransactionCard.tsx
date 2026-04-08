import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Coffee, Tag, Calendar, Check, Edit3, CreditCard, ShoppingBag, Utensils, Home, Car, Zap, Heart, MoreHorizontal } from "lucide-react-native";
import { AtelierTypography } from "./AtelierTypography";
import { AtelierCard } from "./AtelierCard";
import { formatCurrency } from "../../utils/format";

interface TransactionData {
  amount: number;
  category: string;
  type: string;
  date: string;
  note: string;
  confidence: number;
  categoryId?: string | null;
}

interface AtelierTransactionCardProps {
  data: TransactionData;
  onConfirm?: () => void;
  onEdit?: () => void;
  variant?: "default" | "bubble";
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes("coffee") || cat.includes("uống")) return Coffee;
  if (cat.includes("ăn") || cat.includes("food")) return Utensils;
  if (cat.includes("shopping") || cat.includes("mua sắm")) return ShoppingBag;
  if (cat.includes("home") || cat.includes("nhà")) return Home;
  if (cat.includes("transport") || cat.includes("di chuyển")) return Car;
  if (cat.includes("bill") || cat.includes("hóa đơn")) return Zap;
  if (cat.includes("health") || cat.includes("sức khỏe")) return Heart;
  return Tag;
};

export const AtelierTransactionCard = ({ data, onConfirm, onEdit, variant = "default" }: AtelierTransactionCardProps) => {
  const Icon = getCategoryIcon(data.category);
  const formattedAmount = formatCurrency(data.amount);

  const isBubble = variant === "bubble";

  const Container = isBubble ? View : AtelierCard;
  const containerProps = isBubble 
    ? { className: "mt-4 pt-4 border-t border-surface-container/30" } 
    : { 
        elevation: "lowest" as const, 
        padding: "md" as const, 
        className: "mt-4 bg-surface-container/30 border border-surface-container/50" 
      };

  return (
    <Container {...containerProps}>
      {/* Header Info */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-2xl bg-tertiary-fixed flex items-center justify-center shadow-sm">
            <Icon size={22} color="#3c1400" />
          </View>
          <View>
            <AtelierTypography variant="h3" className="text-[15px] font-bold text-surface-on">
              {data.note || "Giao dịch mới"}
            </AtelierTypography>
            <AtelierTypography variant="label" className="text-[10px] text-surface-on-variant/70 uppercase tracking-widest font-bold">
              {data.type === "EXPENSE" ? "Khoản chi" : "Khoản thu"}
            </AtelierTypography>
          </View>
        </View>
        <View className="items-end">
          <AtelierTypography variant="h3" className="text-[17px] font-black text-primary">
            {formattedAmount}
          </AtelierTypography>
          <AtelierTypography variant="label" className="text-[10px] text-surface-on-variant font-semibold">
            Đang chờ
          </AtelierTypography>
        </View>
      </View>

      {/* Details Row */}
      <View className="flex-row justify-between py-4 border-y border-surface-container/40">
        <TouchableOpacity 
          className="flex-1" 
          onPress={onEdit} 
          activeOpacity={0.7}
        >
          <AtelierTypography variant="label" className="text-[9px] uppercase font-bold text-outline tracking-widest">
            Danh mục
          </AtelierTypography>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <AtelierTypography 
              variant="body" 
              className={`text-[13px] font-bold ${!data.categoryId ? "text-error" : "text-primary"}`}
            >
              {data.category || "Cần chọn"}
            </AtelierTypography>
            <Edit3 size={10} color={!data.categoryId ? "#dd3544" : "#005ab4"} />
          </View>
        </TouchableOpacity>

        <View className="flex-1 items-end">
          <AtelierTypography variant="label" className="text-[9px] uppercase font-bold text-outline tracking-widest">
            Ngày giao dịch
          </AtelierTypography>
          <AtelierTypography variant="body" className="text-[13px] font-bold text-surface-on mt-0.5">
            {data.date}
          </AtelierTypography>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 mt-5">
        <TouchableOpacity 
          onPress={onConfirm}
          activeOpacity={0.8}
          className="flex-1 py-4 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
        >
          <AtelierTypography variant="label" className="text-white text-[13px] font-black normal-case">
            Xác nhận
          </AtelierTypography>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onEdit}
          activeOpacity={0.7}
          className="flex-1 py-4 bg-white border border-surface-container/80 rounded-2xl items-center justify-center"
        >
          <AtelierTypography variant="label" className="text-surface-on text-[13px] font-bold normal-case">
            Sửa chi tiết
          </AtelierTypography>
        </TouchableOpacity>
      </View>
    </Container>
  );
};
