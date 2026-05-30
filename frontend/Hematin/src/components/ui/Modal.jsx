const Modal = ({
  show,
  onClose,
  title,
  children,
}) => {

  if (!show) return null;

  return (

    <div className="custom-modal-overlay">

      <div className="custom-modal">

        <div className="custom-modal-content">

          <div className="modal-header">

            <h4>{title}</h4>

            <button
              className="modal-close-btn"
              onClick={onClose}
            >
              <i className="bi bi-x-lg" />
            </button>

          </div>

          <div className="modal-body">
            {children}
          </div>

        </div>

      </div>

    </div>

  );

};

export default Modal;