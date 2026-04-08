import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";

interface AtelierSkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  show?: boolean;
}

export const SkeletonBox = ({ width = "100%", height = 20, radius = 8, show = true }: AtelierSkeletonProps) => (
  <Skeleton
    show={show}
    width={width as any}
    height={height as any}
    radius={radius}
    colorMode="light"
    backgroundColor="#f0f2f5"
    transition={{
      type: "timing",
      duration: 1000,
    }}
  />
);

export const DashboardSkeleton = () => (
  <View style={styles.container}>
    {/* Balance Card Skeleton */}
    <View style={styles.cardSkeleton}>
      <SkeletonBox height={220} radius={24} />
    </View>

    {/* Alert Section Skeleton */}
    <View style={styles.sectionSkeleton}>
      <SkeletonBox height={80} radius={16} />
    </View>

    {/* Progress Card Skeleton */}
    <View style={styles.sectionSkeleton}>
      <SkeletonBox height={100} radius={16} />
    </View>

    {/* List Activity Skeleton */}
    <View style={styles.listHeader}>
      <SkeletonBox width={120} height={24} />
      <SkeletonBox width={60} height={20} />
    </View>
    
    <View style={styles.listItem}>
      <SkeletonBox height={70} radius={16} />
    </View>
    <View style={styles.listItem}>
      <SkeletonBox height={70} radius={16} />
    </View>
    <View style={styles.listItem}>
      <SkeletonBox height={70} radius={16} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  cardSkeleton: {
    marginBottom: 32,
  },
  sectionSkeleton: {
    marginBottom: 32,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  listItem: {
    marginBottom: 12,
  }
});
