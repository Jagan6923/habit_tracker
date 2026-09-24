import { twMerge } from 'tailwind-merge'

const Button = ({ children, variant = 'primary', className = '', style, ...props }) => {
    const variantClassName = variantStyles[variant] ?? variantStyles.primary

    return (
        <button
            style={style}
            className={twMerge(
                'transition-all duration-150 rounded-lg px-3 py-1.5 text-sm font-medium cursor-pointer hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100',
                variantClassName,
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button

const variantStyles = {
    primary: 'bg-violet-600 text-white',
    secondary: 'bg-zinc-700 text-zinc-200',
    'ghost-destructive': 'bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white',
}