import Modal from "./Modal";

const ConfirmModal = ({
  show,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  message = "Apakah Anda yakin?"
}) => {

  return (

    <Modal
      show={show}
      onClose={onClose}
      title={title}
    >

      <div className="confirm-modal">

        <p>
          {message}
        </p>

        <div className="confirm-actions">

          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
          >
            Batal
          </button>

          <button
            type="button"
            className="delete-btn"
            onClick={onConfirm}
          >
            Ya, Hapus
          </button>

        </div>

      </div>

    </Modal>

  );

};

export default ConfirmModal;