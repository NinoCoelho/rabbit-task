import React, { useState } from 'react';
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
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
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

function AddMemberDialog({ onClose, onAddMember }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onAddMember(name.trim());
    }
  };

  return (
    <DialogOverlay onClick={onClose}>
      <DialogContent onClick={e => e.stopPropagation()}>
        <h3>Add Team Member</h3>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Enter member name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          <ButtonGroup>
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" $primary>Add Member</Button>
          </ButtonGroup>
        </form>
      </DialogContent>
    </DialogOverlay>
  );
}

export default AddMemberDialog; 