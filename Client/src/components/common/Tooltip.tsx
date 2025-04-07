import styled from 'styled-components';
import { useState } from 'react';

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.9);
  color: #fff;
  border: 1px solid #C19B76;
  border-radius: 4px;
  font-size: 0.875rem;
  white-space: nowrap;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
  transition: opacity 0.2s ease, visibility 0.2s ease;
  z-index: 1000;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #C19B76 transparent transparent transparent;
  }
`;

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  show: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, show }) => {
  return (
    <TooltipContainer>
      {children}
      <TooltipContent $isVisible={show}>
        {content}
      </TooltipContent>
    </TooltipContainer>
  );
};

export default Tooltip; 