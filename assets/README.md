# Asset Guidelines

## Background Image
- Recommended size: 1920x1080 pixels
- Format: PNG (for transparency support)
- Style: Top-down view similar to the reference image
- Consider creating in layers for parallax effects

## Best Practices
1. Background should be tileable if extending beyond screen
2. Use a resolution that's high enough for desktop but optimized for performance
3. Consider breaking larger backgrounds into tiles (128x128 or 256x256) for better memory management
4. Keep file sizes optimized (use compression tools)
5. Use power-of-two textures when possible (2048x1024, 1024x1024, etc.)

## Asset Organization
- background/
  - main-background.png
  - decorative-elements/
- characters/
- ui/
