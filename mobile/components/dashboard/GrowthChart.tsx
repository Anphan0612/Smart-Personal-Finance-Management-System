import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { theme } from '../../constants/theme';

export const GrowthChart = ({ data }: { data?: any[] }) => {
  const customData = (data && data.length > 0) ? data : [
    { value: 0 }, { value: 10 }, { value: 8 }, { value: 58 }, { value: 56 }, { value: 78 }, { value: 74 }, { value: 98 }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tăng trưởng (Growth Bloom)</Text>
      <View style={styles.chartWrapper}>
        <LineChart
          areaChart
          curved
          isAnimated
          data={customData}
          hideDataPoints
          spacing={40}
          color={theme.colors.secondaryFixed}
          thickness={4}
          startFillColor={theme.colors.secondaryFixed}
          endFillColor={theme.colors.background}
          startOpacity={0.7}
          endOpacity={0.05}
          initialSpacing={0}
          noOfSections={4}
          height={180}
          yAxisColor="transparent"
          xAxisColor="transparent"
          yAxisTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
          rulesType="solid"
          rulesColor={theme.colors.surfaceContainerLow}
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: 'lightgray',
            pointerStripWidth: 2,
            pointerColor: theme.colors.primary,
            radius: 6,
            pointerLabelWidth: 80,
            pointerLabelHeight: 30,
            activatePointersOnLongPress: true,
            autoAdjustPointerLabelPosition: true,
            pointerLabelComponent: (items: any) => {
              return (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>
                    {items[0].value}
                  </Text>
                </View>
              );
            },
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.roundness.md,
    padding: 20,
    marginBottom: 20,
    ...theme.shadows.ambient,
  },
  title: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: theme.typography.display.fontFamily,
  },
  chartWrapper: {
    alignItems: 'center',
    marginLeft: -10, // Giảm margin trái vì Y axis tự tạo khoảng trống
  },
  tooltip: {
    height: 30,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(246, 250, 254, 0.9)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tooltipText: {
    color: theme.colors.onSurface, 
    fontSize: 12, 
    fontWeight: 'bold',
  }
});
