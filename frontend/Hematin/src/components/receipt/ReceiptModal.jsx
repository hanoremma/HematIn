import { useState } from "react";

import Modal from "../ui/Modal";

import {
  uploadTransactionImage
} from "../../services/transactionImgService";

const ReceiptModal = ({
  show,
  onClose,
}) => {

  const [
    receiptImage,
    setReceiptImage
  ] = useState(null);

  const [
    imageFile,
    setImageFile
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(false);

  const handleReceiptUpload =
    (e) => {

      const file =
        e.target.files[0];

      if (file) {

        setImageFile(file);

        setReceiptImage(
          URL.createObjectURL(file)
        );

      }

    };

  const handleDrop = (e) => {

    e.preventDefault();

    const file =
      e.dataTransfer.files[0];

    if (file) {

      setImageFile(file);

      setReceiptImage(
        URL.createObjectURL(file)
      );

    }

  };

  const handleDragOver = (e) => {

    e.preventDefault();

  };

  const handleScan =
    async () => {

      if (!imageFile) {

        alert(
          "Pilih gambar terlebih dahulu"
        );

        return;

      }

      try {

        setLoading(true);

        const result =
          await uploadTransactionImage(
            imageFile
          );

        console.log(
          "Upload Success:",
          result
        );

        alert(
          "Struk berhasil diupload"
        );

        setReceiptImage(null);
        setImageFile(null);

        onClose();

      } catch (error) {

        console.error(error);

        alert(
          "Upload gagal"
        );

      } finally {

        setLoading(false);

      }

    };

  return (

    <Modal
      show={show}
      onClose={() => {

        setReceiptImage(null);
        setImageFile(null);

        onClose();

      }}
    >

      <div className="receipt-upload">

        <h3>
          Upload Struk Anda
        </h3>

        <p>
          Upload gambar struk transaksi.
        </p>

        <label
          className="custom-file-upload"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >

          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={
              handleReceiptUpload
            }
          />

          <div className="upload-content">

            {
              receiptImage ? (

                <div className="receipt-preview">

                  <img
                    src={receiptImage}
                    alt="preview"
                  />

                </div>

              ) : (

                <>
                  <div className="upload-icon">
                    <i className="bi bi-receipt"></i>
                  </div>

                  <h4>
                    Pilih atau Drop File
                  </h4>

                  <p>
                    JPG, PNG • Maksimal 10 MB
                  </p>
                </>

              )
            }

          </div>

        </label>

        <button
          className="upload-btn"
          onClick={handleScan}
          disabled={loading}
        >

          {
            loading
              ? "Uploading..."
              : "Upload Struk"
          }

        </button>

      </div>

    </Modal>

  );

};

export default ReceiptModal;