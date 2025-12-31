import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders login component on root path', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const loginTitle = screen.getByText(/Welcome to ChatChum/i);
  expect(loginTitle).toBeInTheDocument();
});