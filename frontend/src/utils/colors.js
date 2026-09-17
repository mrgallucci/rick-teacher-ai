// Lista completa de cores em inglês com códigos hexadecimais
// Organizada por níveis de dificuldade

export const COLORS_DATABASE = {
  // Nível 1: Cores Básicas (10 cores)
  level1: [
    { name: 'red', hex: '#FF0000' },
    { name: 'blue', hex: '#0000FF' },
    { name: 'green', hex: '#00FF00' },
    { name: 'yellow', hex: '#FFFF00' },
    { name: 'orange', hex: '#FFA500' },
    { name: 'purple', hex: '#800080' },
    { name: 'pink', hex: '#FFC0CB' },
    { name: 'black', hex: '#000000' },
    { name: 'white', hex: '#FFFFFF' },
    { name: 'brown', hex: '#8B4513' }
  ],
  
  // Nível 2: Cores Secundárias (10 cores adicionais)
  level2: [
    { name: 'gray', hex: '#808080' },
    { name: 'silver', hex: '#C0C0C0' },
    { name: 'gold', hex: '#FFD700' },
    { name: 'cyan', hex: '#00FFFF' },
    { name: 'magenta', hex: '#FF00FF' },
    { name: 'lime', hex: '#00FF00' },
    { name: 'navy', hex: '#000080' },
    { name: 'maroon', hex: '#800000' },
    { name: 'olive', hex: '#808000' },
    { name: 'teal', hex: '#008080' }
  ],
  
  // Nível 3: Cores Exóticas (15 cores adicionais)
  level3: [
    { name: 'turquoise', hex: '#40E0D0' },
    { name: 'crimson', hex: '#DC143C' },
    { name: 'violet', hex: '#EE82EE' },
    { name: 'indigo', hex: '#4B0082' },
    { name: 'beige', hex: '#F5F5DC' },
    { name: 'salmon', hex: '#FA8072' },
    { name: 'coral', hex: '#FF7F50' },
    { name: 'khaki', hex: '#F0E68C' },
    { name: 'plum', hex: '#DDA0DD' },
    { name: 'azure', hex: '#F0FFFF' },
    { name: 'mint', hex: '#98FF98' },
    { name: 'lavender', hex: '#E6E6FA' },
    { name: 'peach', hex: '#FFDAB9' },
    { name: 'ivory', hex: '#FFFFF0' },
    { name: 'tan', hex: '#D2B48C' }
  ],
  
  // Nível 4+: Cores Avançadas (30+ cores adicionais)
  level4: [
    { name: 'amber', hex: '#FFBF00' },
    { name: 'burgundy', hex: '#800020' },
    { name: 'chartreuse', hex: '#7FFF00' },
    { name: 'copper', hex: '#B87333' },
    { name: 'jade', hex: '#00A86B' },
    { name: 'lilac', hex: '#C8A2C8' },
    { name: 'mahogany', hex: '#C04000' },
    { name: 'mustard', hex: '#FFDB58' },
    { name: 'orchid', hex: '#DA70D6' },
    { name: 'pearl', hex: '#EAE0C8' },
    { name: 'ruby', hex: '#E0115F' },
    { name: 'sapphire', hex: '#0F52BA' },
    { name: 'scarlet', hex: '#FF2400' },
    { name: 'tangerine', hex: '#F28500' },
    { name: 'aquamarine', hex: '#7FFFD4' },
    { name: 'bronze', hex: '#CD7F32' },
    { name: 'cerulean', hex: '#007BA7' },
    { name: 'emerald', hex: '#50C878' },
    { name: 'fuchsia', hex: '#FF00FF' },
    { name: 'garnet', hex: '#733635' },
    { name: 'honeydew', hex: '#F0FFF0' },
    { name: 'lemon', hex: '#FFF700' },
    { name: 'mauve', hex: '#E0B0FF' },
    { name: 'periwinkle', hex: '#CCCCFF' },
    { name: 'rose', hex: '#FF007F' },
    { name: 'sepia', hex: '#704214' },
    { name: 'sienna', hex: '#A0522D' },
    { name: 'slate', hex: '#708090' },
    { name: 'taupe', hex: '#483C32' },
    { name: 'ultramarine', hex: '#4166F5' },
    { name: 'vermillion', hex: '#E34234' },
    { name: 'wheat', hex: '#F5DEB3' }
  ]
};

/**
 * Retorna as cores disponíveis para um nível específico
 * @param {number} level - Nível do jogador
 * @returns {Array} Array de objetos de cores
 */
export const getColorsForLevel = (level) => {
  let colors = [...COLORS_DATABASE.level1];
  
  if (level >= 2) {
    colors = [...colors, ...COLORS_DATABASE.level2];
  }
  
  if (level >= 3) {
    colors = [...colors, ...COLORS_DATABASE.level3];
  }
  
  if (level >= 4) {
    colors = [...colors, ...COLORS_DATABASE.level4];
  }
  
  return colors;
};

/**
 * Retorna uma cor aleatória para o nível atual
 * @param {number} level - Nível do jogador
 * @returns {Object} Objeto com name e hex da cor
 */
export const getRandomColorForLevel = (level) => {
  const availableColors = getColorsForLevel(level);
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  return availableColors[randomIndex];
};

/**
 * Verifica se uma cor falada corresponde à cor esperada
 * @param {string} spokenColor - Cor falada pelo usuário
 * @param {string} expectedColor - Cor esperada
 * @returns {boolean} True se as cores correspondem
 */
export const checkColorMatch = (spokenColor, expectedColor) => {
  const spoken = spokenColor.toLowerCase().trim();
  const expected = expectedColor.toLowerCase().trim();
  
  // Correspondências exatas
  if (spoken === expected) return true;
  
  // Variações comuns de pronúncia
  const variations = {
    'gray': ['grey'],
    'cyan': ['sian'],
    'magenta': ['majenta'],
    'turquoise': ['turquois', 'turkoise'],
    'beige': ['baige'],
    'chartreuse': ['chartroose', 'chartruse']
  };
  
  if (variations[expected] && variations[expected].includes(spoken)) {
    return true;
  }
  
  return false;
};

/**
 * Retorna o total de cores disponíveis até um nível
 * @param {number} level - Nível do jogador
 * @returns {number} Total de cores
 */
export const getTotalColorsForLevel = (level) => {
  return getColorsForLevel(level).length;
};
