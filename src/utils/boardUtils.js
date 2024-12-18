import { DEFAULT_BOARD } from '../constants';

export const createEmptyBoard = (id, title) => ({
  ...DEFAULT_BOARD,
  id,
  title: title || DEFAULT_BOARD.title,
});

export const generateInitials = (name) => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// ... other utility functions 