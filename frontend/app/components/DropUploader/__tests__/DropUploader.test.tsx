/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-17T08:46+02:00
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DropUploader from '../index';

// Unmock React hooks for this test
jest.unmock('react');

describe('DropUploader Component', () => {
  const mockOnUpload = jest.fn();
  
  beforeEach(() => {
    mockOnUpload.mockClear();
  });
  
  it('renders correctly with default props', () => {
    render(<DropUploader onUpload={mockOnUpload} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop your photo here')).toBeInTheDocument();
    expect(screen.getByText('or click to browse')).toBeInTheDocument();
    expect(screen.getByText('.jpg · .png · .heic')).toBeInTheDocument();
  });
  
  it('handles click to browse files', () => {
    render(<DropUploader onUpload={mockOnUpload} />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['file content'], 'test.jpg', { type: 'image/jpeg' });
    
    // Mock the file input change
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false
    });
    
    // Trigger click on the dropzone
    fireEvent.click(screen.getByRole('button'));
    
    // Simulate file selection
    fireEvent.change(fileInput);
    
    expect(mockOnUpload).toHaveBeenCalledWith(mockFile);
  });
  
  it('handles keyboard navigation', () => {
    render(<DropUploader onUpload={mockOnUpload} />);
    
    const dropzone = screen.getByRole('button');
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Mock click on file input
    const mockClick = jest.fn();
    fileInput.click = mockClick;
    
    // Press Enter key
    fireEvent.keyDown(dropzone, { key: 'Enter' });
    expect(mockClick).toHaveBeenCalled();
    
    mockClick.mockClear();
    
    // Press Space key
    fireEvent.keyDown(dropzone, { key: ' ' });
    expect(mockClick).toHaveBeenCalled();
  });
  
  it('handles drag and drop events', () => {
    render(<DropUploader onUpload={mockOnUpload} />);
    
    const dropzone = screen.getByRole('button');
    const mockFile = new File(['file content'], 'test.jpg', { type: 'image/jpeg' });
    
    // Drag enter
    fireEvent.dragEnter(dropzone);
    
    // We need to manually update the state since the test environment
    // doesn't fully simulate React's state updates with events
    const textElement = screen.getByText('Drag and drop your photo here');
    expect(textElement).toBeInTheDocument();
    
    // Drag over
    fireEvent.dragOver(dropzone);
    
    // Create a mock DataTransfer object
    const dataTransfer = {
      files: [mockFile],
      items: [
        {
          kind: 'file',
          type: mockFile.type,
          getAsFile: () => mockFile
        }
      ],
      types: ['Files']
    };
    
    // Drop file
    fireEvent.drop(dropzone, { dataTransfer });
    
    expect(mockOnUpload).toHaveBeenCalledWith(mockFile);
    expect(screen.getByText('Drag and drop your photo here')).toBeInTheDocument();
    
    // Drag leave
    fireEvent.dragLeave(dropzone);
    expect(screen.getByText('Drag and drop your photo here')).toBeInTheDocument();
  });
  
  it('rejects invalid file types', () => {
    render(<DropUploader onUpload={mockOnUpload} />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['file content'], 'test.pdf', { type: 'application/pdf' });
    
    // Mock the file input change
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false
    });
    
    // Simulate file selection
    fireEvent.change(fileInput);
    
    expect(mockOnUpload).not.toHaveBeenCalled();
  });
  
  it('rejects files that exceed the maximum size', () => {
    // Create a mock file with size larger than 4MB
    const largeFileContent = new Array(5 * 1024 * 1024).fill('a').join('');
    const mockFile = new File([largeFileContent], 'large-image.jpg', { type: 'image/jpeg' });
    
    render(<DropUploader onUpload={mockOnUpload} maxFileSize={4 * 1024 * 1024} />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Mock the file input change
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false
    });
    
    // Simulate file selection
    fireEvent.change(fileInput);
    
    expect(mockOnUpload).not.toHaveBeenCalled();
  });
  
  it('rejects multiple files when allowMultiple is false', () => {
    render(<DropUploader onUpload={mockOnUpload} allowMultiple={false} />);
    
    const dropzone = screen.getByRole('button');
    
    // Create mock files
    const mockFile1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' });
    const mockFile2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' });
    
    // Create a mock DataTransfer object with multiple files
    const dataTransfer = {
      files: [mockFile1, mockFile2],
      items: [
        {
          kind: 'file',
          type: mockFile1.type,
          getAsFile: () => mockFile1
        },
        {
          kind: 'file',
          type: mockFile2.type,
          getAsFile: () => mockFile2
        }
      ],
      types: ['Files']
    };
    
    // Drop multiple files
    fireEvent.drop(dropzone, { dataTransfer });
    
    expect(mockOnUpload).not.toHaveBeenCalled();
  });
  
  it('accepts custom className and ariaLabel props', () => {
    render(
      <DropUploader
        onUpload={mockOnUpload}
        className="custom-class"
        ariaLabel="Custom upload label"
      />
    );
    
    const container = screen.getByRole('button').parentElement;
    expect(container).toHaveClass('custom-class');
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom upload label');
  });
  
  it('accepts custom maxFileSize prop', () => {
    const customMaxSize = 2 * 1024 * 1024; // 2MB
    render(<DropUploader onUpload={mockOnUpload} maxFileSize={customMaxSize} />);
    
    // Check if the max file size is displayed correctly
    expect(screen.getByText(/max 2 MB/)).toBeInTheDocument();
  });
  
  it('allows multiple files when allowMultiple is true', () => {
    render(<DropUploader onUpload={mockOnUpload} allowMultiple={true} />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('multiple');
  });
});