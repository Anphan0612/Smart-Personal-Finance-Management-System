import { View } from "react-native";
import { Check } from "lucide-react-native";
import { AtelierTypography } from "@/components/ui";
import { Colors } from "@/constants/tokens";

export function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className={`w-4 h-4 rounded-full items-center justify-center ${
          met ? "bg-green-500" : "bg-neutral-100"
        }`}
      >
        {met && <Check size={10} color="white" strokeWidth={3} />}
      </View>
      <AtelierTypography
        variant="caption"
        className={met ? "text-neutral-900" : "text-neutral-400"}
      >
        {label}
      </AtelierTypography>
    </View>
  );
}
