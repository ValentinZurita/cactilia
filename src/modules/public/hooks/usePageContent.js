import { useEffect, useState } from 'react'
import { ContentService } from '../../admin/index.js'
import { blockConfig, defaultBlockOrder } from '../components/home-page/homePageConfig.js'


/**
 * Hook para gestionar el contenido de páginas dinámicas
 * @param {string} pageId - Identificador de la página (ej: "home", "about", "contact")
 * @returns {Object} - Datos y funciones para manejar el contenido
 */
export const usePageContent = (pageId) => {

  // Estado para contenido de la página
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar contenido publicado
  useEffect(() => {
    const loadContent = async () => {

      // Si no hay pageId, no hacer nada
      if (!pageId) return

      // Mostrar indicador de carga
      setLoading(true)

      // Intentar cargar contenido de la página
      try {
        const result = await ContentService.getPageContent(pageId, 'published')
        if (result.ok && result.data) {
          setContent(result.data)
        } else {
          console.warn(`No se encontró contenido para la página ${pageId}`)
        }
        setError(null)
      } catch (err) {
        console.error(`Error cargando contenido de página ${pageId}:`, err)
        setError(err.message || 'Error al cargar contenido')
      } finally {
        setLoading(false)
      }

    }

    loadContent()

  }, [pageId])


  /**
   * Obtiene un bloque específico por su tipo
   * @param {string} blockType - Tipo de bloque a buscar
   * @returns {Object|null} - Datos del bloque o null si no existe
   */
  const getBlock = (blockType) => {
    if (!content?.blocks) return null
    return content.blocks.find(b => b.type === blockType) || null
  }


  /**
   * Verifica si existe un bloque de un tipo específico
   * @param {string} blockType - Tipo de bloque a buscar
   * @returns {boolean} - True si existe el bloque
   */
  const hasBlock = (blockType) => {
    return !!getBlock(blockType)
  }


  /**
   * Obtiene las propiedades para un bloque específico
   * @param {string} blockType - Tipo de bloque
   * @returns {Object} - Propiedades combinadas (default + específicas)
   */
  const getBlockProps = (blockType) => {
    // Verificar si este tipo de bloque existe en la configuración
    if (!blockConfig[blockType]) return {}

    // Obtener bloque del contenido
    const block = getBlock(blockType)
    if (!block) return blockConfig[blockType].defaultProps || {}

    // Preparar las props combinando valores por defecto con los del bloque
    const props = { ...blockConfig[blockType].defaultProps }

    // Añadir cualquier propiedad del bloque real
    Object.keys(block).forEach(key => {
      if (key !== 'type' && key !== 'id') {
        props[key] = block[key]
      }
    })

    // Procesar propiedades especiales si existen
    if (blockConfig[blockType].extraProps?.getImages && typeof blockConfig[blockType].extraProps.getImages === 'function') {
      props.images = blockConfig[blockType].extraProps.getImages(block)
    }

    return props
  }


  /**
   * Obtiene el orden en que se deben renderizar los bloques
   * @returns {Array} - Array con tipos de bloques en orden
   */
  const getBlockOrder = () => {
    return content?.blockOrder || defaultBlockOrder
  }


  /**
   * Obtiene los bloques a renderizar en orden
   * @returns {Array} - Array con objetos {type, props, childrenComponent, childrenProps}
   */
  const getBlocksToRender = () => {
    const blockOrder = getBlockOrder()

    return blockOrder
      .filter(blockType => hasBlock(blockType) && blockConfig[blockType])
      .map(blockType => {
        const config = blockConfig[blockType]
        return {
          type: blockType,
          component: config.component,
          props: getBlockProps(blockType),
          childrenComponent: config.children || null,
          childrenProps: config.childrenProps || {},
        }
      })
  }


  return {
    loading,
    error,
    hasContent: !!content,
    getBlock,
    hasBlock,
    getBlockProps,
    getBlockOrder,
    getBlocksToRender,
  }
}