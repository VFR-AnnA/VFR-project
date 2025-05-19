# v0.5.0-ui-polish Release Notes

## New Features
- FPS overlay
- Drag-&-drop uploader with visual feedback and validation
- Dark-mode & mobile layout polish
- Accessibility 100/100 maintained

## Technical Improvements
- Performance monitoring with real-time FPS display
- Enhanced mobile experience with proper safe-area handling
- System preference detection for theme
- Improved file upload experience:
  - Visual feedback for drag, hover, and rejected states
  - File size validation (4MB limit)
  - Multi-file guard
  - Mobile-friendly touch interaction
  - Keyboard and screen reader accessibility
- fix: sliders now update avatar in realtime (Body-AI MVP)

## How to Tag
```bash
git tag v0.5.0-ui-polish
git push origin v0.5.0-ui-polish
```

## Deployment Checklist
- [ ] Verify all acceptance criteria are met
- [ ] Run final accessibility tests
- [ ] Create and push tag
- [ ] Update documentation