import { cva, type VariantProps } from "class-variance-authority"

/**
 * Helper function to create standardized component variants
 * This provides a consistent way to define size, shape, and style variants
 */

// Standard size variants that can be reused across components
export const standardSizes = {
  xs: "xs",
  sm: "sm", 
  md: "md",
  lg: "lg",
  xl: "xl",
  "2xl": "2xl",
} as const;

// Standard shape variants
export const standardShapes = {
  square: "square",
  rounded: "rounded",
  pill: "pill", 
  circle: "circle",
} as const;

// Standard spacing variants
export const standardSpacing = {
  none: "none",
  tight: "tight",
  normal: "normal", 
  loose: "loose",
  relaxed: "relaxed",
} as const;

// Builder function for creating consistent component variants
export const buildComponentVariants = (config: {
  baseStyles: string;
  variants: {
    variant?: Record<string, string>;
    size?: Record<string, string>;
    shape?: Record<string, string>;
    spacing?: Record<string, string>;
    state?: Record<string, string>;
  };
  defaultVariants?: Record<string, any>;
}) => {
  return cva(config.baseStyles, {
    variants: config.variants,
    defaultVariants: config.defaultVariants,
  });
};

// Preset configurations for common component types
export const presetConfigs = {
  // Interactive component (buttons, links)
  interactive: {
    baseStyles: "inline-flex items-center justify-center font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variants: {
      size: {
        xs: "h-6 px-2 text-xs",
        sm: "h-8 px-3 text-sm", 
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
      },
      shape: {
        square: "rounded-none",
        rounded: "rounded-md",
        pill: "rounded-full",
      }
    }
  },

  // Container component (cards, panels)
  container: {
    baseStyles: "bg-card text-card-foreground border transition-all duration-200",
    variants: {
      size: {
        sm: "p-3",
        md: "p-4", 
        lg: "p-6",
        xl: "p-8",
      },
      shape: {
        square: "rounded-none",
        rounded: "rounded-lg",
        pill: "rounded-full",
      },
      spacing: {
        none: "p-0",
        tight: "p-2",
        normal: "p-4",
        loose: "p-6",
        relaxed: "p-8",
      }
    }
  },

  // Input component (forms, fields)
  input: {
    baseStyles: "flex w-full border border-input bg-background ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    variants: {
      size: {
        sm: "h-8 px-2 py-1 text-sm",
        md: "h-10 px-3 py-2 text-sm", 
        lg: "h-12 px-4 py-3 text-base",
      },
      shape: {
        square: "rounded-none",
        rounded: "rounded-md",
        pill: "rounded-full",
      },
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-success focus-visible:ring-success", 
        warning: "border-warning focus-visible:ring-warning",
      }
    }
  },

  // Status component (badges, chips)
  status: {
    baseStyles: "inline-flex items-center font-semibold transition-colors",
    variants: {
      size: {
        xs: "px-1.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-sm",
      },
      shape: {
        square: "rounded-md",
        rounded: "rounded-lg", 
        pill: "rounded-full",
      }
    }
  }
};

// Quick variant builders using presets
export const createInteractiveVariants = (customVariants?: any, customDefaults?: any) => 
  buildComponentVariants({
    ...presetConfigs.interactive,
    variants: { ...presetConfigs.interactive.variants, ...customVariants },
    defaultVariants: { size: "md", shape: "rounded", ...customDefaults }
  });

export const createContainerVariants = (customVariants?: any, customDefaults?: any) =>
  buildComponentVariants({
    ...presetConfigs.container, 
    variants: { ...presetConfigs.container.variants, ...customVariants },
    defaultVariants: { size: "md", shape: "rounded", spacing: "normal", ...customDefaults }
  });

export const createInputVariants = (customVariants?: any, customDefaults?: any) =>
  buildComponentVariants({
    ...presetConfigs.input,
    variants: { ...presetConfigs.input.variants, ...customVariants },
    defaultVariants: { size: "md", shape: "rounded", state: "default", ...customDefaults }
  });

export const createStatusVariants = (customVariants?: any, customDefaults?: any) =>
  buildComponentVariants({
    ...presetConfigs.status,
    variants: { ...presetConfigs.status.variants, ...customVariants },
    defaultVariants: { size: "md", shape: "pill", ...customDefaults }
  });

// Example usage:
/*
// Create a custom button with medical theme
const medicalButtonVariants = createInteractiveVariants({
  variant: {
    medical: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90",
    outline: "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
  }
}, { variant: "medical" });

// Create a custom card with elevated styles  
const elevatedCardVariants = createContainerVariants({
  variant: {
    elevated: "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
    flat: "shadow-none border-0",
  }
}, { variant: "elevated" });
*/