import { Container, Row, Col} from "react-bootstrap";
import FaqComponent from "../components/FaqComponent";

const ToSPage = () => {
  return (
    <div className="tos-page">
      <div className="tos min-vh-100">
        <Container>
          <Row>
            <Col>
            <h1 className="fw-bold text-center mb-2">Syarat & Ketentuan</h1>
            <p  className="text-center">Berikut adalah syarat dan ketentuan yang berlaku saat menggunakan aplikasi Hematin.</p>
            </Col>
          </Row>
          <Row className="pt-5">
            <Col>
            <p>Syarat dan ketentuan ini mengatur penggunaan aplikasi Hematin. Dengan menggunakan aplikasi ini, Anda setuju untuk mematuhi syarat dan ketentuan yang berlaku.</p>
            </Col>
          </Row>
          <Row>
            <Col>
            <h4 className="fw-bold">1. Syarat Umum</h4>
            <p>Dengan menggunakan aplikasi Hematin, Anda setuju untuk mematuhi syarat dan ketentuan yang berlaku.</p>
            <p>
              Pengguna harus berusia minimal 17 tahun untuk menggunakan aplikasi Hematin. Dengan menggunakan aplikasi ini, Anda menyatakan bahwa Anda memenuhi persyaratan usia tersebut dan memiliki kapasitas hukum untuk menyetujui syarat dan ketentuan ini.
            </p>
            <p>
              Pengguna bertanggung jawab untuk menjaga kerahasiaan informasi akun mereka, termasuk kata sandi dan informasi pribadi lainnya. Hematin tidak bertanggung jawab atas kerugian atau kerusakan yang timbul akibat penggunaan akun yang tidak sah atau pelanggaran keamanan.
            </p>
            </Col>
          </Row>
          <Row className="py-3">
            <Col>
            <h4 className="fw-bold">2. Ketentuan Penggunaan</h4>
            <p>Pengguna setuju untuk menggunakan aplikasi Hematin sesuai dengan hukum yang berlaku dan tidak menyalahgunakan aplikasi untuk tujuan yang melanggar hukum atau merugikan pihak lain.</p>
            <p>
              Pengguna tidak diperbolehkan untuk mengakses, mengubah, atau menyebarkan data pengguna lain tanpa izin. Hematin berhak untuk menangguhkan atau menghentikan akun pengguna yang melanggar ketentuan ini.
            </p>
            </Col>
          </Row>
          <Row className="py-3">
            <Col>
            <h4 className="fw-bold">3. Privasi dan Keamanan</h4>
            <p>
              Hematin berkomitmen untuk melindungi privasi dan keamanan data pengguna. Informasi pribadi yang dikumpulkan akan digunakan sesuai dengan kebijakan privasi yang berlaku.  Pengguna setuju untuk memberikan informasi yang akurat dan lengkap saat mendaftar dan menggunakan aplikasi Hematin. Hematin tidak bertanggung jawab atas kerugian atau kerusakan yang timbul akibat penggunaan informasi yang tidak akurat atau tidak lengkap.
            </p>
            <p>Hematin menggunakan teknologi keamanan yang sesuai untuk melindungi data pengguna. Namun, tidak ada sistem keamanan yang sempurna, dan Hematin tidak dapat menjamin keamanan data pengguna sepenuhnya. Pengguna bertanggung jawab untuk menjaga kerahasiaan informasi akun mereka dan melaporkan setiap aktivitas mencurigakan kepada Hematin.
            </p>
            </Col>
          </Row>
        </Container>
      </div>
      <FaqComponent />
    </div>
  );
}

export default ToSPage
