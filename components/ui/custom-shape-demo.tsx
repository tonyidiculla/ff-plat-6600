import React from 'react';
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CardTemplate, ButtonTemplate, createComponentVariants } from './component-template';

// Example: Extending existing templates with new shapes
const extendedCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      variant: {
        default: "border-border",
        medical: "border-primary/20 bg-gradient-to-br from-card to-primary/5",
        elevated: "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
      },
      shape: {
        // Original shapes
        rounded: "rounded-lg",
        square: "rounded-none",
        pill: "rounded-full",
        large: "rounded-xl",
        // NEW custom shapes
        hexagon: "clip-path-hexagon", // Custom CSS class needed
        diamond: "rotate-45 transform", 
        asymmetric: "rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm",
        organic: "rounded-tl-[2rem] rounded-tr-[1rem] rounded-bl-[1rem] rounded-br-[2rem]",
        notched: "rounded-lg before:content-[''] before:absolute before:top-0 before:right-4 before:w-4 before:h-4 before:bg-background before:rotate-45 before:-mt-2 relative",
        beveled: "rounded-none border-8 border-double",
        scalloped: "rounded-full before:content-[''] before:absolute before:inset-2 before:rounded-full before:border-2 before:border-dashed before:border-primary/30 relative",
      },
      spacing: {
        none: "p-0",
        tight: "p-2",
        normal: "p-4",
        loose: "p-6",
        relaxed: "p-8",
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      shape: "rounded",
      spacing: "normal",
    },
  }
);

// Custom button with new shapes
const customButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        medical: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
      },
      shape: {
        // Original shapes
        default: "rounded-md",
        rounded: "rounded-lg",
        pill: "rounded-full",
        square: "rounded-none",
        // NEW custom shapes
        arrow: "rounded-md relative after:content-[''] after:absolute after:right-[-8px] after:top-1/2 after:-translate-y-1/2 after:border-l-8 after:border-l-primary after:border-t-4 after:border-b-4 after:border-t-transparent after:border-b-transparent",
        tab: "rounded-t-lg rounded-b-none border-b-0",
        shield: "rounded-full rounded-b-[50%]",
        house: "rounded-md relative before:content-[''] before:absolute before:top-[-8px] before:left-1/2 before:-translate-x-1/2 before:border-l-4 before:border-r-4 before:border-b-8 before:border-l-transparent before:border-r-transparent before:border-b-primary",
        wave: "rounded-[100px_30px_100px_30px]",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "default",
    },
  }
);

// Create extended components using new variants
const ExtendedCard = React.forwardRef<HTMLDivElement, any>(
  ({ className, size, variant, shape, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(extendedCardVariants({ size, variant, shape, spacing }), className)}
      {...props}
    />
  )
);

const CustomButton = React.forwardRef<HTMLButtonElement, any>(
  ({ className, variant, size, shape, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(customButtonVariants({ variant, size, shape }), className)}
      {...props}
    />
  )
);

export const CustomShapeDemo = () => {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Custom Shapes Demo</h2>
        <p className="text-muted-foreground mb-6">
          Examples of how to create and customize component shapes beyond the defaults.
        </p>
      </div>

      {/* Extended Card Shapes */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Extended Card Shapes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ExtendedCard variant="medical" shape="asymmetric" size="md">
            <h4 className="font-semibold">Asymmetric</h4>
            <p className="text-sm text-muted-foreground">Unique corner styling</p>
          </ExtendedCard>
          
          <ExtendedCard variant="elevated" shape="organic" size="md">
            <h4 className="font-semibold">Organic</h4>
            <p className="text-sm text-muted-foreground">Natural flowing shape</p>
          </ExtendedCard>
          
          <ExtendedCard variant="default" shape="beveled" size="md">
            <h4 className="font-semibold">Beveled</h4>
            <p className="text-sm text-muted-foreground">Double border effect</p>
          </ExtendedCard>
          
          <ExtendedCard variant="medical" shape="scalloped" size="md">
            <h4 className="font-semibold">Scalloped</h4>
            <p className="text-sm text-muted-foreground">Decorative border</p>
          </ExtendedCard>
        </div>
      </section>

      {/* Custom Button Shapes */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Custom Button Shapes</h3>
        <div className="flex flex-wrap gap-4">
          <CustomButton variant="medical" shape="arrow" size="md">
            Next Step
          </CustomButton>
          
          <CustomButton variant="default" shape="tab" size="md">
            Tab Button
          </CustomButton>
          
          <CustomButton variant="medical" shape="shield" size="lg">
            Secure
          </CustomButton>
          
          <CustomButton variant="default" shape="wave" size="md">
            Wave Style
          </CustomButton>
        </div>
      </section>

      {/* How to Create Custom Shapes */}
      <section>
        <h3 className="text-xl font-semibold mb-4">How to Create Your Own Shapes</h3>
        <ExtendedCard variant="elevated" size="lg" className="font-mono text-sm">
          <div className="space-y-4">
            <div>
              <div className="text-success font-bold mb-2">1. Extend the variants object:</div>
              <div className="bg-muted p-3 rounded">
                {`shape: {
  myCustomShape: "rounded-tl-3xl rounded-br-3xl border-4 border-dashed",
  triangle: "clip-path-triangle", // requires custom CSS
  star: "clip-path-star", // requires custom CSS
}`}
              </div>
            </div>
            
            <div>
              <div className="text-success font-bold mb-2">2. Use with your components:</div>
              <div className="bg-muted p-3 rounded">
                {`<CardTemplate shape="myCustomShape" variant="medical">
  Custom shaped card
</CardTemplate>`}
              </div>
            </div>
            
            <div>
              <div className="text-success font-bold mb-2">3. Add custom CSS for complex shapes:</div>
              <div className="bg-muted p-3 rounded">
                {`.clip-path-triangle {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.clip-path-star {
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}`}
              </div>
            </div>
          </div>
        </ExtendedCard>
      </section>

      {/* Live Shape Editor */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Shape Variations Available</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {[
            'rounded', 'square', 'pill', 'large',
            'asymmetric', 'organic', 'beveled', 'scalloped',
            'arrow', 'tab', 'shield', 'wave'
          ].map((shape) => (
            <div key={shape} className="p-2 bg-secondary rounded text-center">
              {shape}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};