interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, ...props }) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    event.currentTarget.blur();
  };

  return (
    <button
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 