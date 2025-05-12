import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, IconDefinition } from '@fortawesome/free-solid-svg-icons';

// Définition de l'interface pour les props
interface PrestationCardProps {
  imageSrc: string;
  title: string;
  link: string;
  icon?: IconDefinition 

}

const PrestationCard: React.FC<PrestationCardProps> = ({ imageSrc, title, link, icon }) => {
  return (
    <article className="relative mx-auto w-[300px] h-[300px] md:w-[400px] md:h-[250px]">
      <Image
        src={imageSrc}
        alt={`Image for ${title}`}
        layout="fill"
        objectFit="cover"
        className="rounded-lg shadow-lg z-20"
      />

      {/* Le bouton chevauchant l'image */}
      <Link href={link} passHref className="group z-30 text-black bg-secondary px-3 py-2 absolute bottom-[-20px] w-[80%] flex-col justify-center text-center left-1/2 transform -translate-x-1/2">
          {/* Cercle décoratif */}
          <div className="absolute top-0 right-0 w-10 h-10 bg-custom-gray rounded-bl-full z-10 group-hover:bg-primary"></div>

          <h3 className="font-semibold">{title}</h3>
          <div className="mx-auto px-2 rounded border border-solid shadow-md flex items-center gap-1">
            Consulter
            <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 text-black" />
          </div>
      </Link>
      {icon && (
  <FontAwesomeIcon
    icon={icon}
    className={`absolute top-[-7rem] left-[-2rem] w-[10rem] h-[10rem] text-primary  opacity-25 ${
      icon.iconName !== 'trowel' ? 'rotate-[20deg]' : ''
    }`}
  />
)}
    </article>
  );
};

export default PrestationCard;
