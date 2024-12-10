import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
`;

const Dialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  width: 90%;
  max-width: 400px;
`;

const Title = styled.h2`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #2c3e50;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: ${props => props.$primary ? '#0052cc' : 'white'};
  color: ${props => props.$primary ? 'white' : '#444'};
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${props => props.$primary ? '#0047b3' : '#f8f9fa'};
  }
`;

function SaveDialog({ onClose, onSave, onExport }) {
  return (
    <>
      <Overlay onClick={onClose} />
      <Dialog onClick={e => e.stopPropagation()}>
        <Title>Save Board</Title>
        <p>Choose how you want to save your board:</p>
        <ButtonGroup>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>
            Save to Browser
          </Button>
          <Button onClick={onExport} $primary>
            Export as File
          </Button>
        </ButtonGroup>
      </Dialog>
    </>
  );
}

export default SaveDialog; 