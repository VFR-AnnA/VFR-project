import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PromptBar from '../PromptBar';
import { AIAssistantProvider } from '../../../contexts/AIAssistantContext';

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ text: 'AI response' }),
  })
) as jest.Mock;

// Helper function to render PromptBar with context provider
function renderPromptBar(props = {}) {
  return render(
    <AIAssistantProvider>
      <PromptBar {...props} />
    </AIAssistantProvider>
  );
}

describe('<PromptBar />', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('shows context-specific placeholder', () => {
    renderPromptBar({ context: 'body-tweak' });
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', expect.stringContaining("More waist definition"));
  });

  it('shows different placeholder for different context', () => {
    renderPromptBar({ context: 'style-suggestion' });
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', expect.stringContaining("More elegant look"));
  });

  it('calls onSubmit with input value', async () => {
    renderPromptBar();
    
    // Type in the input
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Make it more elegant' } });
    
    // Submit the form
    const form = screen.getByRole('search');
    fireEvent.submit(form);
    
    // Verify API was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/prompt', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }));
    });
    
    // Check that the input was cleared after the async operation completes
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('shows suggestions when input is focused', () => {
    renderPromptBar({ context: 'body-tweak' });
    
    // Focus the input
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    // Check that suggestions are shown
    expect(screen.getByText('More defined waistline')).toBeInTheDocument();
    expect(screen.getByText('Elegant pants style')).toBeInTheDocument();
  });

  it('fills input with suggestion when clicked', () => {
    renderPromptBar();
    
    // Focus the input to show suggestions
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    // Click a suggestion
    const suggestion = screen.getByText('More defined waistline');
    fireEvent.click(suggestion);
    
    // Check that the input was filled with the suggestion
    expect(input).toHaveValue('More defined waistline');
  });
});