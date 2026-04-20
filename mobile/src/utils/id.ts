import 'react-native-get-random-values';
import { nanoid } from 'nanoid';

/**
 * Utility for generating unique IDs and stable UI keys.
 * Part of the ID Utility System.
 */

// Standard prefixes to prevent cross-entity collisions
export const ID_PREFIX = {
  MESSAGE: 'msg',
  TRANSACTION: 'txn',
  WALLET: 'wlt',
  CATEGORY: 'cat',
  PROACTIVE_INSIGHT: 'insight',
  AI_EXTRACT: 'ext',
  AI_QUERY: 'qry',
  USER: 'user',
  ERROR: 'err',
} as const;

export type IdPrefix = typeof ID_PREFIX[keyof typeof ID_PREFIX];

/**
 * Generates a collision-resistant unique ID using nanoid.
 * Defaults to 10 characters for a good balance of speed and entropy.
 * 
 * @param prefix Optional prefix from ID_PREFIX
 * @returns A stable, unique string ID
 */
export const generateId = (prefix?: string): string => {
  const id = nanoid(10);
  return prefix ? `${prefix}-${id}` : id;
};

/**
 * Renders a stable key for React components in mapped lists.
 * This is the SOURCE OF TRUTH for keys in the UI.
 * 
 * @param type The context/entity type (e.g., 'message', 'txn')
 * @param id The unique identifier
 * @param index Optional index as a last-resort fallback
 * @returns A unique string key
 */
export const renderKey = (type: string, id: string | number, index?: number): string => {
  // Backward compatibility: Handle legacy numeric IDs or missing IDs
  const identifier = (id !== undefined && id !== null && id !== '') 
    ? id.toString() 
    : `fallback-${index ?? Math.random().toString(36).slice(2, 5)}`;
    
  // SAFETY: Always append index if available to guarantee uniqueness in mapped lists
  // This prevents React "Duplicate Key" errors even if two items share the same ID.
  const suffix = index !== undefined ? `-idx-${index}` : '';
    
  return `${type}-${identifier}${suffix}`;
};
