# @ddevkim/carousel-circular-3d

> A luxury 3D circular carousel component for React with smooth animations, drag interactions, and premium visual effects.

[![npm version](https://img.shields.io/npm/v/@ddevkim/carousel-circular-3d.svg)](https://www.npmjs.com/package/@ddevkim/carousel-circular-3d)
[![npm downloads](https://img.shields.io/npm/dm/@ddevkim/carousel-circular-3d.svg)](https://www.npmjs.com/package/@ddevkim/carousel-circular-3d)
[![license](https://img.shields.io/npm/l/@ddevkim/carousel-circular-3d.svg)](LICENSE)

## ✨ Features

- 🎨 **Luxury 3D Effects** - Smooth perspective transforms, depth perception, and premium visual effects
- 🖱️ **Interactive** - Drag, touch, and momentum physics for natural interactions
- ⚡ **High Performance** - GPU-accelerated animations, 60fps on desktop, 55fps+ on mobile
- 🖼️ **Built-in Lightbox** - Full-screen image viewer with smooth transitions
- 🎯 **LQIP Support** - Progressive image loading with blur placeholders
- ⌨️ **Keyboard Navigation** - Arrow keys support for accessibility
- 📱 **Fully Responsive** - Touch-optimized for mobile devices
- 🔧 **Highly Customizable** - Extensive API for fine-tuning every aspect
- 💪 **TypeScript** - Full type safety and IntelliSense support
- 🌟 **Zero Dependencies** - Only React as peer dependency

## 🚀 Demo

**[Live Demo](https://carousel-circular.vercel.app)** - See it in action!

## 📦 Installation

```bash
# npm
npm install @ddevkim/carousel-circular-3d

# yarn
yarn add @ddevkim/carousel-circular-3d

# pnpm
pnpm add @ddevkim/carousel-circular-3d
```

## 🎯 Quick Start

```tsx
import { CarouselCircular } from "@ddevkim/carousel-circular-3d";

const items = [
  { id: 1, image: "/image1.jpg", alt: "Image 1" },
  { id: 2, image: "/image2.jpg", alt: "Image 2" },
  { id: 3, image: "/image3.jpg", alt: "Image 3" },
];

function App() {
  return (
    <CarouselCircular
      items={items}
      containerHeight={600}
      geometry={{
        radius: 900,
        cameraAngle: 12,
      }}
      visualEffect={{
        scaleRange: [0.5, 1],
        enableReflection: true,
      }}
    />
  );
}
```

## 📖 API Reference

### Props

#### Required Props

| Prop    | Type             | Description                                    |
| ------- | ---------------- | ---------------------------------------------- |
| `items` | `CarouselItem[]` | Array of items to display (max 30 recommended) |

#### 3D Geometry (`geometry`)

| Prop             | Type     | Default         | Description                                                   |
| ---------------- | -------- | --------------- | ------------------------------------------------------------- |
| `radius`         | `number` | `600`           | Circle radius in pixels                                       |
| `perspective`    | `number` | `radius * 3.33` | Perspective depth (min: `radius * 2`)                         |
| `cameraAngle`    | `number` | `0`             | Camera vertical angle (-30 to 30 degrees)                     |
| `depthIntensity` | `number` | `0`             | Individual item Z-depth variation (0-3, recommended: 1.0-2.0) |

#### Interaction (`interaction`)

| Prop               | Type      | Default | Description                    |
| ------------------ | --------- | ------- | ------------------------------ |
| `dragSensitivity`  | `number`  | `1.0`   | Drag responsiveness multiplier |
| `enableMomentum`   | `boolean` | `true`  | Enable physics-based momentum  |
| `momentumFriction` | `number`  | `0.95`  | Friction coefficient (0-1)     |

#### Auto-Rotation (`autoRotateConfig`)

| Prop          | Type      | Default | Description                                  |
| ------------- | --------- | ------- | -------------------------------------------- |
| `enabled`     | `boolean` | `false` | Enable auto-rotation                         |
| `speed`       | `number`  | `0.1`   | Rotation speed (degrees/frame)               |
| `resumeDelay` | `number`  | `3000`  | Delay before resuming after interaction (ms) |

#### Visual Effects (`visualEffect`)

| Prop               | Type               | Default      | Description                     |
| ------------------ | ------------------ | ------------ | ------------------------------- |
| `opacityRange`     | `[number, number]` | `[0.3, 1.0]` | Opacity range [min, max]        |
| `scaleRange`       | `[number, number]` | `[0.7, 1.0]` | Scale range [min, max]          |
| `enableReflection` | `boolean`          | `false`      | Enable bottom reflection effect |

#### Styling (`style`)

| Prop            | Type     | Description             |
| --------------- | -------- | ----------------------- |
| `className`     | `string` | CSS class for container |
| `itemClassName` | `string` | CSS class for each item |

#### Container

| Prop              | Type     | Default | Description                |
| ----------------- | -------- | ------- | -------------------------- |
| `containerHeight` | `number` | `600`   | Container height in pixels |

#### Lightbox

| Prop                      | Type              | Default | Description              |
| ------------------------- | ----------------- | ------- | ------------------------ |
| `enableLightboxWhenClick` | `boolean`         | `false` | Enable lightbox on click |
| `lightboxOptions`         | `LightboxOptions` | -       | Lightbox configuration   |

#### Callbacks & Accessibility

| Prop          | Type                    | Description                   |
| ------------- | ----------------------- | ----------------------------- |
| `onItemClick` | `(item, index) => void` | Callback when item is clicked |
| `ariaLabel`   | `string`                | ARIA label for screen readers |

### CarouselItem Type

```typescript
// Image-based item
type CarouselItemWithImage = {
  id: string | number;
  image: string;
  lqip?: {
    base64: string;
    width: number;
    height: number;
  };
  alt?: string;
  title?: string;
};

// Custom content item
type CarouselItemWithContent = {
  id: string | number;
  content: ReactNode;
  alt?: string;
  title?: string;
};

type CarouselItem = CarouselItemWithImage | CarouselItemWithContent;
```

## 🎨 Advanced Usage

### With LQIP (Progressive Loading)

```tsx
const items = [
  {
    id: 1,
    image: "/high-res.jpg",
    lqip: {
      base64: "iVBORw0KGgoAAAANSUhEUgAAAA...",
      width: 800,
      height: 600,
    },
    alt: "Beautiful landscape",
  },
];

<CarouselCircular items={items} />;
```

### With Lightbox

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
/>
```

### With Auto-Rotation

```tsx
<CarouselCircular
  items={items}
  autoRotateConfig={{
    enabled: true,
    speed: 0.1,
    resumeDelay: 3000,
  }}
/>
```

### Custom Content

```tsx
const items = [
  {
    id: 1,
    content: (
      <div className="custom-card">
        <h3>Custom Content</h3>
        <p>You can render anything here!</p>
      </div>
    ),
  },
];

<CarouselCircular items={items} />;
```

## 🎯 Best Practices

### Performance Tips

1. **Image Optimization**: Use optimized images (WebP, compressed JPEG)
2. **LQIP**: Include LQIP data for smooth loading experience
3. **Item Count**: Keep items under 30 for optimal performance
4. **Container Height**: Match your content size to avoid unnecessary scaling

### Visual Design Tips

1. **Radius**: Larger radius (900-1200px) creates more luxurious spacing
2. **Camera Angle**: 8-15 degrees provides subtle depth without distortion
3. **Depth Intensity**: 1.0-2.0 adds subtle Z-axis variation
4. **Scale Range**: `[0.5, 1]` creates dramatic focus effect

### Accessibility

1. Always provide `alt` text for images
2. Set meaningful `ariaLabel` for container
3. Test keyboard navigation (Arrow keys)
4. Ensure sufficient color contrast for text overlays

## 🏗️ Architecture

### Key Features

- **GPU-Accelerated**: Uses CSS `transform` and `will-change` for 60fps animations
- **Physics-Based**: Realistic momentum with configurable friction
- **Orientation Detection**: Automatically calculates item sizes based on image dimensions
- **Smart Angle Distribution**: Even spacing regardless of portrait/landscape mix
- **RAF-Based**: All animations use `requestAnimationFrame` for smooth performance

## 🤝 Contributing

Contributions are welcome! Please submit issues or pull requests to improve this component.

## 📄 License

MIT © ddevkim

## 🔗 Links

- [Live Demo](https://carousel-circular.vercel.app)
- [npm Package](https://www.npmjs.com/package/@ddevkim/carousel-circular-3d)

---

Made with ❤️ by ddevkim
