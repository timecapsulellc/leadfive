/**
 * Professional Button Component
 * Part of LeadFive Design System
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { THEME } from '../../../styles/designSystem';
import './Button.css';

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isDisabled = false,
      leftIcon = null,
      rightIcon = null,
      onClick,
      type = 'button',
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'btn';
    const variantClass = `btn--${variant}`;
    const sizeClass = `btn--${size}`;
    const stateClasses = [
      isLoading && 'btn--loading',
      isDisabled && 'btn--disabled',
    ]
      .filter(Boolean)
      .join(' ');

    const combinedClassName = [
      baseClasses,
      variantClass,
      sizeClass,
      stateClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleClick = e => {
      if (isDisabled || isLoading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        className={combinedClassName}
        onClick={handleClick}
        disabled={isDisabled || isLoading}
        whileHover={!isDisabled && !isLoading ? { scale: 1.02 } : {}}
        whileTap={!isDisabled && !isLoading ? { scale: 0.98 } : {}}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
        }}
        {...props}
      >
        {isLoading && (
          <div className="btn__spinner">
            <div className="spinner" />
          </div>
        )}

        {leftIcon && !isLoading && (
          <span className="btn__icon btn__icon--left">{leftIcon}</span>
        )}

        <span
          className={`btn__content ${isLoading ? 'btn__content--hidden' : ''}`}
        >
          {children}
        </span>

        {rightIcon && !isLoading && (
          <span className="btn__icon btn__icon--right">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'tertiary',
    'ghost',
    'danger',
    'success',
    'warning',
    'info',
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

export default Button;
