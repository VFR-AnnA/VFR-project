import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Fab from '../Fab';
import { AIAssistantProvider } from '../../../contexts/AIAssistantContext';

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ text: 'AI response' }),
  })
) as jest.Mock;

// Helper function to render Fab with context provider
function renderFab() {
  return render(
    <AIAssistantProvider>
      <Fab />
    </AIAssistantProvider>
  );
}

describe('<Fab />', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // We're using the mock in jest.setup.js instead of directly setting NODE_ENV
    // which is read-only in TypeScript
  });

  it('renders closed by default', () => {
    renderFab();
    expect(screen.getByRole('button', { name: /open ai assistant/i })).toBeInTheDocument();
  });

  it('opens menu on click', async () => {
    renderFab();
    const user = userEvent.setup();
    
    // Find and click the FAB button
    const fabButton = screen.getByRole('button', { name: /open ai assistant/i });
    await user.click(fabButton);
    
    // Check that the menu is now in the document (not checking visibility due to animation)
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/ask me about sizes/i)).toBeInTheDocument();
  });

  it('closes when clicking outside', async () => {
    const { container } = renderFab();
    const user = userEvent.setup();
    
    // Open the menu
    const fabButton = screen.getByRole('button', { name: /open ai assistant/i });
    await user.click(fabButton);
    
    // Verify menu is open (in the document, not checking visibility due to animation)
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    
    // Click outside (on the container)
    fireEvent.click(container);
    
    // Menu should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('calls API when suggestion is clicked', async () => {
    renderFab();
    const user = userEvent.setup();
    
    // Open the menu
    const fabButton = screen.getByRole('button', { name: /open ai assistant/i });
    await user.click(fabButton);
    
    // Click a suggestion
    const suggestion = screen.getByText('What size should I choose?');
    await user.click(suggestion);
    
    // Verify API was called
    expect(global.fetch).toHaveBeenCalledWith('/api/prompt', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
      }),
    }));
  });
});