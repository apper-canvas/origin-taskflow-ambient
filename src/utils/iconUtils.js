import * as LucideIcons from 'lucide-react';

/**
 * Gets an icon component from Lucide icons
 * @param {string} iconName - The name of the icon to retrieve
 * @returns {function|null} - The icon component or null if not found
 */
function getIcon(iconName) {
  if (!iconName) return null;
  
  // First, check if the icon name exists directly
  if (LucideIcons[iconName]) {
    return LucideIcons[iconName];
  }

  // If not found, try with different case combinations
  const iconNameLower = iconName.toLowerCase();
  
  // Try camelCase (firstWordLowercase + NextWordsCapitalized)
  const camelCaseName = iconNameLower
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '');
  
  if (LucideIcons[camelCaseName]) {
    return LucideIcons[camelCaseName];
  }
  
  // Try PascalCase (FirstLetterCapitalizedForEachWord)
  const pascalCaseName = iconNameLower
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '');
  
  if (LucideIcons[pascalCaseName]) {
    return LucideIcons[pascalCaseName];
  }
  
  // Return a default icon or null if no matches
  return LucideIcons.HelpCircle || null;
}

export default getIcon;