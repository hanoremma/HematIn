import { Container, Row, Col } from "react-bootstrap"
import { semuaFitur } from "../data/index";

const FiturePage = () => {
    return (
        <div className="fitur-page">
            <div className="fitur min-vh-100">
            <Container>
                <Row>
                    <Col>
                    <h1 className="fw-bold text-center">Semua Fitur</h1>
                    <p className="text-center">Hematin memiliki fitur unggulan yang dapat membantu kamu mengelola keuangan dengan lebih baik. Mulai dari pencatatan transaksi, pembuatan anggaran, hingga laporan keuangan yang mudah dipahami. Semua fitur ini dirancang untuk memberikan pengalaman terbaik dalam mengelola keuanganmu.</p>
                    </Col>
                </Row>
                <Row>
                    {semuaFitur.map((fitur) => {
                    return(
                        <Col key={fitur.id} className="shadow">
                            <img src={fitur.image} className="w-100 mb-5 rounded-top" />
                            <h5 className="mb-5 px-2">
                                {fitur.title}
                            </h5>
                        </Col>
                    );
                })}
                </Row>
                <Row>
                    <Col>
                    <h1 className="fw-bold text-center pt-5">Cara Penggunaan</h1>
                    <p className="text-center">Berikut adalah panduan cara menggunakan Hematin untuk mengelola keuangan Anda dengan lebih efektif.</p>
                    </Col>
                </Row>
          <Row className="pt-5">
  <Col>
    <div className="step-item">
      <div className="step-number">1</div>
      <div className="step-content">
        <h4>Daftar dan Masuk Akun Hematin Anda</h4>
        <p>
          Untuk memulai, daftar akun Hematin Anda dengan mengisi formulir
          pendaftaran. Setelah itu, masuk ke akun Anda menggunakan email dan
          kata sandi yang telah didaftarkan.
        </p>
      </div>
    </div>

    <div className="step-item">
      <div className="step-number">2</div>
      <div className="step-content">
        <h4>Buat Wallet</h4>
        <p>
          Setelah masuk, buat wallet baru untuk mengelola keuangan Anda.
          Wallet akan menjadi sumber utama untuk mencatat semua transaksi dan
          anggaran Anda.
        </p>
      </div>
    </div>

    <div className="step-item">
      <div className="step-number">3</div>
      <div className="step-content">
        <h4>Kelola Transaksi dan Anggaran</h4>
        <p>
          Setelah membuat wallet, Anda dapat mulai mencatat transaksi dan
          mengatur anggaran berdasarkan kategori yang sudah default atau Anda
          buat sendiri.
        </p>
      </div>
    </div>

    <div className="step-item">
      <div className="step-number">4</div>
      <div className="step-content">
        <h4>Upload Struk Anda</h4>
        <p>
          Gunakan fitur upload struk untuk mencatat pengeluaran Anda dengan
          lebih mudah dan akurat. Cukup ambil foto struk, dan Hematin akan
          secara otomatis memproses informasi transaksi.
        </p>
      </div>
    </div>
  </Col>
</Row>
        </Container>
        </div>
        </div>
    );
}

export default FiturePage
