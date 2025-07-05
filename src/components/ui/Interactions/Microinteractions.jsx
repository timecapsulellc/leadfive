/**
 * Micro-interactions Component Library
 * Subtle animations that enhance user experience
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import PropTypes from 'prop-types';
import './Microinteractions.css';

// ============ ANIMATED BUTTON ============
export const AnimatedButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  const handleClick = e => {
    if (disabled) return;

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    onClick?.(e);
  };

  return (
    <motion.button
      className={`animated-btn animated-btn--${variant} animated-btn--${size} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      animate={isPressed ? { scale: 0.95 } : { scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
      {...props}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      <span className="animated-btn__content">{children}</span>
    </motion.button>
  );
};

// ============ HOVER CARD ============
export const HoverCard = ({
  children,
  className = '',
  intensity = 'medium',
  direction = 'up',
  ...props
}) => {
  const intensityMap = {
    subtle: { y: -2, shadow: '0 4px 20px rgba(0, 229, 255, 0.1)' },
    medium: { y: -4, shadow: '0 10px 30px rgba(0, 229, 255, 0.2)' },
    strong: { y: -8, shadow: '0 15px 40px rgba(0, 229, 255, 0.3)' },
  };

  const directionMap = {
    up: { y: intensityMap[intensity].y, x: 0 },
    down: { y: -intensityMap[intensity].y, x: 0 },
    left: { x: intensityMap[intensity].y, y: 0 },
    right: { x: -intensityMap[intensity].y, y: 0 },
  };

  return (
    <motion.div
      className={`hover-card ${className}`}
      whileHover={{
        ...directionMap[direction],
        boxShadow: intensityMap[intensity].shadow,
      }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============ FLOATING ACTION BUTTON ============
export const FloatingActionButton = ({
  children,
  onClick,
  position = 'bottom-right',
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={`fab fab--${position} ${className}`}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        scale: 1.1,
        rotate: 5,
        boxShadow: '0 15px 35px rgba(0, 229, 255, 0.4)',
      }}
      whileTap={{ scale: 0.9 }}
      animate={isHovered ? { y: -2 } : { y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      {...props}
    >
      <motion.div
        animate={isHovered ? { rotate: 180 } : { rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </motion.button>
  );
};

// ============ STAGGER CONTAINER ============
export const StaggerContainer = ({
  children,
  staggerDelay = 0.1,
  className = '',
  ...props
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      className={`stagger-container ${className}`}
      variants={container}
      initial="hidden"
      animate="show"
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============ STAGGER ITEM ============
export const StaggerItem = ({
  children,
  className = '',
  direction = 'up',
  ...props
}) => {
  const directionVariants = {
    up: { y: 20, opacity: 0 },
    down: { y: -20, opacity: 0 },
    left: { x: 20, opacity: 0 },
    right: { x: -20, opacity: 0 },
    scale: { scale: 0.8, opacity: 0 },
  };

  const item = {
    hidden: directionVariants[direction],
    show: {
      y: 0,
      x: 0,
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <motion.div
      className={`stagger-item ${className}`}
      variants={item}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============ PARALLAX ELEMENT ============
export const ParallaxElement = ({
  children,
  speed = 0.5,
  className = '',
  ...props
}) => {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className={`parallax-element ${className}`}
      style={{
        transform: `translateY(${offsetY * speed}px)`,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============ REVEAL ON SCROLL ============
export const RevealOnScroll = ({
  children,
  className = '',
  threshold = 0.1,
  triggerOnce = true,
  direction = 'up',
  ...props
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold, triggerOnce });
  const controls = useAnimation();

  const variants = {
    up: {
      hidden: { y: 50, opacity: 0 },
      visible: { y: 0, opacity: 1 },
    },
    down: {
      hidden: { y: -50, opacity: 0 },
      visible: { y: 0, opacity: 1 },
    },
    left: {
      hidden: { x: 50, opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },
    right: {
      hidden: { x: -50, opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },
    scale: {
      hidden: { scale: 0.8, opacity: 0 },
      visible: { scale: 1, opacity: 1 },
    },
  };

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!triggerOnce) {
      controls.start('hidden');
    }
  }, [isInView, controls, triggerOnce]);

  return (
    <motion.div
      ref={ref}
      className={`reveal-on-scroll ${className}`}
      variants={variants[direction]}
      initial="hidden"
      animate={controls}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============ MAGNETIC ELEMENT ============
export const MagneticElement = ({
  children,
  strength = 0.3,
  className = '',
  ...props
}) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = e => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={`magnetic-element ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============ PULSE ELEMENT ============
export const PulseElement = ({
  children,
  duration = 2,
  intensity = 1.05,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      className={`pulse-element ${className}`}
      animate={{
        scale: [1, intensity, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============ LOADING DOTS ============
export const LoadingDots = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div
      className={`loading-dots loading-dots--${size} loading-dots--${color} ${className}`}
      {...props}
    >
      {[0, 1, 2].map(index => (
        <motion.div
          key={index}
          className="loading-dot"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
};

// PropTypes
AnimatedButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'tertiary']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

HoverCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  intensity: PropTypes.oneOf(['subtle', 'medium', 'strong']),
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
};

FloatingActionButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  position: PropTypes.oneOf([
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
  ]),
  className: PropTypes.string,
};

StaggerContainer.propTypes = {
  children: PropTypes.node.isRequired,
  staggerDelay: PropTypes.number,
  className: PropTypes.string,
};

StaggerItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right', 'scale']),
};

ParallaxElement.propTypes = {
  children: PropTypes.node.isRequired,
  speed: PropTypes.number,
  className: PropTypes.string,
};

RevealOnScroll.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  threshold: PropTypes.number,
  triggerOnce: PropTypes.bool,
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right', 'scale']),
};

MagneticElement.propTypes = {
  children: PropTypes.node.isRequired,
  strength: PropTypes.number,
  className: PropTypes.string,
};

PulseElement.propTypes = {
  children: PropTypes.node.isRequired,
  duration: PropTypes.number,
  intensity: PropTypes.number,
  className: PropTypes.string,
};

LoadingDots.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white']),
  className: PropTypes.string,
};
