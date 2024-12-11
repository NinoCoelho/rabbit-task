import pako from 'pako';

export const encodeBoard = (board) => {
  try {
    // Convert board to JSON string
    const jsonString = JSON.stringify(board);
    
    // Convert string to Uint8Array for compression
    const uint8Array = new TextEncoder().encode(jsonString);
    
    // Compress the data
    const compressed = pako.deflate(uint8Array, { level: 9 });
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode.apply(null, compressed));
    
    // Make base64 URL safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error('Error encoding board:', error);
    return null;
  }
};

export const decodeBoard = (encodedBoard) => {
  try {
    // Restore base64 characters
    const base64 = encodedBoard.replace(/-/g, '+').replace(/_/g, '/');
    
    // Convert base64 to binary string
    const binaryString = atob(base64);
    
    // Convert binary string to Uint8Array
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    // Decompress
    const decompressed = pako.inflate(uint8Array);
    
    // Convert back to string and parse JSON
    const jsonString = new TextDecoder().decode(decompressed);
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