import React, { useState } from 'react';
import styled from 'styled-components';
import TeamMember from './TeamMember';

const Container = styled.div`
  background: white;
  border-top: 1px solid #e1e4e8;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TeamList = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  min-height: 40px;
  padding: 4px;
  background: ${props => props.$isDraggingOver ? '#f8f9fa' : 'transparent'};
  border-radius: 4px;
  transition: background 0.2s;
`;

const AddButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px dashed #ddd;
  background: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  
  &:hover {
    border-color: #999;
    color: #444;
  }
`;

const AddMemberDialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
  margin-bottom: 16px;
`;

function TeamBar({ members, onAddMember }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      onAddMember(newMemberName.trim());
      setNewMemberName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Container>
        <TeamList>
          {members.map((member, index) => (
            <TeamMember
              key={member.id}
              member={member}
              index={index}
              isTeamBar={true}
            />
          ))}
        </TeamList>
        <AddButton onClick={() => setIsDialogOpen(true)}>+</AddButton>
      </Container>

      {isDialogOpen && (
        <>
          <Overlay onClick={() => setIsDialogOpen(false)} />
          <AddMemberDialog onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Enter member name"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                autoFocus
              />
              <button type="submit">Add Member</button>
            </form>
          </AddMemberDialog>
        </>
      )}
    </>
  );
}

export default TeamBar; 