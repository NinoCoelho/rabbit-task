export const encodeBoard = (board) => {
  const jsonString = JSON.stringify(board);
  return btoa(encodeURIComponent(jsonString));
};

export const decodeBoard = (encodedBoard) => {
  try {
    const jsonString = decodeURIComponent(atob(encodedBoard));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decoding board:', error);
    return null;
  }
};

export const getBoardFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const encodedBoard = params.get('board');
  if (!encodedBoard) return null;
  return decodeBoard(encodedBoard);
}; 