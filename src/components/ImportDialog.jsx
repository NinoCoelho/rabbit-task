import React from 'react';
import styled from 'styled-components';

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const DialogTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
`;

const DialogText = styled.p`
  margin: 8px 0;
  color: #666;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: ${props => props.$primary ? '#0052cc' : 'white'};
  color: ${props => props.$primary ? 'white' : '#333'};
  cursor: pointer;

  &:hover {
    background: ${props => props.$primary ? '#0047b3' : '#f8f9fa'};
  }
`;

const ImportDialog = ({ title, itemName, onCreateNew, onOverride, onCancel }) => (
  <DialogOverlay onClick={onCancel}>
    <DialogContent onClick={e => e.stopPropagation()}>
      <DialogTitle>{title}</DialogTitle>
      <DialogText>A {itemName.toLowerCase()} already exists.</DialogText>
      <DialogText>Would you like to:</DialogText>
      <ButtonGroup>
        <Button onClick={onCreateNew}>
          Create New Version
        </Button>
        <Button onClick={onOverride} $primary>
          Override Existing
        </Button>
        <Button onClick={onCancel}>
          Cancel
        </Button>
      </ButtonGroup>
    </DialogContent>
  </DialogOverlay>
);

export default ImportDialog; 