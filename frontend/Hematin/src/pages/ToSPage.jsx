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
            <p  className="text-center">Lorem ipsum dolor sit amet consectetur</p>
            </Col>
          </Row>
          <Row className="pt-5">
            <Col>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
              Tempore rem sequi quam, placeat quas reiciendis dolores itaque 
              incidunt consequatur nostrum a neque autem temporibus explicabo 
              officiis porro voluptatem officia magnam soluta possimus dicta 
              adipisci? Officia ratione voluptas debitis, quos rerum cumque 
              tenetur aperiam impedit quaerat nihil hic vel obcaecati nobis 
              ad reprehenderit? Natus quia soluta eos, suscipit tempora fuga? 
              Nulla.</p>
            </Col>
          </Row>
          <Row>
            <Col>
            <h4 className="fw-bold">1. Lorem</h4>
            <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nemo praesentium laborum fugit. Itaque neque pariatur vel possimus esse saepe doloribus facilis incidunt, quibusdam quaerat veniam facere omnis magni est necessitatibus nostrum amet asperiores consectetur autem repellat. Laboriosam vitae saepe adipisci.</p>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. At officiis possimus quam qui, vel nostrum iste atque laboriosam suscipit totam eius ex laborum pariatur minima eum laudantium. Ipsum rem culpa magni ad, beatae illum dolorum veniam eveniet, quibusdam ut quos.
            </p>
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quibusdam nostrum deserunt esse quidem laboriosam, nobis quisquam sapiente nihil tempora blanditiis dolor soluta, odio tempore repellendus ex sit nesciunt? Ratione pariatur quaerat est autem iusto. Et quam cupiditate quos corrupti hic.
            </p>
            </Col>
          </Row>
          <Row className="py-3">
            <Col>
            <h4 className="fw-bold">2. Lorem</h4>
            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quis id tempore eveniet illo recusandae temporibus sapiente eos aliquid dolorum dolore ut sit, omnis quo. Nam, quos. Sunt unde asperiores fugiat! Magni sed perferendis voluptatum dicta nulla ducimus praesentium recusandae doloribus, eligendi assumenda, quidem consectetur distinctio possimus architecto, inventore nobis fugit voluptas debitis necessitatibus provident hic aspernatur ut veniam doloremque! Beatae.</p>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi, molestiae! Enim tempora ab porro? Placeat, ratione dignissimos aliquid asperiores nemo, iure exercitationem hic nulla sed saepe maxime, qui ea officia sequi quo!
            </p>
            </Col>
          </Row>
          <Row className="py-3">
            <Col>
            <h4 className="fw-bold">3. Lorem</h4>
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugit saepe doloribus earum, numquam eos qui quo, in magni sunt quidem quisquam accusantium. Minima omnis veniam numquam labore sunt! Dignissimos tempore incidunt nostrum dolorum sunt facilis tenetur fuga quam illo. Ea minus eaque similique suscipit voluptatem!
            </p>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque delectus totam, eum ipsa blanditiis, impedit reprehenderit pariatur odit maiores alias possimus minima officiis. Ratione, beatae aut! Eaque similique voluptate architecto dolore mollitia porro laudantium corrupti fugit voluptates nulla veritatis reprehenderit temporibus accusamus incidunt, velit repellat. Dicta ipsam ex officiis saepe?
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
