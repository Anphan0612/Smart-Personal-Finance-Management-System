import { useEffect } from 'react';
import { Alert } from 'react-native';

/**
 * useKeyGuard Hook
 *
 * A developer tool to detect and prevent "Duplicate Key" errors in real-time.
 * It monitors a list of data and triggers a visual alert (Alert.alert)
 * in development mode if any key collisions are found.
 *
 * @param data Array of items being rendered in a list
 * @param componentName The name of the component (for logging)
 * @param idExtractor Optional function to extract the unique ID (defaults to item.id)
 */
export const useKeyGuard = (
  data: any[],
  componentName: string,
  idExtractor: (item: any) => string | number = (item) => item?.id,
) => {
  useEffect(() => {
    // Only execute in development mode to avoid any prod performance impact
    if (__DEV__ && data && Array.isArray(data) && data.length > 0) {
      const idSet = new Set<string | number>();
      const duplicates = new Set<string | number>();

      data.forEach((item, index) => {
        const id = idExtractor(item);

        if (id === undefined || id === null) {
          console.warn(
            `[KeyGuard] Item at index ${index} is missing a unique ID in component <${componentName}>.`,
          );
          return;
        }

        if (idSet.has(id)) {
          duplicates.add(id);
        }
        idSet.add(id);
      });

      if (duplicates.size > 0) {
        const dupeList = Array.from(duplicates).join('\n• ');
        const message = `Duplicate keys detected in <${componentName}>:\n• ${dupeList}`;

        console.warn(`[KeyGuard] Collision Error in ${componentName}:`, Array.from(duplicates));

        // Visual alert that forces immediate attention
        Alert.alert(
          '⚠️ Key Collision Detected',
          `${message}\n\nDuplicates in mapped lists cause unstable animations and data corruption. Replace manual IDs with IdUtility.generateId().`,
          [{ text: 'I will fix it', style: 'destructive' }],
        );
      }
    }
  }, [data, componentName]); // Re-run when data changes
};
