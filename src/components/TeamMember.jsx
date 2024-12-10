import React from 'react';
import styled from 'styled-components';
import { MEMBER_COLORS } from '../constants';

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  cursor: ${props => props.$isTeamBar ? 'grab' : 'default'};
  user-select: none;
  opacity: ${props => props.$isDragging ? 0.8 : 1};
  
  &:hover {
    opacity: 0.9;
  }
`;

function TeamMember({ member, index, isTeamBar = false, onDragStart }) {
  const handleDragStart = (e) => {
    if (!isTeamBar) return;
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'team-member',
      member: member
    }));
    e.dataTransfer.effectAllowed = 'copy';
    if (onDragStart) onDragStart();
  };

  return (
    <Avatar
      draggable={isTeamBar}
      onDragStart={handleDragStart}
      $color={MEMBER_COLORS[member.id % MEMBER_COLORS.length]}
      title={member.name}
      $isTeamBar={isTeamBar}
    >
      {member.initials}
    </Avatar>
  );
}

export default TeamMember; 