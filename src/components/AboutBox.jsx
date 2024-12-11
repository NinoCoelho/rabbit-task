import React from 'react';
import styled from 'styled-components';

const AboutContainer = styled.div`
  margin-top: auto;
  padding: 12px;
  border-top: 1px solid #e1e4e8;
  font-size: 11px;
  color: #666;
  text-align: center;
`;

const DeveloperLabel = styled.div`
  font-size: 10px;
  opacity: 0.8;
`;

const DeveloperName = styled.a`
  color: #0052cc;
  text-decoration: none;
  display: block;
  margin-top: 2px;
  font-size: 12px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AboutBox = () => (
  <AboutContainer>
    <DeveloperLabel>developed by</DeveloperLabel>
    <DeveloperName 
      href="https://www.linkedin.com/in/idemir/" 
      target="_blank"
      rel="noopener noreferrer"
    >
      Idemir Coelho
    </DeveloperName>
  </AboutContainer>
);

export default AboutBox; 