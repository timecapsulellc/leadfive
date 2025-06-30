// This file contains type definitions for components used in the project.

export interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'tertiary';
}

export interface CardProps {
    title: string;
    content: React.ReactNode;
    footer?: React.ReactNode;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export interface HeaderProps {
    title: string;
    onMenuToggle: () => void;
}

export interface SidebarProps {
    items: Array<{ label: string; onClick: () => void }>;
}

export interface FooterProps {
    copyright: string;
}

export interface AnalyticsProps {
    data: Array<{ label: string; value: number }>;
}

export interface ChartProps {
    data: Array<{ x: number; y: number }>;
    type: 'line' | 'bar' | 'pie';
}

export interface WidgetProps {
    title: string;
    content: React.ReactNode;
}

export interface InputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}

export interface SelectProps {
    options: Array<{ label: string; value: string }>;
    onChange: (value: string) => void;
    value: string;
}

export interface ValidationProps {
    validate: (value: string) => boolean;
    errorMessage: string;
}