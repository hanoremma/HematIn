import { useState } from "react";

const NotificationButton = () => {

  const [showNotif, setShowNotif] = useState(false);

  return (
    <div className="notification-wrapper">

      {/* BUTTON */}
      <button
        className="notif-btn"
        onClick={() => setShowNotif(!showNotif)}
      >
        🔔
      </button>

      {/* DROPDOWN */}
      {showNotif && (
        <div className="notification-dropdown">

          <h5>Notifikasi</h5>

          <div className="notification-item">
            Transaksi berhasil ditambahkan
          </div>

          <div className="notification-item">
            Pengeluaran bulan ini meningkat
          </div>

          <div className="notification-item">
            Budget makanan hampir habis
          </div>

        </div>
      )}

    </div>
  );
};

export default NotificationButton;