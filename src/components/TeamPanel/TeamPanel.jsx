import React from 'react';
import styled from 'styled-components';
import TeamMember from '../TeamMember';
import AboutBox from '../AboutBox';

const Container = styled.div`
  width: ${props => props.$isExpanded ? '250px' : '50px'};
  background: white;
  border-left: 1px solid #e1e4e8;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  class: team-panel;
`;

const Header = styled.div`
  padding: 8px;
  border-bottom: 1px solid #e1e4e8;
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isExpanded ? 'space-between' : 'center'};
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const TeamList = styled.div`
  padding: 4px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 4px;
  border-radius: 4px;
  min-height: 28px;
  
  &:hover {
    background: #f8f9fa;
  }

  span {
    flex: 1;
    font-size: 12px;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
  }
`;

const AddButton = styled.button`
  margin: 4px;
  padding: 4px 8px;
  font-size: 12px;
  width: calc(100% - 8px);
  justify-content: center;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  color: #444;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #f8f9fa;
    border-color: #999;
  }

  span {
    font-size: 14px;
    font-weight: bold;
  }
`;

/**
 * TeamPanel component that displays team members and controls
 */
const TeamPanel = ({
  isExpanded,
  onToggleExpand,
  members,
  onAddMember
}) => {
  return (
    <Container 
      $isExpanded={isExpanded}
      className="team-panel"
    >
      <Header 
        $isExpanded={isExpanded}
        onClick={onToggleExpand}
      >
        {isExpanded ? (
          <>
            <span>Team Members</span>
            <span>›</span>
          </>
        ) : (
          <span>‹</span>
        )}
      </Header>
      
      {isExpanded && (
        <TeamList>
          {members.map(member => (
            <MemberItem key={member.id}>
              <TeamMember
                member={{
                  ...member,
                  name: member.name.split(' ').map(part => 
                    part.length > 10 ? part.substring(0, 10) + '...' : part
                  ).join(' ')
                }}
                isTeamBar={true}
                size="small"
              />
              <span>{member.name}</span>
            </MemberItem>
          ))}
          <AddButton onClick={onAddMember}>
            <span>+</span> Add Member
          </AddButton>
          
          <AboutBox />
        </TeamList>
      )}
    </Container>
  );
};

export default TeamPanel; 