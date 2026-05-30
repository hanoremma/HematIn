const StatCard = ({
  title,
  amount,
  icon,
  iconClass
}) => {

  return (

    <div className="stat-card">

      <div
        className={`stat-icon ${iconClass}`}
      >
        <i className={icon}></i>
      </div>

      <h3>{title}</h3>

      <h2>{amount}</h2>

    </div>

  );

};

export default StatCard;