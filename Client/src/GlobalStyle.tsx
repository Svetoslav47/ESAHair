import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  .slick-slider, .slick-list, .slick-track {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
  }
  body {
    overflow-x: hidden;
  }
`;

export default GlobalStyle; 