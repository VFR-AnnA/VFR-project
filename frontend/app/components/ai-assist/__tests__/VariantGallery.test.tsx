import { render, screen, fireEvent } from '@testing-library/react';
import VariantGallery, { VariantItem } from '../VariantGallery';
import { AIAssistantProvider } from '../../../contexts/AIAssistantContext';

// Sample items for testing
const testItems: VariantItem[] = [
  { 
    id: 'a', 
    imageUrl: '/test-a.png', 
    title: 'Variant A',
    description: 'Description for A'
  },
  { 
    id: 'b', 
    imageUrl: '/test-b.png', 
    title: 'Variant B',
    description: 'Description for B'
  },
  { 
    id: 'c', 
    imageUrl: '/test-c.png', 
    title: 'Variant C',
    description: 'Description for C'
  }
];

// Helper function to render VariantGallery with context provider
function renderGallery(props = {}) {
  return render(
    <AIAssistantProvider>
      <VariantGallery items={testItems} {...props} />
    </AIAssistantProvider>
  );
}

describe('<VariantGallery />', () => {
  it('renders all variants', () => {
    renderGallery();
    
    // Check that all variants are rendered
    expect(screen.getByText('Variant A')).toBeInTheDocument();
    expect(screen.getByText('Variant B')).toBeInTheDocument();
    expect(screen.getByText('Variant C')).toBeInTheDocument();
  });

  it('fires onSelect when a variant is clicked', () => {
    const onSelect = jest.fn();
    renderGallery({ onSelect });
    
    // Click the first variant
    const firstVariant = screen.getByText('Variant A').closest('.flex-shrink-0');
    fireEvent.click(firstVariant!);
    
    // Check that onSelect was called with the correct item
    expect(onSelect).toHaveBeenCalledWith(testItems[0]);
  });

  it('shows fewer variants when personalizedRecommendations is disabled', () => {
    // Mock the AIAssistantContext to disable personalizedRecommendations
    jest.spyOn(require('../../../contexts/AIAssistantContext'), 'useAIAssistant').mockReturnValue({
      settings: {
        engine: 'openai',
        personalizedRecommendations: false,
        showSuggestions: true,
        saveHistory: true
      },
      updateSettings: jest.fn(),
      isLoading: false
    });
    
    renderGallery();
    
    // Only the first two variants should be shown
    expect(screen.getByText('Variant A')).toBeInTheDocument();
    expect(screen.getByText('Variant B')).toBeInTheDocument();
    expect(screen.queryByText('Variant C')).not.toBeInTheDocument();
    
    // Should show a message about enabling personalized recommendations
    expect(screen.getByText(/enable personalized recommendations/i)).toBeInTheDocument();
  });

  it('shows pagination dots for multiple items', () => {
    renderGallery();
    
    // There should be 3 pagination dots (one for each item)
    const paginationDots = screen.getAllByRole('button', { name: /go to variant/i });
    expect(paginationDots).toHaveLength(3);
  });

  it('changes active item when pagination dot is clicked', () => {
    renderGallery();
    
    // Click the second pagination dot
    const paginationDots = screen.getAllByRole('button', { name: /go to variant/i });
    fireEvent.click(paginationDots[1]);
    
    // The second variant should now have the active class (ring-indigo-500)
    const secondVariant = screen.getByText('Variant B').closest('.flex-shrink-0');
    expect(secondVariant).toHaveClass('ring-indigo-500');
  });
});