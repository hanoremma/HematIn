const SearchBox = ({
  placeholder,
  mobile,
  value,
  onChange
}) => {
  return (
    <div className={mobile ? "mobile-search-box" : "search-box"}>

      <span className="search-icon">
        🔍
      </span>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />

    </div>
  );
};

export default SearchBox;