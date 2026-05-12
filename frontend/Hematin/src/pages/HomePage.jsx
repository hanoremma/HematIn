import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom"
import WalletImage from '../assets/wallet.png'

import {semuaFitur, dataSwiper } from '../data/index'
import FaqComponent from '../components/FaqComponent'

import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from "react-router-dom";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

// import required modules
import { Pagination } from 'swiper/modules';

const HomePage = () => {
    let navigate = useNavigate();

  return (<div className="homepage">
    <header className="w-100 min-vh-100 d-flex align-items-center">
    <Container>
        <Row className="header-box d-flex align-items-center pt-lg-5">
            <Col lg="6">
                <h1 className="mb-4">
                    Kelola Keuanganmu <br /><span>dengan Mudah</span><br />Bersama Hematin!
                </h1>
                <p className="mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <button className="btn btn-danger btn-lg rounded-1 me-2 mb-xs-0 mb-2" onClick={() => navigate("/fiture")}>Lihat Fitur</button>
                <Link to="/dashboard" className="btn btn-outline-danger btn-lg rounded-1 me-2 mb-xs-0 mb-2">Get Started</Link>
            </Col>
            <Col lg="6" className="pt-lg-0 pt-5">
                <img src={WalletImage} alt="wallet-img" />
            </Col>
        </Row>
    </Container>
    </header>
    <div className="fitur w-100 min-vh-100">
        <Container>
            <Row>
                <Col>
                    <h1 className="text-center fw-bold">
                        Fitur Unggulan
                    </h1>
                    <p className="text-center">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                </Col>
            </Row>
            <Row>
                {semuaFitur.map((fitur) => {
                    return(
                        <Col key={fitur.id} className="shadow">
                            <img src={fitur.image} alt="unplash.com" className="w-100 mb-5 rounded-top" />
                            <h5 className="mb-5 px-2">
                                {fitur.title}
                            </h5>
                        </Col>
                    );
                })}
            </Row>
        </Container>
    </div>
    <div className="testimonial py-5">
        <Container>
            <Row>
                <Col>
                <h1 className="text-center fw-bold my-5">
                    Testimonial
                </h1>
                </Col>
            </Row>
            <Row>
                <Swiper
        slidesPerView={1}
        spaceBetween={10}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 40,
          },
          994: {
            slidesPerView: 2,
            spaceBetween: 50,
          },
          1200: {
            slidesPerView: 3,
            spaceBetween: 50,
          },
        }}
        modules={[Pagination]}
        className="mySwiper"
      >
        {dataSwiper.map((data) => {
            return (<SwiperSlide key={data.id} className="shadow">
                <p className="desc">{data.desc}</p>
                    <div className="people">
                        <img src={data.image} alt="" />
                        <div>
                            <h5 className="mb-1">{data.name}</h5>
                            <p className="m-0 fw-bold">
                                {data.skill}
                            </p>
                        </div>
                    </div>
          </SwiperSlide>
            );
        })}
      </Swiper>
            </Row>
        </Container>
    </div>
    {/* Section faq */}
    <FaqComponent />
    {/* Section faq */}
  </div>
  );
}

export default HomePage;
