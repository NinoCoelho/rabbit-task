import React from 'react';
import styled from 'styled-components';

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const DialogContainer = styled.div`
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-width: 400px;
  width: 90%;
  position: relative;
`;

const DialogTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
  padding-right: 32px;
`;

const DialogText = styled.p`
  margin: 8px 0;
  color: #666;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
`;

const ImportButton = styled.button`
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  color: #444;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    border-color: #999;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #dc3545;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }

  &:hover {
    color: #c82333;
  }
`;

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const ImportDialog = ({ data, onClose, onImport }) => {
  if (!data || !data.board) {
    console.warn('ImportDialog: No valid data provided');
    return null;
  }

  const title = data.board?.title || 'Untitled Board';

  const handleImport = (createNew) => {
    try {
      onImport(data, createNew);
    } catch (error) {
      console.error('Error during import:', error);
      alert('Failed to import board. Please try again.');
    }
  };

  return (
    <DialogOverlay>
      <DialogContainer>
        <CloseButton onClick={onClose} title="Cancel">
          <CloseIcon />
        </CloseButton>
        <DialogTitle>Import Board</DialogTitle>
        <DialogText>A board named "{title}" already exists.</DialogText>
        <DialogText>Would you like to:</DialogText>
        <ButtonGroup>
          <ImportButton onClick={() => handleImport(true)}>
            Create New Version
          </ImportButton>
          <ImportButton onClick={() => handleImport(false)}>
            Override Existing
          </ImportButton>
        </ButtonGroup>
      </DialogContainer>
    </DialogOverlay>
  );
};

export default ImportDialog; 