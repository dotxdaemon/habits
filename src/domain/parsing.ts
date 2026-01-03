/**
 * Parsing logic for quick-add item input
 *
 * Supported formats:
 * - "2 milk"
 * - "milk 2"
 * - "2x milk"
 * - "milk x2"
 * - "1.5 lb chicken"
 * - "3 apples"
 * - "apples 3"
 * - "apples (honeycrisp) 6"
 *
 * Goal: Extract quantity, unit, and item name without losing any user input
 */

export interface ParsedItem {
  name: string; // canonical name (trimmed)
  nameOriginal: string; // raw user input
  quantity?: number;
  unit?: string; // normalized
}

const KNOWN_UNITS = ['lb', 'lbs', 'oz', 'g', 'kg', 'ct', 'pcs', 'pc', 'l', 'ml', 'gal', 'qt'];

// Normalize units to canonical form
const UNIT_NORMALIZATION: Record<string, string> = {
  'lbs': 'lb',
  'pound': 'lb',
  'pounds': 'lb',
  'ounce': 'oz',
  'ounces': 'oz',
  'gram': 'g',
  'grams': 'g',
  'kilogram': 'kg',
  'kilograms': 'kg',
  'count': 'ct',
  'piece': 'pc',
  'pieces': 'pcs',
  'liter': 'l',
  'liters': 'l',
  'milliliter': 'ml',
  'milliliters': 'ml',
  'gallon': 'gal',
  'gallons': 'gal',
  'quart': 'qt',
  'quarts': 'qt',
};

function normalizeUnit(unit: string): string {
  const lower = unit.toLowerCase().trim();
  return UNIT_NORMALIZATION[lower] || lower;
}

function isNumberString(s: string): boolean {
  return /^(\d+\.?\d*|\.\d+)$/.test(s);
}

export function parseItemInput(input: string): ParsedItem {
  const original = input.trim();
  if (!original) {
    return { name: '', nameOriginal: original };
  }

  let quantity: number | undefined;
  let unit: string | undefined;
  let nameParts: string[] = [];

  // Tokenize the input
  const tokens = original.split(/\s+/);

  let i = 0;

  // Check if first token is a number (e.g., "2 milk", "1.5 lb chicken")
  if (i < tokens.length && isNumberString(tokens[i])) {
    quantity = parseFloat(tokens[i]);
    i++;

    // Check if next token is a unit
    if (i < tokens.length && isUnit(tokens[i])) {
      unit = normalizeUnit(tokens[i]);
      i++;
    }
  }
  // Check for "x" multiplier at start (e.g., "2x milk")
  else if (i < tokens.length && /^\d+x$/i.test(tokens[i])) {
    quantity = parseFloat(tokens[i].slice(0, -1));
    i++;
  }

  // Collect remaining tokens as name parts
  while (i < tokens.length) {
    const token = tokens[i];

    // Check for quantity at end (e.g., "milk 2", "milk x2")
    if (i === tokens.length - 1 && isNumberString(token) && quantity === undefined) {
      quantity = parseFloat(token);
      i++;
      continue;
    }

    if (i === tokens.length - 1 && /^x?\d+$/i.test(token) && quantity === undefined) {
      quantity = parseFloat(token.replace(/^x/i, ''));
      i++;
      continue;
    }

    // Check for unit in middle or end
    if (isUnit(token) && unit === undefined) {
      unit = normalizeUnit(token);
      i++;
      continue;
    }

    // Otherwise, it's part of the name
    nameParts.push(token);
    i++;
  }

  const name = nameParts.join(' ').trim();

  return {
    name: name || original, // Fall back to original if parsing failed
    nameOriginal: original,
    quantity,
    unit,
  };
}

function isUnit(token: string): boolean {
  const lower = token.toLowerCase().trim();
  return KNOWN_UNITS.includes(lower) || lower in UNIT_NORMALIZATION;
}

/**
 * Format a parsed item for display
 */
export function formatItemDisplay(item: { quantity?: number; unit?: string; name: string }): string {
  const parts: string[] = [];

  if (item.quantity !== undefined) {
    parts.push(item.quantity.toString());
  }

  if (item.unit) {
    parts.push(item.unit);
  }

  parts.push(item.name);

  return parts.join(' ');
}

/**
 * Fuzzy match for autocomplete
 * Returns a score 0-1, with 1 being perfect match
 */
export function fuzzyMatch(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact match
  if (q === t) return 1.0;

  // Starts with
  if (t.startsWith(q)) return 0.9;

  // Contains
  if (t.includes(q)) return 0.7;

  // Check for all query chars in order
  let targetIndex = 0;
  for (const char of q) {
    const foundIndex = t.indexOf(char, targetIndex);
    if (foundIndex === -1) return 0;
    targetIndex = foundIndex + 1;
  }

  return 0.5; // Found all chars in order
}
