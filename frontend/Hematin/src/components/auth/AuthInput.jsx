const AuthInput = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  className = "",
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      autoComplete="off"
      className={`form-control mb-3 ${className}`}
    />
  );
};

export default AuthInput;