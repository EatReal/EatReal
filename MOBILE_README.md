# Mobile-Optimized Eat Real Landing Page

## Overview
This implementation provides a mobile-optimized version of the Eat Real landing page with a horizontal scrolling carousel for product cards on screens under 768px width.

## Files Created/Modified

### New Files:
- `index_phoneview.html` - Standalone mobile version
- `assets/css/mobile-responsive.css` - Mobile-specific styles
- `assets/js/mobile-carousel.js` - Carousel functionality
- `MOBILE_README.md` - This documentation

### Modified Files:
- `index.html` - Updated to include mobile carousel alongside desktop layout

## Features

### Mobile Carousel (screens < 768px):
- **Horizontal scrolling** product cards
- **Touch/swipe support** for navigation
- **Dot navigation** indicators
- **Auto-advance** every 5 seconds (pauses on interaction)
- **Keyboard navigation** (arrow keys)
- **Accessibility features** (ARIA labels, screen reader support)

### Responsive Design:
- **Desktop layout preserved** - No changes to screens ≥ 768px
- **Mobile-first approach** - Optimized for touch interactions
- **Multiple breakpoints** - 480px, 768px, landscape orientation
- **High DPI support** - Crisp images on retina displays
- **Reduced motion support** - Respects user preferences

### Mobile Optimizations:
- **Reduced vertical scrolling** - Cards fit better on mobile screens
- **Touch-friendly buttons** - Larger tap targets
- **Optimized typography** - Readable text sizes
- **Efficient layout** - Better use of screen real estate

## How to Test

### Method 1: Browser Developer Tools
1. Open `index.html` in your browser
2. Open Developer Tools (F12)
3. Click the device toggle button (mobile/tablet icon)
4. Select a mobile device or set custom width to < 768px
5. The carousel should appear with swipeable cards

### Method 2: Use the Standalone Version
1. Open `index_phoneview.html` directly
2. This version shows the mobile layout regardless of screen size
3. Useful for testing mobile functionality on desktop

### Method 3: Real Mobile Device
1. Host the files on a web server
2. Access from a mobile device
3. The mobile carousel should automatically appear

## Carousel Controls

### Touch/Swipe:
- **Swipe left** - Next product
- **Swipe right** - Previous product
- **Tap dots** - Jump to specific product

### Keyboard:
- **Left arrow** - Previous product
- **Right arrow** - Next product
- **Tab + Enter** - Navigate dots

### Auto-advance:
- Automatically advances every 5 seconds
- Pauses when user interacts with carousel
- Resumes 2 seconds after interaction ends
- Pauses when page is not visible

## CSS Structure

The mobile styles use media queries to ensure desktop layout is unaffected:

```css
/* Desktop: Hide mobile carousel */
@media (min-width: 768px) {
    .mobile-products-carousel { display: none; }
}

/* Mobile: Hide desktop layout, show carousel */
@media (max-width: 767px) {
    .desktop-only { display: none !important; }
    .mobile-products-carousel { display: block; }
}
```

## JavaScript Features

- **Touch event handling** with proper passive listeners
- **Mouse event support** for desktop testing
- **Smooth animations** with CSS transitions
- **Auto-advance functionality** with pause/resume
- **Accessibility enhancements** (ARIA labels, keyboard nav)
- **Visual feedback** for touch interactions

## Browser Support

- **Modern browsers** with ES6+ support
- **Mobile browsers** (Safari, Chrome, Firefox)
- **Touch devices** with proper event handling
- **Desktop browsers** for testing (mouse events)

## Performance Considerations

- **Lightweight** - No external dependencies
- **Efficient animations** - CSS transforms only
- **Optimized images** - Proper sizing and compression
- **Minimal JavaScript** - Only essential functionality

## Future Enhancements

Potential improvements that could be added:
- **Lazy loading** for images
- **Swipe velocity detection** for better UX
- **Haptic feedback** on supported devices
- **Analytics tracking** for carousel interactions
- **A/B testing** capabilities 