import { HeroSection, ProductCarousel, HomeSection, HomeCarousel } from '../components/home-page/index.js';
import { CustomTextBlock, CustomCTABlock } from '../components/home-page/homePageBlocks.jsx';
import { usePageContent } from '../hooks/usePageContent.js';
import { blockConfig } from '../config/homePageConfig.js';
import '../../../styles/global.css';

// Mapa de componentes disponibles
const componentMap = {
  HeroSection,
  HomeSection,
  ProductCarousel,
  HomeCarousel,
  CustomTextBlock,
  CustomCTABlock
};

export const HomePage = () => {

  // Usar el hook para gestionar el contenido
  const { loading, getBlocksToRender, getBlockProps } = usePageContent('home');

  // Sí está cargando, mostrar el héroe por defecto
  if (loading) {
    const heroConfig = blockConfig['hero-slider'];
    return <HeroSection {...heroConfig.defaultProps} />;
  }

  // Obtener los bloques a renderizar
  const blocksToRender = getBlocksToRender();

  // Renderizar un bloque específico
  const renderBlock = (blockData, index) => {
    const Component = componentMap[blockData.component];
    if (!Component) return null;

    // Si el componente necesita children, añadirlos
    if (blockData.childrenComponent) {
      const ChildComponent = componentMap[blockData.childrenComponent];
      return (
        <Component key={index} {...blockData.props}>
          <ChildComponent {...blockData.childrenProps} />
        </Component>
      );
    }

    // Componente sin children
    return <Component key={index} {...blockData.props} />;
  };

  return (
    <div className="home-section">
      {blocksToRender.map((blockData, index) => renderBlock(blockData, index))}
    </div>
  );
};