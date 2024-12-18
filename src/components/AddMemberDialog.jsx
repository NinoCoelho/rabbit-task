import React, { useState } from 'react';
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
  z-index: 1000;
`;

const DialogContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
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
  margin-top: 16px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  
  &.cancel {
    background: #f8f9fa;
    border: 1px solid #ddd;
  }
  
  &.add {
    background: #0052cc;
    color: white;
  }
`;

const AddMemberDialog = ({ onClose, onAddMember }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onAddMember(name.trim());
      setName('');
    }
  };

  return (
    <DialogOverlay onClick={onClose}>
      <DialogContainer onClick={e => e.stopPropagation()}>
        <h3>Add Team Member</h3>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter member name"
            autoFocus
          />
          <ButtonGroup>
            <Button type="button" className="cancel" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="add" disabled={!name.trim()}>
              Add Member
            </Button>
          </ButtonGroup>
        </form>
      </DialogContainer>
    </DialogOverlay>
  );
};

export default AddMemberDialog; 