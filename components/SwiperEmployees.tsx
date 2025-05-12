"use client"
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';


// import required modules
import { Pagination, Navigation, Keyboard, A11y } from 'swiper/modules';
import Image from 'next/image';

interface SlideData {
    imageSrc: string;
    title: string;
    alt: string;
    yearsExperience: string
  }
  
  interface SwiperEmployeesProps {
    slides: SlideData[];
  }


  const SwiperEmployees: React.FC<SwiperEmployeesProps> = ({ slides }) => {


  return (
    <div className=' overflow-hidden'>
   <Swiper
      // Par défaut (mobile) on voit un peu des voisins
      slidesPerView={1}
      centeredSlides={true}
      spaceBetween={16}
    
      // Slide centrale au chargement
      initialSlide={Math.floor(slides.length / 2)}

      // Pagination bullets
      pagination={{ type: 'bullets', clickable: true }}
      navigation={true}
      keyboard={{ enabled: true, onlyInViewport: true }}
      a11y={{
        enabled: true,
        prevSlideMessage: 'Diapositive précédente',
        nextSlideMessage: 'Diapositive suivante',
        slideLabelMessage: '{{index}} sur {{slidesLength}} : {{roleDescription}}',
      }}
      modules={[Pagination, Navigation, Keyboard, A11y]}

      // Responsive : 1.2 slides mobiles, 2.2 tablets, 3 desktop
      breakpoints={{
        0:    { slidesPerView: 1.2, spaceBetween: 18 },
        640:  { slidesPerView: 2.2, spaceBetween: 16 },
        1024: { slidesPerView: 3,   spaceBetween: 13 },
      }}

      aria-label="Galerie d’employés"
      className="mySwiper h-[70vh]"
    >
      {slides.map((slide, index) => (
        <SwiperSlide
          key={index}
          role="group"
          aria-roledescription="diapositive"
          aria-label={`${index + 1} sur ${slides.length} : ${slide.title}`}
          className="relative text-custom-gray"
        >
          <Image
            src={slide.imageSrc}
            alt={slide.alt}
            layout="fill"
            objectFit="cover"
            className="rounded shadow-lg pb-10"
          />
          <div
            className="w-full md:w-3/4 absolute bottom-10 left-1/2 transform -translate-x-1/2
                       bg-custom-white text-xl font-bold z-10 text-center
                       p-3 trapezoid rounded-lg"
          >
            <p>{slide.title}</p>
            <p>{slide.yearsExperience}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>

    </div>
  );
}


export default SwiperEmployees;
