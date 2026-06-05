import { useState } from "react";
import { toast } from "react-toastify";

import Modal from "../ui/Modal";

import {
  uploadTransactionImage
} from "../../services/transactionImgService";

const ReceiptModal = ({
  show,
  onClose,
  onScanSuccess,
  onUploadSuccess,
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

  const setReceiptFile = (file) => {
    if (!file) return;

    setImageFile(file);
    setReceiptImage(
      URL.createObjectURL(file)
    );
  };

  const handleReceiptUpload =
    (e) => {
      setReceiptFile(
        e.target.files[0]
      );
    };

  const handleDrop = (e) => {
    e.preventDefault();
    setReceiptFile(
      e.dataTransfer.files[0]
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const resetReceipt = () => {
    setReceiptImage(null);
    setImageFile(null);
  };

  const handleClose = () => {
    if (loading) return;

    resetReceipt();
    onClose();
  };

  const handleScan =
    async () => {

      if (!imageFile) {
        toast.error(
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

        try {
          await onUploadSuccess?.(
            result
          );
        } catch (successCallbackError) {
          console.log(successCallbackError);
        }

        toast.success(
          "Struk berhasil diproses"
        );

        resetReceipt();

        if (onScanSuccess && result?.data?.ocr_result) {
          try {
            const ocr =
              typeof result.data.ocr_result === "string"
                ? JSON.parse(result.data.ocr_result)
                : result.data.ocr_result;

            const description =
              ocr.items?.length > 0
                ? ocr.items.map((item) => item.name).join(", ")
                : "";

            onScanSuccess({
              amount: Math.round(ocr.total_expense ?? 0).toString(),
              description,
              suggestedCategoryName: ocr.classification?.category ?? "",
            });
          } catch (parseError) {
            console.log(parseError);
          }
        }

        onClose();

      } catch (error) {

        console.error(error);

        toast.error(
          error?.response?.data?.message ||
          "Upload gagal"
        );

      } finally {

        setLoading(false);

      }

    };

  return (

    <Modal
      show={show}
      onClose={handleClose}
    >

      <div className="receipt-upload">

        {loading ? (

          <div className="receipt-processing">

            <div className="receipt-spinner" />

            <h3>
              Tunggu sebentar
            </h3>

            <p>
              Struk sedang diproses. Transaksi akan otomatis ditambahkan setelah selesai.
            </p>

          </div>

        ) : (

          <>

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
                onChange={handleReceiptUpload}
              />

              <div className="upload-content">

                {receiptImage ? (

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
                      JPG, PNG - Maksimal 10 MB
                    </p>
                  </>

                )}

              </div>

            </label>

          </>

        )}

        <button
          className="upload-btn"
          onClick={handleScan}
          disabled={loading}
        >

          {loading
            ? "Memproses..."
            : "Upload Struk"}

        </button>

      </div>

    </Modal>

  );

};

export default ReceiptModal;
