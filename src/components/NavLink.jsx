import React from 'react';
import styled from 'styled-components';

const StyledLink = styled.a`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  color: #444;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  margin-left: 16px;

  &:hover {
    background: #f8f9fa;
    border-color: #999;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export default StyledLink; 