import React from 'react';
import { View, Dimensions } from 'react-native';
import { PieChart, LineChart } from 'react-native-gifted-charts';
import { AtelierTypography } from './AtelierTypography';
import { formatCurrency } from '../../utils/format';
import { MotiView } from 'moti';
import { BarChart2 } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

interface TopCategory {
  category: string;
  amount: number;
}

interface AtelierInsightChartProps {
  type: 'pie' | 'line';
  data: TopCategory[] | any[];
  title?: string;
  insight?: string;
}

export const AtelierInsightChart = ({ type, data, title, insight }: AtelierInsightChartProps) => {
  if (!data || data.length === 0) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="items-center py-8 bg-surface-container-lowest/50 rounded-2xl border border-dashed border-surface-container-high"
      >
        <View className="w-12 h-12 rounded-full bg-surface-container-low items-center justify-center mb-3">
          <BarChart2 size={24} color="#717785" />
        </View>
        <AtelierTypography variant="h3" className="text-[14px] text-white mb-1">
          Chưa có dữ liệu
        </AtelierTypography>
        <AtelierTypography
          variant="label"
          className="text-[11px] text-white/60 text-center px-6"
        >
          Hãy thêm giao dịch mới để Atelier AI có thể phân tích chi tiêu cho bạn nhé.
        </AtelierTypography>
      </MotiView>
    );
  }

  const renderHeader = () => {
    if (!title && !insight) return null;
    return (
      <View className="mb-4">
        {title && (
          <AtelierTypography variant="h3" className="text-[16px] font-bold text-white mb-1">
            {title}
          </AtelierTypography>
        )}
        {insight && (
          <AtelierTypography variant="body" className="text-[13px] text-white/70">
            {insight}
          </AtelierTypography>
        )}
      </View>
    );
  };

  if (type === 'pie') {
    // Colors for pie chart
    const colors = ['#005ab4', '#8b5cf6', '#ba1a1a', '#006b5f', '#bf5f00'];

    const total = data.reduce((sum, item) => sum + item.amount, 0);

    const pieData = data.map((item, index) => {
      const percentage = Math.round((item.amount / total) * 100);
      return {
        value: item.amount,
        color: colors[index % colors.length],
        text: `${percentage}%`,
        label: item.category,
      };
    });

    return (
      <View className="py-2">
        {renderHeader()}
        <View className="items-center">
          <PieChart
            data={pieData}
            donut
            radius={screenWidth * 0.2}
            innerRadius={screenWidth * 0.12}
            showText
            textColor="white"
            textSize={10}
            textBackgroundRadius={14}
            centerLabelComponent={() => {
              return (
                <View className="justify-center items-center">
                  <AtelierTypography variant="label" className="text-[10px] text-white/50">
                    Tổng chi
                  </AtelierTypography>
                  <AtelierTypography variant="h3" className="text-[12px] font-bold text-white mt-0.5">
                    {formatCurrency(total)}
                  </AtelierTypography>
                </View>
              );
            }}
          />
          <View className="flex-row flex-wrap justify-center mt-6 gap-3">
            {pieData.map((item, index) => (
              <View key={index} className="flex-row items-center">
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: item.color,
                    marginRight: 6,
                  }}
                />
                <AtelierTypography
                  variant="label"
                  className="text-[11px] font-medium text-white/80"
                >
                  {item.label}
                </AtelierTypography>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // Fallback for line chart if needed later
  return (
    <View className="py-2">
      {renderHeader()}
      <View className="items-center py-8 bg-white/5 rounded-xl border border-white/10">
        <AtelierTypography variant="body" className="text-white/60">
          Chart type "{type}" not implemented yet
        </AtelierTypography>
      </View>
    </View>
  );
};
