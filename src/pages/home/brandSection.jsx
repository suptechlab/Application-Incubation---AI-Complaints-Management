import React, { useRef } from "react";
import { Container, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

// Importing images from local assets
import conafips from "../../assets/images/brands/CONAFIPS.jpg";
import contraloria from "../../assets/images/brands/contraloria.png";
import controlPoder from "../../assets/images/brands/controlpoder.png";
import cosede from "../../assets/images/brands/COSEDE.jpg";
import defPueblo from "../../assets/images/brands/defensoria-del-pueblo.png";
import ftcs from "../../assets/images/brands/FTCS-1.jpg";
import ieps from "../../assets/images/brands/IEPS.jpg";
import juntaPolitica from "../../assets/images/brands/junta_politica_RF_ec.png";
import cpccs from "../../assets/images/brands/logoCPCCS.png";
import sot from "../../assets/images/brands/SOT.png";
import superbancos from "../../assets/images/brands/superbancos.jpg";
import supercias from "../../assets/images/brands/supercias.png";

const BrandSection = () => {
  const sliderRef = useRef(null);

  // Slider Settings
  let settings = {
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    initialSlide: 0,
    autoplay: true,
    pauseOnHover: false,
    afterChange: (current) => {
      // Remove aria-hidden from cloned slides
      const clonedSlides =
        sliderRef.current.innerSlider.list.querySelectorAll(".slick-cloned");
      clonedSlides.forEach((slide) => {
        slide.removeAttribute("aria-hidden");
      });
    },
    responsive: [
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 5,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
    ],
  };

  //Slider Items
  const sliderItems = [
    {
      id: 1,
      image: defPueblo,
      name: "Defensoria del Pueblo",
      url: "https://www.dpe.gob.ec/",
    },
    {
      id: 2,
      image: cpccs,
      name: "CPCCS",
      url: "https://www.cpccs.gob.ec/",
    },
    {
      id: 3,
      image: sot,
      name: "SOT",
      url: "https://www.sot.gob.ec/inicio/0/esp",
    },
    {
      id: 4,
      image: superbancos,
      name: "Superbancos",
      url: "https://www.superbancos.gob.ec/bancos/",
    },
    {
      id: 5,
      image: supercias,
      name: "Supercias",
      url: "https://www.supercias.gob.ec/portalscvs/",
    },
    {
      id: 6,
      image: juntaPolitica,
      name: "Junta Politica RF",
      url: "https://jprf.gob.ec/",
    },
    {
      id: 7,
      image: conafips,
      name: "CONAFIPS",
      url: "https://www.finanzaspopulares.gob.ec/",
    },
    {
      id: 8,
      image: ftcs,
      name: "FTCS",
      url: "http://www.ftcs.gob.ec/",
    },
    {
      id: 9,
      image: ieps,
      name: "IEPS",
      url: "https://www.economiasolidaria.gob.ec/",
    },
    {
      id: 10,
      image: cosede,
      name: "COSEDE",
      url: "https://www.cosede.gob.ec/",
    },
    {
      id: 11,
      image: contraloria,
      name: "Contraloria",
      url: "https://www.contraloria.gob.ec/",
    },
    {
      id: 12,
      image: controlPoder,
      name: "Control Poder",
      url: "https://www.sce.gob.ec/sitio",
    },
  ];

  return (
    <Container>
      <Slider ref={sliderRef} {...settings} className="carousel-cover-main">
        {sliderItems?.map((items) => {
          const { id, image, name, url } = items;
          return (
            <div key={id} className="py-3 px-1">
              <Link
                to={url}
                target="_blank"
                rel="noreferrer"
                className="carousel-link"
              >
                <Image fluid src={image} alt={name} width={294} height={78} />
              </Link>
            </div>
          );
        })}
      </Slider>
    </Container>
  );
};

export default BrandSection;
