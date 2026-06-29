import React from 'react';
import { motion } from 'framer-motion';

export const ControlType = { String: "String", Number: "Number", Color: "Color", Boolean: "Boolean", File: "File", Image: "Image", Enum: "Enum", Object: "Object", Array: "Array", Transition: "Transition", EventHandler: "EventHandler" };
export const addPropertyControls = () => {};
export const addFonts = () => {};
export const cx = (...args) => args.filter(Boolean).join(" ");
export const getLoadingLazyAtYPosition = () => "lazy";

// Image Component Mock with motion support and nice styling
export const Image = React.forwardRef((props, ref) => {
  const { background, ...rest } = props;
  const src = background?.src;
  
  return React.createElement(motion.img, { 
    ref, 
    src, 
    alt: background?.alt || "", 
    ...rest,
    style: { 
      width: "100%", 
      height: "100%", 
      objectFit: background?.fit === "fill" ? "cover" : "contain", 
      borderRadius: "12px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
      backgroundColor: "transparent",
      ...rest.style 
    } 
  });
});

// Variant Callback Mock
export const useActiveVariantCallback = (baseVariant) => {
  return { activeVariantCallback: (cb) => cb, delay: 0 };
};

// Viewport Mock
export const useComponentViewport = () => ({ width: 480, height: 320, y: 0 });

// Locale Mock
export const useLocaleInfo = () => ({ activeLocale: "en", setLocale: () => {} });

// Variant State Mock
export const useVariantState = ({ defaultVariant, variant, variantClassNames }) => {
  const [currentVariant, setVariant] = React.useState(variant || defaultVariant);
  return {
    baseVariant: currentVariant,
    classNames: variantClassNames?.[currentVariant] || "",
    clearLoadingGesture: () => {},
    gestureHandlers: {},
    gestureVariant: null,
    isLoading: false,
    setGestureState: () => {},
    setVariant,
    variants: [currentVariant]
  };
};

// CSS Injection Mock (Dynamically rewrite Framer's hardcoded portrait layout to landscape)
export const withCSS = (Component, css, hash) => {
  return React.forwardRef((props, ref) => {
    React.useEffect(() => {
      if (!document.getElementById(hash)) {
        const style = document.createElement("style");
        style.id = hash;
        
        let cssText = Array.isArray(css) ? css.join("\n") : css;
        
        // Rewrite width: 30% -> 80%
        cssText = cssText.replace(/width: 30%;/g, "width: 80%;");
        cssText = cssText.replace(/left: calc\(50\.00000000000002% - 30% \/ 2\);/g, "left: 10%;");
        
        // Rewrite height: 60% -> 80%
        cssText = cssText.replace(/height: 60%;/g, "height: 80%;");
        cssText = cssText.replace(/top: calc\(47\.51461988304096% - 60% \/ 2\);/g, "top: 10%;");
        
        // Remove hardcoded component container dimensions
        cssText = cssText.replace(/height: 684px;/g, "height: 100%;");
        cssText = cssText.replace(/width: 390px;/g, "width: 100%;");
        
        style.textContent = cssText;
        document.head.appendChild(style);
      }
    }, []);
    return React.createElement(Component, { ref, ...props });
  });
};
