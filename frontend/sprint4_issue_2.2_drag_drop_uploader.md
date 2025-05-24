# Drag-and-drop uploader

## Description
Replace the current `<input type="file">` with a more user-friendly drag-and-drop upload zone for avatar images.

## Acceptance Criteria
- [x] User can drop a .jpg file onto the upload zone to update their avatar
- [x] Avatar updates without requiring a page reload
- [x] Visual feedback during the drag, hover, and upload process
- [x] Fallback for browsers that don't support drag-and-drop
- [x] Mobile-friendly touch interaction

## Implementation Details
- Implement drag events (dragenter, dragover, dragleave, drop)
- Add visual cues for drag states
- Ensure the same validation as the current file input
- Maintain accessibility for keyboard and screen reader users

## Metadata
- **Parent Issue:** Sprint 4 – UI Polish & FPS Overlay
- **Branch:** feature/drag-drop-uploader
- **Labels:** enhancement, Sprint 4