# @ddevkim/carousel-circular

A highly customizable 3D circular carousel component for React with built-in lightbox functionality.

## Features

- 🎡 **3D Circular Layout**: Beautiful 3D perspective with customizable radius and camera angles
- 🖱️ **Drag & Momentum**: Smooth drag interactions with physics-based momentum
- ⌨️ **Keyboard Navigation**: Arrow key support for accessibility
- 🔄 **Auto Rotation**: Optional auto-rotation with pause on hover
- 🖼️ **Lightbox Mode**: Built-in fullscreen image viewer with smooth animations
- 📱 **Touch Support**: Swipe gestures for mobile devices
- 🎨 **Highly Customizable**: Extensive configuration options for visual effects
- ♿ **Accessible**: ARIA labels and keyboard navigation support

## Installation

```bash
npm install @ddevkim/carousel-circular
# or
pnpm add @ddevkim/carousel-circular
# or
yarn add @ddevkim/carousel-circular
```

## Basic Usage

```tsx
import { CarouselCircular } from '@ddevkim/carousel-circular';

const items = [
  { id: 1, image: '/path/to/image1.jpg', alt: 'Image 1' },
  { id: 2, image: '/path/to/image2.jpg', alt: 'Image 2' },
  { id: 3, image: '/path/to/image3.jpg', alt: 'Image 3' },
];

function App() {
  return (
    <CarouselCircular
      items={items}
      geometry={{ radius: 600 }}
      itemSize={{ width: 300, height: 400 }}
    />
  );
}
```

## Lightbox Feature

Enable the built-in lightbox to view images in fullscreen:

```tsx
<CarouselCircular
  items={items}
  enableLightboxWhenClick={true}
  lightboxOptions={{
    enableKeyboardNavigation: true,
    closeOnEsc: true,
    backgroundBlur: 8,
    animationDuration: 500,
  }}
  geometry={{
    radius: 600,
    cameraAngle: 10,
    depthIntensity: 1.5,
  }}
  itemSize={{
    width: 300,
    height: 400,
  }}
/>
```

### Lightbox Features

- ✨ **Smooth Animations**: Images smoothly transition from carousel to fullscreen
- 🎯 **Click to Open**: Click any image to open in lightbox
- ⌨️ **Keyboard Controls**: Use arrow keys to navigate, ESC to close
- 📱 **Touch Gestures**: Swipe left/right on mobile devices
- 🔄 **Carousel Sync**: Lightbox navigation syncs with carousel rotation
- 🎨 **Background Blur**: Elegant blur effect on background content

## API Reference

### Props

#### Basic Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `CarouselItem[]` | **required** | Array of items to display |
| `geometry` | `GeometryConfig` | - | 3D geometry configuration |
| `itemSize` | `ItemSizeConfig` | - | Item dimensions |
| `interaction` | `InteractionConfig` | - | Drag and momentum settings |
| `autoRotateConfig` | `AutoRotateConfig` | - | Auto rotation settings |
| `visualEffect` | `VisualEffectConfig` | - | Opacity and scale effects |
| `style` | `StyleConfig` | - | CSS class names |
| `onItemClick` | `(item, index) => void` | - | Click handler |
| `ariaLabel` | `string` | `"Circular Carousel"` | ARIA label |

#### Lightbox Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableLightboxWhenClick` | `boolean` | `false` | Enable lightbox on image click |
| `lightboxOptions` | `LightboxOptions` | - | Lightbox configuration |

### LightboxOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableKeyboardNavigation` | `boolean` | `true` | Enable arrow key navigation |
| `closeOnEsc` | `boolean` | `true` | Close lightbox with ESC key |
| `backgroundBlur` | `number` | `8` | Background blur intensity (px) |
| `animationDuration` | `number` | `500` | Animation duration (ms) |

### GeometryConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `radius` | `number` | `600` | Circular layout radius (px) |
| `perspective` | `number` | `radius * 3.33` | 3D perspective depth (px) |
| `cameraAngle` | `number` | `0` | Camera tilt angle (0-30°) |
| `depthIntensity` | `number` | `0` | Z-axis depth variation (0-3) |

### ItemSizeConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | `300` | Item width (px) |
| `height` | `number` | `400` | Item height (px) |

### InteractionConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dragSensitivity` | `number` | `1.0` | Drag sensitivity multiplier |
| `enableMomentum` | `boolean` | `true` | Enable momentum physics |
| `momentumFriction` | `number` | `0.95` | Momentum friction (0-1) |

### AutoRotateConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Enable auto rotation |
| `speed` | `number` | `0.1` | Rotation speed (deg/frame) |
| `resumeDelay` | `number` | `3000` | Resume delay after interaction (ms) |

### VisualEffectConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `opacityRange` | `[number, number]` | `[0.3, 1.0]` | Min/max opacity range |
| `scaleRange` | `[number, number]` | `[0.7, 1.0]` | Min/max scale range |

## Examples

### Auto Rotation

```tsx
<CarouselCircular
  items={items}
  autoRotateConfig={{
    enabled: true,
    speed: 0.15,
    resumeDelay: 2000,
  }}
/>
```

### Custom Content

```tsx
const items = [
  {
    id: 1,
    content: (
      <div>
        <h3>Custom Card</h3>
        <p>Any React component</p>
      </div>
    ),
  },
];

<CarouselCircular items={items} />
```

### Advanced Configuration

```tsx
<CarouselCircular
  items={items}
  geometry={{
    radius: 800,
    cameraAngle: 15,
    depthIntensity: 2.0,
  }}
  itemSize={{
    width: 400,
    height: 500,
  }}
  interaction={{
    dragSensitivity: 1.5,
    enableMomentum: true,
    momentumFriction: 0.92,
  }}
  visualEffect={{
    opacityRange: [0.2, 1.0],
    scaleRange: [0.6, 1.0],
  }}
  enableLightboxWhenClick={true}
  onItemClick={(item, index) => {
    console.log('Clicked:', item, index);
  }}
/>
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers with touch support

## License

MIT

## Author

@ddevkim


