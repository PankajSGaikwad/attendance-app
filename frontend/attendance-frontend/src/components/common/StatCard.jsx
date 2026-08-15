function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "blue",
}) {
  return (
    <div className={`stat-card tone-${tone}`}>

      <div className="stat-top">

        <span>
          {label}
        </span>

        <div className="stat-icon">

          {Icon && (
            <Icon size={18} />
          )}

        </div>

      </div>

      <strong>
        {value}
      </strong>

      {hint && (
        <small>
          {hint}
        </small>
      )}

    </div>
  );
}

export default StatCard;