import React from "react";

const PriceCard = ({ value, src, header, label, balance }) => {
  const val =
    typeof parseFloat(value) === "number" && !isNaN(parseFloat(value))
      ? parseFloat(value)
      : value;
  return (
    <div className="card mr-0 custom-card">
      <div className="card-body">
        <img src={src} alt={src} className="img-responsive float-right" />
        <h6 className="card-title mb-4 ">{header} </h6>

        <h3 className="mb-1 text-primary">${val.toFixed(4)}</h3>
        <p className="card-text">
          <small className="text-muted">{label}</small>
        </p>
        <h6>
          {balance} - {balance && (balance * value).toFixed(2)}
        </h6>
      </div>
    </div>
  );
};

export default PriceCard;
